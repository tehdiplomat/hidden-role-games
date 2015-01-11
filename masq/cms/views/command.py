import pusher

from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, Http404

from cms.models import GameSession

def command(request):
	data = request.POST

	action = data.get('action', None)

	if not action:
		return Http404

	if action == 'startSession':
		resp = startSession(data)

	resp = HttpResponse()
	resp.status_code = 200
	resp.content = 'HOOORAY'
	return resp 

def startSession(data):
	sess = data.get('session', None)

	session = GameSession.objects.get(id=sess)
	if not session.active:
		return Http404

	players = Player.objects.filter(game=session.game)
	chosenRoles = Role.objects.filter(id__in=data.get('roles', []))
	genericRoles = Role.objects.filter(game=session.game, generic=True)

	if assignRoles(session, chosenRoles, genericRoles, players):
		return Http404

	p = pusher.Pusher(app_id=settings.PUSHER_APP, key=settings.PUSHER_KEY, secret=settings.PUSHER_SECRET)

	p['lobby'+sess].trigger('game', {'message': 'Game session is starting', 'action': 'rolesAssigned' })