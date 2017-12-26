'use strict';

/**
 * Module - hitchcar
 */
var hitchcar = angular.module('hitchcar', ['ui.router', 'ngAnimate', 'ngAria', 'ngCookies', 'ngMessages', 'ngResource', 'ngRoute', 'ngSanitize', 'ngTouch']).
    config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {

        $locationProvider.hashPrefix('');

        // Router Konfiguration
        $stateProvider
            .state('public', {
                templateUrl: 'static/templates/public.html'
            })
            .state('public.login', {
                url: '/login',
                templateUrl: 'static/templates/controller/login.html',
                controller: 'loginCtrl'
            })
            .state('public.register', {
                url: '/register',
                templateUrl: 'static/templates/controller/register.html',
                controller: 'registerCtrl'
            })
            .state('private', {
                templateUrl: 'static/templates/private.html'
            })
            .state('private.home', {
                url: '/home',
                templateUrl: 'static/templates/controller/home.html',
                controller: 'homeCtrl'
            })
            .state('private.map', {
                url: '/map',
                templateUrl: 'static/templates/controller/map.html',
                controller: 'mapCtrl'
            })
            .state('private.routes', {
                url: '/routes',
                templateUrl: 'static/templates/controller/routes.html',
                controller: 'routesCtrl'
            })
            .state('private.ride', {
                url: '/ride/:id',
                templateUrl: 'static/templates/controller/ride.html',
                controller: 'rideCtrl'
            })
            .state('private.profile', {
                url: '/profile',
                templateUrl: 'static/templates/controller/profile.html',
                controller: 'profileCtrl'
            })
            .state('private.logout', {
                url: '/logout',
                controller: 'logoutCtrl'
            });

        $urlRouterProvider.otherwise('/login');

    }])
    .constant('AUTH_EVENTS', {
        notAuthenticated: 'auth-not-authenticated'
    })
    .run(['$rootScope', '$transitions', '$location', function($rootScope, $transitions, $location) {

        //Change for Production
        $rootScope.url = $location.protocol()+ '://' + $location.host();
        if ($location.port() !== 80 && $location.port() !== 443) {
            $rootScope.url = $rootScope.url + ':' + $location.port()
        }

        //Redirect unauthenticated User to Login page
        $transitions.onStart({ to: 'private.**' }, function(transition) {
            var auth = transition.injector().get('authService');
            if (!auth.isAuthenticated()) {
                $rootScope.originalTarget = {
                    name: transition.$to().name,
                    params: transition.params()
                };
                // User isn't authenticated. Redirect to login state.
                return transition.router.stateService.target('public.login');
            }
        });

        //Redirect authenticated User to Home page
        $transitions.onStart({ to: 'public.**' }, function(transition) {
            var auth = transition.injector().get('authService');
            if (auth.isAuthenticated()) {
                // User isn't authenticated. Redirect to login state.
                return transition.router.stateService.target('private.home');
            }
        });

        $rootScope.randomColorSet = [
            '#e6194b',
            '#3cb44b',
            '#0082c8',
            '#f58231',
            '#911eb4',
            '#46f0f0',
            '#f032e6',
            '#008080',
            '#e6beff',
            '#aa6e28',
            '#800000',
            '#808000',
            '#000080'
        ];

        $rootScope.randomColor = function() {
            return $rootScope.randomColorSet[Math.floor(Math.random() * $rootScope.randomColorSet.length)];
        };

        $rootScope.getMapUrl = function(location) {
            if (angular.isUndefined(location)) {
                return '';
            }
            return 'https://www.google.com/maps/?q='+location.latitude+','+location.longitude;
        }

    }]);
