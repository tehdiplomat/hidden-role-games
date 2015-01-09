from rest_framework import generics
from rest_framework import permissions
from cms.models.GameSession import GameSession, GameSessionSerializer

class GameSessionList(generics.ListCreateAPIView):
	queryset = GameSession.objects.all()
	serializer_class = GameSessionSerializer
	filter_fields = ( 'active', )


class GameSessionDetail(generics.RetrieveUpdateDestroyAPIView):
	queryset = GameSession.objects.all()
	serializer_class = GameSessionSerializer