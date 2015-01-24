from django.db import models
from django.contrib import admin
from django.conf import settings
from rest_framework import serializers

from cms.models.Base import BaseModel

class Game(BaseModel):
	name = models.CharField(max_length=32, default='Unnamed Game')
	template = models.CharField(max_length=32, default='play.html', blank=True)
	
	def __unicode__(self):
		return u'%s' % (self.name)


	def secondsPerRound(self, round, totalRounds):
		if self.name == 'Two Rooms and a Boom':
			return (totalRounds + 1 - round) * 60

		return 0

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