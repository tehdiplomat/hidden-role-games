# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('cms', '0011_auto_20150118_2246'),
    ]

    operations = [
        migrations.AddField(
            model_name='affiliation',
            name='styling',
            field=models.TextField(default='', blank=True),
            preserve_default=False,
        ),
    ]
