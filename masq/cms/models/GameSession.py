from django.db import models
from django.contrib import admin
from django.conf import settings
from rest_framework import serializers

from cms.models.Base import BaseModel
from cms.models.Game import Game
from cms.models.Role import Role

class GameSession(BaseModel):
	STATUS_LOBBY = 'lobby'
	STATUS_ACTIVE = 'active'
	STATUS_END = 'completed'

	STATUS_CHOICES = (
		(STATUS_LOBBY, STATUS_LOBBY.capitalize()), 
		(STATUS_ACTIVE, STATUS_ACTIVE.capitalize()),
		(STATUS_END, STATUS_END.capitalize()),
	)

	name = models.CharField(max_length=32, default='Unnamed Session')
	game = models.ForeignKey(Game, null=False)

	status = models.CharField(max_length=16, default=STATUS_LOBBY, choices=STATUS_CHOICES)
	currentRound = models.PositiveSmallIntegerField(default=0)
	rounds = models.PositiveSmallIntegerField(default=5)
	roles = models.ManyToManyField(Role)

	def __unicode__(self):
		return u'%s' % (self.name)

	class Meta:
		app_label = 'cms'
		verbose_name_plural = 'gameSessions'
		ordering = ['name']

class GameSessionAdmin(admin.ModelAdmin):
	list_display = ['id', 'name', 'game', 'status']
	list_filter = ['name']

# For serializing with django_rest_framework
class GameSessionSerializer(serializers.ModelSerializer):
	class Meta:
		model = GameSession
		fields = ('id', 'name', 'game', 'status', 'roles')

GameSession.serializer = GameSessionSerializer