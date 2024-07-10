from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'component', views.ComponentViewSet)
router.register(r'node', views.NodeViewSet)
router.register(r'connection', views.ConnectionViewSet)
router.register(r'board', views.BoardViewSet)

urlpatterns = [
    # path('test/', views.test_example),
    path('home/', views.show_home, name='show_home'),
    path('api/', include(router.urls)),
]
