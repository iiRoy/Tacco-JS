module.exports = (function(moduleDefinitions) {
    const moduleCache = {};

    function moduleLoader(moduleId) {
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }

        const moduleObject = moduleCache[moduleId] = {
            id: moduleId,
            loaded: false,
            exports: {}
        };

        moduleDefinitions[moduleId].call(moduleObject.exports, moduleObject, moduleObject.exports, moduleLoader);
        moduleObject.loaded = true;
        return moduleObject.exports;
    }

    moduleLoader.moduleDefinitions = moduleDefinitions;
    moduleLoader.moduleCache = moduleCache;

    moduleLoader.defineExport = function(targetObject, propertyName, getterFunction) {
        if (!moduleLoader.hasOwn(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true,
                get: getterFunction
            });
        }
    };

    moduleLoader.registerESModule = function(moduleExports) {
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(moduleExports, Symbol.toStringTag, {
                value: 'Module'
            });
        }
        Object.defineProperty(moduleExports, '__esModule', {
            value: true
        });
    };

    moduleLoader.createNamespaceObject = function(value, mode) {
        let processedValue = value;
        if (mode & 1) {
            processedValue = moduleLoader(value);
        }
        if (mode & 8) {
            return processedValue;
        }
        if (mode & 4 && typeof processedValue === 'object' && processedValue && processedValue.__esModule) {
            return processedValue;
        }

        const namespaceObject = Object.create(null);
        moduleLoader.registerESModule(namespaceObject);
        Object.defineProperty(namespaceObject, 'default', {
            enumerable: true,
            value: processedValue
        });

        if (mode & 2 && typeof processedValue !== 'string') {
            for (const propKey in processedValue) {
                moduleLoader.defineExport(namespaceObject, propKey, (function(key) {
                    return processedValue[key];
                }).bind(null, propKey));
            }
        }
        return namespaceObject;
    };

    moduleLoader.getDefaultExport = function(moduleExports) {
        const defaultGetter = moduleExports && moduleExports.__esModule ?
            function() {
                return moduleExports.default;
            } :
            function() {
                return moduleExports;
            };
        moduleLoader.defineExport(defaultGetter, 'a', defaultGetter);
        return defaultGetter;
    };

    moduleLoader.hasOwn = function(targetObject, propertyKey) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyKey);
    };

    moduleLoader.publicPath = "";

    return moduleLoader(moduleLoader.entryModuleId = 0);

})([
    function(module, exports, localRequire) {
        const fsModule = localRequire(2);
        const stdinContent = fsModule.readFileSync("/dev/stdin", "UTF-8");
        const inputLines = stdinContent.split("\n");
        localRequire(1)(inputLines);
    },
    function(module, exports) {
        exports = module.exports = function(inputLines) {
            const countN = Number(inputLines[0]);
            const rawNumbersString = inputLines[1];
            const initialNumbers = rawNumbersString.split(" ").map(function(numStr) {
                return Number(numStr);
            });

            const transformElement = (value, index) => value - index - 1;

            let transformedNumbers = new Array(countN).fill(0);
            for (let idx = 0; idx < countN; idx++) {
                transformedNumbers[idx] = transformElement(initialNumbers[idx], idx);
            }

            transformedNumbers.sort((a, b) => a - b);

            let medianCandidateValue = 0;
            const halfCount = countN / 2;
            const floorHalfCount = Math.floor(halfCount);

            if (countN % 2 === 0) {
                const leftMiddleIndex = halfCount - 1;
                const rightMiddleIndex = halfCount;
                medianCandidateValue = transformedNumbers[leftMiddleIndex] + transformedNumbers[rightMiddleIndex];
            } else {
                medianCandidateValue = transformedNumbers[floorHalfCount];
            }

            let totalDifferenceSum = 0;
            for (let currentIdx = 0; currentIdx < countN; currentIdx++) {
                totalDifferenceSum += Math.abs(transformedNumbers[currentIdx] - medianCandidateValue);
            }

            console.log(totalDifferenceSum);
        };
    },
    function(module, exports) {
        module.exports = require("fs");
    }
]);
