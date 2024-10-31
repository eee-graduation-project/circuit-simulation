from django.shortcuts import render
from django.conf import settings
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Component, Node, Connection, Board, Wire
from .serializers import ComponentSerializer, NodeSerializer, ConnectionSerializer, BoardSerializer, WireSerializer
import uuid
import re
import json
from .simulation.simulation import cmd_analysis
from .services import generate_netlist, generate_probe
from sympy import Symbol
from sympy import Float
from sympy import Integer
import numpy as np

def convert_symbols_to_str(data): # by GPT
    if isinstance(data, dict):
        return {convert_symbols_to_str(k): convert_symbols_to_str(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [convert_symbols_to_str(i) for i in data]
    elif isinstance(data, np.ndarray):  # NumPy 배열 처리
        # 배열의 모든 요소를 변환
        return [convert_symbols_to_str(item) for item in data]
    elif isinstance(data, Symbol):
        return str(data)  # Symbol 객체를 문자열로 변환
    elif isinstance(data, Float):  # SymPy Float 객체 처리
        return float(data)  # Float 객체를 float로 변환
    elif isinstance(data, Integer) and data == Integer(0):  # SymPy Integer 0 체크
        return 0  # SymPy의 Integer(0)을 0으로 변환
    elif data is None:  # None을 그대로 반환
        return None
    else:
        return data  # 기타 데이터는 그대로 반환

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

class WireViewSet(viewsets.ModelViewSet):
    queryset = Wire.objects.all()
    serializer_class = WireSerializer

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
    print(request)
    board_id = uuid.UUID(request.GET.get('boardId'))
    analysis = request.GET.get('analysis')
    probes = json.loads(request.GET.get('probes'))
    print(analysis)
    print('probes:')
    print(probes)
    # ground_num = int(request.GET.get('groundNodeNum'))
    if not board_id:
        return Response({'error': 'boardId is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    [netlist, com2node, wire2node] = generate_netlist(board_id)
    [probeVoltage, probeCurrent, probeVout] = generate_probe(probes, com2node, wire2node)
    # calculate_simulation(analysis, netlist, probeVoltage, probeCurrent)
    
    print(netlist)
    print(probeVoltage)
    print(probeCurrent)
    print(probeVout)
    [analysis_type, result] = cmd_analysis(netlist, analysis, probeCurrent, probeVoltage, probeVout)
    result = json.dumps(convert_symbols_to_str(result))
    # data = process_result(analysis_type, result)
    print('---------------')
    print(result)
    response = {'com2node': com2node, 'analysis_type': analysis_type, 'netlist': netlist, 'analysis': analysis, 'probeVoltage': probeVoltage, 'probeCurrent': probeCurrent, 'probeVout': probeVout, 'result': str(result)}
    return Response(response)
    # for component in components:
    #   if component.type == 'ground':
    #     continue
    #   net = [component.name]
    #   connections = Connection.objects.filter(component=component).order_by('-position')
    #   for connection in connections:
    #     node_num = int(connection.node.name)
    #     if node_num==ground_num:
    #       node_num = 0
    #     net.append(node_num)
    #   net.append(float(component.value[:-1]))
    #   netlist.append(net)
    
    # [result_source, result_node] = calculate_simulation(netlist)
    # transformed_result_source = {element: round(current, 3) for element, _, current in result_source}
    # transformed_result_node = {node: round(value, 3) for node, value in result_node}
    
    # return Response({'result_current' : transformed_result_source, 'result_node' : transformed_result_node}, status=status.HTTP_200_OK)