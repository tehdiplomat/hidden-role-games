from django.http import HttpResponse
from django.shortcuts import render_to_response, get_object_or_404
from django.template import RequestContext
from django.contrib.auth.decorators import login_required
from django.conf import settings
from cms.models import GameSession, Game, Player, Affiliation, Role


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
	sessions = GameSession.objects.filter(active=True)

	return render_to_response('start.html', {
		'games': games,
		'gameSessions': sessions
	}, context_instance=RequestContext(request))

def lobby(request, id=None):
	session = GameSession.objects.filter(id=id)

	if not session.count():
		resp = HttpResponse()
		resp.status_code = 400
		resp.content = 'Game Session for %s not found' % id
		return resp

	game = Game.objects.filter(gamesession__in=session)
	affiliations = Affiliation.objects.filter(game=game)
	roles = Role.objects.filter(game=game, generic=False)

	init = request.GET.get('init', None)
	player = None

	if init == 'host':
		# Should this really be a get or create?
		player = Player.objects.get_or_create(session=session[0], host=True)[0]

	elif init == 'join':
		player = Player()
		player.session = session[0]
		player.host = False
		player.save()

	elif init == 'rejoin':
		name = request.GET.get('name', None)
		pin = request.GET.get('pin', None)
		try:
			player = Player.objects.get(name=name, pin=pin, session=session[0])
		except:
			resp = HttpResponse()
			resp.status_code = 400
			resp.content = 'Incorrect credentials provided for Player %s in Session %s' % (name, id)
			return resp

	else:
		# No player passed in, this will either error out or load from localstorage
		# Watcher? Ask user if they want to try to log in with localstorage user?
		player = None

	players = Player.objects.filter(session=session)
	inviteURL = '%smasq/lobby/%s/?init=join' % (settings.SITE_URL, id)

	return render_to_response('lobby.html', {
		'games': game,
		'gameSessions': session,
		'player': player,
		'players': players,
		'affiliations': affiliations,
		'roles': roles,
		'inviteURL': inviteURL
	}, context_instance=RequestContext(request))


def play(request):
	games = Game.objects.all()

	return render_to_response('play.html', {
		'games': games
	}, context_instance=RequestContext(request))
