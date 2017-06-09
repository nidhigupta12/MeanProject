(function() {
    angular
        .module('myApp')

        .controller('mainDashCtrl', mainDashCtrl);


    mainDashCtrl.$inject = ['$rootScope', '$scope', '$location', '$timeout'];


    function mainDashCtrl($rootScope, $scope, $location, $timeout) {
        var web3 = $rootScope.web3;
        var BigNumber = require('bignumber.js');
        // Display & update block list
        // getETHRates();
        updateBlockList();
        updateTXList();
        updateStats();
        // getHashrate();

        web3.eth.filter("latest").watch(function(error, result) {
            if (error) {
                console.log(error);
            } else {
                updateBlockList();
                updateTXList();
                updateStats();
                $scope.$apply();
            }
        });

        $scope.processRequest = function() {
            var requestStr = $scope.ethRequest;


            if (requestStr !== undefined) {

                // maybe we can create a service to do the reg ex test, so we can use it in every controller ?

                var regexpTx = /[0-9a-zA-Z]{64}?/;
                //var regexpAddr =  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}/; // TODO ADDR REGEX or use isAddress(hexString) API ?
                var regexpAddr = /^(0x)?[0-9a-f]{40}$/; //New ETH Regular Expression for Addresses
                var regexpBlock = /[0-9]{1,7}?/;

                var result = regexpTx.test(requestStr);
                if (result === true) {
                    goToTxInfos(requestStr)
                } else {
                    result = regexpAddr.test(requestStr.toLowerCase());
                    if (result === true) {
                        goToAddrInfos(requestStr.toLowerCase())
                    } else {
                        result = regexpBlock.test(requestStr);
                        if (result === true) {
                            goToBlockInfos(requestStr)
                        } else {
                            console.log("nope");
                            return null;
                        }
                    }
                }
            } else {
                return null;
            }
        };


        function goToBlockInfos(requestStr) {
            $location.path('/block/' + requestStr);
        }

        function goToAddrInfos(requestStr) {
            $location.path('/address/' + requestStr.toLowerCase());
        }

        function goToTxInfos(requestStr) {
            $location.path('/tx/' + requestStr);
        }

        function updateStats() {
            $scope.blockNum = web3.eth.blockNumber; // now that was easy

            if ($scope.blockNum !== undefined) {

                // TODO: put the 2 web3.eth.getBlock into the async function below
                //       easiest to first do with fastInfosCtrl
                var blockNewest = web3.eth.getBlock($scope.blockNum);

                if (blockNewest !== undefined) {

                    // difficulty
                    $scope.difficulty = blockNewest.difficulty;
                    $scope.difficultyToExponential = blockNewest.difficulty.toExponential(3);

                    $scope.totalDifficulty = blockNewest.totalDifficulty;
                    $scope.totalDifficultyToExponential = blockNewest.totalDifficulty.toExponential(3);

                    $scope.totalDifficultyDividedByDifficulty = $scope.totalDifficulty.dividedBy($scope.difficulty);
                    $scope.totalDifficultyDividedByDifficulty_formatted = $scope.totalDifficultyDividedByDifficulty.toFormat(1);

                    $scope.AltsheetsCoefficient = $scope.totalDifficultyDividedByDifficulty.dividedBy($scope.blockNum);
                    $scope.AltsheetsCoefficient_formatted = $scope.AltsheetsCoefficient.toFormat(4);

                    // large numbers still printed nicely:
                    $scope.difficulty_formatted = $scope.difficulty.toFormat(0);
                    $scope.totalDifficulty_formatted = $scope.totalDifficulty.toFormat(0);

                    // Gas Limit
                    $scope.gasLimit = new BigNumber(blockNewest.gasLimit).toFormat(0) + " m/s";


                    // Adding new difficulty





                    // Time
                    var newDate = new Date();
                    newDate.setTime(blockNewest.timestamp * 1000);
                    $scope.time = newDate.toUTCString();

                    $scope.secondsSinceBlock1 = blockNewest.timestamp - 1438226773;
                    $scope.daysSinceBlock1 = ($scope.secondsSinceBlock1 / 86400).toFixed(2);

                    // Average Block Times:
                    // TODO: make fully async, put below into 'fastInfosCtrl'

                    var blockBefore = web3.eth.getBlock($scope.blockNum - 1);
                    if (blockBefore !== undefined) {
                        $scope.blocktime = blockNewest.timestamp - blockBefore.timestamp;
                    }
                    $scope.range1 = 100;
                    range = $scope.range1;
                    var blockPast = web3.eth.getBlock(Math.max($scope.blockNum - range, 0));
                    if (blockBefore !== undefined) {
                        $scope.blocktimeAverage1 = ((blockNewest.timestamp - blockPast.timestamp) / range).toFixed(2);
                    }
                    $scope.range2 = 1000;
                    range = $scope.range2;
                    var blockPast = web3.eth.getBlock(Math.max($scope.blockNum - range, 0));
                    if (blockBefore !== undefined) {
                        $scope.blocktimeAverage2 = ((blockNewest.timestamp - blockPast.timestamp) / range).toFixed(2);
                    }
                    $scope.range3 = 10000;
                    range = $scope.range3;
                    var blockPast = web3.eth.getBlock(Math.max($scope.blockNum - range, 0));
                    if (blockBefore !== undefined) {
                        $scope.blocktimeAverage3 = ((blockNewest.timestamp - blockPast.timestamp) / range).toFixed(2);
                    }
                    $scope.range4 = 100000;
                    range = $scope.range4;
                    var blockPast = web3.eth.getBlock(Math.max($scope.blockNum - range, 0));
                    if (blockBefore !== undefined) {
                        $scope.blocktimeAverage4 = ((blockNewest.timestamp - blockPast.timestamp) / range).toFixed(2);
                    }

                    range = $scope.blockNum;
                    var blockPast = web3.eth.getBlock(1);
                    if (blockBefore !== undefined) {
                        $scope.blocktimeAverageAll = ((blockNewest.timestamp - blockPast.timestamp) / range).toFixed(2);
                    }

                    //fastAnswers($scope);
                    //$scope=BlockExplorerConstants($scope);

                }
            }
            // Block Explorer Info
            $scope.isConnected = web3.isConnected();
            //$scope.peerCount = web3.net.peerCount;
            $scope.versionApi = web3.version.api;
            $scope.versionClient = web3.version.client;
            //$scope.versionNetwork = web3.version.network;
            $scope.versionCurrency = web3.version.ethereum; // TODO: change that to currencyname?

            // ready for the future:
            try {
                $scope.versionWhisper = web3.version.whisper;
            } catch (err) {
                $scope.versionWhisper = err.message;
            }
        }


        function updateTXList() {
            var currentTXnumber = web3.eth.blockNumber;
            $scope.txNumber = currentTXnumber;
            $scope.recenttransactions = [];
            for (var i = 0; i < 10 && currentTXnumber - i >= 0; i++) {
                if (web3.eth.getTransactionFromBlock(currentTXnumber - i) != null) {
                    $scope.recenttransactions.push(web3.eth.getTransactionFromBlock(currentTXnumber - i));
                }
            }
        }

        function updateBlockList() {
            var currentBlockNumber = web3.eth.blockNumber;
            $scope.blockNumber = currentBlockNumber;
            $scope.blocks = [];
            for (var i = 0; i < 10 && currentBlockNumber - i >= 0; i++) {
                $scope.blocks.push(web3.eth.getBlock(currentBlockNumber - i));
            }
        }

    }
})();
