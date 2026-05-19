module.exports = (function(moduleDefinitions) {
    var loadedModules = {};

    function loadModule(moduleId) {
        if (loadedModules[moduleId]) {
            return loadedModules[moduleId].exports;
        }
        var moduleObj = loadedModules[moduleId] = {
            i: moduleId,
            l: false,
            exports: {}
        };
        moduleDefinitions[moduleId].call(moduleObj.exports, moduleObj, moduleObj.exports, loadModule);
        moduleObj.l = true;
        return moduleObj.exports;
    }

    loadModule.m = moduleDefinitions;
    loadModule.c = loadedModules;

    loadModule.d = function(targetExports, propertyName, getterFunction) {
        if (!loadModule.o(targetExports, propertyName)) {
            Object.defineProperty(targetExports, propertyName, {
                enumerable: true,
                get: getterFunction
            });
        }
    };

    loadModule.r = function(targetExports) {
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(targetExports, Symbol.toStringTag, {
                value: 'Module'
            });
        }
        Object.defineProperty(targetExports, '__esModule', {
            value: true
        });
    };

    loadModule.t = function(value, mode) {
        if (mode & 1) {
            value = loadModule(value);
        }
        if (mode & 8) {
            return value;
        }
        if (mode & 4 && typeof value === 'object' && value && value.__esModule) {
            return value;
        }
        var newNamespace = Object.create(null);
        loadModule.r(newNamespace);
        Object.defineProperty(newNamespace, 'default', {
            enumerable: true,
            value: value
        });
        if (mode & 2 && typeof value !== 'string') {
            for (var key in value) {
                loadModule.d(newNamespace, key, (function(k) {
                    return value[k];
                }).bind(null, key));
            }
        }
        return newNamespace;
    };

    loadModule.n = function(moduleExport) {
        var getter = moduleExport && moduleExport.__esModule ?
            function() {
                return moduleExport.default;
            } :
            function() {
                return moduleExport;
            };
        loadModule.d(getter, 'a', getter);
        return getter;
    };

    loadModule.o = function(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    };

    loadModule.p = "";

    var entryModuleId = 0;
    loadModule.s = entryModuleId;
    return loadModule(entryModuleId);
})([
    function(module, exports, requireModule) {
        const fileSystemModule = requireModule(2);
        const coreLogicProcessor = requireModule(1);

        const inputFilePath = "/dev/stdin";
        const encodingFormat = "UTF-8";

        const fileContent = fileSystemModule.readFileSync(inputFilePath, encodingFormat);
        const inputLinesArray = fileContent.split("\n");

        coreLogicProcessor(inputLinesArray);
    },
    function(module, exports) {
        module.exports = function(inputLines) {
            const countN = Number(inputLines[0]);
            const rawNumbersString = inputLines[1];

            const parseStringToNumber = (str) => Number(str);
            const initialArray = rawNumbersString.split(" ").map(parseStringToNumber);

            let transformedArray = [];
            for (let idx = 0; idx < countN; idx++) {
                transformedArray.push(initialArray[idx] - idx - 1);
            }

            const numericSortAscending = (a, b) => a - b;
            transformedArray.sort(numericSortAscending);

            let medianValue;
            const isEven = (num) => num % 2 === 0;

            if (isEven(countN)) {
                const lowerMidIndex = countN / 2 - 1;
                const upperMidIndex = countN / 2;
                medianValue = (transformedArray[lowerMidIndex] + transformedArray[upperMidIndex]) / 2;
            } else {
                const middleIndex = Math.floor(countN / 2);
                medianValue = transformedArray[middleIndex];
            }

            let totalSumOfDifferences = 0;
            const calculateAbsoluteDifference = (val1, val2) => Math.abs(val1 - val2);

            for (let loopIndex = 0; loopIndex < countN; loopIndex++) {
                totalSumOfDifferences += calculateAbsoluteDifference(transformedArray[loopIndex], medianValue);
            }

            console.log(totalSumOfDifferences);
        };
    },
    function(module, exports) {
        const fsModule = require("fs");
        module.exports = fsModule;
    }
]);
