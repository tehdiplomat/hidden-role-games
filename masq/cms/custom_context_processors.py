from django.conf import settings
from datetime import time


def customProcessors(request):
	curPath = request.path_info
	splitPath = curPath.split("/")
	curPage = splitPath[-1]

	if (curPage == ""):
		curPage = splitPath[-2]

	try:
		us = request.user.usersession_set.get(session=request.session.session_key)
		usId = us.id
	except:
		usId = ""

	try:
		HRG_VERSION = settings.HRG_VERSION
	except:
		HRG_VERSION = ""

	return {
		"request": request,
		"curPage": curPage,
		"Pusher": settings.PUSHER_APP,
		"GET": request.GET,
		"usId": usId,
		"HRG_VERSION": HRG_VERSION
	}