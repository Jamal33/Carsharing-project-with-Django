'use strict';

/**
 * Service - DataService
 *
 */
hitchcar.factory('dataService', ['$rootScope', '$q', '$http', '$filter', function($rootScope, $q, $http, $filter){

    const dataService = {};
    dataService.api = $rootScope.url;

    dataService.get = function(getUri, searchParams, locationsToResolve) {
        return $q(function(resolve, reject) {
            var uri = getUri;
            if (angular.isDefined(searchParams)) {
                uri = uri + '?';
                var params = [];
                angular.forEach(searchParams, function (value, key) {
                    params.push(key + "=" + value)
                });
                uri += params.join('&');
            }
            $http.get(dataService.api + uri).then(function(result) {
                if (angular.isUndefined(locationsToResolve) || locationsToResolve.length === 0) {
                    resolve(result.data);
                } else {
                    var promises = [];

                    if (result.data.hasOwnProperty(locationsToResolve[0])) {
                        var p = dataService.resolveLocation(result.data, locationsToResolve);
                        promises.push(p);
                    } else {
                        angular.forEach(result.data, function(serverObject) {
                            var p = dataService.resolveLocation(serverObject, locationsToResolve);
                            promises.push(p);
                        });
                    }

                    $q.all(promises).then(function() {
                        resolve(result.data);
                    });
                }
            }).catch(function(error){
                reject(error);
            });
        });
    };

    dataService.resolveLocation = function(serverObject, locationsToResolve) {
        return $q(function(resolve, reject) {
            var promises = [];
            angular.forEach(locationsToResolve, function(locationName) {
                var uri = serverObject[locationName].replace($rootScope.url, '');
                var p = dataService.get(uri).then(function(serverLocationObject) {
                    serverObject[locationName] = serverLocationObject;
                });
                promises.push(p);
            });
            $q.all(promises).then(function() {
                resolve(serverObject);
            });
        });
    };

    dataService.post = function(postUri, payloadData) {
        return $q(function(resolve, reject) {
            $http.post(dataService.api + postUri, payloadData).then(function(result) {
                resolve(result.data);
            }).catch(function(error){
                reject(error);
            });
        });
    };

    dataService.put = function(putUri, payloadData) {
        return $q(function(resolve, reject) {
            $http.put(dataService.api + putUri, payloadData).then(function(result) {
                resolve(result.data);
            }).catch(function(error){
                reject(error);
            });
        });
    };

    dataService.loadUser = function() {
        return $q(function(resolve, reject) {
            $http.get(dataService.api + '/api/user/').then(function(result) {
                result.data.url = $rootScope.url+'/api/users/'+result.data.id+'/';
                resolve(result.data);
            }).catch(function(error){
                reject(error);
            });
        });
    };

    // Public Service Methods
    return  {
        get : function(getUri, searchParams, locationsToResolve) {
            return dataService.get(getUri, searchParams, locationsToResolve);
        },
        post : function(postUri, payloadData) {
            return dataService.post(postUri, payloadData);
        },
        put : function(putUri, payloadData) {
            return dataService.put(putUri, payloadData);
        },
        loadUser : function() {
            return dataService.loadUser();
        }
    };
}]);