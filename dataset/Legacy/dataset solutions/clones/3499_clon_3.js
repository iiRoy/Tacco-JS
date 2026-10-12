module.exports = function(modulesArray) {
    var moduleCache = {};

    function webpackRequire(moduleId) {
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }
        var moduleEntry = moduleCache[moduleId] = {
            id: moduleId,
            loaded: false,
            exports: {}
        };
        modulesArray[moduleId].call(moduleEntry.exports, moduleEntry, moduleEntry.exports, webpackRequire);
        moduleEntry.loaded = true;
        return moduleEntry.exports;
    }

    webpackRequire.modules = modulesArray;
    webpackRequire.cache = moduleCache;

    webpackRequire.defineExport = function(targetObject, propertyName, getterFunction) {
        if (!webpackRequire.hasOwnProperty(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true,
                get: getterFunction
            });
        }
    };

    webpackRequire.markAsEsModule = function(exportsObject) {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(exportsObject, Symbol.toStringTag, {
                value: "Module"
            });
        }
        Object.defineProperty(exportsObject, "__esModule", {
            value: true
        });
    };

    webpackRequire.createFakeNamespaceObject = function(value, modeFlags) {
        if (modeFlags & 1) value = webpackRequire(value);
        if (modeFlags & 8) return value;
        if (modeFlags & 4 && typeof value === "object" && value && value.__esModule) return value;
        var namespaceObject = Object.create(null);
        webpackRequire.markAsEsModule(namespaceObject);
        Object.defineProperty(namespaceObject, "default", {
            enumerable: true,
            value: value
        });
        if (modeFlags & 2 && typeof value !== "string") {
            for (var keyName in value) {
                webpackRequire.defineExport(namespaceObject, keyName, (function(currentKey) {
                    return value[currentKey];
                }).bind(null, keyName));
            }
        }
        return namespaceObject;
    };

    webpackRequire.getModuleExports = function(moduleRef) {
        var exportGetter = moduleRef && moduleRef.__esModule ?
            function() {
                return moduleRef.default;
            } :
            function() {
                return moduleRef;
            };
        webpackRequire.defineExport(exportGetter, "a", exportGetter);
        return exportGetter;
    };

    webpackRequire.hasOwnProperty = function(targetObject, propertyKey) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyKey);
    };

    webpackRequire.publicPath = "";

    return webpackRequire(webpackRequire.startupModuleId = 0);
}([
    function(module, exports, webpackRequire) {
        const fileSystemModule = webpackRequire(3);
        const rawInputContent = fileSystemModule.readFileSync("/dev/stdin", "UTF-8");
        const inputLinesArray = rawInputContent.split("\n");
        const processInputFunction = webpackRequire(1);
        processInputFunction(inputLinesArray);
    },
    function(module, exports, webpackRequire) {
        const getPrimeFactors = webpackRequire(2);

        module.exports = function(inputDataLines) {
            const firstInputLine = inputDataLines[0];

            const parseNumbersFromString = (str) => str.split(" ").map(Number);

            const [divisorN, dividendM] = parseNumbersFromString(firstInputLine);

            // Guard clause for the simple case where M is perfectly divisible by N
            if (dividendM % divisorN === 0) {
                console.log(dividendM / divisorN);
                return;
            }

            // Complex case: M is not perfectly divisible by N
            const primeFactorsMap = getPrimeFactors(dividendM);
            let currentSmallestFactor = dividendM; // Initialize with M itself

            const numericFactors = Object.keys(primeFactorsMap).map(Number);

            // Filter factors that are >= N and potentially smaller than currentSmallestFactor
            const eligibleFactors = numericFactors.filter(factor => factor >= divisorN && factor < currentSmallestFactor);

            if (eligibleFactors.length > 0) {
                currentSmallestFactor = Math.min(...eligibleFactors);
            }
            // If no eligible factors are found, currentSmallestFactor remains dividendM,
            // which correctly preserves the original behavior.

            const finalCalculatedResult = dividendM / currentSmallestFactor;
            console.log(finalCalculatedResult);
        };
    },
    function(module, exports) {
        module.exports = function(inputNumber) {
            const primeFactorCounts = {};
            let currentRemainingNumber = inputNumber;

            const upperLimitForDivisors = Math.ceil(Math.sqrt(inputNumber));

            for (let divisorCandidate = 2; divisorCandidate < upperLimitForDivisors; divisorCandidate++) {
                let currentFactorCount = 0;
                while (currentRemainingNumber % divisorCandidate === 0) {
                    currentRemainingNumber /= divisorCandidate;
                    currentFactorCount++;
                }
                if (currentFactorCount > 0) {
                    primeFactorCounts[divisorCandidate] = currentFactorCount;
                }
                // Preserve original behavior for non-positive remaining numbers
                if (currentRemainingNumber <= 0) {
                    break;
                }
            }

            // If after dividing by all small factors, currentRemainingNumber is still > 1,
            // it means currentRemainingNumber itself is a prime factor.
            if (currentRemainingNumber > 1) {
                primeFactorCounts[currentRemainingNumber] = 1;
            }

            return primeFactorCounts;
        };
    },
    function(module, exports) {
        module.exports = require("fs");
    }
]);
