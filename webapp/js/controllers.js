angular.module('app.controllers', [])

.controller('LoginCtrl', ['$scope', '$http', '$animate', '$window', '$location', '$rootScope', 'ngNotify', 'UserService', function($scope, $http, $animate, $window, $location, $rootScope, ngNotify, UserService) {
  $scope.user = {
    'username': 'test',
    'password': 'test'
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
        ngNotify.set('Something went wrong, try again', {
            type: 'error',
            duration: 2000
        });
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
    
.controller('MainCtrl', ['$scope', '$window', '$location', '$rootScope', 'ngNotify', '$http', 'UserService', function($scope, $window, $location, $rootScope, ngNotify, $http, UserService) {    
    
    $scope.posts = [];
    $http.defaults.headers.common['X-Auth'] = $rootScope.token
    
    $http.get('/api/posts')
            .success(function(posts) {
                $scope.posts = posts;
            })
            .error(function(err) {
                ngNotify.set('Something went wrong. I don\'t know what', {
                        type: 'error',
                        duration: 2000
                    });
            });
              
    $scope.postController = false;
    
    $scope.$on('ws:new_post', function(_, post) {
        $scope.$apply(function() {
            $scope.posts.unshift(post);
            ngNotify.set('A new post was posted', {
                type: 'info',
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
                        type: 'warn',
                        duration: 2000
                    });

                    return;
                }
            })
        })
    });    
    
    $scope.$on('ws:update_post', function(_, post) {
        $scope.$apply(function() {
            angular.forEach($scope.posts, function(val, key) {
                if (val._id === post._id) {
                    val = post;
                    ngNotify.set('Someone updated a post', {
                        type: 'info',
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
        $location.path('/edit/' + post._id);
    }
    
    $scope.logout = function() {
        UserService.logout();
    }
    
}])
    
.controller('PostCtrl', ['$scope', '$rootScope', '$location', '$http', '$window', 'ngNotify', '$timeout', 'UserService', function($scope, $rootScope, $location, $http, $window, ngNotify, $timeout, UserService) {    
    $scope.postController = true;

    $http.defaults.headers.common['X-Auth'] = $window.sessionStorage.token;

    $scope.submit = function(post) {
        if (post === undefined) {
             ngNotify.set('Empty post, eh?', {
                type: 'error',
                duration: 2000
            });
        } else {
            post.username = $rootScope.username;
            
            $http.post('/api/posts', post)
                .success(function(newPost) {
                    ngNotify.set('Your post was added to the brilliant archive', {
                        type: 'success',
                        duration: 1000
                    });
                    $timeout(function() {
                        $location.path('/main');
                    }, 1000)
                })
                .error(function() {
                    console.log('Something went wrong');
                });
        }
        
    }
    
    $scope.logout = function() {
        UserService.logout();
    }
}])

.controller('EditCtrl', ['$scope', '$rootScope', '$location', '$http', '$window', 'ngNotify', '$stateParams', '$timeout', 'UserService', function($scope, $rootScope, $location, $http, $window, ngNotify, $stateParams, $timeout, UserService) {    

    $http.defaults.headers.common['X-Auth'] = $window.sessionStorage.token;

    $http.get('/api/post/' + $stateParams.id)
            .success(function(post) {
                $scope.post = post;
            })
            .error(function(err) {
                ngNotify.set('Something went wrong. I don\'t know what', {
                        type: 'error',
                        duration: 2000
                    });
            });

    $scope.submit = function(post) {
        if (post.title === undefined || post.text === undefined) {
             ngNotify.set('Empty post, eh?', {
                type: 'error',
                duration: 2000
            });
        } else {
            $http.put('/api/update', post)
                .success(function(newPost) {
                    ngNotify.set('Your post was added updated', {
                        type: 'success',
                        duration: 1000
                    })
                    
                    $timeout(function() {
                        $location.path('/main');
                    }, 1000);
                })
                .error(function() {
                    console.log('Something went wrong');
                });
        } 
    }
    
    $scope.logout = function() {
        delete $window.sessionStorage.token;
        $http.defaults.headers.common['X-Auth'] = null;
        $location.path('/');
    }
}])