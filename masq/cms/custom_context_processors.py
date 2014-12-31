from django.conf import settings
from datetime import time


def customProcessors(request):
	curPath = request.path_info
	splitPath = curPath.split("/")
	curPage = splitPath[-1]

	if (curPage == ""):
		curPage = splitPath[-2]

	sysIp = request.get_host()
	if sysIp.find(":") != -1:
		sysIp = sysIp[:sysIp.find(":")]

	if settings.EXPRESS_ONLY:
		navTabs = (
			("Express", "express"),
		)
	else:
		# TODO Add Users' grouplist to cache
		groupsList = request.user.groups.values_list('name', flat=True) if request.user.is_authenticated() else []
		navTabs = ()
		if "admin" in groupsList:
			navTabs = (
				("Devices", "devices"),
				("Media", "media"),
				("Campaign", "campaign"),
				("Schedule", "schedule"),
				("Express", "express")
			)
		elif "express" in groupsList:
			navTabs = (
				("Express", "express"),
			)
		elif "device" in groupsList:
			navTabs = (
				("Devices", "devices"),
			)



	timeChoices = [
		(
			time(hour=i),

			"%d %s" % (
				i % 12 if i % 12 != 0 else 12,  # multiples of 12 don't follow the pattern
				"AM" if i < 12 else "PM"
			)
		) for i in range(24)
	]

	try:
		us = request.user.usersession_set.get(session=request.session.session_key)
		usId = us.id
	except:
		usId = ""

	try:
		ZC_VERSION = settings.ZC_VERSION
	except:
		ZC_VERSION = ""

	return {
		"request": request,
		"navTabs": navTabs,
		"curPage": curPage,
		"socketioUrl": "//" + sysIp + ":" + str(settings.NODEJS_PORT) + "/",
		"GET": request.GET,
		"timeChoices": timeChoices,
		"usId": usId,
		"TIME_ZONE": settings.TIME_ZONE,
		"ZC_VERSION": ZC_VERSION
	}