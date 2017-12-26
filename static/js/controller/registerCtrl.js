'use strict';

/**
 * Controller - registerCtrl
 */
hitchcar.controller('registerCtrl', ['$scope', 'authService', '$state', function($scope, authService, $state) {

    $scope.registerError = undefined;

    $scope.user = {
        username: '',
        email: '',
        password: '',
        repassword: ''
    };

    $scope.register = function() {
        $scope.registerError = undefined;
        authService.register($scope.user).then(function(msg) {
            $state.go('public.login');
        }, function(errMsg) {
            $scope.registerError = 'Registration failed: ' + errMsg;
        });
    };
    
}]);
