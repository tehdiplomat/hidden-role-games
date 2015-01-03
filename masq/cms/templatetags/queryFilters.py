# Version info $Id: queryFilters.py 8603 2013-02-13 21:11:06Z chris $

from django import template

register = template.Library()

@register.filter(name='queryFilter')
def queryFilter(querySet, filter):
	filtersList = filter.split(",")
	filtersDict = dict()
	for oneFilter in filtersList:
		splitFilter = oneFilter.partition(":")
		filtersDict[splitFilter[0]] = splitFilter[2]
	return querySet.filter(**filtersDict)

@register.filter(name='orderBy')
def orderBy(querySet, field):
	if querySet:
		fields = field.split(",")
		return querySet.order_by(*fields)
	else:
		return querySet

@register.filter(name='getLogs')
def getLogs(room, all_logs):
	return all_logs.filter(room=room).order_by("-time")

@register.filter(name='hasMultipleLogs')
def hasMultipleLogs(room, all_logs):
	return all_logs.filter(room=room).count() > 1