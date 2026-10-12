module.exports = function(moduleDefinitions) {
    var moduleCache = {};

    function internalRequire(moduleId) {
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }
        var moduleObject = moduleCache[moduleId] = {
            id: moduleId,
            loaded: false,
            exports: {}
        };
        moduleDefinitions[moduleId].call(moduleObject.exports, moduleObject, moduleObject.exports, internalRequire);
        moduleObject.loaded = true;
        return moduleObject.exports;
    }

    internalRequire.modules = moduleDefinitions;
    internalRequire.cache = moduleCache;

    internalRequire.definePropertyGetter = function(targetObject, propertyName, getterFunction) {
        if (!internalRequire.hasOwnProperty(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true,
                get: getterFunction
            });
        }
    };

    internalRequire.markAsEsModule = function(targetObject) {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(targetObject, Symbol.toStringTag, {
                value: "Module"
            });
        }
        Object.defineProperty(targetObject, "__esModule", {
            value: true
        });
    };

    internalRequire.createNamespaceObject = function(moduleExport, flags) {
        var isModuleLoaded = (flags & 1) && (moduleExport = internalRequire(moduleExport));
        if (flags & 8) return moduleExport;
        if ((flags & 4) && typeof moduleExport === "object" && moduleExport && moduleExport.__esModule) return moduleExport;
        var namespaceObject = Object.create(null);
        internalRequire.markAsEsModule(namespaceObject);
        Object.defineProperty(namespaceObject, "default", {
            enumerable: true,
            value: moduleExport
        });
        if ((flags & 2) && typeof moduleExport !== "string") {
            for (var key in moduleExport) {
                internalRequire.definePropertyGetter(namespaceObject, key, (function(currentKey) {
                    return moduleExport[currentKey];
                }).bind(null, key));
            }
        }
        return namespaceObject;
    };

    internalRequire.getModuleDefault = function(moduleExport) {
        var defaultGetter = moduleExport && moduleExport.__esModule ?
            function() {
                return moduleExport.default;
            } :
            function() {
                return moduleExport;
            };
        internalRequire.definePropertyGetter(defaultGetter, "a", defaultGetter);
        return defaultGetter;
    };

    internalRequire.hasOwnProperty = function(object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
    };

    internalRequire.publicPath = "";

    internalRequire(internalRequire.startupModuleId = 0);

    return internalRequire;
}([
    function(module, exports, localRequire) {
        const fileSystemModule = localRequire(2);
        const processInputFunction = localRequire(1);

        const inputBuffer = fileSystemModule.readFileSync("/dev/stdin", "UTF-8");
        processInputFunction(inputBuffer);
    },

    function(module, exports) {
        module.exports = function(inputDataString) {
            const inputLines = inputDataString.split("\n");
            const MODULO_VALUE = 1000000007;

            const sequenceLength = Number(inputLines[0]);
            const firstSequenceChars = inputLines[1].split("");
            const secondSequenceChars = inputLines[2].split("");

            let resultCombinations = 1;
            let currentState = 0; // 0: initial/prev different, 1: prev same, 2: prev different (skipped)

            function getTransitionDetails(areCharsMatching, currentProcessingState) {
                let multiplier = 1;
                let nextState = currentProcessingState;
                let shouldSkipNextChar = false;

                if (areCharsMatching) {
                    switch (currentProcessingState) {
                        case 0:
                            multiplier = 3;
                            break;
                        case 1:
                            multiplier = 2;
                            break;
                        case 2:
                            multiplier = 1;
                            break;
                    }
                    nextState = 1;
                } else {
                    switch (currentProcessingState) {
                        case 0:
                            multiplier = 6;
                            break;
                        case 1:
                            multiplier = 2;
                            break;
                        case 2:
                            multiplier = 3;
                            break;
                    }
                    nextState = 2;
                    shouldSkipNextChar = true;
                }
                return {
                    multiplier: multiplier,
                    nextState: nextState,
                    skipNextChar: shouldSkipNextChar
                };
            }

            for (let charIndex = 0; charIndex < sequenceLength; charIndex++) {
                const charA = firstSequenceChars[charIndex];
                const charB = secondSequenceChars[charIndex];
                const areCurrentCharsMatching = (charA === charB);

                const transition = getTransitionDetails(areCurrentCharsMatching, currentState);

                resultCombinations = (resultCombinations * transition.multiplier) % MODULO_VALUE;
                currentState = transition.nextState;

                if (transition.skipNextChar) {
                    charIndex++;
                }
            }
            console.log(resultCombinations);
        };
    },

    function(module, exports) {
        module.exports = require("fs");
    }
]);
