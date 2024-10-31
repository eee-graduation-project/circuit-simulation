from django.db import models
import uuid

class Board(models.Model):
  id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

class Component(models.Model):
    num = models.CharField(max_length=100, blank=True, null=True)
    name = models.CharField(max_length=100, blank=True, null=True)
    type = models.CharField(max_length=100)
    value = models.CharField(max_length=100, blank=True, null=True)
    board = models.ForeignKey(Board, on_delete=models.CASCADE, blank=True, null=True)
    options = models.JSONField()
    connections = models.JSONField()

    class Meta:
        unique_together = (('num', 'board'),)

class Wire(models.Model):
    num = models.CharField(max_length=100, blank=True, null=True)
    start = models.CharField(max_length=100)
    startDir = models.CharField(max_length=100)
    end = models.CharField(max_length=100)
    endDir = models.CharField(max_length=100)
    board = models.ForeignKey(Board, on_delete=models.CASCADE, blank=True, null=True)

    class Meta:
        unique_together = (('num', 'board'),)

class Node(models.Model):
    name = models.CharField(max_length=100)

class Connection(models.Model):
    component = models.ForeignKey(Component, on_delete=models.CASCADE)
    node = models.ForeignKey(Node, on_delete=models.CASCADE)
    position = models.CharField(max_length=100)
