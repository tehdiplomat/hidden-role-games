from rest_framework import generics
from rest_framework import permissions
from cms.models.Game import Game, GameSerializer

class GameList(generics.ListCreateAPIView):
	queryset = Game.objects.all()
	serializer_class = GameSerializer
	permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

class GameDetail(generics.RetrieveUpdateDestroyAPIView):
	queryset = Game.objects.all()
	serializer_class = GameSerializer
	permission_classes = (permissions.IsAuthenticatedOrReadOnly,)