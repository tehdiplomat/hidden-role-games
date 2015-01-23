import calendar
import datetime
import json
import pytz
import time

from django.conf import settings
from django.contrib.auth.models import User
from django.core import serializers
from django.db import models
from rest_framework.renderers import JSONRenderer

class BaseManager(models.Manager):
	def get_queryset(self):
		return BaseQuerySet(self.model)

	def get_empty_queryset(self):
		return EmptyBaseQuerySet(self.model)
	
	def getById(self, id):
		# Might be better to use this over objects.get(id=)
		objs = self.filter(id=id)
		if objs.count():
			return objs[0]
		
		return None

class BaseQuerySet(models.query.QuerySet):
	def toJSON(self, alt=False, render=True):
		# Experimental reuse of DRF Serializers
		if self.model.serializer:
			try:
				serializer = self.model.serializer(self, many=True)
				if render:
					return JSONRenderer().render(serializer.data)
				else:
					return serializer.data

			except:
				print "Failed to serialize QuerySet of %s. Falling back to old method", self.model

		raise Exception('No serializer found for model')

class EmptyBaseQuerySet(models.query.EmptyQuerySet):
	def toJSON(self):
		return '[]'

class BaseModel(models.Model):
	FIELDS = []
	objects = BaseManager()
	modified = models.DateTimeField(auto_now=True)

	@classmethod
	def convertToTimestamp(self, sqlDateTime):
		return int(time.mktime(sqlDateTime.timetuple()))*1000

	def toJSON(self, extended=False, render=True):
		arrJson = self.__class__.objects.filter(id=self.id).toJSON(extended)
		return arrJson[1:-1]
	
	def assignByDictionary(self, dic):
		# AssignByDictionary works for ForeignKeys, but not for ManyToMany
		changes = unicode("")
		for p, model, type in self.getParameterArray():
			if p in dic:
				param = dic.get(p)
				if model:  # FK, we only need to deal with the _id field
					p = self._meta.get_field_by_name(p)[0].attname
					# If param is sent in as -1 for Foreign Keys, add safe guard and change it to None
					if param == -1:
						param = None

				try:
					oldAttr = getattr(self, p)
				except:
					oldAttr = None # only exception I've seen thrown is getting a foreign key object when it isn't set yet
				newAttr = param
				if type is models.DateTimeField:
					# Convert timestamps to DTFs
					if param is not None:
						try:
							pTime = float(param)
							newAttr = datetime.datetime.fromtimestamp(pTime, pytz.utc)
							print newAttr
						except ValueError:
							newAttr = datetime.datetime.strptime(param, "%Y-%m-%d %H:%M:%S")
						except TypeError:
							# Param is already a datetime?
							pass

				elif type is models.DateField:
					# Convert timestamps to DFs (for Entry, Semester, etc...)
					if param is not None:
						try:
							newAttr = datetime.datetime.strptime(param, "%Y-%m-%d").date()
						except TypeError:
							# Param is already a date?
							pass

				if oldAttr != newAttr:
					setattr(self, p, newAttr)
					try:
						changes = unicode("%s%s: %s => %s ; " % (changes, p, oldAttr, newAttr))
					except:
						pass

		return changes

	def toDict(self, fields=None, convertTimestamp=False):
		# toDict doesn't handle ManyToMany. If needed, override by calling super then adding individually
		d = {}
		for p, model, type in self.getParameterArray():
			if fields and not p in fields:
				continue

			val = getattr(self, p)

			if model and val:
				d[p] = val.id
			elif convertTimestamp and type is models.DateTimeField and val is not None:
				d[p] = self.convertToTimestamp(val)
			elif convertTimestamp and type is models.DateField and val is not None:
				d[p] = self.convertToDateString(val)
			else:
				d[p] = val
		return d

	def toJSONDict(self, fields=None, alt=False):
		''' mimic format of django's serialize (to python), with arbitrary field list.
		Primarily used in preparation for conversion to JSON, hence the name. '''
		d = {
			"pk": self.pk,
			"model": self._meta.app_label + "." + self._meta.model_name,
			"fields": {}
		}
		nameToField = dict((f.name, f) for f in self._meta.fields + self._meta.many_to_many)
		if fields is None:
			if alt and hasattr(self, "alt_json_fields"):
				fields = self.alt_json_fields
			elif hasattr(self, "json_fields"):
				fields = self.json_fields
			elif hasattr(self, "json_exclude"):
				fields = self.getSafeFields(self.json_exclude)
			else:
				fields = self.getSafeFields()
		for f in fields:
			if f in nameToField and nameToField[f].get_internal_type() == "ForeignKey":
				# optimizing foreign keys so we don't have extra hits on the database
				val = getattr(self, nameToField[f].attname)
			else:
				try:
					attr = getattr(self, "_" + f)
					builtIn = False
				except:
					attr = getattr(self, f)
					builtIn = (f in nameToField)

				if builtIn:
					fieldType = nameToField[f].get_internal_type()
					if fieldType == "ManyToManyField":
						#val = [o.pk for o in attr.all()]
						val = attr.values_list('pk', flat=True)
					else:
						val = attr
				else:
					try:
						val = attr()
					except:
						val = attr
			d["fields"][f] = val
		return d

	@classmethod
	def getParameterArray(cls):
		return [(f.name, cls.getModelByField(f), type(f)) for f in cls._meta.fields]

	@classmethod
	def getSafeFields(cls, unsafe=set()):
		return [f.name for f in (cls._meta.fields + cls._meta.many_to_many) if f.name not in set(unsafe)]

	@classmethod
	def getModelByField(cls, field):
		if field.rel:
			return field.rel.to
		return None

	class Meta:
		abstract = True


BaseModel.serializer = None