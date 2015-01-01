# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('cms', '0002_auto_20150101_0959'),
    ]

    operations = [
        migrations.AlterField(
            model_name='role',
            name='affiliation',
            field=models.ForeignKey(to='cms.Affiliation', null=True),
            preserve_default=True,
        ),
    ]
