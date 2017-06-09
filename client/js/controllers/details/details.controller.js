// (function() {
//
//     angular
//         .module('myApp')
//         .controller('detailsCtrl', detailsCtrl);
//
//     detailsCtrl.$inject = ['$scope', '$http', '$stateParams', 'authentication'];
//
//
//     function detailsCtrl($scope, $http, $stateParams, authentication) {
//         $http.get('/artists/list', {
//             headers: {
//                 Authorization: 'Bearer ' + authentication.getToken()
//             }
//         }).then(function(response) {
//             $scope.artists = response.data;
//             $scope.whichItem = $stateParams.itemId;
//             console.log($scope.whichItem);
//
//             if ($stateParams.itemId > 0) {
//                 $scope.prevItem = Number($stateParams.itemId) - 1;
//             } else {
//                 $scope.prevItem = $scope.artists.length - 1;
//             }
//
//             if ($stateParams.itemId < $scope.artists.length - 1) {
//                 $scope.nextItem = Number($stateParams.itemId) + 1;
//             } else {
//                 $scope.nextItem = 0;
//             }
//         }, function(response) {
//
//             console.log(response.status);
//         });
//
//     }
// })();
