# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('cms', '0004_auto_20150105_2144'),
    ]

    operations = [
        migrations.AddField(
            model_name='role',
            name='required',
            field=models.CharField(default=b'never', max_length=32, choices=[(b'never', b'Never'), (b'always', b'Always'), (b'burying', b'Burying'), (b'paired', b'Paired')]),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='player',
            name='host',
            field=models.BooleanField(default=False),
            preserve_default=True,
        ),
    ]
