import uuid

from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token
from django.conf import settings
from django.db import models
from pushover import Client


# This code is triggered whenever a new user has been created and saved to the database
@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)


class Profile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=200, null=True, blank=True)
    pushover = models.CharField(max_length=200, null=True, blank=True)


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()


# Create your models here.
class Ride(models.Model):
    # Ride Model
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    startTime = models.DateTimeField(auto_now_add=True)
    rideStart = models.ForeignKey('Location', on_delete=models.SET_NULL, null=True, related_name='rideStart')
    rideDestination = models.ForeignKey('Location', on_delete=models.SET_NULL, null=True,
                                        related_name='rideDestination')
    active = models.BooleanField(default=True)

    def __str__(self):
        return "Ride from " + self.rideStart.__str__() + " to " + self.rideDestination.__str__()\
               + " (" + self.startTime.strftime('%d.%m.%Y %H:%M') + ")."


class Waypoint(models.Model):
    # Waypoint Model
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    timestamp = models.DateTimeField(auto_now_add=True)
    waypointLocation = models.ForeignKey('Location', on_delete=models.SET_NULL, null=True,
                                         related_name='waypointLocation')
    ride = models.ForeignKey('Ride', on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return "Waypoint " + self.waypointLocation.__str__() + "(" + self.timestamp.strftime('%d.%m.%Y %H:%M') + ")."


class PickUpRequest(models.Model):
    # PickUpRequest Model
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    ride = models.ForeignKey('Ride', on_delete=models.SET_NULL, null=True)
    currentLocation = models.ForeignKey('Location', on_delete=models.SET_NULL, null=True,
                                        related_name='currentLocation')
    destination = models.ForeignKey('Location', on_delete=models.SET_NULL, null=True,
                                    related_name='destination')
    answered = models.BooleanField(default=False)
    accepted = models.BooleanField(default=False)
    __original_accepted = None

    def __str__(self):
        return "PickUpRequest from " + self.currentLocation.__str__() + " to " + self.destination.__str__() + "("\
               + self.user.username + ")."

    def __init__(self, *args, **kwargs):
        super(PickUpRequest, self).__init__(*args, **kwargs)
        self.__original_accepted = self.accepted

    def save(self, force_insert=False, force_update=False, *args, **kwargs):
        if self.accepted != self.__original_accepted:
            if self.accepted:
                send_push_request_accepted_if_token(self, self.user)
            else:
                send_push_request_declined_if_token(self, self.user)

        super(PickUpRequest, self).save(force_insert, force_update, *args, **kwargs)
        self.__original_accepted = self.accepted


@receiver(post_save, sender=PickUpRequest)
def send_push_request_created(sender, instance=None, created=False, **kwargs):
    if created:
        send_push_request_created_if_token(instance, instance.ride, instance.ride.user)


# This code is triggered whenever a new pickup request has ben saved
def send_push_request_created_if_token(pickUpRequest, ride, user):
    if user.profile.pushover:
        client = Client(user.profile.pushover, api_token="ad9ohz7ege8sr2ejv3t3asfcnszyr9")
        client.send_message("New PickUp Request on Hitchcar.", title="New PickUp Request",
                            url="https://hitchcar.pillo.ch/#/ride/" + str(ride.id), url_title="Open Ride")


# This code is triggered whenever a new pickup request has ben saved
def send_push_request_accepted_if_token(pickUpRequest, user):
    if user.profile.pushover:
        client = Client(user.profile.pushover, api_token="ad9ohz7ege8sr2ejv3t3asfcnszyr9")
        client.send_message("Your PickUp Request to "+str(pickUpRequest.destination.title)+" was accepted. " +
                            "The drivers phone number is " + pickUpRequest.ride.user.profile.phone,
                            title="PickUp Request accepted",
                            url="https://hitchcar.pillo.ch/#/home", url_title="Open Hitchcar")


# This code is triggered whenever a new pickup request has ben saved
def send_push_request_declined_if_token(pickUpRequest, user):
    if user.profile.pushover:
        client = Client(user.profile.pushover, api_token="ad9ohz7ege8sr2ejv3t3asfcnszyr9")
        client.send_message("Your PickUp Request to " + str(pickUpRequest.destination.title) + " was declined.",
                            title="PickUp Request declined",
                            url="https://hitchcar.pillo.ch/#/home", url_title="Open Hitchcar")


class Location(models.Model):
    # Location Model
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    title = models.CharField(max_length=200, null=True, blank=True)
    latitude = models.FloatField(null=False, blank=False)
    longitude = models.FloatField(null=False, blank=False)

    def __str__(self):
        return "Location (" + ") - Lat: " + self.latitude.__str__() + ", Long: " + self.longitude.__str__()
