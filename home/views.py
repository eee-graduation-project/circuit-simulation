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

    def create(self, request, *args, **kwargs):
        data = request.data
        if isinstance(data, list):
            serializer = self.get_serializer(data=data, many=True)
        else:
            serializer = self.get_serializer(data=data)

        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class NodeViewSet(viewsets.ModelViewSet):
    queryset = Node.objects.all()
    serializer_class = NodeSerializer

    def create(self, request, *args, **kwargs):
        data = request.data
        if isinstance(data, list):
            serializer = self.get_serializer(data=data, many=True)
        else:
            serializer = self.get_serializer(data=data)

        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class ConnectionViewSet(viewsets.ModelViewSet):
    queryset = Connection.objects.all()
    serializer_class = ConnectionSerializer

    def create(self, request, *args, **kwargs):
        data = request.data
        if isinstance(data, list):
            serializer = self.get_serializer(data=data, many=True)
        else:
            serializer = self.get_serializer(data=data)

        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class BoardViewSet(viewsets.ModelViewSet):
    queryset = Board.objects.all()
    serializer_class = BoardSerializer

@api_view(['GET'])
def simulate_circuit(request):
    board_id = uuid.UUID(request.GET.get('boardId'))
    ground_num = int(request.GET.get('groundNodeNum'))
    if not board_id:
        return Response({'error': 'boardId is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    netlist = []
    components = Component.objects.filter(board=board_id)
    for component in components:
      if component.type == 'ground':
        continue
      net = [component.name]
      connections = Connection.objects.filter(component=component).order_by('-position')
      for connection in connections:
        node_num = int(connection.node.name)
        if node_num==ground_num:
          node_num = 0
        net.append(node_num)
      net.append(float(component.value[:-1]))
      netlist.append(net)
    
    [result_source, result_node] = calculate_simulation(netlist)
    transformed_result_source = {element: round(current, 3) for element, _, current in result_source}
    transformed_result_node = {node: round(value, 3) for node, value in result_node}

    return Response({'result_current' : transformed_result_source, 'result_node' : transformed_result_node}, status=status.HTTP_200_OK)
# def test_example(request):
#   if request.method != 'POST':
#     return
  
#   return render(request, 'home/test.html')