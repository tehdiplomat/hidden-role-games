from django.db import models
from django.contrib import admin
from django.conf import settings
from rest_framework import serializers

from cms.models.Base import BaseModel
from cms.models.Game import Game

class GameSession(BaseModel):
	name = models.CharField(max_length=32, default='Unnamed Session')
	game = models.ForeignKey(Game, null=False)

	active = models.BooleanField(default=True)

	
	def __unicode__(self):
		return u'%s' % (self.name)

	class Meta:
		app_label = 'cms'
		verbose_name_plural = 'gameSessions'
		ordering = ['name']

class GameSessionAdmin(admin.ModelAdmin):
	list_display = ['id', 'name', 'game', 'active']
	list_filter = ['name']

# For serializing with django_rest_framework
class GameSessionSerializer(serializers.ModelSerializer):
	class Meta:
		model = GameSession
		fields = ('id', 'name', 'game', 'active')

GameSession.serializer = GameSessionSerializer