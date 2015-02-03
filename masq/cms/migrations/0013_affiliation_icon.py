# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import cms.utils.Utils


class Migration(migrations.Migration):

    dependencies = [
        ('cms', '0012_affiliation_styling'),
    ]

    operations = [
        migrations.AddField(
            model_name='affiliation',
            name='icon',
            field=models.FileField(default=b'', upload_to=cms.utils.Utils.getUploadPath, blank=True),
            preserve_default=True,
        ),
    ]
