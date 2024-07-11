from django.shortcuts import render
from django.conf import settings
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Component, Node, Connection, Board
from .serializers import ComponentSerializer, NodeSerializer, ConnectionSerializer, BoardSerializer
import uuid
from .simulation.simulation import calculate_simulation

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

@api_view(['GET'])
def simulate_circuit(request):
    board_id = uuid.UUID(request.GET.get('boardId'))
    if not board_id:
        return Response({'error': 'boardId is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    netlist = []
    components = Component.objects.filter(board=board_id)
    for component in components:
      net = [component.name]
      connections = Connection.objects.filter(component=component).order_by('-position')
      for connection in connections:
        net.append(int(connection.node.name))
      net.append(float(component.value[:-1]))
      netlist.append(net)
    calculate_simulation(netlist)
    
    response_data = {'boardId': board_id, 'netlist': netlist}
    return Response(response_data, status=status.HTTP_200_OK)
# def test_example(request):
#   if request.method != 'POST':
#     return
  
#   return render(request, 'home/test.html')