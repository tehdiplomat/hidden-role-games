from django.db import models
from django.contrib import admin
from django.conf import settings
from rest_framework import serializers

from cms.models.Base import BaseModel

class Game(BaseModel):
	name = models.CharField(max_length=32, default='Unnamed Game')

	
	def __unicode__(self):
		return u'%s' % (self.name)

	class Meta:
		app_label = 'cms'
		verbose_name_plural = 'games'
		ordering = ['name']

class GameAdmin(admin.ModelAdmin):
	list_display = ['id', 'name']
	list_filter = ['name']

# For serializing with django_rest_framework
class GameSerializer(serializers.ModelSerializer):
	class Meta:
		model = Game
		fields = ('id', 'name')

Game.serializer = GameSerializer