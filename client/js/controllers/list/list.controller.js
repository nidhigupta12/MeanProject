// (function() {
//
//     angular
//         .module('myApp')
//         .controller('listCtrl', listCtrl);
//
//     listCtrl.$inject = ['$scope', '$http', '$state', 'authentication'];
//
//     function listCtrl($scope, $http, $state, authentication) {
//
//         $http.get('/artists/list', {
//             headers: {
//                 Authorization: 'Bearer ' + authentication.getToken()
//             }
//         }).then(
//             function(response) {
//                 // $scope.status = response.status;
//
//                 $scope.artists = response.data;
//                 $scope.artistOrder = 'reknown';
//             },
//             function(response) {
//                 console.log(response.status);
//                 console.log(response.error);
//                 console.log(response.data);
//                 $scope.data = response.data || 'Request failed';
//                 $scope.status = response.status;
//             });
//
//
//
//     }
// })();
