(function() {
    angular
        .module('myApp')
        .controller('notificationCtrl', notificationCtrl);

    notificationCtrl.$inject = ['$scope', '$http', 'authentication', '$timeout', '$state'];

    function notificationCtrl($scope, $http, authentication, $timeout, $state) {
        var vm = this;
        vm.showAccordion = false;
        vm.lcDetailsEnabled = true;
        // ENUM
        $scope.notificatoinText = [{
                99: "Stage 'Initiate LC Request'[PO# {0}]: Request initiated by {1}. File - {3} uploaded successfully. Block chain processing commenced."
            },
            {
                100: "Stage 'Initiate LC Request'[PO# {0}]: Block chain processing completed. Documents forwarded to issuing bank. Request Initiation complete. "
            },
            {
                199: "Stage 'Issuing bank verification'[LC# {2}]: Documents reviewed and verified. Block chain processing commenced. "
            },
            {
                200: "Stage 'Issuing bank verification'[LC# {2}]: Block chain processing completed. Documents forwarded to Advising bank. Issuing bank verification stage complete."
            },
            {
                299: "Stage 'Advising bank verification'[LC# {2}]: Documents reviewed and verified. Block chain processing commenced. "
            },
            {
                300: "Stage 'Advising bank verification'[LC# {2}]: Block chain processing completed. Documents forwarded to beneficiary. Advising bank verification stage complete."
            },
            {
                399: "Stage 'Beneficiary proof submission'[LC# {2}]: LC documents reviewed by beneficiary. Bill and Proof documents uploaded successfully.  Block chain processing commenced."
            },
            {
                400: "Stage 'Beneficiary proof submission' [LC# {2}]: Block chain processing completed. Bill and Proof documents forwarded to Presenting bank. Beneficiary proof submission stage complete."
            },
            {
                499: "Stage 'Presenting bank verification'[LC# {2}]: Bill and Proof documents reviewed and verified. Block chain processing commenced."
            },
            {
                500: "Stage 'Presenting bank verification'[LC# {2}]: Block chain processing completed. Bill and Proof documents forwarded to Issuing bank. Presenting bank verification stage complete."
            },
            {
                599: "Stage 'Issuing bank Lodgement'[LC# {2}]: Bill and Proof documents reviewed and verified. LC amount released to Presenting bank. Block chain processing commenced. "
            },
            {
                600: "Stage 'Issuing bank Lodgement'[LC# {2}]: Block chain processing completed. Bill and Proof documents lodged. LC amount transferred. Issuing bank Lodgement stage complete."
            }
        ];



        $scope.reload = function() {
            $http.get('/notification/LCDetails', {
                headers: {
                    Authorization: 'Bearer ' + authentication.getToken()
                }
            }).then(function(response) {
                // console.log("notification controller");
                vm.notifications = response.data;

                vm.workFlowsSeg = [];
                var poNumbers = [];
                var workFlows = [];
                var workFlowsSeg = [];
                var myMap = new Map();
                var first = 1;
                var value = -1;
                // console.log(response.data);
                angular.forEach(response.data, function(item) {
                    angular.forEach(item.workflows, function(workflow) {

                        // console.log(workflow);

                        var dateToSet = new Date(workflow.createdDateUTC);
                        var timeToSet = dateToSet.getTime(); // + dateToSet.getTimezoneOffset()*60*1000;
                        if (typeof myMap.get(timeToSet) !== 'undefined') {

                            var timeSegregation = myMap.get(timeToSet);
                            var timeSegregation1 = [];
                            timeSegregation1.transactionDT = workflow.createdDateUTC;
                            timeSegregation1.fileName = item.initiaterFileName;
                            timeSegregation1.stage = workflow.stage;
                            timeSegregation1.poNumbers = item.poNumber;
                            timeSegregation1.lcNumber = item.lcNumber;
                            timeSegregation1.buyerName = item.buyerId.name;
                            timeSegregation1.timeStamp = workflow.createdDateUTC;
                            timeSegregation1.offSet = timeToSet;
                            timeSegregation1.transactionHash = workflow.transactionHash;
                            timeSegregation.push(timeSegregation1);
                            myMap.set(timeToSet, timeSegregation);
                        } else {
                            var timeSegregation = [];
                            timeSegregation.transactionDT = workflow.createdDateUTC;
                            timeSegregation.fileName = item.initiaterFileName;
                            timeSegregation.stage = workflow.stage;
                            timeSegregation.poNumbers = item.poNumber;
                            timeSegregation.lcNumber = item.lcNumber;
                            timeSegregation.buyerName = item.buyerId.name;
                            timeSegregation.timeStamp = workflow.createdDateUTC;
                            timeSegregation.offSet = timeToSet;
                            timeSegregation.transactionHash = workflow.transactionHash;
                            myMap.set(timeToSet, timeSegregation);
                        }

                        // Self code for Creating Array

                        /*  var dateToSet1 = new Date(workflow.createdDateUTC);
                  var timeToSet1 = dateToSet1.getTime() ; //+ dateToSet1.getTimezoneOffset()*60*1000;
                  var tymStamp = timeToSet1;

                    value = -1;
                    if (first == 1) {
                        first = 2;
                        console.log("first time ");
                        var sameTime = [];
                        var dateToSet2 = new Date(workflow.createdDateUTC);
                        var timeToSet2 = dateToSet2.getTime() ;//+ dateToSet2.getTimezoneOffset()*60*1000;

                        sameTime.poNumber = item.poNumber;
                        sameTime.stage = workflow.stage;
                        sameTime.timeStamp = workflow.createdDateUTC;
                        sameTime.offSet = timeToSet2;
                        sameTime.fileName= item.initiaterFileName;
						sameTime.lcNumber= item.lcNumber;
						sameTime.buyerName= item.buyerId.name;
                        poNumbers.push(sameTime);
                        poNumbers.timeStamp = timeToSet2;
                      //  poNumbers.timeStamp = workflow.createdDateUTC;
                        workFlowsSeg.poNumbers = poNumbers;
                    } else {
                        console.log("The second time and on ");
                        angular.forEach(workFlowsSeg.poNumbers, function(poNumber) {

                          var dateToSet4 = new Date(poNumber.timeStamp);
                          var storedTym = dateToSet4.getTime() ;//+ dateToSet4.getTimezoneOffset()*60*1000;

                          //  var storedTym = poNumber.timeStamp;
                            if (storedTym == tymStamp) {
                                value = 1;
                                var sameTime = [];
                                sameTime.poNumber = item.poNumber;
                                sameTime.stage = workflow.stage;
                                sameTime.timeStamp = workflow.createdDateUTC;
                                sameTime.fileName= item.initiaterFileName;
                                sameTime.offSet = storedTym;
								sameTime.lcNumber= item.lcNumber;
								sameTime.buyerName= item.buyerId.name;
                                poNumber.push(sameTime);
                            }
                        });
                        if (value == -1) {
                            var sameTime = [];
                            var dateToSet = new Date(workflow.createdDateUTC);
                            var timeToSet = dateToSet.getTime() ;//+ dateToSet.getTimezoneOffset()*60*1000;
							sameTime.poNumber = item.poNumber;
                            sameTime.stage = workflow.stage;
                            sameTime.timeStamp = workflow.createdDateUTC;
                            sameTime.fileName= item.initiaterFileName;
							sameTime.lcNumber= item.lcNumber;
							sameTime.buyerName= item.buyerId.name;
                            sameTime.offSet = timeToSet;
                            poNumbers.push(sameTime);
							poNumbers.timeStamp = timeToSet;
                            //poNumbers.timeStamp = workflow.createdDateUTC;
                            workFlowsSeg.poNumbers = poNumbers;
                        }
                    }
					*/
                    });
                });
                /*
            $scope.notificationEntries = workFlowsSeg.poNumbers.sort(function (a, b) {
				  return b.offSet - a.offSet;
			});
			*/
                // console.log(myMap);
                var mapDesc = new Map([...myMap.entries()].sort().reverse());
                // console.log("Sorrted ------");
                $scope.notificationEntries = Array.from(mapDesc);
                console.log($scope.notificationEntries);
            }, function(response) {
                // console.log(response.status);
            });
            // end http get
            timeoutId = $timeout(function() {
                $scope.reload();
            }, 5000)
        };
        $scope.reload();

        $scope.$on("$destroy", function(event) {
            $timeout.cancel(timeoutId);
        });

        vm.toTimestamp = function(timeObj) {
            return new Date(timeObj).getTime();
        }

        vm.showLCDetail = function(lcDetails) {
            // console.log("lcNumber is" + lcDetails.lcNumber);
            vm.showAccordion = true;
            vm.lcDetailsEnabled = false;
        }

        $scope.range = function(min, max, step) {
            // console.log("max=" + max);
            step = step || 1;
            var input = [];
            for (var i = min; i <= max; i += step) {
                input.push(i);
            }
            return input;
        }
    }



})();
