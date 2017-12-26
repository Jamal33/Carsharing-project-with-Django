from django.conf.urls import url, include
from rest_framework import routers
from webeng.hitchcar import views
from django.views.generic.base import TemplateView
from rest_framework.authtoken import views as authviews



from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

router = routers.DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'groups', views.GroupViewSet)
router.register(r'rides', views.RideViewSet)
router.register(r'waypoints', views.WaypointViewSet)
router.register(r'pickuprequests', views.PickUpRequestViewSet)
router.register(r'locations', views.LocationViewSet)
router.register(r'profiles', views.ProfileViewSet)

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    url(r'^$', TemplateView.as_view(template_name='index.html'), name="main"),
    url(r'^api/', include(router.urls)),
    url(r'^api/user/', views.current_user_view),
    url(r'^api/api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^api/api-token-auth/', authviews.obtain_auth_token),
    url(r'^api/signup/$', views.Signup, name='Signup'),
]