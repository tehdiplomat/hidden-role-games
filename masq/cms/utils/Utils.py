import calendar
import subprocess
import json
import urllib2
import urllib

from django.conf import settings
from django.core import serializers
from django.contrib.auth.models import User, Group
from django.contrib.contenttypes.models import ContentType
from django.contrib.sites.models import Site
from django.db.models import Q

from datetime import datetime
from operator import __or__ as OR
from uuid import getnode as get_mac


SIOCGIFCONF = 0x8912  #define SIOCGIFCONF
BYTES = 4096          # Simply define the byte size
def UsersToJson(objects):
	if hasattr(objects, "select_related"):
		objects = objects.select_related("groups")

	# Flatten groups to a dictionary of ID -> Name!
	groups = {}
	for g in Group.objects.all():
		groups[g.id] = g.name

	usersToGroup = {}
	for ug in User.groups.through.objects.filter(user__in=objects):
		userId = ug.user_id
		groupId = ug.group_id
		try:
			usersToGroup[userId].append(groupId)
		except:
			usersToGroup[userId] = [ groupId ]

	return jsonWithDates([userToDict(o, groups, usersToGroup.get(o.id, [])) for o in objects])

def userToDict(u, groups, userGroups, notificationList=None):
	profile = u.userprofile
	
	return {
		'pk': u.id,
		'model': 'auth.user',
		'fields': {
			'username': u.username,
			'firstName': u.first_name,
			'lastName': u.last_name,
			'email': u.email,
			'groups': userGroups,
			'groupName': (groups[userGroups[0]] if userGroups else ""),
			'notificationTypes': [], # For now just an empty array, just in case something needs it
			'displayName': profile.displayName,
			'department': profile.department,
			'receiveEmails': profile.receiveEmails,
			'alertSound': profile.alertSound,
			'phone': profile.phone,
			'altEmail': profile.altEmail,
			'mobileNewsletter': profile.mobileNewsletter
		}
	}

def UsersValueListToJson(objects):
	return json.dumps( [{
		'pk': o['id'],
		'model': 'auth.user',
		'fields': {
			'username': o.get('username', ''),
			'firstName': o.get('first_name', ''),
			'lastName': o.get('last_name', ''),
			'email': o.get('email', '')
		}
	} for o in objects] )

def GroupsForJson(groups):
	return groups.values_list('id', flat=True)

def safeJsonDatesDict(d):
	for k, v in d.items():
		if isinstance(v, datetime):
			d[k] = convertToTimestamp(v)
	return d

def valueListToJson(objects, model, pk='id'):
	return json.dumps( [{
		'pk': o[pk],
		'model': model,
		'fields': safeJsonDatesDict(o)
	} for o in objects])

def getMacAddress():
	macInt = get_mac()
	# convert from int to a 12-digit hex string
	macHex = ""
	# first without colons
	for i in range(11, -1, -1):
		macHex = hex(macInt%16)[2:-1] + macHex
		macInt/=16

	#now insert colons
	macStr = ""
	for i in range(0, 12, 2):
		macStr += macHex[i:i+2] + ":"
	macStr = macStr[:-1]

	return macStr

def convertToTimestamp(sqlDateTime):
	return int(calendar.timegm(sqlDateTime.utctimetuple()))

def convertToDateString(sqlDate):
	return sqlDate.strftime("%Y-%m-%d")

def convertToTimeString(sqlTime):
	return sqlTime.strftime("%X")

def jsonWithDates(obj, extended=False):
	def extraHandler(o):
		if hasattr(o, "utctimetuple"):		# datetime object
			return convertToTimestamp(o)
		elif hasattr(o, "strftime"):
			if not hasattr(o, "minute"):  	# date object
				return convertToDateString(o)
			else:							# time object
				return convertToTimeString(o)

		elif o.__class__.__name__ == "BaseQuerySet" or o.__class__.__name__ == "QuerySet":
			return serializers.serialize("python", o)
		elif o.__class__.__name__ == "ValuesQuerySet":
			return [{
				'pk': item['id'],
				'model': o.model._meta.app_label + "." + o.model._meta.module_name,
				'fields': item
			} for item in o]
		elif o.__class__.__name__ == 'FieldFile':
			return o.url if o else ''
		elif hasattr(o, "__iter__"):
			return list(o)
		elif hasattr(o, "__float__"):
			return float(o)
		elif hasattr(o, "__int__"):
			return int(o)
		elif extended and hasattr(o, "toJSON"):
			return json.loads(o.toJSON())
		elif extended and hasattr(o, "toDict"):
			return o.toDict()
		elif hasattr(o, "id"):
			return o.id
		else:
			raise TypeError, 'Object of type %s with value of %s is not JSON serializable (error with type %s)' % (type(obj), repr(obj), type(o))

	return json.dumps(obj, default=extraHandler)

def sendUpdateToDevices(action, devices, user):
	from nyse.models.Log import Log
	args = list()
	args.append("bash")
	
	commandLocation = '/home/zignage/nyse'
	
	if settings.ROOT_FILE_DIR:
		commandLocation = settings.ROOT_FILE_DIR
		
	commandLocation = "%s%s" % (commandLocation, "server/nyse/scripts/sendCommandToDevice.ksh")
		
	args.append(commandLocation)
	args.append(action)
	
	for d in devices:
		# Add Logs
		l = Log()
		l.object_id = d.id
		l.content_type = ContentType.objects.get_for_model(d)
		l.user = user
		l.type = action
		l.desc = l.get_type_display()
		l.save()
		# Append arguments
		args.append(d.name)
		args.append(d.ip)
	
	print args
	pid = subprocess.Popen(args).pid
	print "Process Id : {0}".format(pid)

def readLog(device):
	fileName = "%s%s.zignage_browser_log" % (settings.BASE_LOG_DIR, device.name)
	file = open(fileName, 'r')
	fileContents = file.read()
	file.close()
	return fileContents

def currentSiteUrl():
	"""Returns fully qualified URL (no trailing slash) for the current site."""
	current_site = settings.SITE_URL
	protocol = getattr(settings, 'MY_SITE_PROTOCOL', 'https')
	port     = getattr(settings, 'MY_SITE_PORT', '')
	url = '%s://%s' % (protocol, current_site.domain)
	if port:
		url += ':%s' % port
	return url

def logError(message):
	# Improve messaging for different log types
	if settings.TESTING:
		return

	print message

def queryExpressResolutions(model):
	res = settings.EXPRESS_RESOLUTIONS
	qs = []
	for r in res:
		qs.append(Q(resolutionWidth=r[0], resolutionHeight=r[1]))

	return model.objects.filter(reduce(OR, qs))
