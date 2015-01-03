from django.conf.urls import patterns, include, url
from django.contrib import admin

urlpatterns = patterns('',
	#url(r'^', include('cms.views.generic.index')),
    url(r'^masq/', include('cms.urls')),
	url(r'^api/', include('cms.api.urls')),
    url(r'^admin/', include(admin.site.urls)),
)
