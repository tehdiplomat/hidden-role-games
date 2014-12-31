from django.db import models
from django.contrib import admin
from django.conf import settings
from rest_framework import serializers

from cms.models.Base import BaseModel
from cms.models.Game import Game

class Role(BaseModel):
	name = models.CharField(max_length=32, default='Unnamed Role')
	game = models.ForeignKey(Game, null=False)
	affiliation = models.CharField(max_length=64, default='Unaffiliated')
	text = models.TextField(blank=True)

	def __unicode__(self):
		return u'%s' % (self.name)

	class Meta:
		app_label = 'cms'
		verbose_name_plural = 'roles'
		ordering = ['name']

class RoleAdmin(admin.ModelAdmin):
	list_display = ['id', 'name', 'game', 'affiliation']
	list_filter = ['game']

# For serializing with django_rest_framework
class RoleSerializer(serializers.ModelSerializer):
	class Meta:
		model = Role
		fields = ('id', 'name', 'game', 'affiliation', 'text')

Role.serializer = RoleSerializer