(function() {
    angular
        .module('myApp')
        .controller('acceptLodgementCtrl', acceptLodgementCtrl);

    acceptLodgementCtrl.$inject = ['$scope','$http','authentication','$rootScope','$window','$state','$stateParams'];

    function acceptLodgementCtrl($scope,$http,authentication, $rootScope,$window,$state,$stateParams) {
		console.log("inside acceptLodgementCtrl-1")
	  var vm = this;
       vm.init = function(){
	     $http.get('/acceptLodgement/lcDetails', {
			 headers: {
				 Authorization: 'Bearer ' + authentication.getToken()
			 }
		 }).then(function(response) {
			$scope.acptLdgmentLCList = response.data;
			console.log($scope.acptLdgmentLCList);
		 }, function(response) {
			   var user = authentication.currentUser();
			   if(user.role!=200) {
				   $scope.errorMsg = "Not the correct role";
				   $state.go('home');
			   }
			 })
       .then( function(){
         if( $stateParams.actionItem != "" && $stateParams.actionItem != null ){
           console.log("action item not null");
           console.log($stateParams.actionItem);

           console.log($scope.acptLdgmentLCList);
         var selectedLcNumber = $scope.acptLdgmentLCList.filter(function( dataObj ) {
                 return (dataObj.lcNumber == $stateParams.actionItem ) ;
               });
         $scope.acptLdgmentFormDetails = selectedLcNumber[0];
         vm.showAccordion = true;
         $stateParams.actionItem = "";
         }
       });
	   }

	  /* function to enable Accordian on selection of LC Number on the HTML page */
	  vm.fetchDetail = function(lcDetails){
      if( lcDetails != null && lcDetails != ""){
        vm.showAccordion = true;
        vm.submitMessage = "";
      }
	  }


	  /* Function to clear the fields on reset button */
	  vm.clear = function(){
			console.log("clear all fields inside acceptLodgementService-2");
			vm.submitMessage = "";
		   if( $scope.acptLdgmentFormDetails != "" && $scope.acptLdgmentFormDetails != undefined
          && $scope.acptLdgmentFormDetails != null ){
			  console.log("clearing all fields");
			  $scope.acptLdgmentFormDetails = "";
			  vm.showAccordion=false;
		  }

	  }

	  /* Function to Save the Advising bank screen details */
	  vm.submit = function(lcDetails){
		  console.log("inside acceptLodgementController->submit()");
		  console.log("contractID="+lcDetails._id);
		  var contractID = {'contractID': lcDetails._id};
		   $http.post('/acceptLodgement/acceptLC',contractID, {
                headers: {
                    Authorization: 'Bearer ' + authentication.getToken()
                }
            }).then(
                function(response) {
                  vm.init();
                  vm.clear();
                  vm.submitMessage="Lodgement Accepted : Block chain processing initiated";
                  vm.showAccordion = false;
                },
                function(response) {
                    console.log(response.data.message);
                });
		}

	  vm.setTab = function(index){
        if( index == $rootScope.tabIdentifier ){
          return "active";
        }
        else{
          return false;
        }
      }
	  vm.init();
    }
})();
