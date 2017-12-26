'use strict';

/**
 * Controller - profileCtrl
 */
hitchcar.controller('profileCtrl', ['$scope', 'dataService', function ($scope, dataService) {

    $scope.userData = {};
    $scope.profileData = {};
    $scope.errorMsg = undefined;
    $scope.successMsg = undefined;

    //Get the logged in user
    $scope.showSpinner = true;
    dataService.get('/api/user/').then(function (user) {
        $scope.userData = user;
        dataService.get('/api/profiles/' + $scope.userData.profile + '/').then(function(profile) {
            $scope.profileData = profile;
            $scope.showSpinner = false;
        });
    });

    /**
     * Update the users profile over API
     */
    $scope.updateProfile = function() {
        $scope.showSpinner = true;
        $scope.errorMsg = undefined;
        $scope.successMsg = undefined;

        var user = {
            email: $scope.userData.email,
            password: $scope.userData.password,
            repassword: $scope.userData.repassword
        };

        dataService.put('/api/profiles/' + $scope.userData.profile + '/', $scope.profileData).then(function(result) {

            dataService.put('/api/user/' + $scope.userData.id + '/', user).then(function(result) {
                $scope.successMsg = result.message;

            }).catch(function(err) {
                if (err.data.message) {
                    $scope.errorMsg = err.data.message;
                } else {
                    $scope.errorMsg = "Error connecting to server.";
                }
            }).finally(function() {
                $scope.showSpinner = false;
            });

        }).catch(function(err) {
            $scope.showSpinner = true;
        });
    };

}]);