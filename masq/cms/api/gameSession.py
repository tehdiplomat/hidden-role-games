from rest_framework import generics
from rest_framework import permissions
from cms.models.GameSession import GameSession, GameSessionSerializer
from cms.models.Role import Role

class GameSessionList(generics.ListCreateAPIView):
	queryset = GameSession.objects.all()
	serializer_class = GameSessionSerializer
	filter_fields = ( 'active', )

	# On Create, add required roles to Session
	def perform_create(self, serializer):
		instance = serializer.save()
		roles = Role.objects.filter(game=instance.game, required=Role.REQ_ALWAYS)
		instance.roles = roles



class GameSessionDetail(generics.RetrieveUpdateDestroyAPIView):
	queryset = GameSession.objects.all()
	serializer_class = GameSessionSerializer