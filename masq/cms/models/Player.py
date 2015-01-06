from django.db import models
from django.contrib import admin
from django.conf import settings
from rest_framework import serializers

from cms.models.Base import BaseModel
from cms.models.GameSession import GameSession
from cms.models.Role import Role

class Player(BaseModel):
	name = models.CharField(max_length=32, default='Unnamed Player')
	session = models.ForeignKey(GameSession, null=False)
	role = models.ForeignKey(Role, null=True, blank=True)

	hidden = models.BooleanField(default=True)
	pin = models.PositiveSmallIntegerField(default=1234)
	host = models.BooleanField(default=True)

	
	def __unicode__(self):
		return u'%s' % (self.name)

	class Meta:
		app_label = 'cms'
		verbose_name_plural = 'players'
		ordering = ['name']

class PlayerAdmin(admin.ModelAdmin):
	list_display = ['id', 'name', 'session', 'role']
	list_filter = ['session']

# For serializing with django_rest_framework
class PlayerSerializer(serializers.ModelSerializer):
	class Meta:
		model = Player
		fields = ('id', 'name', 'session', 'role', 'hidden', 'pin', 'host')

Player.serializer = PlayerSerializer