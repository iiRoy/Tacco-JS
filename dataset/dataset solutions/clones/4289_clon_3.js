module.exports = function(moduleDefinitions) {
    var moduleCache = {};

    function moduleLoader(moduleId) {
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }
        var moduleObj = moduleCache[moduleId] = {
            id: moduleId,
            loaded: false,
            exports: {}
        };
        moduleDefinitions[moduleId].call(moduleObj.exports, moduleObj, moduleObj.exports, moduleLoader);
        moduleObj.loaded = true;
        return moduleObj.exports;
    }

    moduleLoader.moduleDefinitions = moduleDefinitions;
    moduleLoader.cache = moduleCache;

    moduleLoader.defineExport = function(exportsObj, propName, getterFn) {
        if (!moduleLoader.hasOwn(exportsObj, propName)) {
            Object.defineProperty(exportsObj, propName, {
                enumerable: true,
                get: getterFn
            });
        }
    };

    moduleLoader.registerModule = function(moduleExports) {
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(moduleExports, Symbol.toStringTag, {
                value: "Module"
            });
        }
        Object.defineProperty(moduleExports, "__esModule", {
            value: true
        });
    };

    moduleLoader.interopRequireDefault = function(moduleValue, mode) {
        if (mode & 1) {
            moduleValue = moduleLoader(moduleValue);
        }
        if (mode & 8) {
            return moduleValue;
        }
        if (mode & 4 && typeof moduleValue === 'object' && moduleValue && moduleValue.__esModule) {
            return moduleValue;
        }
        var defaultExportObj = Object.create(null);
        moduleLoader.registerModule(defaultExportObj);
        Object.defineProperty(defaultExportObj, "default", {
            enumerable: true,
            value: moduleValue
        });
        if (mode & 2 && typeof moduleValue !== 'string') {
            for (var propKey in moduleValue) {
                moduleLoader.defineExport(defaultExportObj, propKey, (function(key) {
                    return moduleValue[key];
                }).bind(null, propKey));
            }
        }
        return defaultExportObj;
    };

    moduleLoader.getModuleExports = function(moduleRef) {
        var moduleDefault = moduleRef && moduleRef.__esModule ?
            function() {
                return moduleRef.default;
            } :
            function() {
                return moduleRef;
            };
        moduleLoader.defineExport(moduleDefault, "a", moduleDefault);
        return moduleDefault;
    };

    moduleLoader.hasOwn = function(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    };

    moduleLoader.publicPath = "";

    return moduleLoader(moduleLoader.entryModuleId = 0);
}([
    function(moduleObj0, exportsObj0, requireFn0) {
        const fileSystemModule = requireFn0(2);
        const inputData = fileSystemModule.readFileSync("/dev/stdin", "UTF-8");
        const linesArray = inputData.split("\n");
        requireFn0(1)(linesArray);
    },
    function(moduleObj1, exportsObj1) {
        moduleObj1.exports = function(inputLines) {
            const targetString = inputLines[0];
            const wildcardChar = 'x';
            let xReplacementCount = 0;
            let leftPtr = 0;
            let rightPtr = targetString.length - 1;

            const evaluateCharacters = (charLeft, charRight, currentLeft, currentRight) => {
                if (charLeft === charRight) {
                    return {
                        newLeft: currentLeft + 1,
                        newRight: currentRight - 1,
                        countIncrement: 0,
                        isMatch: true
                    };
                } else if (charLeft === wildcardChar) {
                    return {
                        newLeft: currentLeft + 1,
                        newRight: currentRight,
                        countIncrement: 1,
                        isMatch: true
                    };
                } else if (charRight === wildcardChar) {
                    return {
                        newLeft: currentLeft,
                        newRight: currentRight - 1,
                        countIncrement: 1,
                        isMatch: true
                    };
                }
                return {
                    isMatch: false
                };
            };

            while (leftPtr < rightPtr) {
                const charAtLeft = targetString[leftPtr];
                const charAtRight = targetString[rightPtr];

                const evaluationResult = evaluateCharacters(charAtLeft, charAtRight, leftPtr, rightPtr);

                if (evaluationResult.isMatch) {
                    leftPtr = evaluationResult.newLeft;
                    rightPtr = evaluationResult.newRight;
                    xReplacementCount += evaluationResult.countIncrement;
                } else {
                    console.log(-1);
                    return;
                }
            }
            console.log(xReplacementCount);
        };
    },
    function(moduleObj2, exportsObj2) {
        moduleObj2.exports = require("fs");
    }
]);
