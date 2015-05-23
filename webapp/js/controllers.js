angular.module('secret.controllers', [])

.controller('LoginCtrl', ['$scope', '$http', '$animate', '$window', '$location', '$rootScope', function($scope, $http, $animate, $window, $location, $rootScope) {
//  $scope.user = {
//    'username': 'kung',
//    'password': 'cool'
//  }
    
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
            })
            .error(function() {
                console.log('Something went wrong');
            });
	};
}])
    
.controller('MainCtrl', ['$scope', '$window', '$location', '$resource', 'toaster', function($scope, $window, $location, $resource, toaster) {    
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
            toaster.pop({type: 'success', title: "New post", body:"Oh look, a new post!"});

        })
    });
    
    $scope.$on('ws:delete_post', function(_, post) {
        $scope.$apply(function() {
            angular.forEach($scope.posts, function(val, key) {
                if (val._id === post._id) {
                    $scope.posts.splice($scope.posts.indexOf(val), 1);
                    toaster.pop({type: 'error', title: "Deleted post", body:"Oh no, looks like someone deleted their not so brilliant post"});

                    return;
                }
            })
        })
    });
    
    
    $scope.delete = function(post) {
        Posts.remove({id: post._id}, function() {
            for (var i = 0; i < $scope.posts.length; i++) {
                if (post._id === $scope.posts[i]._id) {
                    toaster.pop({type: 'error', title: "Deleted post", body:"Your post is hereby deleted"});
                    $scope.posts.splice(i, 1);
                }
            }
       });
    }
    
    $scope.edit = function(post) {
        $location.path('#/post/');
    }
}])
    
.controller('PostCtrl', ['$scope', '$resource', '$rootScope', '$location', '$http', '$window', 'toaster', function($scope, $resource, $rootScope, $location, $http, $window, toaster) {    
    $scope.postController = true;

    $http.defaults.headers.common['X-Auth'] = $window.sessionStorage.token;

    $scope.submit = function(post) {
        if (post.title === undefined || post.text === undefined) {
            toaster.pop({type: 'error', title: "Nothing here", body:"Dude, write something"});
        } else {
            $http.post('/api/posts', post)
                .success(function(newPost) {
                    toaster.pop({type: 'success', title: "Success", body:"Your post was added to the brilliant archive"});
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