/**
 * @author sukohli@deloitte.com
 * /issueBank/home -> controller
 * This controller handles Issue LC, prepopulates, uploads
 * file to ipfs and submits form
 */
(function() {
    angular
        .module('myApp')
        .controller('issueBankCtrl', issueBankCtrl);

    issueBankCtrl.$inject = ['$http', '$scope', '$rootScope', 'apiCall', 'authentication', '$stateParams'];

    function issueBankCtrl($http, $scope, $rootScope, apiCall, authentication, $stateParams) {
        var vm = this;


        // using below regex in ng-pattern
        $scope.onlyNumbers = /^[0-9]{1,7}$/;

        vm.lcDetails = {
            lcFee: "",
            lcNumber: "",
            lcValue: "",
            lcTerms: "",
            message: "",
            showAccordion: false
        };

        console.log("Issue Bank controller !!");

        vm.clear = function() {
            vm.lcDetails.lcNumber = "";
            vm.lcDetails.lcValue = "";
            vm.lcDetails.lcTerms = "";
            vm.lcDetails.message = "";
            $scope.issueLcForm = "";
            vm.lcDetails.lcFee = "";
            vm.lcDetails.lcDocsRequired = "";
            vm.lcDetails.showAccordion = false;
            vm.acceptLcForm.lcNumber.$setValidity('lcUnique', true);
            vm.acceptLcForm.$setPristine();
        }

        vm.submit = function() {
            console.log("Submit function called!");
            var mybody = angular.element(document).find('body');
            mybody.addClass('waiting');
            var lcRequest = {
                "contractID": $scope.issueLcForm._id,
                "lcNumber": vm.lcDetails.lcNumber,
                "lcValue": vm.lcDetails.lcValue,
                "lcTerms": vm.lcDetails.lcTerms,
                "lcFee": vm.lcDetails.lcFee,
                "lcDocsRequired": vm.lcDetails.lcDocsRequired,
                "advisingBankId": vm.lcDetails.advisingBankId
            };
            // disabling submit button
            vm.clear();
            vm.lcDetails.message = "--- Issue Lc In Progress, Please Wait ---";
            apiCall
                .makeCall("/lcRequest/saveLcForm", "post", lcRequest)
                .then(
                    function(response) {
                        // console.log(response.status);
                        // console.log(response.data);
                        console.log("calling init again to update PO Number list");
                        vm.init();
                        vm.clear();
                        mybody.removeClass('waiting');
                        vm.lcDetails.message = response.data;
                    }
                )
        }

        vm.fileView = function(issueLcForm) {
            var fileName = issueLcForm.initiaterFileName;
            window.open("/static/uploadedFiles/" + fileName, "_blank");
        }
        vm.changeLcFee = function(lcValue) {
            // value="{{ ((vm.lcDetails.lcValue * (issueLcForm.lcDuration+issueLcForm.usancePeriod) * 0.75)/365) | number:3}}"
            var RatePercent = 0.0075;
            console.log(lcValue);
            if (lcValue != null && lcValue != "" && lcValue != undefined) {
                console.log("LC duration" + $scope.issueLcForm.lcDuration);
                console.log("Usance Period" + $scope.issueLcForm.usancePeriod);
                console.log("LC Value" + lcValue);
                // var lcFee = (lcValue * ($scope.issueLcForm.lcDuration+$scope.issueLcForm.usancePeriod) * RatePercent) / 365;
                /*var lcFee = (lcValue (1+($scope.issueLcForm.tolerancePercent/100)*RatePercent) * Math.round(($scope.issueLcForm.lcDuration + $scope.issueLcForm.usancePeriod +1 )/30)/12 * (1+.14+.005+.005);
                 */
                console.log("LC Fees" + lcFee);
                vm.lcDetails.lcFee = lcFee.toFixed(2);
            }
        }
        vm.prepopulateLCDetails = function(lcDetails) {
            apiCall.makeCall("lcRequest/fetchAdvBank/" + encodeURIComponent(lcDetails.poNumber), "get")
                .then(function(response) {
                    console.log(response);
                    $scope.advBanks = response.data;
                })

            vm.lcDetails.showAccordion = true;
            var RatePercent = 0.0075;
            if ($scope.issueLcForm != "" && $scope.issueLcForm != undefined &&
                $scope.issueLcForm != null) {
                /*vm.lcDetails.lcFee = ((lcDetails.poValue *
									($scope.issueLcForm.lcDuration+$scope.issueLcForm.usancePeriod) *
									RatePercent) / 365);
									*/


                var lcFee_1 = lcDetails.poValue * (1 + ($scope.issueLcForm.tolerancePercent / 100)) * RatePercent;
                var lcFee_2 = Math.ceil(($scope.issueLcForm.lcDuration + $scope.issueLcForm.usancePeriod + 1) / 30);
                vm.lcDetails.lcFee = (lcFee_1 * lcFee_2) / 12 * (1 + .14 + .005 + .005);

                // 1 LC creation Fee = [(LC Duration + Usance Period) x Rate%]/365
            }
            vm.lcDetails.lcValue = lcDetails.poValue;
        }
        // Prepopulate PO Number
        vm.init = function() {
            console.log("Prepopulate init function called !!");
            // get PO number from mongo
            apiCall
                .makeCall("lcRequest/getPoNumbers", "get")
                .then(
                    function(response) {
                        console.log(response.status);
                        // console.log(response.data);
                        $scope.lcRequestDetails = response.data;
                    }
                )
                // .then(function() {
                //     apiCall.makeCall("lcRequest/fetchAdvBank/1211112", "get")
                //         .then(function(response) {
                //             $scope.advBanks = response.data;
                //         })
                // })
                .then(function() {
                    if ($stateParams.actionItem != "" && $stateParams.actionItem != null) {
                        console.log("action item not null");
                        console.log($stateParams.actionItem);
                        // console.log($scope.lcRequestDetails[1].poNumber);

                        var selectedPoNumber = $scope.lcRequestDetails.filter(function(dataObj) {
                            return (dataObj.poNumber == $stateParams.actionItem);
                        });
                        $scope.issueLcForm = selectedPoNumber[0];
                        // to populate lc fee and amount
                        vm.prepopulateLCDetails($scope.issueLcForm);
                        $stateParams.actionItem = "";
                    }
                });
        }

        // select active bootstrap tab
        vm.setTab = function(index) {
            if (index == $rootScope.tabIdentifier) {
                return "active";
            } else {
                return false;
            }
        }

        // calling on load of page
        vm.init();

        // Function to check if LC/Documentary Credit Number is unique for a issueBank
        vm.validateLcNumber = function(lcNumber) {
            console.log("validating lcNumber on blur");
            console.log("lcNumber is : " + lcNumber);
            // encoding while sending as get query parameter
            lcNumber = encodeURIComponent(lcNumber);
            console.log("Encoding lcNumber is : " + lcNumber);
            var issuingBankId = authentication.currentUser().userId;
            if (lcNumber != undefined && lcNumber != "" && lcNumber != null) {
                $http.get('/lcRequest/validateLcNumber/' + lcNumber + '/' + issuingBankId, {
                    headers: {
                        Authorization: 'Bearer ' + authentication.getToken()
                    },
                }).then(function(response) {
                        // if poNumber is unique
                        console.log(response.data.message);
                        // $scope.createLcRequestForm.poNumber.$setValidity("poUnique",true);
                    },
                    function(err) {
                        // if poNumber already exists in DB
                        console.log(err.data.message);
                        vm.acceptLcForm.lcNumber.$setValidity("lcUnique", false);
                        // $scope.createLcRequestForm.poNumber.$setValidity("poUnique",false);
                    });
            }
        }

        vm.removeUniqueMsg = function() {
            vm.acceptLcForm.lcNumber.$setValidity("lcUnique", true);
            // $scope.createLcRequestForm.poNumber.$setValidity("poUnique",true);
        }

        vm.populateAdvising = function(advBank) {
            $scope.issueLcForm.advisingBankId.branch = advBank.branch;
            $scope.issueLcForm.advisingBankId.address = advBank.address;
            vm.lcDetails.advisingBankId = advBank._id;
        };
    }
})();
