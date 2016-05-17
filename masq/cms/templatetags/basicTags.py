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
