# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('sessions', '0001_initial'),
        ('cms', '0006_auto_20150112_2340'),
    ]

    operations = [
        migrations.AddField(
            model_name='player',
            name='browserSession',
            field=models.ForeignKey(on_delete=django.db.models.deletion.SET_NULL, default=None, blank=True, to='sessions.Session', null=True),
            preserve_default=True,
        ),
    ]
