# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('cms', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Affiliation',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(default=b'Unnamed Affiliation', max_length=32)),
                ('text', models.TextField(blank=True)),
                ('primary', models.BooleanField(default=True)),
                ('game', models.ForeignKey(to='cms.Game')),
            ],
            options={
                'ordering': ['name'],
                'verbose_name_plural': 'affiliations',
            },
            bases=(models.Model,),
        ),
        migrations.AddField(
            model_name='role',
            name='generic',
            field=models.BooleanField(default=False),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='role',
            name='maxPerGame',
            field=models.PositiveSmallIntegerField(default=0),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='role',
            name='affiliation',
            field=models.ForeignKey(to='cms.Affiliation'),
            preserve_default=True,
        ),
    ]
