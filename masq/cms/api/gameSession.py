from rest_framework import generics
from rest_framework import permissions
from cms.models.GameSession import GameSession, GameSessionSerializer

class GameSessionList(generics.ListCreateAPIView):
	queryset = GameSession.objects.all()
	serializer_class = GameSessionSerializer
	permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
	filter_fields = ( 'online', )


class GameSessionDetail(generics.RetrieveUpdateDestroyAPIView):
	queryset = GameSession.objects.all()
	serializer_class = GameSessionSerializer
	permission_classes = (permissions.IsAuthenticatedOrReadOnly,)