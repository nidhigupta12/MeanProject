(function() {

    angular
        .module('myApp')
        .controller('navigationCtrl', navigationCtrl);

    //TODO - remove HTTP after test , we should not make Service calls from here
    navigationCtrl.$inject = ['$location', 'authentication', '$state', '$http',
    '$rootScope'];

    function navigationCtrl($location, authentication, $state, $http,
      $rootScope) {
        var vm = this;

        vm.isLoggedIn = authentication.isLoggedIn();

        vm.currentUser = authentication.currentUser();

        vm.role = authentication.role();
        console.log("Current User Roles: => ");
        console.log(vm.role);

        vm.ifRoleExists = function(role){
          var result = vm.role.indexOf(role);
          if( result == -1 ){
            return false;
          }
          return true;
        }


        vm.logout = function() {
            authentication
                .logout();
            // $state.go('logout');
        };

        vm.inState = function(state) {
            return $state.is(state);
        }

        vm.deployContract = function() {
            $http.get('/eth/socket', {
                headers: {
                    Authorization: 'Bearer ' + authentication.getToken()
                }
            }).then(
                function(response) {
                    console.log(response);

                },
                function(response) {
                    console.log(response.data.message);
                });

        }

        vm.setTabIdentifier = function(id){
          // console.log("reached tab identifier !!");
          // console.log(id);
          $rootScope.tabIdentifier = id;
          // console.log($rootScope.tabIdentifier);
        }
    }

})();
