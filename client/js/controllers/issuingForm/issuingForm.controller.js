(function() {
    angular
        .module('myApp')
        .controller('issueFormCtrl', issueFormCtrl);

    issueFormCtrl.$inject = ['$scope','$http','authentication'];

    function issueFormCtrl($scope,$http,authentication) {
      console.log("inside IssueForm controller@@@@@@@@@");
      var vm=this;
      $http.get('/issuingForm/issue', {
                 headers: {
                     Authorization: 'Bearer ' + authentication.getToken()
                 }
             }).then(function(response) {

                 $scope.poList = response.data;

                 console.log(response.data);


             }, function(response) {

                 console.log(response.status);
             });


             vm.fetchDetail = function(id) {
                var po = id.po;
               $http.get('/issuingForm/fetchdetail/'+po, {
                          headers: {
                              Authorization: 'Bearer ' + authentication.getToken()
                          }
                      }).then(function(response) {
                          $scope.poDetail= response.data;
                          console.log(response.data);
                      }, function(response) {
                          console.log(response.status);
                      });


             };

             vm.submit = function(id) {
               console.log("The submit call to service");
               var po = {'po': id.po};
                 $http.post('/issuingForm/submit/',po, {
                            headers: {
                                Authorization: 'Bearer ' + authentication.getToken()
                            }
                        }).then(function(response) {
                          console.log(response);
                            // $scope.messsage= "Workflow changes done";
                        }, function(response) {
                            console.log(response);
                        });


             };

        }
    })();
