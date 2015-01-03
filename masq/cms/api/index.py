from rest_framework import renderers
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse


@api_view(('GET',))
def api_root(request, format=None):
	return Response({
		'affiliations': reverse('affiliation-list', request=request, format=format),
		'games': reverse('game-list', request=request, format=format),
		'gameSessions': reverse('gamesession-list', request=request, format=format),
		'players': reverse('player-list', request=request, format=format),
		'roles': reverse('role-list', request=request, format=format),
	})