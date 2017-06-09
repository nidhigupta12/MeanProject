(function() {
    angular
        .module('myApp')
        .controller('loginCtrl', loginCtrl);

    loginCtrl.$inject = ['$state', 'authentication'];

    function loginCtrl($state, authentication) {
        var vm = this;

        if (authentication.isLoggedIn()) {
            console.log(authentication.getToken());
            $state.go('home');
        }

        vm.credentials = {
            email: "",
            password: ""
        };

        vm.errorMsg = {
            message: ""
        };


        vm.login = function() {
            authentication
                .login(vm.credentials)
                .then(function(response) {
                    if (response.status !== 200) {
                        vm.errorMsg.message = response.data.message;
                        $state.go('login');
                    } else {
                        $state.go('home');
                    }

                }, function(response) {
                    // in case Angular service failed
                });
        };
    };

})();
