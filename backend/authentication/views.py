from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from django.db.models import Count, Q, query
from django.utils import timezone
from .serializers import (
    UserSerializer, 
    ActorCreateSerializer,
    ActorSerializer,
    PartySerializer
)
from .models import Actor, Party

class UserDetailView(generics.RetrieveAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class IsAdminOrActorWithPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        # Only allow access if user has actor_profile (is an actor)
        # or is the initial superadmin (no actor_profile)
        if not hasattr(request.user, 'actor_profile'):
            return True  # This is the initial superadmin
            
        actor = request.user.actor_profile
        
        # Check if actor has access to the actors page
        if not actor.can_access_actors:
            return False
            
        # If they have access to the page, they can do everything on that page
        return True

    def has_object_permission(self, request, view, obj):
        # Only allow access if user has actor_profile (is an actor)
        # or is the initial superadmin (no actor_profile)
        if not hasattr(request.user, 'actor_profile'):
            return True  # This is the initial superadmin
            
        actor = request.user.actor_profile
        
        # Check if actor has access to the actors page
        if not actor.can_access_actors:
            return False
            
        # If they have access to the page, they can do everything on that page
        return True

class ActorViewSet(viewsets.ModelViewSet):
    queryset = Actor.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsAdminOrActorWithPermission]

    def get_serializer_class(self):
        if self.action == 'create':
            return ActorCreateSerializer
        return ActorSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Actor.objects.all()
        
        # If this is an actor (not the initial superadmin)
        if hasattr(user, 'actor_profile'):
            actor = user.actor_profile
            # If they don't have access to the actors page, return empty queryset
            if not actor.can_access_actors:
                return Actor.objects.none()
        
        # Apply search filters
        name = self.request.query_params.get('name', None)
        if name is not None:
            queryset = queryset.filter(
                Q(name__icontains=name) |
                Q(family__icontains=name) |
                Q(role__icontains=name)
            )
            
        return queryset

class IsAdminOrActorWithPartyPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        # Only allow access if user has actor_profile (is an actor)
        # or is the initial superadmin (no actor_profile)
        if not hasattr(request.user, 'actor_profile'):
            return True  # This is the initial superadmin
            
        actor = request.user.actor_profile
        
        # Check if actor has access to the parties page
        if not actor.can_access_parties:
            return False
            
        # If they have access to the page, they can do everything on that page
        return True

    def has_object_permission(self, request, view, obj):
        # Only allow access if user has actor_profile (is an actor)
        # or is the initial superadmin (no actor_profile)
        if not hasattr(request.user, 'actor_profile'):
            return True  # This is the initial superadmin
            
        actor = request.user.actor_profile
        
        # Check if actor has access to the parties page
        if not actor.can_access_parties:
            return False
            
        # If they have access to the page, they can do everything on that page
        return True

import logging
logger = logging.getLogger(__name__)

class PartyViewSet(viewsets.ModelViewSet):
    queryset = Party.objects.all()
    serializer_class = PartySerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrActorWithPartyPermission]

    def create(self, request, *args, **kwargs):
        logger.error(f"Received party data: {request.data}")
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            logger.error(f"Validation errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return super().create(request, *args, **kwargs)

    def get_queryset(self):
        user = self.request.user
        queryset = Party.objects.all().order_by('-date', '-time')
        
        # If this is an actor (not the initial superadmin)
        if hasattr(user, 'actor_profile'):
            actor = user.actor_profile
            # If they don't have access to the parties page, return empty queryset
            if not actor.can_access_parties:
                return Party.objects.none()
        
        # Apply search filters
        status = self.request.query_params.get('status', None)
        if status is not None and status != 'all':
            queryset = queryset.filter(status=status)
            
        search = self.request.query_params.get('search', None)
        if search is not None:
            queryset = queryset.filter(
                Q(place__icontains=search) |
                Q(camera_man__icontains=search) |
                Q(actors__name__icontains=search) |
                Q(actors__family__icontains=search) |
                Q(day__icontains=search)
            ).distinct()
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats(request):
    user = request.user
    today = timezone.now().date()
    
    # Check if user has access to dashboard
    if not user.is_staff and hasattr(user, 'actor_profile'):
        actor = user.actor_profile
        if not actor.can_access_dashboard:
            return Response({"error": "You don't have access to the dashboard"}, status=status.HTTP_403_FORBIDDEN)
    
    if user.is_staff:
        # Admin stats
        total_actors = Actor.objects.count()
        total_parties = Party.objects.count()
        upcoming_parties = Party.objects.filter(
            date__gte=today,
            status__in=['pending', 'in_progress']
        ).count()
        completed_parties = Party.objects.filter(status='done').count()
        
        # Top actors with their party counts
        actor_stats = Actor.objects.annotate(
            party_count=Count('parties')
        ).values('name', 'family', 'party_count').order_by('-party_count')[:5]
        
        # Monthly activity data
        from django.db.models import Count
        from django.db.models.functions import TruncMonth
        
        monthly_activity = Party.objects.annotate(
            month=TruncMonth('date')
        ).values('month').annotate(
            parties=Count('id')
        ).order_by('month')
        
        # Status distribution
        status_distribution = Party.objects.values('status').annotate(
            count=Count('id')
        ).order_by('status')
        
        return Response({
            'total_actors': total_actors,
            'total_parties': total_parties,
            'upcoming_parties': upcoming_parties,
            'completed_parties': completed_parties,
            'top_actors': actor_stats,
            'monthly_activity': monthly_activity,
            'status_distribution': status_distribution
        })
    else:
        # Actor stats
        actor = user.actor_profile
        
        # If actor has access to parties page, show all parties stats
        if actor.can_access_parties:
            my_parties = Party.objects.filter(actors=actor)
            total_parties = my_parties.count()
            upcoming_parties = my_parties.filter(
                date__gte=today,
                status__in=['pending', 'in_progress']
            ).count()
            completed_parties = my_parties.filter(status='done').count()
            
            # Monthly activity data for actor's parties
            from django.db.models.functions import TruncMonth
            
            monthly_activity = my_parties.annotate(
                month=TruncMonth('date')
            ).values('month').annotate(
                parties=Count('id')
            ).order_by('month')
            
            # Status distribution for actor's parties
            status_distribution = my_parties.values('status').annotate(
                count=Count('id')
            ).order_by('status')
        else:
            total_parties = 0
            upcoming_parties = 0
            completed_parties = 0
            monthly_activity = []
            status_distribution = []
        
        return Response({
            'my_total_parties': total_parties,
            'my_upcoming_parties': upcoming_parties,
            'my_completed_parties': completed_parties,
            'monthly_activity': monthly_activity,
            'status_distribution': status_distribution
        })