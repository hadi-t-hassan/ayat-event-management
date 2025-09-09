from django.db import models
from django.contrib.auth.models import User

class Actor(models.Model):
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE,  # Delete actor when user is deleted
        related_name='actor_profile',
        null=True,  # Allow null temporarily for migration
        blank=True
    )
    name = models.CharField(max_length=100)
    family = models.CharField(max_length=100)
    age = models.IntegerField()
    role = models.CharField(max_length=100)
    
    # Permissions
    can_view_upcoming_parties = models.BooleanField(default=True)
    can_view_completed_parties = models.BooleanField(default=True)
    can_view_all_actors = models.BooleanField(default=False)
    can_manage_parties = models.BooleanField(default=False)
    can_manage_actors = models.BooleanField(default=False)
    
    # Page-specific permissions
    can_access_dashboard = models.BooleanField(default=True)
    can_access_actors = models.BooleanField(default=False)
    can_access_parties = models.BooleanField(default=False)
    can_access_schedule = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} {self.family}"

    class Meta:
        ordering = ['name']

class Song(models.Model):
    title = models.CharField(max_length=200)
    party = models.ForeignKey('Party', on_delete=models.CASCADE, related_name='songs')
    order = models.IntegerField()

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title

class Party(models.Model):
    PARTY_STATUS = (
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('done', 'Done'),
        ('cancelled', 'Cancelled'),
    )

    # Basic party information
    day = models.CharField(max_length=20)
    date = models.DateField()
    time = models.TimeField()
    duration = models.DurationField()
    place = models.CharField(max_length=200)
    event = models.CharField(max_length=200, help_text="Type of event (e.g., Wedding, Birthday, etc.)", default="Other")
    
    # Actors information
    number_of_actors = models.IntegerField()
    actors = models.ManyToManyField(Actor, related_name='parties')
    
    # Meeting details
    meeting_time = models.TimeField()
    meeting_date = models.DateField()
    meeting_place = models.CharField(max_length=200)
    
    # Additional details
    transport_vehicle = models.CharField(max_length=100)
    notes = models.TextField(blank=True)
    camera_man = models.CharField(max_length=100)
    dress_details = models.TextField()
    
    # Status and timestamps
    status = models.CharField(max_length=20, choices=PARTY_STATUS, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='parties_created')

    def is_visible_to_actor(self, actor):
        """Check if the party is visible to a specific actor"""
        # Admin can see all parties
        if actor.can_manage_parties:
            return True
        
        # Actor must be part of the party
        if not actor in self.actors.all():
            return False
            
        # Check status-based permissions
        if self.status in ['pending', 'in_progress']:
            return actor.can_view_upcoming_parties
        elif self.status == 'done':
            return actor.can_view_completed_parties
            
        return False

    def __str__(self):
        return f"Party on {self.date} at {self.place}"

    class Meta:
        ordering = ['-date', '-time']
        verbose_name_plural = 'Parties'