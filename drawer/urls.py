from django.conf.urls import patterns, url

from drawer import views

urlpatterns = patterns('', 
		url(r'^$', views.home, name='home'),
		url(r'^random/$', views.randomGraph, name='random'),
		url(r'^randominput/$', views.randomInput, name='randominput'),
		url(r'^randomupload/$', views.randomUpload, name='randomupload'),
		url(r'^gml/$', views.parseGML, name='gml'),
		url(r'^getgml/$', views.getGML, name='getgml'),
		url(r'^energyval/$', views.calculateEnergy, name='energyval'),
		url(r'^minenergyval/$', views.calculateMinEnergy, name='minenergyval'),
		url(r'^tests/$', views.tests, name='tests'),
		url(r'^minstatus/$', views.minStatus, name='minstatus'),
		url(r'^cancelgenetic/$', views.cancelGenetic, name='cancelgenetic'),
	)