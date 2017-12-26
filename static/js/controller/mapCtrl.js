'use strict';

/**
 * Controller - mapController
 */
hitchcar.controller('mapCtrl', ['$rootScope', '$scope', '$q', '$filter', '$timeout', 'dataService', 'locationService', function ($rootScope, $scope, $q, $filter, $timeout, dataService, locationService) {

    //List of available Rides
    $scope.rides = [];

    if ($rootScope.user === undefined) {
        dataService.loadUser().then(function (user) {
            $rootScope.user = user;
        });
    }

    $scope.showSpinner = true;

    //Load all available rides over API Server (call if map is ready)
    $scope.loadAvailableRides = function() {
        dataService.get('/api/rides/', {active: true, 'user!':$rootScope.user.id}, ['rideStart', 'rideDestination']).then(function(rides) {
            $scope.rides = rides;
            var promises = [];

            //Resolve waypoints and set color
            angular.forEach($scope.rides, function(ride) {
                ride.color = $rootScope.randomColor();
                //Load Waypoints
                var p = dataService.get('/api/waypoints/', {ride: ride.id}, ['waypointLocation']).then(function(rideWaypoints) {
                    ride.waypoints = rideWaypoints;
                });
                promises.push(p);
            });

            //Wait for all async operations to be resolved
            $q.all(promises).then(function() {
                //reset map markers
                $scope.resetMap();
                //All Data prepared, display on Map
                $scope.displayAvailableRides();
            });
        });
    };

    //Display Available Rides
    $scope.directionsService = undefined;
    $scope.displayAvailableRides = function() {
        //Dont to anything if there are no routes.
        if ($scope.rides.length === 0) {
            $scope.showSpinner = false;
            return;
        }

        if ($scope.directionsService === undefined) {
            $scope.directionsService = new google.maps.DirectionsService;
        }

        //Load the direction object over Google Maps API for each ride
        angular.forEach($scope.rides, function(ride) {

            var waypoints = [];
            angular.forEach(ride.waypoints, function(waypoint) {
                waypoints.push({location: waypoint.waypointLocation.latitude + ', ' + waypoint.waypointLocation.longitude, stopover: false})
            });

            $scope.directionsService.route({
                origin: ride.rideStart.latitude + ", " + ride.rideStart.longitude,
                destination: ride.rideDestination.latitude + ", " + ride.rideDestination.longitude,
                travelMode: 'DRIVING',
                unitSystem: google.maps.UnitSystem.METRIC,
                waypoints: waypoints
            }, function(response, status) {
                if (status === 'OK') {
                    $scope.renderRideOnMap(ride, response);
                }
            });
        });
    };

    $scope.renderRideOnMap = function(ride, response) {
        var rideData = {
            ride: ride,
            markers: [],
            shown: true
        };

        var leg = response.routes[ 0 ].legs[ 0 ];

        //Draw Line
        $scope.createPolyline(rideData, response, ride.color, ride);

        //Draw start Marker
        $scope.createMarker(rideData, leg.start_location, 'Start: ' + $filter('date')(ride.startTime, 'dd.MM.yyyy HH:mm'), ride.color, '', ride, true, false);

        //Draw waypoint Markers
        var cnt = 1;
        angular.forEach(ride.waypoints, function(waypoint){
            var latLng = new google.maps.LatLng(waypoint.waypointLocation.latitude, waypoint.waypointLocation.longitude);
            $scope.createMarker(rideData, latLng, 'Waypoint ' + cnt + ': ' + $filter('date')(waypoint.timestamp, 'dd.MM.yyyy HH:mm'), ride.color, cnt++, ride, false, false);
        });

        //Draw destination Marker
        $scope.createMarker(rideData, leg.end_location, 'Destination', ride.color, '', ride, false, true);

        $timeout(function() {
            $scope.routes.push(rideData);
            $scope.showSpinner = false;
        }, 250);
    };

    $scope.createPolyline = function(rideData, directionResult, color, ride) {
        var line = new google.maps.Polyline({
            map: $scope.map,
            path: directionResult.routes[0].overview_path,
            strokeColor: color,
            strokeOpacity: 1,
            strokeWeight: 4
        });

        line.addListener('click', function() {
            $scope.showRideModal(ride);
        });

        rideData.markers.push(line);
    };

    $scope.createMarker = function(rideData, latLng, title, color, number, ride, isStart, isEnd) {

        var pinColor = color.replace('#', '');
        if (isStart) {
            number = 'S';
        }
        if (isEnd) {
            number = 'D';
        }

        var pinImage = new google.maps.MarkerImage("//chart.apis.google.com/chart?chst=d_map_pin_letter&chld=" + number +"|" + pinColor, new google.maps.Size(21, 34), new google.maps.Point(0,0), new google.maps.Point(10, 34));
        var marker = new google.maps.Marker({
            map: $scope.map,
            position: latLng,
            title: title,
            icon: pinImage
        });

        marker.addListener('click', function() {
            $scope.showRideModal(ride);
        });

        rideData.markers.push(marker);
    };

    $scope.selectedRide = undefined;
    $scope.tmpRequestData = undefined;
    $scope.showRideModal = function(ride) {
        //Save Ride in Scope for UI
        $scope.selectedRide = ride;

        $timeout(function() {
            //Dont delete, updates scope.
            console.log('opening ride modal');
        });

        //Prepare data
        $scope.tmpRequestData = {
            user: $rootScope.user.url,
            ride: ride.url,
            currentLocation: $scope.currentLocation,
            destination: undefined
        };

        //Resolve Location Names
        angular.forEach(['rideStart', 'rideDestination'], function(keyName) {
            if (angular.isUndefined(ride[keyName].title) || ride[keyName].title === '' || ride[keyName].title === null) {
                locationService.resolveToName(ride[keyName]).then(function(title) {
                    ride[keyName].title = title;
                });
            }
        });
        angular.forEach(ride.waypoints, function(waypoint) {
            if (angular.isUndefined(waypoint.waypointLocation.title) || waypoint.waypointLocation.title === '' || waypoint.waypointLocation.title === null) {
                locationService.resolveToName(waypoint.waypointLocation).then(function(title) {
                    waypoint.waypointLocation.title = title;
                });
            }
        });

        $('#rideModal').on('shown.bs.modal', function(){
            var input = document.getElementById('pac-input');
            var searchBox = new google.maps.places.SearchBox(input);

            searchBox.addListener('places_changed', function() {
                var places = searchBox.getPlaces();

                if (places.length === 0) {
                    return;
                }

                // For each place, get the icon, name and location.
                var bounds = new google.maps.LatLngBounds();
                places.forEach(function(place) {
                    if (!place.geometry) {
                        return;
                    }

                    //Set ride destination
                    $scope.tmpRequestData.destination = {
                        latitude: place.geometry.location.lat(),
                        longitude: place.geometry.location.lng(),
                        title: place.formatted_address
                    };

                    $scope.$apply();
                });
            });
        });

        $('#rideModal').modal('show');
    };

    $scope.sendPickUpRequest = function(ride, requestData) {
        $scope.showSpinner = true;

        dataService.post('/api/locations/', requestData.currentLocation).then(function(cl) {
            requestData.currentLocation = cl.url;
            dataService.post('/api/locations/', requestData.destination).then(function(dst) {
                requestData.destination = dst.url;
                dataService.post('/api/pickuprequests/', requestData).then(function(dataPur) {
                    console.log(dataPur);
                    $('#rideModal').modal('hide');
                    $scope.tmpRequestData = undefined;
                    $scope.showSpinner = false;
                });
            });
        });
    };

    $scope.userMarker = undefined;
    $scope.routes = [];

    $scope.mapOptions = {
        center: new google.maps.LatLng(46.8, 8.2),
        zoom: 8,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    //Initialize Map
    $scope.initMap = function() {
        $scope.map = new google.maps.Map(document.getElementById("map"), $scope.mapOptions);

        //Load and display Stats if map is ready
        google.maps.event.addListenerOnce($scope.map, 'idle', function(){
            $scope.loadAvailableRides();
            //Show Users Position
            $scope.showUser();
        });

    };
    $scope.initMap();

    $scope.showUser = function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition($scope.renderUserMarker);
        }
    };

    $scope.renderUserMarker = function(position) {
        $scope.currentLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        };
        //Ad Marker for User
        $scope.userMarker = new google.maps.Marker({
            map: $scope.map,
            animation: google.maps.Animation.DROP,
            position: new google.maps.LatLng($scope.currentLocation.latitude, $scope.currentLocation.longitude)
        });
    };

    //Remove al routes from map
    $scope.resetMap = function() {
        angular.forEach($scope.routes, function(rideData) {
            angular.forEach(rideData.markers, function(routElement) {
                routElement.setMap(null);
            });
        });
        $scope.routes = [];
    };

    $scope.hideOrDisplayRoute = function(route) {
        angular.forEach(route.markers, function(marker) {
            if (route.shown) {
                marker.setMap($scope.map);
            } else {
                marker.setMap(null);
            }
        });
    }

}]);