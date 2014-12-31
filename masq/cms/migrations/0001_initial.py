# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Game',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(default=b'Unnamed Game', max_length=32)),
            ],
            options={
                'ordering': ['name'],
                'verbose_name_plural': 'games',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='GameSession',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(default=b'Unnamed Session', max_length=32)),
                ('active', models.BooleanField(default=True)),
                ('game', models.ForeignKey(to='cms.Game')),
            ],
            options={
                'ordering': ['name'],
                'verbose_name_plural': 'gameSessions',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Player',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(default=b'Unnamed Player', max_length=32)),
                ('hidden', models.BooleanField(default=True)),
            ],
            options={
                'ordering': ['name'],
                'verbose_name_plural': 'players',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Role',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(default=b'Unnamed Role', max_length=32)),
                ('affiliation', models.CharField(default=b'Unaffiliated', max_length=64)),
                ('text', models.TextField(blank=True)),
                ('game', models.ForeignKey(to='cms.Game')),
            ],
            options={
                'ordering': ['name'],
                'verbose_name_plural': 'roles',
            },
            bases=(models.Model,),
        ),
        migrations.AddField(
            model_name='player',
            name='role',
            field=models.ForeignKey(blank=True, to='cms.Role', null=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='player',
            name='session',
            field=models.ForeignKey(to='cms.GameSession'),
            preserve_default=True,
        ),
    ]
