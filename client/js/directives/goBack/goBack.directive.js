(function() {

  angular
      .module('myApp')
      .directive('goBack', goBack);

  function goBack( $window ) {
    return function($scope, $element){
      $element.on('click', function(){
        $window.history.back();
      })
  }
  }

})();
