from rest_framework import generics
from rest_framework import permissions
from cms.models.Player import Player, PlayerSerializer

class PlayerList(generics.ListCreateAPIView):
	queryset = Player.objects.all()
	serializer_class = PlayerSerializer


class PlayerDetail(generics.RetrieveUpdateDestroyAPIView):
	queryset = Player.objects.all()
	serializer_class = PlayerSerializer