# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('cms', '0009_auto_20150117_2028'),
    ]

    operations = [
        migrations.AddField(
            model_name='gamesession',
            name='currentRound',
            field=models.PositiveSmallIntegerField(default=0),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='gamesession',
            name='rounds',
            field=models.PositiveSmallIntegerField(default=5),
            preserve_default=True,
        ),
    ]
