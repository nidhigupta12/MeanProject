// // //inject angular file upload directives and services.
// // var app = angular.module('fileUpload', ['ngFileUpload']);
//
// (function() {
//
//     angular
//         .module('myApp')
//         .controller('fileCtrl', fileCtrl);
//
//     fileCtrl.$inject = ['$scope', 'Upload', '$timeout'];
//
//     function fileCtrl($scope, Upload, $timeout) {
//         $scope.uploadFiles = function(files) {
//             $scope.files = files;
//             if (files && files.length) {
//                 Upload.upload({
//                     url: '/file/upload',
//                     data: {
//                         files: files
//                     }
//                 }).then(function(response) {
//                     $timeout(function() {
//                         $scope.result = response.data;
//                     });
//                 }, function(response) {
//                     if (response.status > 0) {
//                         $scope.errorMsg = response.status + ': ' + response.data;
//                     }
//                 }, function(evt) {
//                     $scope.progress =
//                         Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
//                 });
//             }
//         };
//     }
// })();
