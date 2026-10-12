(function(moduleDefinitions) {
    var moduleCache = {};

    function localRequire(moduleId) {
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }
        var currentModule = moduleCache[moduleId] = {
            id: moduleId,
            loaded: false,
            exports: {}
        };
        moduleDefinitions[moduleId].call(currentModule.exports, currentModule, currentModule.exports, localRequire);
        currentModule.loaded = true;
        return currentModule.exports;
    }

    localRequire.moduleMap = moduleDefinitions;
    localRequire.cache = moduleCache;

    function defineExportProperty(targetObject, propertyName, getterFunction) {
        if (!localRequire.hasOwn(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true,
                get: getterFunction
            });
        }
    }
    localRequire.define = defineExportProperty;

    localRequire.markAsModule = function(targetExports) {
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(targetExports, Symbol.toStringTag, {
                value: 'Module'
            });
        }
        Object.defineProperty(targetExports, '__esModule', {
            value: true
        });
    };

    localRequire.interopDefault = function(moduleExports, flags) {
        if (1 & flags) moduleExports = localRequire(moduleExports);
        if (8 & flags) return moduleExports;
        if (4 & flags && typeof moduleExports === 'object' && moduleExports && moduleExports.__esModule) return moduleExports;
        var defaultExportObject = Object.create(null);
        localRequire.markAsModule(defaultExportObject);
        Object.defineProperty(defaultExportObject, 'default', {
            enumerable: true,
            value: moduleExports
        });
        if (2 & flags && typeof moduleExports !== 'string') {
            for (var key in moduleExports) {
                localRequire.define(defaultExportObject, key, (function(k) {
                    return moduleExports[k];
                }).bind(null, key));
            }
        }
        return defaultExportObject;
    };

    localRequire.createDefaultExport = function(moduleExports) {
        var getExportFunction = moduleExports && moduleExports.__esModule ?
            function() {
                return moduleExports.default;
            } :
            function() {
                return moduleExports;
            };
        localRequire.define(getExportFunction, "a", getExportFunction);
        return getExportFunction;
    };

    localRequire.hasOwn = function(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    };

    localRequire.publicPath = "";

    localRequire(localRequire.entryModule = 0);

})([
    function(currentModule, moduleExports, moduleLoader) {
        const fileSystemModule = moduleLoader(2);
        const rawFileContent = fileSystemModule.readFileSync("/dev/stdin", "UTF-8");
        const inputLinesArray = rawFileContent.split("\n");
        moduleLoader(1)(inputLinesArray);
    },
    function(currentModule, moduleExports, moduleLoader) {
        "use strict";

        function processInputString(linesData) {
            const primaryString = linesData[0];
            const stringLength = primaryString.length;

            let foundConsecutiveMatch = false;

            if (stringLength > 0) { // Guard clause for empty string or single char string
                for (let charIndex = 0; charIndex < stringLength - 1; charIndex++) {
                    const currentChar = primaryString[charIndex];
                    const nextChar = primaryString[charIndex + 1];

                    if (currentChar === nextChar) {
                        foundConsecutiveMatch = true;
                        break;
                    }
                }
            }

            if (foundConsecutiveMatch) {
                console.log("Bad");
            } else {
                console.log("Good");
            }
        }

        currentModule.exports = processInputString;
    },
    function(currentModule, moduleExports) {
        currentModule.exports = require("fs");
    }
]);
