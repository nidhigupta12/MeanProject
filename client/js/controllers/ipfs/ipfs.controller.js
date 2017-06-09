// (function() {
//
//     angular
//         .module('myApp')
//         .controller('ipfsCtrl', ipfsCtrl)
//         .directive('ngFiles', ['$parse', function($parse) {
//
//             function fn_link(scope, element, attrs) {
//                 var onChange = $parse(attrs.ngFiles);
//                 element.on('change', function(event) {
//                     onChange(scope, {
//                         $files: event.target.files
//                     });
//                 });
//             };
//
//             return {
//                 link: fn_link
//             }
//         }])
//
//
//     ipfsCtrl.$inject = ['$scope', '$http', '$state'];
//
//     function ipfsCtrl($scope, $http) {
//
//         var formdata = new FormData();
//         $scope.getTheFiles = function($files) {
//             angular.forEach($files, function(value, key) {
//                 formdata.append(key, value);
//             });
//         };
//         $scope.uploadFiles = function() {
//             var request = {
//                 method: 'POST',
//                 url: 'http://127.0.0.1:5001/api/v0/add',
//                 data: formdata,
//                 headers: {
//                     'Content-Type': undefined
//                 }
//             };
//
//             // SEND THE FILES.
//             $http(request)
//                 .then(function(response) {
//                         $scope.message = response.data.Hash;
//                     },
//                     function(response) {
//                         console.log('Failed');
//                         $scope.message = response.error;
//                     }
//                 );
//
//         }
//
//         $scope.viewIPFS = function() {
//             var fileHash = $scope.file.hash;
//             // /$scope.ipfsUrl = 'http://127.0.0.1:5001/api/v0/cat?arg=' + fileHash;
//             $scope.ipfsUrl = 'http://ipfs.io/ipfs/' + fileHash;
//         }
//     }
// })();
//
//
// var ipfs = window.IpfsApi('localhost', '5001');
