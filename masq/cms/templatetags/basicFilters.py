# Version info $Id: basicFilters.py 10595 2014-06-05 18:48:33Z karl $

import calendar
import os
import os.path
import pytz

from cms.utils.Utils import jsonWithDates

from django import template
from django.template.defaultfilters import stringfilter
from django.conf import settings
from datetime import datetime, date, timedelta


register = template.Library()

SYMBOLS = ('', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y')
PREFIX = {}

for i, s in enumerate(SYMBOLS):
	PREFIX[s] = 1 << i*10

@register.filter(name='memoryFromNumBytes')
def memoryFromNumBytes(n):
	for s in reversed(SYMBOLS):
		if n >= PREFIX[s]:
			value = float(n) / PREFIX[s]
			return '%.2f %sB' % (value, s)

	return ""

@register.filter(name='memoryFromMB')
def memoryFromMB(n):
	return memoryFromNumBytes(n << 20)

@register.filter(name='percentOf')
def percentOf(numerator, denominator):
	if denominator == 0:
		return 0
	return round(float(100*float(numerator)/denominator),2)

@register.filter(name='dict')
def dictionaryAccess(dictionary, key):
	try:
		return dictionary.get(key, "")
	except:
		return ""

@register.filter
def toISODateTimeString(datetime):
	return datetime.strftime('%Y-%m-%d %H:%M:%S')

@register.filter
def toISODateString(datetime):
	return datetime.strftime('%Y-%m-%d')

@register.filter
def toDateString(datetime):
	# return "%d/%d/%d" % (datetime.month, datetime.day, datetime.year)
	return datetime.strftime('%m/%d/%Y')

@register.filter
def toShortDate(dt, compDatetime = None):
	''' pass in compDatetime to have it include the year if it differs '''
	if compDatetime is not None and not hasattr(compDatetime, "year"):
		compDatetime = datetime.fromtimestamp(compDatetime, pytz.utc)
	return "%d/%d%s" % (dt.month, dt.day, (("/%02d" % (dt.year % 100)) if compDatetime and dt.year != compDatetime.year else ""))

@register.filter
def toLongDate(datetime, withDay=True):
	return datetime.strftime(("%A " if withDay else "") + "%B X%d, %Y").replace("X0", "").replace("X", "")  # somewhat ugly, but effective, method of removing the leading 0 from the day

@register.filter
def toTimeString(datetime):
	hour = datetime.hour % 12
	if hour == 0:
		hour = 12
	amPm = "am" if datetime.hour < 12 else "pm"
	#return "%d:%02d:%02d%s" % (hour, datetime.minute, datetime.second, amPm)
	return "%d:%02d%s" % (hour, datetime.minute, amPm)

@register.filter
def toLongTimeString(datetime):
	hour = datetime.hour % 12
	if hour == 0:
		hour = 12
	amPm = "am" if datetime.hour < 12 else "pm"
	return "%d:%02d:%02d%s" % (hour, datetime.minute, datetime.second, amPm)

@register.filter
def toNakedTimeString(datetime):
	''' Same as toLongTimeString (h:mm:ss) but without am/pm '''
	hour = datetime.hour % 12
	if hour == 0:
		hour = 12
	return "%d:%02d:%02d" % (hour, datetime.minute, datetime.second)

@register.filter
def toDatetimeString(datetime):
	return "%s %s" % (toDateString(datetime), toTimeString(datetime))

@register.filter
def tdToTime(td):
	return secondsToTime(td.seconds)

@register.filter
def secondsToTime(seconds):
	seconds = int(seconds)
	if seconds > 3600:
		return "%d:%02d:%02d" % (seconds // 3600, (seconds // 60) % 60, seconds % 60)
	return "%d:%02d" % (seconds // 60, seconds % 60)

MONTH_NUM_TO_STRING = (
	'January',
	'Februrary',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December'
)

@register.filter
def toMonthString(datetime):
	return "%s %d" % (MONTH_NUM_TO_STRING[datetime.month - 1], datetime.year)

@register.filter
def toDayAbbrev(datetime):
	return datetime.strftime("%a")

@register.filter
def dayNameList(startDay, abbr=False):
	cal = calendar.Calendar(startDay)
	if abbr:
		return [calendar.day_abbr[day] for day in cal.iterweekdays()]
	return [calendar.day_name[day] for day in cal.iterweekdays()]


@register.filter
def serverTime(dt, format=None):
	return dt.astimezone(pytz.timezone(settings.TIME_ZONE))


@register.filter
def isToday(dt):
	if dt.tzinfo:
		dt = dt.astimezone(pytz.timezone(settings.TIME_ZONE))
	return dt.date() == date.today()


@register.filter
def diff(a, b):
	return a - b

@register.filter
def sum(a, b):
	return a + b

@register.filter
def tdSeconds(td):
	return "%02d" % (td.seconds % 60)

@register.filter
def tdMinutes(td):
	return "%02d" % ((td.seconds // 60) % 60)

@register.filter
def tdHours(td):
	return td.seconds // 3600

@register.filter
def filenameFromPath(path):
	splitPath = os.path.split(path)
	if splitPath[-1] == "":
		return splitPath[-2]
	else:
		return splitPath[-1]

@register.filter(name='indicatorClass')
def indicatorClass(boolVal):
	if (boolVal):
		return "ok"
	else:
		return "fail"

@register.filter(name='json')
def toJSON(pythonObj, extended=False):
	return jsonWithDates(pythonObj, extended)

@register.filter(name='altJson')
def altJSON(pythonObj):
	if hasattr(pythonObj, "toJSON"):
		return pythonObj.toJSON(alt=True)

@register.filter(name='min')
def minInList(l, delimiter=','):
	if isinstance(l, list):
		return min(l)
	else:
		try:
			realList = [float(l), float(delimiter)]  # min of two numbers
		except ValueError:
			realList = [float(x) for x in l.split(delimiter)]
	retVal = min(realList)
	return int(retVal) if int(retVal) == retVal else retVal

@register.filter
def fieldMaxLength(model, fieldName):
	if hasattr(model, "_meta"):
		meta = model._meta
	elif hasattr(model.__class__, "_meta"):
		meta = model.__class__._meta
	else:
		raise Exception("Invalid model for finding field max length")
	return meta.get_field(fieldName).max_length

@register.filter
def mediaRequestable(recording):
	if recording.scheduledEntry is None or recording.fileLocation != "":
		return False
	timeSinceEnd = datetime.now(pytz.utc) - recording.scheduledEntry.end
	acceptableTime = timedelta(minutes=settings.REQUEST_MEDIA_BUFFER)
	return timeSinceEnd > acceptableTime

@register.filter
def toString(var):
	return str(var)

@register.filter
def oneDayTime(dayTimes, loopCounter):
	if len(dayTimes) > 1:
		return dayTimes[loopCounter if loopCounter < 7 else 0]
	else:
		return False

@register.filter
def percentageIn(now, scheduledEntry):
	divisor = (scheduledEntry.end - scheduledEntry.start).seconds

	return 100 * (now - scheduledEntry.start).seconds / divisor if divisor > 0 else 0

@register.filter
@stringfilter
def toInt(str):
	return int(float(str))

@register.filter
@stringfilter
def toFloat(str):
	return float(str)

@register.filter(name='split')
@stringfilter
def split(listStr, delimiter=','):
	return listStr.split(delimiter)

@register.filter
@stringfilter
def themedCssExists(filename, skinName):
	staticRoot = settings.STATICFILES_DIRS[0]
	return os.path.exists(staticRoot + "/css/" + skinName + "-skin/" + filename + ".css")

adminPages = set(["systemSettings", "universitySetup", "calendarsAndDates", "bulkData", "appearance"])

@register.filter
@stringfilter
def selectedPage(curPage, candidatePage):
	if curPage == candidatePage:
		return True
	elif candidatePage == "admin" and curPage in adminPages:
		return True
	else:
		return False

@register.filter
def startsWith(value, arg):
	"""Usage, {% if value|startsWith:"arg" %}"""
	return value.startswith(arg)
