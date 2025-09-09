import logging
from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import Actor, Party, Song

class ActorCreateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True, required=False, allow_blank=True)
    
    # Permissions
    can_view_upcoming_parties = serializers.BooleanField(default=True)
    can_view_completed_parties = serializers.BooleanField(default=True)
    can_view_all_actors = serializers.BooleanField(default=False)
    can_manage_parties = serializers.BooleanField(default=False)
    can_manage_actors = serializers.BooleanField(default=False)
    
    # Page-specific permissions
    can_access_dashboard = serializers.BooleanField(default=True)
    can_access_actors = serializers.BooleanField(default=False)
    can_access_parties = serializers.BooleanField(default=False)
    can_access_schedule = serializers.BooleanField(default=False)

    class Meta:
        model = Actor
        fields = (
            'id', 'name', 'family', 'age', 'role', 'username', 'password', 'email',
            'can_view_upcoming_parties', 'can_view_completed_parties',
            'can_view_all_actors', 'can_manage_parties', 'can_manage_actors',
            'can_access_dashboard', 'can_access_actors', 'can_access_parties', 'can_access_schedule'
        )

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        email = validated_data.pop('email', '')

        # Create User account as superuser
        user = User.objects.create_user(
            username=username,
            password=password,
            email=email,
            first_name=validated_data['name'],
            last_name=validated_data['family'],
            is_staff=True,  # Make all actors superusers
            is_superuser=True  # Give them full Django permissions
        )

        # Create Actor profile with permissions
        actor = Actor.objects.create(user=user, **validated_data)
        return actor

class ActorSerializer(serializers.ModelSerializer):
    parties_count = serializers.SerializerMethodField()
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Actor
        fields = (
            'id', 'name', 'family', 'age', 'role', 'username',
            'can_view_upcoming_parties', 'can_view_completed_parties',
            'can_view_all_actors', 'can_manage_parties', 'can_manage_actors',
            'can_access_dashboard', 'can_access_actors', 'can_access_parties', 'can_access_schedule',
            'parties_count'
        )

    def get_parties_count(self, obj):
        return obj.parties.count()

class UserSerializer(serializers.ModelSerializer):
    actor_profile = ActorSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'actor_profile')

class SongSerializer(serializers.ModelSerializer):
    order = serializers.IntegerField(required=False)  # Make order optional
    
    class Meta:
        model = Song
        fields = ('id', 'title', 'order')

class PartySerializer(serializers.ModelSerializer):
    songs = SongSerializer(many=True, required=False)
    actors = ActorSerializer(many=True, read_only=True)
    actor_ids = serializers.PrimaryKeyRelatedField(
        queryset=Actor.objects.all(),
        many=True,
        write_only=True,
        source='actors'
    )
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    is_visible = serializers.SerializerMethodField()

    class Meta:
        model = Party
        fields = '__all__'
        read_only_fields = ('created_by', 'created_at', 'updated_at', 'status_display', 'created_by_name', 'is_visible')

    def get_is_visible(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        try:
            actor = request.user.actor_profile
            return obj.is_visible_to_actor(actor)
        except Actor.DoesNotExist:
            return request.user.is_staff

    def validate(self, data):
        logger = logging.getLogger(__name__)
        logger.error(f"Validating party data: {data}")
        
        # Check required fields
        required_fields = ['day', 'date', 'time', 'duration', 'place', 'number_of_actors',
                         'meeting_time', 'meeting_date', 'meeting_place', 'transport_vehicle',
                         'camera_man', 'dress_details']
        
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            logger.error(f"Missing required fields: {missing_fields}")
            raise serializers.ValidationError({field: ['This field is required.'] for field in missing_fields})
        
        # Duration is already validated by DurationField
        duration = data.get('duration')
        if duration is None:
            logger.error("Duration is required")
            raise serializers.ValidationError({'duration': ['This field is required.']})
        
        return data

    def create(self, validated_data):
        actor_ids = validated_data.pop('actors', [])
        songs_data = validated_data.pop('songs', [])
        
        # Set default status to pending if not provided
        if 'status' not in validated_data:
            validated_data['status'] = 'pending'
        
        # Create party
        party = Party.objects.create(**validated_data)
        
        # Add actors
        party.actors.set(actor_ids)
        
        # Add songs with automatic order
        for index, song_data in enumerate(songs_data):
            if isinstance(song_data, dict):
                song_data['order'] = index
                Song.objects.create(party=party, **song_data)
        
        return party

    def update(self, instance, validated_data):
        actor_ids = validated_data.pop('actors', None)
        songs_data = validated_data.pop('songs', None)
        
        # Update party fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update actors if provided
        if actor_ids is not None:
            instance.actors.set(actor_ids)
        
        # Update songs if provided
        if songs_data is not None:
            instance.songs.all().delete()
            for index, song_data in enumerate(songs_data):
                if isinstance(song_data, dict):
                    song_data['order'] = index
                    Song.objects.create(party=instance, **song_data)
        
        return instance