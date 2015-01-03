from django.conf.urls import patterns, include, url
from django.contrib import admin

urlpatterns = patterns('cms.views',
	url(r'^$', 'generic.index'),

	url(r'^create$', 'game.create'),
	url(r'^join$', 'game.join'),
	url(r'^lobby$', 'game.lobby'),
	url(r'^play$', 'game.play'),

	#url(r'^command$', 'command.command'),
)