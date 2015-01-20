# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('cms', '0010_auto_20150117_2110'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='gamesession',
            name='active',
        ),
        migrations.AddField(
            model_name='gamesession',
            name='status',
            field=models.CharField(default=b'lobby', max_length=16, choices=[(b'lobby', b'Lobby'), (b'active', b'Active'), (b'completed', b'Completed')]),
            preserve_default=True,
        ),
    ]
