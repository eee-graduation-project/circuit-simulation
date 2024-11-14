from rest_framework import serializers
from .models import Component, Board, Wire

class ComponentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Component
        fields = '__all__'

class WireSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wire
        fields = '__all__'

class BoardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Board
        fields = '__all__'
