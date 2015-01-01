from django.db import models
from django.contrib import admin
from django.conf import settings
from rest_framework import serializers

from cms.models.Base import BaseModel
from cms.models.Game import Game

class Affiliation(BaseModel):
	name = models.CharField(max_length=32, default='Unnamed Affiliation')
	game = models.ForeignKey(Game, null=False)
	text = models.TextField(blank=True)
	primary = models.BooleanField(default=True)

	def __unicode__(self):
		return u'%s' % (self.name)

	class Meta:
		app_label = 'cms'
		verbose_name_plural = 'affiliations'
		ordering = ['name']

class AffiliationAdmin(admin.ModelAdmin):
	list_display = ['id', 'name', 'game', 'primary']
	list_filter = ['game']

# For serializing with django_rest_framework
class AffiliationSerializer(serializers.ModelSerializer):
	class Meta:
		model = Affiliation
		fields = ('id', 'name', 'game', 'primary', 'text')

Affiliation.serializer = AffiliationSerializer