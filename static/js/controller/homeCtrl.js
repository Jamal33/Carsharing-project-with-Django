'use strict';

/**
 * Controller - homeCtrl
 */
hitchcar.controller('homeCtrl', ['$rootScope', '$scope', '$state', '$q', 'dataService', 'locationService', function ($rootScope, $scope, $state, $q, dataService, locationService) {

    //Load active rides and pickup requests
    $scope.myActiveRides = [];
    $scope.myActiveRequests = [];

    $scope.loadData = function() {
        $scope.showSpinner = true;
        var promises = [];

        var p1 = dataService.get('/api/rides/', {user: $rootScope.user.id, active: true}, ['rideStart', 'rideDestination']).then(function(rides) {
            $scope.myActiveRides = rides;

            //Resolve dependencies (we do not wait on Location Resolving by Google Maps API)
            angular.forEach($scope.myActiveRides, function(ride) {
                //Resolve title for both locations of each ride.
                angular.forEach(['rideStart', 'rideDestination'], function(keyName) {
                    if (angular.isUndefined(ride[keyName].title) || ride[keyName].title === '' || ride[keyName].title === null) {
                        locationService.resolveToName(ride[keyName]).then(function(title) {
                            ride[keyName].title = title;
                        });
                    }
                });
            });
        });
        promises.push(p1);

        var p2 = dataService.get('/api/pickuprequests/', {user: $rootScope.user.id, 'ride__active':true}, ['currentLocation', 'destination']).then(function(requests) {
            $scope.myActiveRequests = requests;

            //Resolve dependencies (we do not wait on Location Resolving by Google Maps API)
            angular.forEach($scope.myActiveRequests, function(request) {
                //Resolve title for both locations of each request.
                angular.forEach(['currentLocation', 'destination'], function(keyName) {
                    if (angular.isUndefined(request[keyName].title) || request[keyName].title === '' || request[keyName].title === null) {
                        locationService.resolveToName(request[keyName]).then(function(title) {
                            request[keyName].title = title;
                        });
                    }
                });
            });
        });
        promises.push(p2);

        $q.all(promises).then(function() {
            $scope.showSpinner = false;
        });
    };

    if ($rootScope.user === undefined) {
        dataService.loadUser().then(function (user) {
            $rootScope.user = user;
            $scope.loadData();
        });
    } else {
        $scope.loadData();
    }

    //Open a modal to search your the rides target.
    $scope.startNewRide = function () {
        //Set global flag, Ride Controller will open Map and Destination Search
        $rootScope.startNewRide = true;
        $state.go('private.routes');
    };

    //Show Map witch currently active rides.
    $scope.searchRide = function () {
        $state.go('private.map');
    };

    $scope.openRide = function(rideId) {
        $state.go('private.ride', {id:rideId});
    };



}]);