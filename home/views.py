from django.shortcuts import render
from django.conf import settings

# Create your views here.
def show_home(request):
  return render(request, 'home/test.html')

def test_example(request):
  # TODO process request
  return render(request, 'home/test.html')