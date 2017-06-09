(function() {
    angular
        .module('myApp')
        .controller('homeCtrl', homeCtrl);

    homeCtrl.$inject = ['$scope', '$http', '$state', 'authentication'];

    function homeCtrl($scope, $http, $state, authentication) {
        var vm = this;

        vm.init = function() {
            $http.get('/home/details/', {
                headers: {
                    Authorization: 'Bearer ' + authentication.getToken()
                }
            }).then(function(response) {
                    console.log("HOME CONTROLLER");
                    var userInfo = authentication.currentUser();
                    var responseData = response.data;
                    console.log(responseData);

                    var usersArray = ["issuingBankId","buyerId","sellerId","advisingBankId","presentingBankId","acceptLodgment"];
                    var newUserObjectArr = {
                      "issuingBankId":[],
                      "buyerId":[],
                      "sellerId":[],
                      "advisingBankId":[],
                      "presentingBankId":[],
                    };
                    for( var i in responseData ){
                      console.log("printing individual items");
                      console.log(responseData[i]);
                      var contractsPerRole = responseData[i];
                      // contractsPerRole => { "roleName" : [ array containing lc's] }
                      for( var y in usersArray ){
                        if( contractsPerRole[usersArray[y]] ){
                          var key1 = usersArray[y];
                          var key2 = key1;
                          if( usersArray[y] == "acceptLodgment" ){
                            key1 = "issuingBankId";
                          }
                          newUserObjectArr[key1].push(contractsPerRole[key2]);
                        }
                      }
                    }

                    vm.homePageData = newUserObjectArr;
                    console.log(vm.homePageData);
                },
                function(err) {


                });
        }
        vm.init();

    }
})();
