(function() {
    "use strict";
    angular
        .module('myApp')
        .service('apiCall', apiCall);

    apiCall.$inject = ['$http', 'authentication', '$state'];

    function apiCall($http, authentication, $state) {
        var makeCall = function(url, httpMethod, data){
          console.log("inside apiCall service !!");
          var result = {
            status:"",
            data:""
          };
          if( httpMethod === "post" ){
            console.log("post: " + url);
            return $http.post(url,data,{
              headers: {
                  Authorization: 'Bearer ' + authentication.getToken()
              }
            }).then(
              function success(response){
                // console.log(response.data.message);
                result.status = "success";
                result.data = response.data.message;
                return result;
              },
              function error(response){
                var user = authentication.currentUser();
                if(user.role!=200) {
                  result.status = "Role Based Authentication Failed";
                  console.log("Wrong user role");
                  $state.go('home');
                }
                // console.log(response.data.message);
                result.status = "failure";
                result.data = response.data.message;
                return result;
              }
            );
          }
          else if( httpMethod === "get"){
            console.log("get: " + url);
            return $http.get(url,{
              headers: {
                  Authorization: 'Bearer ' + authentication.getToken()
              }
            }).then(
              function success(response){
                // console.log(response.data.message);
                result.status = "success";
                result.data = response.data.message;
                // console.log(result.data);
                return result;
              },
              function error(response){
                var user = authentication.currentUser();
                if(user.role!=200) {
                  result.status = "Role Based Authentication Failed";
                  console.log("Wrong user role");
                  $state.go('home');
                }
                // console.log(response.data.message);
                result.status = "failure";
                result.data = response.data.message;
                return result;
              }
            );
          }
          else{
            console.log("Not a supported httpMethod");
          }
        };
        var service = {
          makeCall: makeCall,
        };

        return service;
    }


})();
