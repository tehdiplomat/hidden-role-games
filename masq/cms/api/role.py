from rest_framework import generics
from rest_framework import permissions
from cms.models.Role import Role, RoleSerializer

class RoleList(generics.ListCreateAPIView):
	queryset = Role.objects.all()
	serializer_class = RoleSerializer
	permission_classes = (permissions.IsAuthenticatedOrReadOnly,)


class RoleDetail(generics.RetrieveUpdateDestroyAPIView):
	queryset = Role.objects.all()
	serializer_class = RoleSerializer
	permission_classes = (permissions.IsAuthenticatedOrReadOnly,)