from django.conf.urls import patterns, include, url
from rest_framework.urlpatterns import format_suffix_patterns

from cms.api import game, gameSession, affiliation, player, role

urlpatterns = patterns('cms.api',
	url(r'^$', 'index.api_root'),

	url(r'^affiliation/$', affiliation.AffiliationList.as_view(), name='affiliation-list'),
	url(r'^affiliation/(?P<pk>[0-9]+)/$', affiliation.AffiliationDetail.as_view(), name='affiliation-detail'),

	url(r'^game/$', game.GameList.as_view(), name='game-list'),
	url(r'^game/(?P<pk>[0-9]+)/$', game.GameDetail.as_view(), name='game-detail'),

	url(r'^gameSession/$', gameSession.GameSessionList.as_view(), name='gamesession-list'),
	url(r'^gameSession/(?P<pk>[0-9]+)/$', gameSession.GameSessionDetail.as_view(), name='gamesession-detail'),

	url(r'^player/$', player.PlayerList.as_view(), name='player-list'),
	url(r'^player/(?P<pk>[0-9]+)/$', player.PlayerDetail.as_view(), name='player-detail'),

	url(r'^role/$', role.RoleList.as_view(), name='role-list'),
	url(r'^role/(?P<pk>[0-9]+)/$', role.RoleDetail.as_view(), name='role-detail'),

)

urlpatterns = format_suffix_patterns(urlpatterns)