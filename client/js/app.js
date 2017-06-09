/**
 * @Author hitjoshi@deloitte.com
 */
(function() {

    angular.module('myApp', ['ui.router', 'ngFileUpload', '720kb.datepicker', 'angularMoment', 'filters']);

    angular
        .module('myApp')
        .config(['$stateProvider', '$urlRouterProvider', config])
        .run(['$rootScope', '$location', 'authentication', run]);

    var GETH_HOSTNAME = "127.0.0.1"; // put your IP address!
    // var APP_HOSTNAME = "127.0.0.1";

    var GETH_RPCPORT = 8545;

    // if we use ui.router we have to change $routeProvider to $stateProvider
    // $locationProvider is used to remove #/ that Angular adds to route
    function config($stateProvider, $urlRouterProvider) {

        var signUpState = {
            name: 'signup',
            url: '/signup',
            templateUrl: 'partials/signup.html',
            controller: 'signUpCtrl',
            controllerAs: 'vm'
        }

        var loginState = {
            name: 'login',
            url: '/login',
            templateUrl: 'partials/login.html',
            controller: 'loginCtrl',
            controllerAs: 'vm'
        }

        var logoutState = {
            name: 'logout',
            url: '/logout',
            templateUrl: 'partials/logout.html'
            // controller: 'logoutCtrl',
            // controllerAs: 'vm'
        }

        var ipfs = {
            name: 'ipfs',
            url: '/ipfs',
            templateUrl: 'partials/ipfs.html',
            controller: 'ipfsCtrl',
            controllerAs: 'vm'
        }

        var dashboard = {
            name: 'dashboard',
            url: '/dashboard',
            templateUrl: 'partials/dashboard.html',
            controller: 'dashboardCtrl',
            controllerAs: 'vm'
        }
        var notification = {
            name: 'notification',
            url: '/notification',
            templateUrl: 'partials/notification.html',
            controller: 'notificationCtrl',
            controllerAs: 'vm'
        }

        var home = {
            name: 'home',
            url: '/home',
            templateUrl: 'partials/home.html',
            controller: 'homeCtrl',
            controllerAs: 'vm'
        }


        var initiateLc = {
            name: 'initiateLc',
            url: '/createlc',
            templateUrl: 'partials/applicantForm.html',
            controller: 'applicantCtrl',
            controllerAs: 'vm'
        }
        // The changes for wire frames starts here
        var issueBankLndingPage = {
            name: 'issueBankLndingPage',
            url: '/issuebank/home/',
            params: {
                'actionItem': null,
            },
            templateUrl: 'partials/issueBankLndingPage.html',
            controller: 'issueBankCtrl',
            controllerAs: 'vm'
        }

        var advisingBankLndingPage = {
            name: 'advisingBankLndingPage',
            url: '/advBank',
            params: {
                'actionItem': null,
            },
            templateUrl: 'partials/advisingBankLndingPage.html',
            controller: 'advisingBankCtrl',
            controllerAs: 'vm'
        }

        var acceptLodgementPage = {
            name: 'acceptLodgementPage',
            url: '/acceptLodgement',
            params: {
                'actionItem': null,
            },
            templateUrl: 'partials/acceptLodgementPage.html',
            controller: 'acceptLodgementCtrl',
            controllerAs: 'vm'
        }

        var beneficiaryLndingPage = {
            name: 'beneficiaryLndingPage',
            url: '/beneficiary/home',
            params: {
                'actionItem': null,
            },
            templateUrl: 'partials/beneficiaryLandingPage.html',
            controller: 'beneficiaryCtrl',
            controllerAs: 'vm'
        }

        var presentingLandingPage = {
            name: 'presentingLandingPage',
            url: '/presenting/home',
            params: {
                'actionItem': null,
            },
            templateUrl: 'partials/presentingLandingPage.html',
            controller: 'presentingCtrl',
            controllerAs: 'vm'
        }


        // The changes for wire frames Ends here

        var issuingForm = {
            name: 'issuingForm',
            url: '/issuingForm',
            templateUrl: 'partials/issuingForm.html',
            controller: 'issueFormCtrl',
            controllerAs: 'vm'
        }
        // // url will be vm/orderDetails
        // // nested states
        // var orderDetails = {
        //     name: 'applicantForm.orderDetails',
        //     url: '/orderDetails',
        //     templateUrl: 'partials/applicantOrderDetails.html',
        // }
        // var details = {
        //     name: 'details',
        //     url: '/details/:itemId',
        //     templateUrl: 'partials/details.html',
        //     controller: 'detailsCtrl',
        //     controllerAs: 'vm'
        // }


        // var upload = {
        //     name: 'upload',
        //     url: '/upload',
        //     templateUrl: 'partials/fileupload.html',
        //     controller: 'fileCtrl',
        //     controllerAs: 'vm'
        // }

        var blockexplorer = {
            name: 'blockexplorer',
            url: '/blockexplorer',
            templateUrl: 'partials/blockmain.html',
            controller: 'mainDashCtrl',
            controllerAs: 'vm'
        }
        //
        var blockid = {
            name: 'blockid',
            url: '/block/:blockId',
            templateUrl: 'partials/blockInfos.html',
            controller: 'blockInfosCtrl',
            controllerAs: 'vm'
        }
        //
        var transactionid = {
            name: 'transactionid',
            url: '/tx/:transactionId',
            templateUrl: 'partials/transactionInfos.html',
            controller: 'transactionInfosCtrl',
            controllerAs: 'vm'
        }
        //
        var address = {
            name: 'address',
            url: '/address/:addressId',
            templateUrl: 'partials/addressInfos.html',
            controller: 'addressInfosCtrl',
            controllerAs: 'vm'
        }
        var chainapi = {
            name: 'chainapi',
            url: '/chain/api',
            templateUrl: 'partials/api.html',
            controller: 'chainInfosCtrl',
            controllerAs: 'vm'
        }
        var chain = {
            name: 'chain',
            url: '/chain/',
            templateUrl: 'partials/chainInfos.html',
            controller: 'chainInfosCtrl',
            controllerAs: 'vm'
        }


        //
        // var difficulty = {
        //     name: 'difficulty',
        //     url: '/chain/difficulty',
        //     templateUrl: 'partials/api/difficulty.html',
        //     controller: 'chainInfosCtrl',
        //     controllerAs: 'vm'
        // }



        $stateProvider
            .state(loginState)
            .state(signUpState)
            .state(ipfs)
            .state(home)
            .state(initiateLc)
            .state(issueBankLndingPage)
            .state(advisingBankLndingPage)
            .state(beneficiaryLndingPage)
            .state(presentingLandingPage)
            .state(issuingForm)
            // .state(details)
            .state(logoutState)
            .state(notification)
            .state(dashboard)
            .state(acceptLodgementPage)

            .state(blockexplorer)
            .state(blockid)
            .state(transactionid)
            .state(address)
            .state(chainapi)
            .state(chain);

        // default route
        $urlRouterProvider.otherwise('/login');
        // enable html5Mode to get rid of # appended in URL
        // $locationProvider.html5Mode(true);
    }

    function run($rootScope, $location, authentication) {

        var web3 = require('web3');
        var url = $location.absUrl().split('#!')[0];
        var protocol = url.split(':')[0];
        var ethDomain = url.split(':')[1];
        var ethPort = "8540";
        console.log(protocol + ":" + ethDomain + ":" + ethPort);
        if (ethDomain == "52.172.44.68") {
            // point to the server where ethereum is deployed
            ethDomain = "172.18.25.180";
        }
        var web3 = new Web3(new Web3.providers.HttpProvider(protocol + ":" + ethDomain + ":" + ethPort));
        $rootScope.web3 = web3;
        $rootScope.$on('$locationChangeStart', function(event, nextRoute, currentRoute) {
            var publicPages = ['/login', '/signup', '/logout'];
            var restrictedPage = publicPages.indexOf($location.path()) === -1;
            if (restrictedPage && !authentication.isLoggedIn()) {
                $location.path('/login');
            }
        });
    }

})();
