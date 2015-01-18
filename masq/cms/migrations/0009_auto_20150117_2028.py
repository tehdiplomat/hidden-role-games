# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('cms', '0008_game_template'),
    ]

    operations = [
        migrations.AddField(
            model_name='player',
            name='room',
            field=models.PositiveSmallIntegerField(default=0),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='game',
            name='template',
            field=models.CharField(default=b'play.html', max_length=32, blank=True),
            preserve_default=True,
        ),
    ]
