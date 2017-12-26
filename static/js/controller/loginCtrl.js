'use strict';

/**
 * Controller - loginCtrl
 */
hitchcar.controller('loginCtrl', ['$rootScope', '$scope', 'authService', '$state', function($rootScope, $scope, authService, $state) {

    $scope.loginError = undefined;

    $scope.user = {
        username: '',
        password: ''
    };

    $scope.login = function() {
        $scope.loginError = undefined;
        authService.login($scope.user).then(function(msg) {
            if (angular.isDefined($rootScope.originalTarget)) {
                $state.go($rootScope.originalTarget.name, $rootScope.originalTarget.params);
                $rootScope.originalTarget = undefined;
            } else {
                $state.go('private.home');
            }
        }, function(errMsg) {
            $scope.loginError = 'Login failed: ' + errMsg;
            console.log('error');
        });
    };

}]);
