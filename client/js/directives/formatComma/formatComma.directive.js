(function() {

  angular
      .module('myApp')
      .directive('formatComma', formatComma);

  function formatComma( $window , $filter ) {
    return {
        require: 'ngModel',

        link: function (scope, elem, attrs, ctrl) {
            console.log("inside comma directive");
            if (!ctrl) return;

            if( attrs.formatComma == "decimal_yes"){
              elem.bind('blur', function() {
                var plainNumber = ctrl.$viewValue.replace(/[^\d|\-+|\.]/g, '');
                ctrl.$viewValue = $filter('number')(plainNumber,2);
                // ctrl.$setViewValue(ctrl.$viewValue);
                ctrl.$render();
               });
            }
            else{
              // decimal_no
              elem.bind('blur', function() {
                // strip everything after decimal
                var val = ctrl.$viewValue;
                var index = val.indexOf(".");
                if( index >= 0 ){
                  val = val.substring(0, index);
                  console.log("logging value without decimal: ");
                  console.log(val);
                }
                ctrl.$viewValue = val;
                var plainNumber = ctrl.$viewValue.replace(/[^\d|\-+]/g, '');
                ctrl.$viewValue = $filter('number')(plainNumber);
                // ctrl.$setViewValue(ctrl.$viewValue);
                ctrl.$render();
               });
            }
        }
    };
  }
  }
)();
