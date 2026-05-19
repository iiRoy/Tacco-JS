module.exports = function(moduleDefinitions) {
    var moduleCache = {};
    var hasOwnProperty = Object.prototype.hasOwnProperty;

    function requireModule(moduleId) {
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }
        var moduleObject = moduleCache[moduleId] = {
            id: moduleId,
            loaded: false,
            exports: {}
        };
        moduleDefinitions[moduleId].call(moduleObject.exports, moduleObject, moduleObject.exports, requireModule);
        moduleObject.loaded = true;
        return moduleObject.exports;
    }

    requireModule.m = moduleDefinitions;
    requireModule.c = moduleCache;

    requireModule.d = function(exportsObject, propertyName, getter) {
        if (!hasOwnProperty.call(exportsObject, propertyName)) {
            Object.defineProperty(exportsObject, propertyName, {
                enumerable: true,
                get: getter
            });
        }
    };

    requireModule.r = function(exportsObject) {
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exportsObject, Symbol.toStringTag, {
                value: 'Module'
            });
        }
        Object.defineProperty(exportsObject, '__esModule', {
            value: true
        });
    };

    requireModule.t = function(value, mode) {
        if (mode & 1) value = requireModule(value);
        if (mode & 8) return value;
        if ((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
        
        var namespaceObject = Object.create(null);
        requireModule.r(namespaceObject);
        Object.defineProperty(namespaceObject, 'default', {
            enumerable: true,
            value: value
        });
        if (mode & 2 && typeof value !== 'string') {
            for (var key in value) {
                requireModule.d(namespaceObject, key, (function(currentKey) {
                    return value[currentKey];
                }).bind(null, key));
            }
        }
        return namespaceObject;
    };

    requireModule.n = function(moduleExports) {
        var defaultGetter = moduleExports && moduleExports.__esModule ?
            function() {
                return moduleExports.default;
            } :
            function() {
                return moduleExports;
            };
        requireModule.d(defaultGetter, 'a', defaultGetter);
        return defaultGetter;
    };

    requireModule.o = hasOwnProperty;

    requireModule.p = "";

    return requireModule(requireModule.s = 0);
}([
    function(module, exports, localRequire) {
        var fileSystemModule = localRequire(2);
        var inputProcessor = localRequire(1);
        var fileContent = fileSystemModule.readFileSync("/dev/stdin", "UTF-8");
        inputProcessor(fileContent);
    },
    function(module, exports) {
        function calculateMinSplitPoint(inputString) {
            var firstLine = inputString.split("\n")[0];
            var lineLength = firstLine.length;
            
            if (lineLength <= 1) {
                return lineLength;
            }

            var minSplitPoint = lineLength;
            var previousCharacter = firstLine[0];

            for (var currentPosition = 1; currentPosition < lineLength; currentPosition++) {
                var currentChar = firstLine[currentPosition];
                if (previousCharacter !== currentChar) {
                    var remainingLength = lineLength - currentPosition;
                    var candidateSplitPoint = Math.max(currentPosition, remainingLength);
                    
                    if (candidateSplitPoint < minSplitPoint) {
                        minSplitPoint = candidateSplitPoint;
                    }
                    previousCharacter = currentChar;
                }
            }
            return minSplitPoint;
        }

        module.exports = function(inputString) {
            var result = calculateMinSplitPoint(inputString);
            console.log(result);
        };
    },
    function(module, exports) {
        module.exports = require("fs");
    }
]);
