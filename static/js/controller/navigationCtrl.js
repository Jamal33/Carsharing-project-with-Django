'use strict';

/**
 * Controller - navigationCtrl
 */
hitchcar.controller('navigationCtrl', ['$rootScope', '$scope', '$state', function ($rootScope, $scope, $state) {

    $scope.navigation = [
        {
            name: 'Home',
            path: '/home',
            state: 'private.home',
            icon: 'fa-home'
        }, {
            name: 'Find Hitch',
            path: '/map',
            state: 'private.map',
            icon: 'fa-map-o'
        }, {
            name: 'My Trips',
            path:'/routes',
            state: 'private.routes',
            icon: 'fa-map-signs'
        }, {
            name: 'Profile',
            path: '/profile',
            state: 'private.profile',
            icon: 'fa-user-circle-o'
        }, {
            name : 'Logout',
            path : '/logout',
            state : 'private.logout',
            icon : 'fa-sign-out'
        }
    ];

    $scope.isActive = function(nav) {
        var state = $state.current.name;
        return nav.state === state;
    };

    $scope.navigate = function(nav) {
        $('#collapsed-navbar').collapse('hide');
        $state.go(nav.state);
    };

}]);