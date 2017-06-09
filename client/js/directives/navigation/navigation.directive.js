(function() {

    angular
        .module('myApp')
        .directive('navigation', navigation);

    function navigation() {
        return {
            restrict: 'EA',
            templateUrl: '../../partials/navigation.html',
            controller: 'navigationCtrl as navvm'
        };
    }
    
})();
