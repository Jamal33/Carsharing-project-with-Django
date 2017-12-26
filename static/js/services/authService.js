'use strict';

/**
 * Service - authService
 */
hitchcar.factory('authService', ['$rootScope', '$q', '$http', 'dataService', function($rootScope, $q, $http, dataService) {
    var LOCAL_TOKEN_KEY = 'hitchcar-client-token-key';
    var isAuthenticated = false;
    var authToken;

    function loadUserCredentials() {
        var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
        if (token) {
            useCredentials(token);
        }
    }

    function storeUserCredentials(token) {
        window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
        useCredentials(token);
    }

    function useCredentials(token) {
        isAuthenticated = true;
        authToken = token;

        // Set the token as header for your requests!
        $http.defaults.headers.common.Authorization = 'Token ' + authToken;
    }

    function destroyUserCredentials() {
        authToken = undefined;
        isAuthenticated = false;
        $http.defaults.headers.common.Authorization = undefined;
        window.localStorage.removeItem(LOCAL_TOKEN_KEY);
    }

    var register = function(user) {
        return $q(function(resolve, reject) {
            $http.post($rootScope.url + '/api/signup/', user).then(function(result) {
                if (result.data.success) {
                    resolve(result.data.message);
                } else {
                    reject(result.data.message);
                }
            }).catch(function() {
                reject('Can\'t connect to Server.');
            });
        });
    };

    var login = function(user) {
        return $q(function(resolve, reject) {
            $http.post($rootScope.url + '/api/api-token-auth/', user).then(function(result) {
                if (result.data.token) {
                    storeUserCredentials(result.data.token);
                    dataService.loadUser().then(function (user) {
                        $rootScope.user = user;
                        resolve('success');
                    }).catch(function (reason) {
                        reject(reason);
                    });
                } else {
                    reject(result.data.message);
                }
            }).catch(function() {
                reject('Can\'t connect to Server.');
            });
        });
    };

    var logout = function() {
        destroyUserCredentials();
    };

    loadUserCredentials();

    return {
        login: login,
        register: register,
        logout: logout,
        isAuthenticated: function() {return isAuthenticated;}
    };
}]);
