from rest_framework import generics
from rest_framework import permissions
from cms.models.Affiliation import Affiliation, AffiliationSerializer

class AffiliationList(generics.ListCreateAPIView):
	queryset = Affiliation.objects.all()
	serializer_class = AffiliationSerializer
	permission_classes = (permissions.IsAuthenticatedOrReadOnly,)


class AffiliationDetail(generics.RetrieveUpdateDestroyAPIView):
	queryset = Affiliation.objects.all()
	serializer_class = AffiliationSerializer
	permission_classes = (permissions.IsAuthenticatedOrReadOnly,)