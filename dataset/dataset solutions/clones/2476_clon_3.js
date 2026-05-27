module.exports = (function(moduleDefinitions) {
    var moduleCache = {};

    function getModule(moduleId) {
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }

        var moduleObject = moduleCache[moduleId] = {
            id: moduleId,
            isLoaded: false,
            exports: {}
        };

        moduleDefinitions[moduleId].call(moduleObject.exports, moduleObject, moduleObject.exports, getModule);
        moduleObject.isLoaded = true;
        return moduleObject.exports;
    }

    getModule(0);

})([
    function(currentModule, moduleExports, getModule) {
        "use strict";
        var fsModule = getModule(1);
        var processInputFunction = getModule(2);
        processInputFunction(fsModule.readFileSync("/dev/stdin", "utf8"));
    },
    function(currentModule, moduleExports) {
        currentModule.exports = require("fs");
    },
    function(currentModule, moduleExports, getModule) {
        "use strict";
        var InputReaderClass = getModule(3);
        var mainLogicFunction = getModule(5);
        currentModule.exports = function(inputStringContent) {
            var readerInstance = new InputReaderClass(inputStringContent);
            mainLogicFunction(readerInstance);
        };
    },
    function(currentModule, moduleExports, getModule) {
        "use strict";
        var QueueClass = getModule(4);
        currentModule.exports = class InputProcessor {
            constructor(rawInputString) {
                var tokenArray = rawInputString.trim().split(/\s+/g);
                this.inputQueue = new QueueClass(tokenArray);
            }
            readString() {
                return this.inputQueue.dequeue();
            }
            readInt() {
                return parseInt(this.inputQueue.dequeue(), 10);
            }
            clearInput() {
                this.inputQueue.clear();
            }
        };
    },
    function(currentModule, moduleExports) {
        "use strict";
        currentModule.exports = class SimpleQueue {
            constructor(initialElements = []) {
                this.currentSize = initialElements.length;
                this.queueItems = initialElements;
                this.currentIndex = 0;
            }
            enqueue(elementToAdd) {
                this.currentSize += 1;
                this.queueItems.push(elementToAdd);
            }
            dequeue() {
                var dequeuedElement = this.queueItems[this.currentIndex];
                this.currentSize -= 1;
                this.currentIndex += 1;
                return dequeuedElement;
            }
            clear() {
                this.queueItems = [];
                this.currentSize = 0;
                this.currentIndex = 0;
            }
            peek() {
                if (this.currentIndex < this.queueItems.length) {
                    return this.queueItems[this.currentIndex];
                }
                return undefined;
            }
            hasMore() {
                return this.currentIndex < this.queueItems.length;
            }
        };
    },
    function(currentModule, moduleExports, getModule) {
        "use strict";
        var getDivisorsMap = getModule(6);
        currentModule.exports = function(readerInstance) {
            var targetNumber = readerInstance.readInt();
            var divisorsData = getDivisorsMap(targetNumber);

            var currentMinDiff = targetNumber;
            var bestFactorA = 1;
            var bestFactorB = targetNumber;

            var divisorKeys = Object.keys(divisorsData);

            for (var k = 0; k < divisorKeys.length; k++) {
                var divisorKeyStr = divisorKeys[k];
                var currentFactorA = parseInt(divisorKeyStr, 10);
                var currentFactorB = divisorsData[divisorKeyStr];

                if (currentFactorA > currentFactorB) {
                    break;
                }

                var diffBetweenFactors = currentFactorB - currentFactorA;
                if (currentMinDiff > diffBetweenFactors) {
                    bestFactorA = currentFactorA;
                    bestFactorB = currentFactorB;
                    currentMinDiff = diffBetweenFactors;
                }
            }
            var resultValue = (bestFactorA - 1) + (bestFactorB - 1);
            console.log(resultValue);
        };
    },
    function(currentModule, moduleExports) {
        "use strict";
        currentModule.exports = function(numToFactor) {
            var divisorPairs = {};
            var limit = Math.ceil(Math.sqrt(numToFactor));

            for (var currentDivisor = 1; currentDivisor <= limit; currentDivisor++) {
                if (numToFactor % currentDivisor === 0) {
                    var complementDivisor = numToFactor / currentDivisor;
                    divisorPairs[currentDivisor] = complementDivisor;
                    divisorPairs[complementDivisor] = currentDivisor;
                }
            }
            return divisorPairs;
        };
    }
]);
