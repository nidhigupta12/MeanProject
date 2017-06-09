(function() {
    angular
        .module('myApp')
        .controller('dashboardCtrl', dashboardCtrl);

    dashboardCtrl.$inject = ['$scope', '$http', 'authentication'];

    function dashboardCtrl($scope, $http, authentication) {
        console.log("inside dashboardCtrl ");
        var vm = this;
        vm.showAccordion = false;
        vm.lcDetailsEnabled = true;
        $scope.today = new Date();


        vm.showRadioBtnDetail = function(formobj, slctdRadioBtn) {
            console.log("slctdRadioBtn=" + slctdRadioBtn);
            formobj.lcSelected = "";
            vm.lcDetailsEnabled = true;
            vm.showAccordion = false;
            console.log("dashboardForm.lcSelected==" + formobj.lcSelected);
            if (slctdRadioBtn == 'contractDate') {
                if (formobj.startDate != undefined && formobj.endDate != undefined) {
                    console.log("from date" + formobj.startDate);
                    console.log("from date" + formobj.endDate);

                    $http.get('/dashboard/fetchPO/' + formobj.startDate + '/' + formobj.endDate, {
                        headers: {
                            Authorization: 'Bearer ' + authentication.getToken()
                        }
                    }).then(function(response) {
                        console.log("dashboard controller-if");
                        $scope.dashboards = response.data;
                        console.log("dashboard controller-if-1" + response.data);
                    }, function(response) {
                        console.log(response.status);
                    });
                }
            } else if (slctdRadioBtn == 'poNumber' || slctdRadioBtn == 'lcNumber') {
                formobj.startDate = "";
                formobj.endDate = "";
                // if selected radio type is not date, its either PO or LC Number
                $http.get('/dashboard/LCDetails', {
                    headers: {
                        Authorization: 'Bearer ' + authentication.getToken()
                    }
                }).then(function(response) {
                    console.log("dashboard controller-else");
                    $scope.dashboards = response.data;
                    console.log(response.data);
                }, function(response) {
                    console.log(response.status);
                });
            }


        }

        vm.toTimestamp = function(timeObj) {
            return new Date(timeObj).getTime();
        }

        vm.showLCDetail = function(lcDetails) {
            console.log("lcNumber is" + lcDetails.lcNumber);
            vm.showAccordion = true;
            vm.lcDetailsEnabled = false;
        };

        $scope.range = function(min, max, step) {
            console.log("max=" + max);
            step = step || 1;
            var input = [];
            for (var i = min; i <= max; i += step) {
                input.push(i);
            }
            return input;
        };
    }



})();
