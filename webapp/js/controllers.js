angular.module('secret.controllers', [])

.controller('LoginCtrl', ['$scope', '$http', '$animate', '$window', '$location', '$rootScope', 'ngNotify', function($scope, $http, $animate, $window, $location, $rootScope, ngNotify) {
  $scope.user = {
    'username': 'kung',
    'password': 'cool'
  }
    
  $scope.login = function(user) {
    $http.post('/authenticate', {username: user.username, password: user.password})
      .success(function (data, status, headers, config) {
        $window.sessionStorage.token = data;
        $rootScope.username = user.username;
        $http.defaults.headers.common['X-Auth'] = data
        $rootScope.token = data;
        $location.path('/main');
      })
      .error(function (data, status, headers, config) {
        delete $window.sessionStorage.token;
      });
  }
  
  $scope.signup = function(user) {
		var newUser = {
			username: user.username,
			password: user.password
		};

		$http.post('/signUp', newUser)
            .success(function(user) {
                $scope.user = {
                    "username":"",
                    "password":""
                }
                ngNotify.set('You are registered, now you can login', {
                    type: 'success',
                    duration: 2000
                });
            })
            .error(function() {
                ngNotify.set('Username is taken, try again', {
                    type: 'error',
                    duration: 2000
                });
            });
	};
}])
    
.controller('MainCtrl', ['$scope', '$window', '$location', '$resource', 'ngNotify', function($scope, $window, $location, $resource, ngNotify) {    
    $scope.logout = function() {
        delete $window.sessionStorage.token;
        $location.path('/');
    }
    
    var Posts = $resource('http://localhost:3000/api/posts');

    $scope.posts = [];

    Posts.query(function(results) {
        $scope.posts = results;
    });
    
    $scope.postController = false;
    
    $scope.$on('ws:new_post', function(_, post) {
        $scope.$apply(function() {
            $scope.posts.unshift(post);
            ngNotify.set('A new post was posted', {
                    type: 'success',
                    duration: 2000
                });

        })
    });
    
    $scope.$on('ws:delete_post', function(_, post) {
        $scope.$apply(function() {
            angular.forEach($scope.posts, function(val, key) {
                if (val._id === post._id) {
                    $scope.posts.splice($scope.posts.indexOf(val), 1);
                    ngNotify.set('Someone deleted a post :(', {
                        type: 'error',
                        duration: 2000
                    });

                    return;
                }
            })
        })
    });
    
    
    $scope.delete = function(post) {
        Posts.remove({id: post._id}, function() {
            for (var i = 0; i < $scope.posts.length; i++) {
                if (post._id === $scope.posts[i]._id) {
                   ngNotify.set('Your post is now doomed into oblivion', {
                        type: 'error',
                        duration: 2000
                    });
                    $scope.posts.splice(i, 1);
                }
            }
       });
    }
    
    $scope.edit = function(post) {
        $location.path('#/post/');
    }
}])
    
.controller('PostCtrl', ['$scope', '$resource', '$rootScope', '$location', '$http', '$window', 'ngNotify', function($scope, $resource, $rootScope, $location, $http, $window, ngNotify) {    
    $scope.postController = true;

    $http.defaults.headers.common['X-Auth'] = $window.sessionStorage.token;

    $scope.submit = function(post) {
        if (post.title === undefined || post.text === undefined) {
             ngNotify.set('Empty post, eh?', {
                type: 'error',
                duration: 2000
            });
        } else {
            $http.post('/api/posts', post)
                .success(function(newPost) {
                    ngNotify.set('Your post was added to the brilliant archive', {
                        type: 'success',
                        duration: 2000
                    });
                    $scope.post = {};
                })
                .error(function() {
                    console.log('Something went wrong');
                });
        }
        
    }
    
    $scope.logout = function() {
        delete $window.sessionStorage.token;
        $location.path('/');
    }
}])