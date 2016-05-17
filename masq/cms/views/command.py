import json
import pusher
from datetime import datetime

from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseBadRequest, JsonResponse
from django.views.decorators.csrf import csrf_exempt

from cms.models import GameSession, Player, Role, Affiliation
from cms.utils.Utils import assignRoles, assignAffiliation

def command(request):
	print "Command me!"
	data = request.GET

	action = data.get('action', None)
	#print "Lights, camera", action

	if not action:
		return HttpResponseBadRequest

	if action == 'startSession':
		resp = startSession(data)
	elif action == 'startRound':
		resp = startRound(data)
	else:
		return HttpResponseBadRequest("Unknown command action.")

	if resp is None:
		resp = HttpResponse()
		resp.status_code = 200
		resp.content = 'HOOORAY'
	return resp 

def startSession(data):
	sess = data.get('session', None)
	#print "Sessioning"
	session = GameSession.objects.get(id=sess)
	if session.status != GameSession.STATUS_LOBBY:
		return HttpResponseBadRequest("Status not set to Lobby. Can't start a session that's already been started.")

	#print "Retrieving things"
	#roleIds = data.get('roles', '').split(',')
	#print data.get('roles', [])
	players = Player.objects.filter(session=session)
	if data.get('assignAffiliation', False):
		if not assignAffiliation(session, Affiliation, Role, players):
			return HttpResponseBadRequest("Failed to assign affiliations, missing roles?")
		
	else:
		chosenRoles = session.roles.all()
		genericRoles = Role.objects.filter(game=session.game, generic=True)

		#print "About to assign roles"
		if not assignRoles(session, chosenRoles, genericRoles, players):
			return HttpResponseBadRequest("Failed to assign roles, mismatched teams?")

	session.status=GameSession.STATUS_ACTIVE
	session.save()

	# TODO Generalize pushing mechanic
	#print "Pre push"
	push = pusher.Pusher(app_id=settings.PUSHER_APP, key=settings.PUSHER_KEY, secret=settings.PUSHER_SECRET)

	push.trigger('presence-lobby'+sess, 'game', {'message': 'Game session is starting', 'action': 'rolesAssigned' })
	#print "Post push"

	return None

def startRound(data):
	sess = data.get('session', None)
	#print "Sessioning"
	session = GameSession.objects.get(id=sess)

	if session.status != GameSession.STATUS_ACTIVE:
		return HttpResponseBadRequest("Session is not Active. Cannot start rounds.")

	now = datetime.now()

	session.currentRound = session.currentRound + 1
	session.save()

	resp = {'message': 'Round is starting', 
			'action': 'roundStart', 
			'round': session.currentRound, 
			#'startDatetime': str(now), 
			'secondsRemaining': session.secondsPerRound() }

	push = pusher.Pusher(app_id=settings.PUSHER_APP, key=settings.PUSHER_KEY, secret=settings.PUSHER_SECRET)

	push.trigger('presence-game'+sess, 'game', resp)
	#print "Post push"

	return None

@csrf_exempt
def auth(request):
	data = request.POST
	channel_name = data.get('channel_name')
	socket_id = data.get('socket_id')

	if not request.session.get('has_session'):
		request.session['has_session'] = True

	try:
		pl = Player.objects.get(browserSession=request.session.session_key)
	except:
		print "Attempting to Authorize: No player found with this session key", request.session.session_key
		pl = None

	channel_data = {'user_id': socket_id}
	if pl:
		channel_data['user_info'] = {'name':pl.name, 'id': pl.id}
	else:
		channel_data['user_info'] = {'name': 'Unknown player', 'id': None}

	p = pusher.Pusher(app_id=settings.PUSHER_APP, key=settings.PUSHER_KEY, secret=settings.PUSHER_SECRET)

	authtxt = p.authenticate(channel_name, socket_id, channel_data)
	json_data = json.dumps(authtxt)

	#return JsonResponse(auth)
	return HttpResponse(json_data)