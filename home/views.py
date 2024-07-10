from django.shortcuts import render
from rest_framework import viewsets
from .models import Component, Node, Connection, Board
from .serializers import ComponentSerializer, NodeSerializer, ConnectionSerializer, BoardSerializer

def show_home(request):
  new_board = Board()
  new_board.save()
  return render(request, 'home/index.html', {'board_id': new_board.id})

class ComponentViewSet(viewsets.ModelViewSet):
    queryset = Component.objects.all()
    serializer_class = ComponentSerializer

class NodeViewSet(viewsets.ModelViewSet):
    queryset = Node.objects.all()
    serializer_class = NodeSerializer

class ConnectionViewSet(viewsets.ModelViewSet):
    queryset = Connection.objects.all()
    serializer_class = ConnectionSerializer

class BoardViewSet(viewsets.ModelViewSet):
    queryset = Board.objects.all()
    serializer_class = BoardSerializer

# def test_example(request):
#   if request.method != 'POST':
#     return
  
#   return render(request, 'home/test.html')