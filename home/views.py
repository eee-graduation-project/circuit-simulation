from django.shortcuts import redirect
from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Component, Board, Wire
from .serializers import ComponentSerializer, BoardSerializer, WireSerializer
import uuid
import json
from .simulation.simulation import cmd_analysis
from .services import generate_netlist, generate_probe
import numpy as np
import traceback

from django.http import JsonResponse

from sympy import Symbol, Float, Integer, Mul, Add, Rational, nan, I, pi, Pow, Basic

class CustomJSONEncoder(json.JSONEncoder): # by GPT
    def default(self, obj):
        if isinstance(obj, Symbol):
            return str(obj)  # Symbol을 문자열로 변환
        elif isinstance(obj, np.ndarray):
            return obj.tolist()  # NumPy 배열을 리스트로 변환
        elif isinstance(obj, Float):
            return float(obj)  # Float을 일반 float로 변환
        elif isinstance(obj, Integer) and obj == Integer(0):
            return 0  # Integer(0)을 0으로 변환
        elif obj is nan:
            return None  # NaN을 None으로 변환
        elif isinstance(obj, Rational):
            return float(obj)  # Rational을 일반 float로 변환
        elif isinstance(obj, Mul):
            return {'type': 'Mul', 'args': [self.default(arg) for arg in obj.args]}  # Mul 타입 처리
        elif isinstance(obj, Add):
            return {'type': 'Add', 'args': [self.default(arg) for arg in obj.args]}  # Add 타입 처리
        elif isinstance(obj, Pow):
            base, exp = obj.as_base_exp()
            return {'type': 'Pow', 'base': self.default(base), 'exp': self.default(exp)}
        elif obj == I:  # 복소수 단위 I 처리
            return {'type': 'I'}  
        elif obj == pi:  # 파이 처리
            return {'type': 'Pi', 'value': float(pi)}  # Pi를 변환
        elif isinstance(obj, uuid.UUID):
            return str(obj)
        elif isinstance(obj, Basic):
            return str(obj)  # 필요에 따라 Basic을 문자열 또는 특정 형식으로 변환 가능
        # 필요한 경우 추가적인 타입을 여기에 추가할 수 있습니다.
        
        return super().default(obj)  # 기본 직렬화기 사용

def show_home(request):
  new_board = Board()
  new_board.save()
  return redirect("boards", id=new_board.id)

def show_board(request, id):
  return render(request, 'home/index.html', {'board_id': id})

class ComponentViewSet(viewsets.ModelViewSet):
    queryset = Component.objects.all()
    serializer_class = ComponentSerializer

    def list(self, request):
      board_id = uuid.UUID(request.query_params.get('boardId', None))
      components = Component.objects.filter(board__id=board_id)
      
      serializer = ComponentSerializer(components, many=True)
      return Response(serializer.data, status=status.HTTP_200_OK)
    
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
    
    def update(self, request, *args, **kwargs):
        num = kwargs.get('num')
        board_id = uuid.UUID(request.query_params.get('boardId', None))
        try:
            component = Component.objects.get(board__id=board_id, num=num)
        except Component.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
        serializer = ComponentSerializer(component, data = request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, *args, **kwargs):
        num = kwargs.get('num')
        board_id = uuid.UUID(request.query_params.get('boardId', None))
        try:
            component = Component.objects.get(board__id=board_id, num=num)
        except Component.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
        component.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class WireViewSet(viewsets.ModelViewSet):
    queryset = Wire.objects.all()
    serializer_class = WireSerializer

    def list(self, request):
      board_id = uuid.UUID(request.query_params.get('boardId', None))
      wires = Wire.objects.filter(board__id=board_id)
      
      serializer = WireSerializer(wires, many=True)
      return Response(serializer.data, status=status.HTTP_200_OK)
    
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

    def delete(self, request, *args, **kwargs):
        num = kwargs.get('num')
        board_id = uuid.UUID(request.query_params.get('boardId', None))
        try:
            wire = Wire.objects.get(board__id=board_id, num=num)
        except Wire.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
        wire.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class BoardViewSet(viewsets.ModelViewSet):
    queryset = Board.objects.all()
    serializer_class = BoardSerializer

@api_view(['GET'])
def simulate_circuit(request):
    # print(request)
    board_id = uuid.UUID(request.GET.get('boardId'))
    analysis = request.GET.get('analysis')
    probes = json.loads(request.GET.get('probes'))
    print(f"analysis : {analysis}")
    # print('probes:')
    # print(probes)
    # ground_num = int(request.GET.get('groundNodeNum'))
    if not board_id:
        return Response({'error': 'boardId is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    [netlist, com2node, wire2node] = generate_netlist(board_id)
    [probeVoltage, probeCurrent, probeVout] = generate_probe(probes, com2node, wire2node)
    # calculate_simulation(analysis, netlist, probeVoltage, probeCurrent)
    
    print(f"netlist : {netlist}")
    print(f"probeV : {probeVoltage}")
    print(f"probeI : {probeCurrent}")
    print(f"probeVout : {probeVout}")
    
    new_board = Board()
    new_board.save()
    response = {'com2node': com2node, 'netlist': netlist, 'analysis': analysis, 'probeVoltage': probeVoltage, 'probeCurrent': probeCurrent, 'probeVout': probeVout, 'newBoardId': new_board.id}
    try:
      [analysis_type, result] = cmd_analysis(netlist, analysis, probeCurrent, probeVoltage, probeVout)
      response['analysis_type'] = analysis_type
      response['result'] = result
    except Exception as e:
      error_message = str(e)
      error_details = traceback.format_exc()
      
      response['simulation_error'] = {
          'message': error_message,
          'details': error_details
      }
      return JsonResponse(response, status=status.HTTP_500_INTERNAL_SERVER_ERROR, encoder=CustomJSONEncoder)
    print(result)
    return JsonResponse(response, encoder=CustomJSONEncoder)
