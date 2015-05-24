angular.module('TopSecret', ['app.controllers', 'app.services', 'ui.router', 'ngResource', 'ngNotify'])

.config(function($stateProvider, $urlRouterProvider, $httpProvider) {
    
    $urlRouterProvider.otherwise("/login");

    $stateProvider
    .state('login', {
      url: "/login",
      templateUrl: "partials/login.html",
      controller: 'LoginCtrl',
      onEnter: function($state) {
        if (window.sessionStorage.token) {
            $state.go('main')
        }
      }
    })
    
    .state('main', {
      url: "/main",
      templateUrl: "partials/main.html",
      controller: 'MainCtrl',
      onEnter: function($state, $rootScope, $http) {
        if (!window.sessionStorage.token) {
            $state.go('login')
        } else {
            $rootScope.token = window.sessionStorage.token;
        }
      }
    })
    
    .state('post', {
      url: "/post",
      templateUrl: "partials/post.html",
      controller: 'PostCtrl',
      onEnter: function($state, $rootScope, $http) {
        if (!window.sessionStorage.token) {
            $state.go('login')
        } else {
            $rootScope.token = window.sessionStorage.token;
            
        }
      }
    })
    
    .state('edit', {
      url: "/edit/:id",
      templateUrl: "partials/edit.html",
      controller: 'EditCtrl',
      onEnter: function($state, $rootScope, $http) {
        if (!window.sessionStorage.token) {
            $state.go('login')
        } else {
            $rootScope.token = window.sessionStorage.token;
        }
      }
    })
})

.run(function($rootScope, $timeout, $location) {
    (function connect() {
        var url = 'ws://' + $location.host() + ':' + $location.port();
        var connection = new WebSocket(url);
        
        connection.onclose = function(e) {
            console.log('WebSocket closed. Reconnecting...')
            $timeout(connect, 10*1000);
        }
        
        connection.onmessage = function(e) {
            var payload = JSON.parse(e.data);
            if (payload.data !== undefined) {
                if (payload.data.public) {
                    $rootScope.$broadcast('ws:' + payload.topic, payload.data);
                }
            }
        }

        connection.onopen = function() {
            console.log('WebSocket connected..');
        }
        
    })()    
})
