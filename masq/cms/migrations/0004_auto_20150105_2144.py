# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('cms', '0003_auto_20150101_1006'),
    ]

    operations = [
        migrations.AddField(
            model_name='player',
            name='host',
            field=models.BooleanField(default=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='player',
            name='pin',
            field=models.PositiveSmallIntegerField(default=1234),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='role',
            name='affiliation',
            field=models.ForeignKey(blank=True, to='cms.Affiliation', null=True),
            preserve_default=True,
        ),
    ]
