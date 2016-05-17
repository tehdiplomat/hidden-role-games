import calendar
import json

from django.conf import settings
from django.core import serializers
from django.contrib.auth.models import User, Group
from django.contrib.contenttypes.models import ContentType
from django.contrib.sites.models import Site
from django.db.models import Q

from datetime import datetime
from operator import __or__ as OR
from random import shuffle

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

def assignAffiliation(session, Affiliation, Role, players):
	# This is used in SpyFall - 
	# Choose a random affiliation (Location), and assign roles that matches that affiliation + Spy
	game = session.game
	aff = Affiliation.objects.filter(game=game, primary=False).order_by('?')[0]
	roles = Role.objects.filter(affiliation=aff).order_by('?')
	genericRoles = Role.objects.filter(game=game, generic=True)

	allRoles = list(genericRoles) + list(roles[:players.count()-1])

	pl = list(players)

	print "Player Count", len(pl), "Role Count", len(allRoles)

	# Randomize roles to players
	shuffle(pl)
	shuffle(allRoles)

	for p, r in zip(pl, allRoles):
		p.role = r
		p.save()

	return True

def assignRoles(session, chosenRoles, genericRoles, players, extraRoles=0):
	# This is used in Two Rooms - Take chosen roles and create a formula to assign
	# Extra roles is for hiding cards will mostly ignore for now
	specialRoles = chosenRoles.filter(generic=False)
	neutrals = specialRoles.filter(affiliation__isnull=True)
	
	affiliateRef = affiliateReference(session.game)
	affiliateFormula = roleFormula(session.game, players.count(), affiliateRef, neutrals.count(), extraRoles)

	allRoles = list(specialRoles)

	for formula in affiliateFormula:
		count = affiliateFormula[formula]
		matched = 0
		if formula == 'Unaffiliated':
			matched = neutrals.count()
			if matched < count:
				# This shouldn't happen, but if it does we need to add "generic" Neutrals, which don't really exist
				# So for now just bail out
				return True
		else:
			matched = specialRoles.filter(affiliation__name=formula).count()
			leftover = count - matched
			if leftover > 0:
				generic = genericRoles.filter(affiliation__name=formula)
				allRoles.extend(list(generic)*leftover)


	# If there are extra roles, pull one out now

	pl = list(players)

	print "Player Count", len(pl), "Role Count", len(allRoles)

	# Randomize roles to players
	shuffle(pl)
	shuffle(allRoles)

	for p, r in zip(pl, allRoles):
		p.role = r

	# Randomize players again for room assignment
	shuffle(pl)
	for idx, p in enumerate(pl):
		p.room = idx % 2 + 1
		print "Player: ", p, "Role: ", p.role, "Room:", p.room
		p.save()

	return True

def affiliateReference(game):
	ref = {}
	if game.name == 'Two Rooms and a Boom':
		ref['good'] = 'Blue Team'
		ref['evil'] = 'Red Team'

	elif game.name == 'Spyfall':
		ref['good'] = 'Location'
		ref['evil'] = 'Unknown Location'

	return ref


def roleFormula(game, players, ref, neutralRoles=0, extraRoles=0):
	d = {}
	bonusNeutral = 0
	if game.name == 'Two Rooms and a Boom':
		nonNeutrals = (players + extraRoles) - neutralRoles
		if nonNeutrals % 2 == 1:
			bonusNeutral = 1

		d['Unaffiliated'] = neutralRoles + bonusNeutral
		d[ref['good']] = d[ref['evil']] = nonNeutrals / 2

	elif game.name == 'Spyfall':
		d[ref['good']] = players - 1
		d[ref['evil']] = 1

	return d

def playerByRoundFormula(game, players, rounds):
	gameSize = None
	if game.name == 'Two Rooms and a Boom':
		if players < 11:
			gameSize = 'tiny'
		elif players < 14:
			gameSize = 'small'
		elif players < 18:
			gameSize = 'medium'
		elif players < 22:
			gameSize = 'large'
		elif players >= 22:
			gameSize = 'huge'


	if gameSize:
		l = settings.PLAYERS_BY_ROUND[game.name][gameSize][-rounds:]
		return ','.join(str(x) for x in l)

	return ''


# Files
def getUploadPath(instance, filename, absolute=False):
	root = settings.MEDIA_ROOT if absolute else ''
	return "%s%s/%s" % (root, instance.id, filename)