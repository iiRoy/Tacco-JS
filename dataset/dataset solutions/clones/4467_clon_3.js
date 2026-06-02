module.exports = function(moduleDefinitions) {
    var moduleCache = {};

    function webpackRequire(moduleId) {
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }

        var moduleObject = moduleCache[moduleId] = {
            id: moduleId,
            loaded: false,
            exports: {}
        };

        moduleDefinitions[moduleId].call(moduleObject.exports, moduleObject, moduleObject.exports, webpackRequire);

        moduleObject.loaded = true;
        return moduleObject.exports;
    }

    webpackRequire.modules = moduleDefinitions;
    webpackRequire.cache = moduleCache;

    webpackRequire.defineGetter = function(targetObject, propertyName, getterFunction) {
        if (!webpackRequire.hasOwn(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true,
                get: getterFunction
            });
        }
    };

    webpackRequire.markAsEsModule = function(targetObject) {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(targetObject, Symbol.toStringTag, {
                value: "Module"
            });
        }
        Object.defineProperty(targetObject, "__esModule", {
            value: true
        });
    };

    webpackRequire.interopRequire = function(value, mode) {
        if (mode & 1) value = webpackRequire(value);
        if (mode & 8) return value;
        if ((mode & 4) && typeof value === "object" && value && value.__esModule) return value;

        var namespaceObject = Object.create(null);
        webpackRequire.markAsEsModule(namespaceObject);
        Object.defineProperty(namespaceObject, "default", {
            enumerable: true,
            value: value
        });

        if (mode & 2 && typeof value !== "string") {
            for (var key in value) {
                webpackRequire.defineGetter(namespaceObject, key, (function(currentKey) {
                    return value[currentKey];
                }).bind(null, key));
            }
        }
        return namespaceObject;
    };

    webpackRequire.getModuleDefault = function(module) {
        var defaultGetter = module && module.__esModule ?
            function() { return module.default; } :
            function() { return module; };
        webpackRequire.defineGetter(defaultGetter, "a", defaultGetter);
        return defaultGetter;
    };

    webpackRequire.hasOwn = function(object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
    };

    webpackRequire.publicPath = "";

    return webpackRequire(webpackRequire.s = 0);
}([
    function(module, exports, webpackRequire) {
        const fileSystemModule = webpackRequire(2);
        const fileContent = fileSystemModule.readFileSync("/dev/stdin", "UTF-8");
        const inputLines = fileContent.split("\n");
        const mainAlgorithmModule = webpackRequire(1);
        mainAlgorithmModule(inputLines);
    },
    function(module, exports) {
        function safeDestructure(iterable, expectedLength) {
            if (Array.isArray(iterable)) {
                return iterable;
            }

            var tempArray = [];
            var iteratorDone = false;
            var encounteredError = false;
            var caughtError = undefined;

            try {
                for (var currentIteratorItem, iterator = iterable[Symbol.iterator](); !(iteratorDone = (currentIteratorItem = iterator.next()).done) && (tempArray.push(currentIteratorItem.value), !expectedLength || tempArray.length !== expectedLength); iteratorDone = true);
            } catch (err) {
                encounteredError = true;
                caughtError = err;
            } finally {
                try {
                    if (!iteratorDone && iterator.return != null) {
                        iterator.return();
                    }
                } finally {
                    if (encounteredError) {
                        throw caughtError;
                    }
                }
            }
            return tempArray;
        }

        const parseSpaceSeparatedNumbers = (inputString) => inputString.split(" ").map(Number);

        module.exports = function(inputLines) {
            const parsedNKValues = safeDestructure(parseSpaceSeparatedNumbers(inputLines[0]), 2);
            const arraySizeN = parsedNKValues[0];
            const targetValueK = parsedNKValues[1];

            const inputArrayA = parseSpaceSeparatedNumbers(inputLines[1]);

            inputArrayA.sort((valA, valB) => valA - valB);

            let foundMultipleWithSameRemainder = false;
            let foundElementGreaterThanK = false;
            let targetKIsPresent = false;

            const firstElementOfSortedArray = inputArrayA[0];

            for (let currentIdx = 0; currentIdx < arraySizeN; currentIdx++) {
                const currentArrayElement = inputArrayA[currentIdx];

                if (currentArrayElement === targetValueK) {
                    targetKIsPresent = true;
                    break;
                }

                if (currentIdx > 0 && currentArrayElement % firstElementOfSortedArray === targetValueK % firstElementOfSortedArray) {
                    foundMultipleWithSameRemainder = true;
                }

                if (currentArrayElement > targetValueK) {
                    foundElementGreaterThanK = true;
                }
            }

            if (targetKIsPresent) {
                console.log("POSSIBLE");
            } else if (foundMultipleWithSameRemainder && foundElementGreaterThanK) {
                console.log("POSSIBLE");
            } else {
                console.log("IMPOSSIBLE");
            }
        };
    },
    function(module, exports) {
        module.exports = require("fs");
    }
]);
