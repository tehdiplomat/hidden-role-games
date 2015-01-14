import pusher

from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, Http404

from cms.models import GameSession, Player, Role
from cms.utils.Utils import assignRoles

def command(request):
	print "Command me!"
	data = request.GET

	action = data.get('action', None)
	#print "Lights, camera", action

	if not action:
		return Http404

	if action == 'startSession':
		resp = startSession(data)
	else:
		return Http404

	if resp == None:
		resp = HttpResponse()
		resp.status_code = 200
		resp.content = 'HOOORAY'
	return resp 

def startSession(data):
	sess = data.get('session', None)
	#print "Sessioning"
	session = GameSession.objects.get(id=sess)
	if not session.active:
		return Http404

	#print "Retrieving things"
	#roleIds = data.get('roles', '').split(',')
	#print data.get('roles', [])
	players = Player.objects.filter(session=session)
	chosenRoles = Role.objects.filter(id__in=session.roles)
	genericRoles = Role.objects.filter(game=session.game, generic=True)

	#print "About to assign roles"
	if assignRoles(session, chosenRoles, genericRoles, players):
		return Http404

	# TODO Generalize pushing mechanic
	#print "Pre push"
	push = pusher.Pusher(app_id=settings.PUSHER_APP, key=settings.PUSHER_KEY, secret=settings.PUSHER_SECRET)

	push['lobby'+sess].trigger('game', {'message': 'Game session is starting', 'action': 'rolesAssigned' })
	#print "Post push"

	return None