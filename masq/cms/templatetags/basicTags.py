# Version info $Id: basicTags.py 10419 2014-04-10 21:10:29Z jeremy $

from itertools import chain
import pytz
from datetime import datetime

from django import template
from django.conf import settings
from django.template import RequestContext
from django.template.loader import render_to_string
from django.template.defaultfilters import date as formatDate
from django.utils.html import escape

from cms.utils import Utils
from cms.templatetags.basicFilters import toDatetimeString

register = template.Library()


@register.inclusion_tag('widgets/toggleSwitch.html', takes_context=True)
def toggleSwitch(context, id, checked, figureClass="", labelText=""):
	if "toggleSwitchIds" not in context:
		context['toggleSwitchIds'] = set()
	if id in context['toggleSwitchIds']:
		raise Exception("ID \"%s\" has already been used for a toggle switch. IDs must be unique." % id)
	context['toggleSwitchIds'].add(id)
	return {
		"id": id,
		"checked": checked,
		"labelText": labelText,
		"figureClass": figureClass
	}


@register.inclusion_tag('widgets/slider.html')
def slider(id, value, figureClass="", minVal=None, maxVal=None, step=None, labelText=""):
	return {
		"id": id,
		"value": value,
		"class": figureClass,
		"min": minVal if minVal != "None" else None,
		"max": maxVal if maxVal != "None" else None,
		"step": step if step != "None" else None,
		"labelText": labelText
	}


@register.simple_tag(takes_context=True)
def help(context, filename, fallback=""):
	try:
		return render_to_string("help/%s.html" % filename, {}, context_instance=RequestContext(context['request']))
	except:
		return fallback


@register.inclusion_tag('widgets/showHelp.html', takes_context=True)
def showHelp(context, helpName):
	# TODO Add HelpViewed structure so help menus aren't re-shown to users unless they change
	return {
		'show': True,
		'helpName': helpName
	}


@register.simple_tag
def clientDataObj(data):
	if data.FIELDS:
		d = data.toDict(data.FIELDS)
	else:
		d = data.toDict()

	json = escape(Utils.jsonWithDates([d]))

	return "<input type='hidden' data-%s=\"%s\" data-json=\"%s\">" % ("model", data.__class__.__name__, json)


@register.simple_tag
def clientData(data, fieldName=None, alt=False, convert=True, model=False):
	if not fieldName and hasattr(data, "model"):  # if no field name is provided, assume it's a standard queryset (or ValuesList)
		fieldName = data.model.__name__
		model = True
		convert = False
		if fieldName == "User":
			if data.__class__.__name__ == "ValuesQuerySet":
				data = zcastUtils.UsersValueListToJson(data)
			else:  # normal queryset (we hope)
				data = zcastUtils.UsersToJson(data)
		elif fieldName == "Group":
			data = zcastUtils.jsonWithDates(data)
		else:
			convert = True  # otherwise, just let it fall through and call toJSON or jsonWithDates

	if convert:
		if hasattr(data, "toJSON"):
			try:
				data = data.toJSON(alt=alt)
			except:
				data = data.toJSON()
		else:
			data = Utils.jsonWithDates(data)

	data = escape(data)

	return "<input type='hidden' data-%s=\"%s\" data-json=\"%s\">" % (("model" if model else "field"), fieldName, data)


@register.simple_tag
def clientMultiData(*args, **kwargs):
	return "\n".join(chain((clientData(d) for d in args), (clientData(v, k) for k, v in kwargs.items())))


@register.simple_tag(takes_context=True)
def clientTime(context, dt, format=None):
	request = context['request']
	if "tzOffset" in request.COOKIES:
		newDT = dt.astimezone(pytz.FixedOffset(int(request.COOKIES["tzOffset"])))
	else:
		newDT = dt.astimezone(pytz.timezone(settings.TIME_ZONE))

	if format:
		txt = formatDate(newDT, format)
		txt = txt.replace(".", "")
	else:
		txt = toDatetimeString(newDT)

	return "<time class='clientTime' data-timestamp='%s' data-format='%s'>%s</time>" % (zcastUtils.jsonWithDates(dt), format, txt)


@register.simple_tag(takes_context=True)
def clientRelTime(context, dt):
	now = datetime.now(pytz.utc)
	delta = now - dt
	if delta.days < 1:
		if delta.seconds < 60:  # <1 minute
			relTime = "%d second%s ago" % (delta.seconds, "" if delta.seconds == 1 else "s")
		elif delta.seconds < 3600:  # <1 hour
			minutes = int(delta.seconds // 60)
			relTime = "%d minute%s ago" % (minutes, "" if minutes == 1 else "s")
		else:  # measure in hours
			hours = int(delta.seconds // 3600)
			relTime = "%d hour%s ago" % (hours, "" if hours == 1 else "s")
		return "<time class='clientRelTime' title='%s' data-timestamp='%s'>%s</time>" % (rawClientTime(context, dt, "n/d @ g:ia"), zcastUtils.jsonWithDates(dt), relTime)
	else:
		return clientTime(context, dt, "n/d @ g:ia")


@register.simple_tag(takes_context=True)
def rawClientTime(context, dt, format=None):
	request = context['request']
	if "tzOffset" in request.COOKIES:
		newDT = dt.astimezone(pytz.FixedOffset(int(request.COOKIES["tzOffset"])))
	else:
		newDT = dt.astimezone(pytz.timezone(settings.TIME_ZONE))

	if format:
		txt = formatDate(newDT, format)
		txt = txt.replace(".", "")
	else:
		txt = toDatetimeString(newDT)

	return txt


@register.simple_tag
def serverTime(dt, format=None):
	newDT = dt.astimezone(pytz.timezone(settings.TIME_ZONE))

	if format:
		txt = formatDate(newDT, format)
		txt = txt.replace(".", "")
	else:
		txt = toDatetimeString(newDT)

	return "<time class='serverTime' data-timestamp='%s'>%s</time>" % (zcastUtils.jsonWithDates(newDT), txt)
