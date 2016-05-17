import os
import pytz

from cms.utils.Utils import jsonWithDates

from django import template
from django.template.defaultfilters import stringfilter
from django.conf import settings
from datetime import datetime, date, timedelta


register = template.Library()


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



@register.filter(name='json')
def toJSON(pythonObj, extended=False):
	return jsonWithDates(pythonObj, extended)

@register.filter(name='altJson')
def altJSON(pythonObj):
	if hasattr(pythonObj, "toJSON"):
		return pythonObj.toJSON(alt=True)


@register.filter
def toString(var):
	return str(var)


@register.filter(name='split')
@stringfilter
def split(listStr, delimiter=','):
	return listStr.split(delimiter)

@register.filter
def startsWith(value, arg):
	"""Usage, {% if value|startsWith:"arg" %}"""
	return value.startswith(arg)
