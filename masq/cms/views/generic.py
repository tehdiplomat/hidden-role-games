from django.conf import settings
from django.contrib.auth import authenticate, login as djangoLogin
from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import logout_then_login
from django.shortcuts import redirect, render_to_response
from django.template import RequestContext

def index(request):
	return redirect('/cms/join')