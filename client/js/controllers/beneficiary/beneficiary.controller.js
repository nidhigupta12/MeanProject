/**
 * @author sukohli@deloitte.com
 * /beneficiary/home -> controller
 * This controller handles Share Lodgement
 */
(function() {
    angular
        .module('myApp')
        .controller('beneficiaryCtrl', beneficiaryCtrl);

    beneficiaryCtrl.$inject = ['$state', 'apiCall', 'authentication', '$scope', '$http', 'Upload', '$timeout', '$stateParams'];

    function beneficiaryCtrl($state, apiCall, authentication, $scope, $http, Upload, $timeout, $stateParams) {
        var vm = this;
        vm.showAccordion = false;
        // Prepopulate LC Number dropdown
        vm.init = function() {
            console.log("Prepopulate init function called !!");
            // get LC numbers from mongo
            $http.get('/beneficiary/getLcNumbers/', {
                    headers: {
                        Authorization: 'Bearer ' + authentication.getToken()
                    }
                })
                .then(function(response) {
                        console.log("Response Lc Numbers");
                        vm.lodgementDetails = response.data;
                    },
                    function(err) {
                        var user = authentication.currentUser();
                        if (user.role != 400) {
                            $scope.errorMsg = "Not the correct role";
                            $state.go('home');
                        }
                    })
                .then(function() {
                    if ($stateParams.actionItem != "" && $stateParams.actionItem != null) {
                        console.log("action item not null");
                        console.log($stateParams.actionItem);

                        console.log(vm.lodgementDetails);
                        var selectedLcNumber = vm.lodgementDetails.filter(function(dataObj) {
                            return (dataObj.lcNumber == $stateParams.actionItem);
                        });
                        // console.log(selectedLcNumber[0]);
                        vm.shareLodgement = selectedLcNumber[0];
                        // vm.showAccordion = true;
                        vm.fetchDetail(vm.shareLodgement);
                        $stateParams.actionItem = "";
                    }
                });


        }

        vm.clear = function() {
            vm.showAccordion = false;
            vm.shareLodgement = "";
            vm.invoiceFile = "";
            vm.invoiceFileArray = "";
            vm.lodgementFiles = "";
            vm.submitMessage = "";
            vm.createLodgementForm.$setPristine();
            vm.createLodgementForm.billNumber.$setValidity("billNumberUnique", true);
            vm.createLodgementForm.billQuantity.$setValidity("positiveInteger", true);
            vm.createLodgementForm.billAmount.$setValidity("positiveInteger", true);
            vm.createLodgementForm.billQuantity.checkPoQuantity = 0;
        }

        vm.fetchDetail = function(selectedLc) {
            console.log(" fetch details function");
            console.log(selectedLc);
            vm.showAccordion = true;
            $http.get('/beneficiary/getPresentingBank/' + encodeURIComponent(selectedLc.lcNumber), {
                    headers: {
                        Authorization: 'Bearer ' + authentication.getToken()
                    }
                })
                .then(function(response) {
                    console.log("Response Presenting Bank");
                    console.log(response.data);
                    vm.presentingBanks = response.data;
                }, function(err) {
                    var user = authentication.currentUser();
                    if (user.role != 400) {
                        $scope.errorMsg = "Not the correct role";
                        $state.go('home');
                    }
                });
        }

        // Function to check if Bill Number is unique for a beneficiary
        vm.validateBillNumber = function(billNumber) {
            console.log("validating billNumber on blur");
            console.log("billNumber is : " + billNumber);
            // encoding while sending as get query parameter
            billNumber = encodeURIComponent(billNumber);
            console.log("Encoding billNumber is : " + billNumber);
            var sellerId = authentication.currentUser().userId;
            if (billNumber != undefined && billNumber != 'undefined') {
                $http.get('/beneficiary/validateBillNumber/' + billNumber + '/' + sellerId, {
                    headers: {
                        Authorization: 'Bearer ' + authentication.getToken()
                    },
                }).then(function(response) {
                        // if billNumber is unique
                        console.log(response.data.message);
                    },
                    function(err) {
                        // if billNumber already exists in DB
                        console.log(err.data.message);
                        vm.createLodgementForm.billNumber.$setValidity("billNumberUnique", false);
                    });
            }
        }

        vm.removeUniqueMsg = function() {
            vm.createLodgementForm.billNumber.$setValidity("billNumberUnique", true);
        }

        vm.selectFiles = function(files) {
            console.log("Uploading ----------------");
            vm.lodgementFiles = files;
            console.log(vm.lodgementFiles);
        };

        vm.selectInvoice = function(file) {
            // console.log(file);
            if (file.length > 1) {
                // remove extra file
                console.log("Remove extra file");
                file.shift();
            }
            console.log("Uploading Invoice----------------");
            vm.invoiceFile = file[0];
            vm.invoiceFileArray = file;
            console.log(vm.invoiceFile);
        }

        vm.removeAttachement = function(index, typeOfFile) {
            console.log("type of file is: " + typeOfFile);
            if (typeOfFile === "others") {
                console.log("sent index is : " + index);
                vm.lodgementFiles.splice(index, 1);
            }
            if (typeOfFile === "invoice") {
                console.log("sent index is : " + index);
                vm.invoiceFile = "";
                vm.invoiceFileArray.splice(index, 1);
            }
        }

        vm.checkBillAmount = function(value, max) {
            value = vm.removeComma(value);
            if (value < 0) {
                vm.createLodgementForm.billAmount.$setValidity("positiveInteger", false);
                vm.createLodgementForm.billAmount.$setValidity("maxDecimalValue", true);
                return;
            } else {
                vm.createLodgementForm.billAmount.$setValidity("positiveInteger", true);
            }
            if (value > max) {
                vm.createLodgementForm.billAmount.$setValidity("maxDecimalValue", false);
            } else {
                vm.createLodgementForm.billAmount.$setValidity("maxDecimalValue", true);
            }
        }

        vm.checkPoQuantity = function() {
            vm.shareLodgement.billQuantity = vm.removeComma(vm.shareLodgement.billQuantity);
            var billQuantity = parseInt(vm.shareLodgement.billQuantity);
            var poQuantity = parseInt(vm.shareLodgement.poQuantity);
            if (billQuantity < 0) {
                vm.createLodgementForm.billQuantity.$setValidity("positiveInteger", false);
                vm.createLodgementForm.billQuantity.checkPoQuantity = 0;
                return;
            } else {
                vm.createLodgementForm.billQuantity.$setValidity("positiveInteger", true);
            }
            // 0 for equal , -1 for less , +1 for more
            if (billQuantity > poQuantity) {
                vm.createLodgementForm.billQuantity.checkPoQuantity = 1;
            } else if (billQuantity < poQuantity) {
                vm.createLodgementForm.billQuantity.checkPoQuantity = -1;
            } else {
                // pass
                vm.createLodgementForm.billQuantity.checkPoQuantity = 0;
            }
        }
        // vm.populatePresenting = function(presentingBank) {
        //     vm.presentingBank.name = presentingBank.name;
        //     vm.presentingBank.addresss = presentingBank.address;
        //     vm.presentingBank.advisingBankId = presentingBank._id;
        // };

        // function to remove comma from string
        vm.removeComma = function(value) {
            var temp = value.replace(/[^\d|\-+|\.]/g, '');
            return temp;
        }

        vm.submit = function() {
            console.log("Submit function called!");
            var mybody = angular.element(document).find('body');
            mybody.addClass('waiting');
            console.log(vm.shareLodgement);
            vm.shareLodgement.billAmount = vm.removeComma(vm.shareLodgement.billAmount);
            vm.shareLodgement.billQuantity = vm.removeComma(vm.shareLodgement.billQuantity);
            var lodgementRequest = {
                "contractID": vm.shareLodgement._id,
                "billNumber": vm.shareLodgement.billNumber,
                "billQuantity": vm.shareLodgement.billQuantity,
                "billAmount": vm.shareLodgement.billAmount,
                "billLading": vm.shareLodgement.billLading,
                "presentingBankId": vm.selectedPreBank._id
            };
            console.log(lodgementRequest);
            // files is a new array, copy of lodgementFiles
            var files = vm.lodgementFiles.slice();
            var invoiceFile = vm.invoiceFile;
            console.log("lodgementFiles are: ");
            console.log(files);
            if (files && files.length && invoiceFile) {
                // disabling submit button
                vm.clear();
                vm.submitMessage = "Lodgement Creation And File Upload In Progress, Please Wait.";
                // appends to start of array
                files.unshift(invoiceFile);
                console.log(files);
                Upload.upload({
                    url: '/beneficiary/upload',
                    data: {
                        files: files
                    }
                }).then(function(response) {
                    $timeout(function() {
                        console.log("The response for lodgementFiles upload");
                        console.log(response);
                        var lodgementDocuments = [];
                        for (var i = 0; i < response.data.length; i++) {
                            if (i == 0) {
                                var tempDoc = {
                                    "ipfsDocHash": response.data[i].hash,
                                    "fileName": response.data[i].fileName,
                                    "fileType": "invoice"
                                }
                            } else {
                                var tempDoc = {
                                    "ipfsDocHash": response.data[i].hash,
                                    "fileName": response.data[i].fileName,
                                    "fileType": "others"
                                }
                            }
                            lodgementDocuments.push(tempDoc);
                        }
                        console.log(lodgementDocuments);
                        lodgementRequest["lodgementDocuments"] = lodgementDocuments;
                        $http.post('/beneficiary/saveLodgementForm/', lodgementRequest, {
                            headers: {
                                Authorization: 'Bearer ' + authentication.getToken()
                            }
                        }).then(function(response) {
                            console.log("RESPONSE From save lodgementForm!");
                            // $scope.submitData = response.data;
                            console.log(response.data);
                            vm.init();
                            vm.clear();
                            mybody.removeClass('waiting');
                            vm.submitMessage = response.data.message;
                        }, function(err) {
                            mybody.removeClass('waiting');
                            console.log(err.status);
                        });
                    });
                }, function(err) {

                    if (err.status > 0) {
                        $scope.errorMsg = err.status + ': ' + err.data;
                    }
                }, function(evt) {
                    $scope.progress =
                        Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                }).then(function() {
                    console.log("THE LOCAL SAVE");
                    // Upload.upload({
                    //   url: '/beneficiary/uploadLocal',
                    //   data: {
                    //       files: files
                    //   }
                    // });
                });
            } else {
                console.log("Files Not Uploaded Properly");
                // disabling submit button
                vm.clear();
                vm.submitMessage = "--- Files Not Uploaded Properly, Please Try Again ---";
            }
        }

        vm.init();
    };
})();
