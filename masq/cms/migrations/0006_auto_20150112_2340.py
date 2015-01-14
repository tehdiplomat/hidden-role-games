# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('cms', '0005_auto_20150112_2229'),
    ]

    operations = [
        migrations.AddField(
            model_name='gamesession',
            name='roles',
            field=models.ManyToManyField(to='cms.Role'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='role',
            name='required',
            field=models.CharField(default=b'never', max_length=32, choices=[(b'never', b'Never'), (b'generic', b'Generic'), (b'always', b'Always'), (b'burying', b'Burying'), (b'paired', b'Paired')]),
            preserve_default=True,
        ),
    ]
