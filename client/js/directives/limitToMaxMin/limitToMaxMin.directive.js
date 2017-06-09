(function() {

    angular
        .module('myApp')
        .directive('limitToMaxMin', limitToMaxMin);

    function limitToMaxMin() {
        return {
            restrict: 'A',
            require: 'ngModel',
            scope:{
              ngModel: '='
            },
            link: function(scope, element, attributes) {
              // element.on("keydown keyup", function(e) {
              element.on("blur", function(e) {
                if (Number(element.val()) > Number(attributes.max) &&
                      e.keyCode != 46 // delete
                      &&
                      e.keyCode != 8 // backspace
                    ) {
                      e.preventDefault();
                      element.val(attributes.max);
                      scope.ngModel = Number(attributes.max);
                    }
                if (Number(element.val()) < Number(attributes.min) &&
                      e.keyCode != 46 // delete
                      &&
                      e.keyCode != 8 // backspace
                    ) {
                      e.preventDefault();
                      element.val(attributes.min);
                      scope.ngModel = Number(attributes.min);
                    }
              });
            }
        };
    }

})();
