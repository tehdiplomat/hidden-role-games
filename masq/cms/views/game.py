from django.http import HttpResponse
from django.shortcuts import render_to_response, get_object_or_404
from django.template import RequestContext
from django.contrib.auth.decorators import login_required
from django.conf import settings
from cms.models import GameSession, Game, Player, Affiliation, Role
from cms.utils.Utils import playerByRoundFormula

def start(request):
	games = Game.objects.all()
	sessions = GameSession.objects.exclude(status=GameSession.STATUS_END)

	if not request.session.get('has_session'):
		request.session['has_session'] = True

	return render_to_response('start.html', {
		'games': games,
		'gameSessions': sessions
	}, context_instance=RequestContext(request))

def lobby(request, id=None):
	if not request.session.get('has_session'):
		request.session['has_session'] = True
	
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

	g = list(game[:1])[0]
	gameName = g.name

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

	if player:
		if not request.session.get('has_session'):
			request.session['has_session'] = True

		print "Assigning session key to ", request.session.session_key, player
		player.browserSession_id = request.session.session_key
		player.save()

		print "Player %s associated with %s" % (player, player.browserSession_id)

	players = Player.objects.filter(session=session)
	inviteURL = '%smasq/lobby/%s/?init=join' % (settings.SITE_URL, id)

	folder = g.template if g.template else ''
	lobbyTemplate = '%slobby.html' % folder
	refTemplate = '%sreference.html' % folder

	return render_to_response(lobbyTemplate, {
		'refTemplate': refTemplate,
		'game': g,
		'games': game,
		'gameSessions': session,
		'player': player,
		'players': players,
		'affiliations': affiliations,
		'roles': roles,
		'inviteURL': inviteURL,
		'shortRounds': settings.ROUNDS[gameName].get('short', 1),
		'longRounds': settings.ROUNDS[gameName].get('long', 1)
	}, context_instance=RequestContext(request))


def play(request):
	try:
		pl = Player.objects.get(browserSession=request.session.session_key)
	except:
		print "No player found with this session key", request.session.session_key
		pl = None

	session = pl.session
	game = session.game
	role = pl.role
	affiliation = role.affiliation
	affiliations = Affiliation.objects.filter(game=game, primary=False)
	chosenRoles = (session.roles.all() | Role.objects.filter(game=game, generic=True)).distinct()
	players = Player.objects.filter(session=session)

	byRound = playerByRoundFormula(game, players.count(), session.rounds)

	folder = game.template if game.template else ''
	playTemplate = '%splay.html' % folder
	refTemplate = '%sreference.html' % folder

	return render_to_response(playTemplate, {
		'refTemplate': refTemplate,
		'game': game,
		'gameSession': session,
		'roles': chosenRoles,
		'role': role,
		'players': players,
		'player': pl,
		'affiliation': affiliation,
		'affiliations': affiliations,
		'roundStart': str(session.modified),
		'roundTime': session.secondsPerRound(),
		'byRound': byRound
	}, context_instance=RequestContext(request))

def roleCreator(request):
	games = Game.objects.all()
	affiliations = Affiliation.objects.all()

	return render_to_response('roleCreator.html', {
		'games': games,
		'affiliations': affiliations
	}, context_instance=RequestContext(request))