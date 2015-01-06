from django.conf.urls import patterns, include, url
from django.contrib import admin

urlpatterns = patterns('cms.views',
	url(r'^$', 'generic.index'),

	url(r'^start$', 'game.start'),
	url(r'^join$', 'game.join'),
	url(r'^lobby/(?P<id>[0-9]+)/$', 'game.lobby'),
	url(r'^play$', 'game.play'),

	#url(r'^command$', 'command.command'),
)
