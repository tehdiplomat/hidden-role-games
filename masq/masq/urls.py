from django.conf.urls import patterns, include, url
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = patterns('',
	url(r'^$', 'cms.views.generic.index'),
	url(r'^masq/', include('cms.urls')),
	url(r'^api/', include('cms.api.urls')),
	url(r'^admin/', include(admin.site.urls)),
	url(r'^pusher/auth', 'cms.views.command.auth'),
) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
