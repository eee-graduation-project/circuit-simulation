from django.contrib import admin
from .models import Board, Component, Node, Connection

# Register your models here.
admin.site.register(Board)
admin.site.register(Component)
admin.site.register(Node)
admin.site.register(Connection)
