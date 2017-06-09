(function() {
    angular
        .module('myApp')

        .controller('applicantCtrl', applicantCtrl);

    applicantCtrl.$inject = ['$scope', '$http', 'authentication', 'Upload', '$timeout', '$state'];


    function applicantCtrl($scope, $http, authentication, Upload, $timeout, $state) {
        console.log("inside applicantForm controller")
        var vm = this;
        // using below regex in ng-pattern
        $scope.onlyNumbers = /^[0-9]{1,7}$/;

        $http.get('/applicant/onload/', {
            headers: {
                Authorization: 'Bearer ' + authentication.getToken()
            }
        }).then(function(response) {
            $scope.appForm = {};
            $scope.today = new Date();
            var user = authentication.currentUser();
            var sellers = [];
            var issueBanks = [];
            $scope.appForm.buyerId = user.userId;
            $scope.appForm.buyerName = user.name;
            $scope.appForm.buyerAdd = user.address;
            $scope.appForm.buyerAccNumber = user.accountNo;

            //$scope.appForm.buyerAccNumber = user.accountDetail.accountNo;
            for (i = 0; i < response.data.length; i++) {
                if ((response.data[i].roles.indexOf(400)) != -1 && response.data[i].id != user.userId) {
                    var seller = {
                      sellerId:'',
                      name:'',
                      sellerAdd:'',
                      sellerAccNumber:''
                    };
                    seller.sellerId=response.data[i].id;
                    seller.name=response.data[i].name;
                    seller.sellerAdd=response.data[i].address;
                    seller.sellerAccNumber=response.data[i].accountDetail.accountNo;
                    sellers.push(seller);
                } else if ((response.data[i].roles.indexOf(200)) != -1) {
                    var issueBank = response.data[i];
                    var issBank = {
                      bankId:'',
                      issueBankName:'',
                      issueBankAddress:'',
                      issueBankBranch:'',
                      issueBankAddress:'',
                    }
                    issBank.bankId = issueBank.id;
                    issBank.issueBankName = issueBank.name;
                    issBank.issueBankAddress = issueBank.address;
                    issBank.issueBankBranch = issueBank.branch;
                    issBank.issueBankAddress = issueBank.address;
                    issueBanks.push(issBank);
                } else if (response.data[i].role == 300) {
                    var advBank = response.data[i];
                    $scope.appForm.advBankId = advBank.id;
                    $scope.appForm.advBankName = advBank.entity;
                    $scope.appForm.advBankBranch = advBank.branch;
                }
            }

            $scope.appForm.sellers = sellers;
            $scope.appForm.issueBanks = issueBanks;

            console.log($scope.appForm);
        }, function(response) {
            if (user.role != 100) {
                $scope.errorMsg = "Not the correct role";
                console.log("Wrong user role");
                $state.go('home');
            }
            console.log(response.status);
        });

        vm.clear = function(appForm) {
            console.log("Clear section ");
            appForm.poNumber = "";
            appForm.poItem = "";
            appForm.poValue = "";
            appForm.lcDuration = "";
            appForm.tolerancePercent = "";
            appForm.usancePeriod = "";
            appForm.initiatorIpfcDocHash = "";
            appForm.poInitDate = "";
            appForm.message = "";
            appForm.poQuantity = "";
            $scope.submitData = "";
            $scope.createLcRequestForm.poNumber.$setValidity("poUnique", true);
            $scope.createLcRequestForm.poValue.$setValidity("minDecimalValue",true);
            $scope.createLcRequestForm.poQuantity.$setValidity("minDecimalValue",true);
            $scope.createLcRequestForm.$setPristine();
        }

        $scope.uploadFiles = function(files) {
            console.log("Uploading ----------------");
            $scope.appForm.files = files;
            $scope.appForm.message = $scope.appForm.files[0].name + " file selected";
        };

        vm.removeComma = function(value) {
            var temp = value.replace(/[^\d|\-+|\.]/g, '');
            return temp;
        }

        vm.submit = function(appForm) {
            console.log(appForm);
            var mybody = angular.element(document).find('body');
            mybody.addClass('waiting');
            console.log("This is for submit in controller" + appForm);
            console.log("poNumber=" + appForm.poNumber);
            console.log("Currency ===> " + appForm.poCurrency);
            console.log("Seller in controller ----------"+appForm.sellerId);
            console.log("This is for submit in controller    Files   " + appForm.files);
            var files = appForm.files;


            var fileName = files[0].name;
            console.log(" Controller naem       " + fileName);

            if (files && files.length) {
                Upload.upload({
                    url: '/applicant/upload',
                    data: {
                        files: files
                    }
                }).then(function(response) {
                    $timeout(function() {
                        $scope.result = response.data;
                        console.log("The response for upload");
                        console.log(response);
                        $scope.appForm.initiatorIpfcDocHash = response.data[0].hash;
                        $scope.appForm.initiaterFileName = fileName;
                        $scope.appForm.userDate = new Date();
                        $scope.appForm.poCurrency = "$";
                        // removing comma for poValue and poQuantity
                        appForm.poValue = vm.removeComma(appForm.poValue);
                        appForm.poQuantity = vm.removeComma(appForm.poQuantity);
                        $http.post('/applicant/submit/', appForm, {
                            headers: {
                                Authorization: 'Bearer ' + authentication.getToken()
                            }
                        }).then(function(response) {
                            console.log("RESPOSNSE________");
                            vm.clear($scope.appForm);
                            $scope.submitData = response.data;
                            mybody.removeClass('waiting');
                            console.log(response.data);

                        }, function(response) {
                            mybody.removeClass('waiting');
                            console.log(response.status);
                        });
                    });
                }, function(response) {

                    if (response.status > 0) {
                        $scope.errorMsg = response.status + ': ' + response.data;
                    }
                }, function(evt) {
                    $scope.progress =
                        Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                }).then(function() {
                    // console.log("THE LOCAL SAVE");
                    // Upload.upload({
                    //   url: '/applicant/uploadLocal',
                    //   data: {
                    //       files: files
                    //   }
                    // });

                });
            }
        };

        vm.populateBenefiary = function(seller) {
          console.log("in selection "+seller.sellerId);

            $scope.appForm.sellerId = seller.sellerId;
            $scope.appForm.sellerName = seller.name;
            $scope.appForm.sellerAdd = seller.sellerAdd;
            $scope.appForm.sellerAccNumber = seller.sellerAccNumber;
        };

        vm.populateIssueBank = function(issBank) {
          console.log("in selection "+issBank.bankId);
          $scope.appForm.bankId = issBank.bankId;
          $scope.appForm.issueBankName = issBank.issueBankName;
          $scope.appForm.issueBankAddress = issBank.issueBankAddress;
          $scope.appForm.issueBankBranch = issBank.issueBankBranch;
        };

        // Function to check if PO Number is unique for a buyerId
        vm.validatePoNumber = function(poNumber) {
            console.log("validating PO number on blur");
            console.log("ponumber is : " + poNumber);
            var buyerId = authentication.currentUser().userId;
            if (poNumber != undefined) {
                // encoding while sending as get query parameter
                poNumber = encodeURIComponent(poNumber);
                $http.get('/applicant/validatePoNumber/' + poNumber + '/' + buyerId, {
                    headers: {
                        Authorization: 'Bearer ' + authentication.getToken()
                    },
                }).then(function(response) {
                        // if poNumber is unique
                        console.log(response.data.message);
                        $scope.createLcRequestForm.poNumber.$setValidity("poUnique", true);
                    },
                    function(err) {
                        // if poNumber already exists in DB
                        console.log(err.data.message);
                        $scope.createLcRequestForm.poNumber.$setValidity("poUnique", false);
                    });
            }
        }

        vm.removeUniqueMsg = function() {
            $scope.createLcRequestForm.poNumber.$setValidity("poUnique", true);
        }

        vm.checkMinValue = function(value, min, type){
          value = vm.removeComma(value);
          if( type == "poValue"){
            if( value < min ){
              $scope.createLcRequestForm.poValue.$setValidity("minDecimalValue",false);
            }
            else{
              $scope.createLcRequestForm.poValue.$setValidity("minDecimalValue",true);
            }
          }
          else if( type == "poQuantity"){
            if( value < min ){
              $scope.createLcRequestForm.poQuantity.$setValidity("minDecimalValue",false);
            }
            else{
              $scope.createLcRequestForm.poQuantity.$setValidity("minDecimalValue",true);
            }
          }
          else{
            // pass
          }

        }




    }
})();
