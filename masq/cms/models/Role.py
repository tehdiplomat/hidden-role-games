from django.db import models
from django.contrib import admin
from django.conf import settings
from rest_framework import serializers

from cms.models.Base import BaseModel
from cms.models.Game import Game
from cms.models.Affiliation import Affiliation

class Role(BaseModel):
	REQ_NEVER = 'never'
	REQ_GENERIC = 'generic'
	REQ_ALWAYS = 'always'
	# If an extra role exists compared to the players
	REQ_BURYING = 'burying'
	# If the "related" roles are in, this needs to be in
	REQ_PAIRED = 'paired'

	REQ_CHOICES = (
		(REQ_NEVER, REQ_NEVER.capitalize()), 
		(REQ_GENERIC, REQ_GENERIC.capitalize()),
		(REQ_ALWAYS, REQ_ALWAYS.capitalize()),
		(REQ_BURYING, REQ_BURYING.capitalize()),
		(REQ_PAIRED, REQ_PAIRED.capitalize()),
	)


	name = models.CharField(max_length=32, default='Unnamed Role')
	game = models.ForeignKey(Game, null=False)
	affiliation = models.ForeignKey(Affiliation, null=True, blank=True)
	text = models.TextField(blank=True)
	generic = models.BooleanField(default=False)
	maxPerGame = models.PositiveSmallIntegerField(default=0)
	required = models.CharField(max_length=32, default=REQ_NEVER, choices=REQ_CHOICES)
	#relatedRoles =

	def __unicode__(self):
		return u'%s' % (self.name)

	class Meta:
		app_label = 'cms'
		verbose_name_plural = 'roles'
		ordering = ['name']

class RoleAdmin(admin.ModelAdmin):
	list_display = ['id', 'name', 'game', 'affiliation', 'generic', 'required']
	list_filter = ['game']

# For serializing with django_rest_framework
class RoleSerializer(serializers.ModelSerializer):
	class Meta:
		model = Role
		fields = ('id', 'name', 'game', 'affiliation', 'generic', 'text', 'required')

Role.serializer = RoleSerializer