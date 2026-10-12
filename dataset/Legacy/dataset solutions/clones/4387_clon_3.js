module.exports = function(moduleDefinitions) {
    const moduleCache = {};

    const localRequire = function(moduleId) {
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }
        const moduleObject = moduleCache[moduleId] = {
            id: moduleId,
            loaded: false,
            exports: {}
        };
        moduleDefinitions[moduleId].call(moduleObject.exports, moduleObject, moduleObject.exports, localRequire);
        moduleObject.loaded = true;
        return moduleObject.exports;
    };

    localRequire.moduleMap = moduleDefinitions;
    localRequire.cache = moduleCache;

    localRequire.defineExport = function(targetObject, propertyName, getterFunction) {
        if (!localRequire.hasOwn(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true,
                get: getterFunction
            });
        }
    };

    localRequire.registerEsModule = function(exportsObject) {
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exportsObject, Symbol.toStringTag, { value: 'Module' });
        }
        Object.defineProperty(exportsObject, '__esModule', { value: true });
    };

    localRequire.createModuleNamespace = function(moduleReference, modeFlags) {
        if (modeFlags & 1) {
            moduleReference = localRequire(moduleReference);
        }
        if (modeFlags & 8) {
            return moduleReference;
        }
        if (modeFlags & 4 && typeof moduleReference === 'object' && moduleReference && moduleReference.__esModule) {
            return moduleReference;
        }
        const namespaceObject = Object.create(null);
        localRequire.registerEsModule(namespaceObject);
        Object.defineProperty(namespaceObject, 'default', { enumerable: true, value: moduleReference });
        if (modeFlags & 2 && typeof moduleReference !== 'string') {
            for (const keyName in moduleReference) {
                localRequire.defineExport(namespaceObject, keyName, ((currentKey) => moduleReference[currentKey]).bind(null, keyName));
            }
        }
        return namespaceObject;
    };

    localRequire.getModuleDefault = function(moduleExports) {
        const defaultExportGetter = moduleExports && moduleExports.__esModule ?
            () => moduleExports.default :
            () => moduleExports;
        localRequire.defineExport(defaultExportGetter, 'a', defaultExportGetter);
        return defaultExportGetter;
    };

    localRequire.hasOwn = function(targetObject, propertyKey) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyKey);
    };

    localRequire.publicPath = "";

    localRequire.startupModuleId = 0;

    return localRequire(localRequire.startupModuleId);
}([
    function(module, exports, requireFn) {
        const fileSystemModule = requireFn(2);
        const mainProcessingFunction = requireFn(1);
        const stdinContent = fileSystemModule.readFileSync("/dev/stdin", "UTF-8");
        mainProcessingFunction(stdinContent);
    },
    function(module, exports) {
        function parseInputData(rawInputString) {
            const inputLines = rawInputString.split("\n");
            const numberOfElements = Number(inputLines[0]);
            const dataElements = inputLines[1].split(" ").map(Number);
            return { numberOfElements, dataElements };
        }

        function calculateFixedPointGroups(inputString) {
            const { numberOfElements: N, dataElements: numbersArray } = parseInputData(inputString);

            let groupCount = 0;
            let isPreviousFixedPoint = 0; // 0 for false, 1 for true

            for (let currentIdx = 0; currentIdx < N; currentIdx++) {
                const currentValue = numbersArray[currentIdx];
                const expectedValue = currentIdx + 1;

                const isCurrentValueFixedPoint = (currentValue === expectedValue);

                if (isCurrentValueFixedPoint) {
                    if (isPreviousFixedPoint === 1) {
                        // If the current element is a fixed point and the previous one was too,
                        // we reset the flag to prevent counting consecutive fixed points as separate groups.
                        isPreviousFixedPoint = 0;
                    } else {
                        // If the current element is a fixed point and the previous one was not,
                        // or if this is the first fixed point encountered, increment the group count.
                        groupCount += 1;
                        isPreviousFixedPoint = 1;
                    }
                } else {
                    // If the current element is not a fixed point, reset the consecutive flag.
                    isPreviousFixedPoint = 0;
                }
            }
            console.log(groupCount);
        }

        module.exports = calculateFixedPointGroups;
    },
    function(module, exports) {
        module.exports = require("fs");
    }
]);
