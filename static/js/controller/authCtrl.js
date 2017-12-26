'use strict';

/**
 * Controller - authCtrl
 */
hitchcar.controller('authCtrl', ['$scope', '$state', 'authService', 'AUTH_EVENTS', function($scope, $state, authService, AUTH_EVENTS) {

    $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
        authService.logout();
        $state.go('public.login');
        console.log('Sorry, You have to login again.');
    });

    $scope.isMapView = function() {
        return $state.current.name === 'private.map';
    };
    
}]);
