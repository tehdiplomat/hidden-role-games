# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('cms', '0007_player_browsersession'),
    ]

    operations = [
        migrations.AddField(
            model_name='game',
            name='template',
            field=models.CharField(default=b'play.html', max_length=32),
            preserve_default=True,
        ),
    ]
