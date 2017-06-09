(function() {
    "use strict";
    angular
        .module('myApp')
        .service('authentication', authentication);

    authentication.$inject = ['$http', '$window'];

    function authentication($http, $window) {


        var saveToken = function(token) {
            $window.sessionStorage['mean-token'] = token;
        };

        var getToken = function() {
            return $window.sessionStorage['mean-token'];
        };

        var isLoggedIn = function() {
            var token = getToken();
            var payload;

            if (token) {
                payload = token.split('.')[1];
                payload = $window.atob(payload);
                payload = JSON.parse(payload);
                return payload.exp > Date.now() / 1000;
            } else {
                return false;
            }
        };

        var currentUserRole = function() {
            var user = this.currentUser();
            var role;
            if (user && user !== "") {
                role = user.role;
            }
            return role;
        };

        var currentUser = function() {
            if (isLoggedIn()) {
                var token = getToken();
                var payload = token.split('.')[1];
                payload = $window.atob(payload);
                payload = JSON.parse(payload);
                return {
                    email: payload.email,
                    name: payload.name,
                    role: payload.role,
                    userId: payload.userId,
                    address:payload.address,
                    accountNo:payload.accountNo
                };
            }
        };

        var register = function(user) {
            console.log(user);
            return $http.post('/user/register', user).then(
                function(response) {
                    console.log(response.data);
                    saveToken(response.data.token);
                    return response;
                },
                function(response) {
                    // if error
                    return response;
                });
        };

        var login = function(user) {
            return $http.post('/user/login', user).then(
                function(response) {
                    // Save token in local storage
                    saveToken(response.data.token);
                    return response;
                },
                function(response) {
                    // return error response
                    return response;

                });
        };



        var logout = function() {
            $window.sessionStorage.removeItem('mean-token');
        };
        var service = {
            currentUser: currentUser,
            saveToken: saveToken,
            getToken: getToken,
            isLoggedIn: isLoggedIn,
            register: register,
            login: login,
            role: currentUserRole,
            logout: logout
        };

        return service;

    }


})();
