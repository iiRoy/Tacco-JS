module.exports = function(moduleDefinitions) {
    var moduleCache = {};

    function localRequire(moduleId) {
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }
        var moduleObject = moduleCache[moduleId] = {
            id: moduleId,
            loaded: false,
            exports: {}
        };
        moduleDefinitions[moduleId].call(moduleObject.exports, moduleObject, moduleObject.exports, localRequire);
        moduleObject.loaded = true;
        return moduleObject.exports;
    }

    localRequire.m = moduleDefinitions;
    localRequire.c = moduleCache;

    localRequire.d = function(targetObject, propertyName, getterFunction) {
        localRequire.o(targetObject, propertyName) || Object.defineProperty(targetObject, propertyName, {
            enumerable: true,
            get: getterFunction
        });
    };

    localRequire.r = function(moduleExports) {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(moduleExports, Symbol.toStringTag, {
                value: "Module"
            });
        }
        Object.defineProperty(moduleExports, "__esModule", {
            value: true
        });
    };

    localRequire.t = function(value, mode) {
        if (1 & mode) {
            value = localRequire(value);
        }
        if (8 & mode) {
            return value;
        }
        if (4 & mode && typeof value === "object" && value && value.__esModule) {
            return value;
        }
        var resultObject = Object.create(null);
        localRequire.r(resultObject);
        Object.defineProperty(resultObject, "default", {
            enumerable: true,
            value: value
        });
        if (2 & mode && typeof value !== "string") {
            for (var propName in value) {
                localRequire.d(resultObject, propName, (function(currentProp) {
                    return value[currentProp];
                }).bind(null, propName));
            }
        }
        return resultObject;
    };

    localRequire.n = function(moduleExports) {
        var defaultGetter = moduleExports && moduleExports.__esModule ?
            function() {
                return moduleExports.default;
            } :
            function() {
                return moduleExports;
            };
        localRequire.d(defaultGetter, "a", defaultGetter);
        return defaultGetter;
    };

    localRequire.o = function(targetObject, propertyName) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
    };

    localRequire.p = "";

    return localRequire(localRequire.s = 0);
}([
    function(currentModule, moduleExports, localRequire) {
        localRequire(1)(localRequire(2).readFileSync("/dev/stdin", "UTF-8").split("\n"));
    },
    function(currentModule, moduleExports) {
        currentModule.exports = function(inputLines) {
            for (
                var firstLine = inputLines[0],
                    lineLength = firstLine.length,
                    playerScore = 0,
                    balanceCounter = 0,
                    charIndex = 0;
                charIndex < lineLength;
                charIndex++
            ) {
                if (balanceCounter > 0 && "g" === firstLine[charIndex]) {
                    if ("g" === firstLine[charIndex]) {
                        playerScore++;
                    }
                    balanceCounter--;
                } else {
                    if ("p" === firstLine[charIndex]) {
                        playerScore--;
                    }
                    balanceCounter++;
                }
            }
            console.log(playerScore);
        };
    },
    function(currentModule, moduleExports) {
        currentModule.exports = require("fs");
    }
]);
