module.exports = function(moduleDefinitions) {
    var moduleCache = {};

    function localRequire(moduleId) {
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }
        var moduleInfo = moduleCache[moduleId] = {
            id: moduleId,
            loaded: false,
            exports: {}
        };
        moduleDefinitions[moduleId].call(moduleInfo.exports, moduleInfo, moduleInfo.exports, localRequire);
        moduleInfo.loaded = true;
        return moduleInfo.exports;
    }

    localRequire.moduleDefinitions = moduleDefinitions;
    localRequire.moduleCache = moduleCache;

    localRequire.defineGetter = function(targetObject, propertyName, getterFunction) {
        if (!localRequire.hasOwn(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true,
                get: getterFunction
            });
        }
    };

    localRequire.markAsEsModule = function(exportsObject) {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(exportsObject, Symbol.toStringTag, {
                value: "Module"
            });
        }
        Object.defineProperty(exportsObject, "__esModule", {
            value: true
        });
    };

    localRequire.interopDefault = function(value, mode) {
        if (mode & 1) value = localRequire(value);
        if (mode & 8) return value;
        if (mode & 4 && typeof value === "object" && value && value.__esModule) return value;
        var namespaceObject = Object.create(null);
        localRequire.markAsEsModule(namespaceObject);
        localRequire.defineGetter(namespaceObject, "default", function() {
            return value;
        });
        if (mode & 2 && typeof value !== "string") {
            for (var key in value) {
                localRequire.defineGetter(namespaceObject, key, (function(k) {
                    return value[k];
                }).bind(null, key));
            }
        }
        return namespaceObject;
    };

    localRequire.createDefaultExport = function(moduleExports) {
        var getterFn = moduleExports && moduleExports.__esModule ?
            function() {
                return moduleExports.default;
            } :
            function() {
                return moduleExports;
            };
        localRequire.defineGetter(getterFn, "a", getterFn);
        return getterFn;
    };

    localRequire.hasOwn = function(object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
    };

    localRequire.publicPath = "";

    return localRequire(localRequire.s = 0);
}([
    function(module, exports, localRequire) {
        "use strict";
        var fsModule = localRequire(1);
        localRequire(2)(fsModule.readFileSync("/dev/stdin", "utf8"));
    },
    function(module, exports) {
        module.exports = require("fs");
    },
    function(module, exports, localRequire) {
        "use strict";
        var InputReader = localRequire(3);
        var solveProblem = localRequire(5);
        module.exports = function solveMain(inputString) {
            var parserInstance = new InputReader(inputString);
            solveProblem(parserInstance);
        };
    },
    function(module, exports, localRequire) {
        "use strict";
        var TokenQueue = localRequire(4);
        module.exports = class InputReader {
            constructor(rawInputString) {
                var tokens = rawInputString.trim().split(/\s+/g);
                this.tokenQueue = new TokenQueue(tokens);
            }
            readNextToken() {
                return this.tokenQueue.dequeue();
            }
            readInt() {
                return parseInt(this.tokenQueue.dequeue(), 10);
            }
            clearTokens() {
                this.tokenQueue.clear();
            }
        };
    },
    function(module, exports, localRequire) {
        "use strict";
        module.exports = class TokenQueue {
            constructor() {
                var initialElements = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
                this.currentSize = initialElements.length;
                this.itemsArray = initialElements;
                this.currentIndex = 0;
            }
            enqueue(itemToEnqueue) {
                this.currentSize += 1;
                this.itemsArray.push(itemToEnqueue);
            }
            dequeue() {
                var dequeuedItem = this.itemsArray[this.currentIndex];
                this.currentSize -= 1;
                this.currentIndex += 1;
                return dequeuedItem;
            }
            clear() {
                this.itemsArray = [];
                this.currentSize = 0;
                this.currentIndex = 0;
            }
            isEmpty() {
                return this.currentSize === 0;
            }
        };
    },
    function(module, exports, localRequire) {
        "use strict";
        const MODULO_CONSTANT = 1000000007;

        function modularMultiplication() {
            for (var args = arguments, currentResult = args[0], argIndex = args.length; --argIndex;) {
                currentResult = ((currentResult >> 16) * args[argIndex] % MODULO_CONSTANT * 65536 + (65535 & currentResult) * args[argIndex]) % MODULO_CONSTANT;
            }
            return currentResult;
        }

        var factorialsArray = [];
        var inverseFactorialsArray = [];
        var unusedCombinationsPrecomputed = [];

        function calculateModularInverse(num) {
            let a = num;
            let m = MODULO_CONSTANT;
            let x0 = 0;
            let x1 = 1;

            while (a > 0) {
                let quotient = Math.floor(m / a);
                let tempM = m;
                m = a;
                a = tempM % a;
                let tempX = x0;
                x0 = x1 - quotient * x0;
                x1 = tempX;
            }
            return (x1 % MODULO_CONSTANT + MODULO_CONSTANT) % MODULO_CONSTANT;
        }

        function precomputeFactorialsAndInverses(maxN) {
            factorialsArray.length = maxN + 1;
            factorialsArray[0] = factorialsArray[1] = 1;
            for (let idx = 2; idx <= maxN; ++idx) {
                factorialsArray[idx] = modularMultiplication(factorialsArray[idx - 1], idx);
            }

            inverseFactorialsArray.length = maxN + 1;
            inverseFactorialsArray[0] = inverseFactorialsArray[1] = 1;
            inverseFactorialsArray[maxN] = calculateModularInverse(factorialsArray[maxN]);
            for (let idx = maxN; idx > 2; --idx) {
                inverseFactorialsArray[idx - 1] = modularMultiplication(inverseFactorialsArray[idx], idx);
            }

            unusedCombinationsPrecomputed.length = maxN + 1;
            unusedCombinationsPrecomputed[0] = unusedCombinationsPrecomputed[1] = 1;
            for (let idx = 2; idx <= maxN; ++idx) {
                unusedCombinationsPrecomputed[idx] = modularMultiplication(factorialsArray[idx - 1], inverseFactorialsArray[idx]);
            }
        }

        function combinationsModP(nValue, rValue) {
            if (rValue < 0 || rValue > nValue) return 0;
            return modularMultiplication(factorialsArray[nValue], inverseFactorialsArray[rValue], inverseFactorialsArray[nValue - rValue]);
        }

        module.exports = function(inputReader) {
            var N_val = inputReader.readInt();
            var K_val = inputReader.readInt();

            precomputeFactorialsAndInverses(N_val);

            for (let loopCounter = 1; loopCounter <= K_val; ++loopCounter) {
                const term1_n_value = N_val - K_val + 1;
                const term1_r_value = loopCounter;
                const term2_n_value = K_val - 1;
                const term2_r_value = loopCounter - 1;

                let combinationTerm1 = combinationsModP(term1_n_value, term1_r_value);
                let combinationTerm2 = combinationsModP(term2_n_value, term2_r_value);
                
                let currentResult = modularMultiplication(combinationTerm1, combinationTerm2);
                console.log(currentResult);
            }
        };
    }
]);
