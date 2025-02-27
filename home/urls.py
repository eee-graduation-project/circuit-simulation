from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r"board", views.BoardViewSet)

urlpatterns = [
    # path('test/', views.test_example),
    path("home/", views.show_home, name="show_home"),
    path("boards/<uuid:id>/", views.show_board, name="boards"),
    path("api/simulation", views.simulate_circuit, name="simulate_circuit"),
    path("api/", include(router.urls)),
    path(
        "api/component/",
        views.ComponentViewSet.as_view({"get": "list", "post": "create"}),
    ),
    path(
        "api/component/<int:num>/",
        views.ComponentViewSet.as_view({"put": "update", "delete": "delete"}),
    ),
    path("api/wire/", views.WireViewSet.as_view({"get": "list", "post": "create"})),
    path(
        "api/wire/<int:num>/",
        views.WireViewSet.as_view({"put": "update", "delete": "delete"}),
    ),
]
