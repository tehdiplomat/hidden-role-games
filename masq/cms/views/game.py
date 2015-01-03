from django.shortcuts import render_to_response
from django.template import RequestContext
from django.contrib.auth.decorators import login_required
from cms.models import GameSession, Game, Player

def join(request):
	sessions = GameSession.objects.all()
	games = Game.objects.filter(gamesession__in=sessions)
	# Players per session
	players = Player.objects.all()


	return render_to_response('join.html', {
		'sessions': sessions,
		'games': games,
		'players': players
	}, context_instance=RequestContext(request))

def start(request):
	games = Game.objects.all()

	return render_to_response('start.html', {
		'games': games
	}, context_instance=RequestContext(request))

def lobby(request):
	games = Game.objects.all()

	return render_to_response('lobby.html', {
		'games': games
	}, context_instance=RequestContext(request))


def play(request):
	games = Game.objects.all()

	return render_to_response('play.html', {
		'games': games
	}, context_instance=RequestContext(request))
