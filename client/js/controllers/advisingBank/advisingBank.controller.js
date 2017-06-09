(function() {
    angular
        .module('myApp')
        .controller('advisingBankCtrl', advisingBankCtrl);

    advisingBankCtrl.$inject = ['$scope','$http','authentication','$rootScope','$window','$state','$stateParams'];

    function advisingBankCtrl($scope,$http,authentication, $rootScope,$window,$state,$stateParams) {
	  var vm = this;
       vm.init = function(){
	     $http.get('/advBank/lcDetails', {
			 headers: {
				 Authorization: 'Bearer ' + authentication.getToken()
			 }
		 }).then(function(response) {
	        $scope.advBankLCList = response.data;
		 }, function(response) {
			   var user = authentication.currentUser();
			   if(user.role!=300) {
				   $scope.errorMsg = "Not the correct role";
				   $state.go('home');
			   }
			 })
       .then( function(){
         if( $stateParams.actionItem != "" && $stateParams.actionItem != null ){
           console.log("action item not null");
           console.log($stateParams.actionItem);

           console.log($scope.advBankLCList);
         var selectedLcNumber = $scope.advBankLCList.filter(function( dataObj ) {
                 return (dataObj.lcNumber == $stateParams.actionItem ) ;
               });
         console.log(selectedLcNumber[0]);
         $scope.advBankFormDetails = selectedLcNumber[0];
         vm.showAccordion = true;
         $stateParams.actionItem = "";
         }
       });
	   }

	  vm.fetchDetail = function(lcDetails){
      if( lcDetails != null && lcDetails != ""){
        vm.showAccordion = true;
      }
	  }

	  /* Function to display the PDF file from IPFS */
	  /*
	  vm.displayPDF = function(lcDetails){
		var fileName = lcDetails.initiaterFileName;
		window.open("/static/uploadedFiles/"+fileName,"_blank");
	  }
	  */

	  /* Function to clear the fields on reset button */
	  vm.clear = function(){
		   if( $scope.advBankFormDetails != "" && $scope.advBankFormDetails != undefined
          && $scope.advBankFormDetails != null ){
			  $scope.advBankFormDetails = "";
		  }
      vm.showAccordion = false;
      $scope.displayMessage = "";
	  }

	  /* Function to Save the Advising bank screen details */
	  vm.submit = function(lcDetails){
		  var contractID = {'contractID': lcDetails._id};
		   $http.post('/advBank/lcAccept',contractID, {
                headers: {
                    Authorization: 'Bearer ' + authentication.getToken()
                }
            }).then(
                function(response) {
      			       vm.init();
                   vm.showAccordion = false;
                   $scope.displayMessage="LC Accepted : Block chain processing initiated";
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
