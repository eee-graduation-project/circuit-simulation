from django.shortcuts import render
from django.conf import settings

# Create your views here.
def show_home(request):
  return render(request, 'home/index.html')

# def test_example(request):
#   if request.method != 'POST':
#     return
  
#   return render(request, 'home/test.html')