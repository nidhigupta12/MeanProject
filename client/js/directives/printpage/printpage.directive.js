(function() {

    angular
        .module('myApp')
        .directive('printpage', printpage);

    function printpage( $timeout ) {
        return {
            restrict: 'E',
            template: "<button class='btn btn-inverse btn-lg btn-login'>" +
            					  "Print" +
            					"</button>",
            link: function(scope, element, attributes) {
              element.on("click", function(e) {
                var expandButton = angular.element("#collapse-init");
                var expandText = expandButton.text();
                if( expandText.trim() === "Expand All" ){
                  expandButton.click();
                }
                $timeout( function(){ window.print() }, 2000);
              });
            }
        };
    }

})();
