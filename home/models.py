from django.db import models
import uuid

class Board(models.Model):
  id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

class Component(models.Model):
    name = models.CharField(max_length=100, blank=True, null=True)
    type = models.CharField(max_length=100)
    value = models.CharField(max_length=100, blank=True, null=True)
    board = models.ForeignKey(Board, on_delete=models.CASCADE, blank=True, null=True)

class Node(models.Model):
    name = models.CharField(max_length=100)

class Connection(models.Model):
    component = models.ForeignKey(Component, on_delete=models.CASCADE)
    node = models.ForeignKey(Node, on_delete=models.CASCADE)
    position = models.CharField(max_length=100)
