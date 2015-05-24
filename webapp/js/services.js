angular.module('app.services', [])

.service('UserService', function($http, $location, $window) {
    var service = this;
    
    this.getUser = function() {
        return $http.get('/api/user', {
            headers: { 'X-Auth': window.sessionStorage.token }
        })
    }
        
    this.login = function(user) {
        return $http.post('/authenticate', {
            username: user.username, password: user.password
        }).then(function(val) {
            service.token = val.data
            window.sessionStorage.token = val.data
            $http.defaults.headers.common['X-Auth'] = val.data
            return service.getUser()
        })
    }
    
    this.register = function(user) {
        return $http.post('api/user', user).success(function(val) {
            this.login(val)
        })
    }
    
    this.logout = function() {
        delete service.token
        delete $window.sessionStorage.token;
        $http.defaults.headers.common['X-Auth'] = null;
        $location.path('/');
    }

})
