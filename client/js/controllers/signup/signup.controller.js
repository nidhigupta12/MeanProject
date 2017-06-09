(function() {
    angular
        .module('myApp')
        .controller('signUpCtrl', signUpCtrl);

    signUpCtrl.$inject = ['$state', 'authentication'];

    function signUpCtrl($state, authentication) {
        var vm = this;
        vm.credentials = {
            name: "",
            email: "",
            password: "",
            address: "",
            role: ""
        };
        vm.errorMsg = {
            message: ""
        };
        vm.submit = function() {
            authentication
                .register(vm.credentials)
                .then(function(response) {
                    if (response.status !== 200) {
                        vm.errorMsg.message = response.data.message;
                        $state.go('signup');
                    } else {
                        $state.go('home');
                    }
                }, function(response) {
                    console.log("In Error of the Angular Service Call");
                });
        };

        vm.clear = function() {
            vm.credentials = {
                name: "",
                email: "",
                password: "",
                role: "",
                address: ""
            };

        }

    }

})();
