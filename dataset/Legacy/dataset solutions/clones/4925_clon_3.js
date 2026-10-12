module.exports = (function(moduleDefinitions) {
    const moduleCache = {};

    function localRequire(moduleId) {
        const cachedModuleEntry = moduleCache[moduleId];
        if (cachedModuleEntry && cachedModuleEntry.isLoaded) {
            return cachedModuleEntry.exports;
        }

        const currentModuleObject = {
            identifier: moduleId,
            isLoaded: false,
            exports: {}
        };
        moduleCache[moduleId] = currentModuleObject;

        const moduleFunctionToExecute = moduleDefinitions[moduleId];
        moduleFunctionToExecute.call(currentModuleObject.exports, currentModuleObject, currentModuleObject.exports, localRequire);

        currentModuleObject.isLoaded = true;
        return currentModuleObject.exports;
    }

    localRequire.allModules = moduleDefinitions;
    localRequire.moduleCache = moduleCache;

    localRequire.defineExportProperty = function(targetObject, propertyName, getterFunction) {
        const propertyExists = Object.prototype.hasOwnProperty.call(targetObject, propertyName);
        if (!propertyExists) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true,
                get: getterFunction
            });
        }
    };

    localRequire.registerESModule = function(targetObject) {
        const hasSymbolTag = typeof Symbol !== 'undefined' && Symbol.toStringTag;
        if (hasSymbolTag) {
            Object.defineProperty(targetObject, Symbol.toStringTag, {
                value: 'Module'
            });
        }
        Object.defineProperty(targetObject, '__esModule', {
            value: true
        });
    };

    localRequire.interopDefault = function(sourceModule, bitmask) {
        let processedModuleValue = sourceModule;

        if (bitmask & 1) {
            processedModuleValue = localRequire(sourceModule);
        }
        if (bitmask & 8) {
            return processedModuleValue;
        }
        const isESModuleObject = (bitmask & 4) && typeof processedModuleValue === 'object' && processedModuleValue && processedModuleValue.__esModule;
        if (isESModuleObject) {
            return processedModuleValue;
        }

        const defaultExportContainer = Object.create(null);
        localRequire.registerESModule(defaultExportContainer);
        Object.defineProperty(defaultExportContainer, 'default', {
            enumerable: true,
            value: processedModuleValue
        });

        const isNotString = typeof processedModuleValue !== 'string';
        if ((bitmask & 2) && isNotString) {
            for (const keyName in processedModuleValue) {
                const currentKey = keyName;
                const propertyGetter = ((k) => processedModuleValue[k]).bind(null, currentKey);
                localRequire.defineExportProperty(defaultExportContainer, currentKey, propertyGetter);
            }
        }
        return defaultExportContainer;
    };

    localRequire.createDefaultGetter = function(sourceModule) {
        const isESModule = sourceModule && sourceModule.__esModule;
        const moduleDefaultValueGetter = isESModule ? () => sourceModule.default : () => sourceModule;
        localRequire.defineExportProperty(moduleDefaultValueGetter, 'a', moduleDefaultValueGetter);
        return moduleDefaultValueGetter;
    };

    localRequire.hasOwn = function(targetObject, propertyName) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
    };

    localRequire.publicPath = "";

    return localRequire(localRequire.s = 0);
})(
    [
        function(moduleObj, moduleExports, moduleRequire) {
            const fileSystemModule = moduleRequire(2);
            const rawInputContent = fileSystemModule.readFileSync("/dev/stdin", "UTF-8");
            const inputLinesArray = rawInputContent.split("\n");
            const gameLogicProcessor = moduleRequire(1);
            gameLogicProcessor(inputLinesArray);
        },
        function(moduleObj, moduleExports) {
            moduleExports.executeGameRound = function(inputLines) {
                const gameString = inputLines[0];
                const stringLength = gameString.length;
                let currentScore = 0;
                let currentBalance = 0;

                for (let charIndex = 0; charIndex < stringLength; charIndex++) {
                    const currentChar = gameString[charIndex];

                    if (currentBalance > 0) {
                        if (currentChar === 'g') {
                            currentScore++;
                        }
                        currentBalance--;
                    } else {
                        if (currentChar === 'p') {
                            currentScore--;
                        }
                        currentBalance++;
                    }
                }
                console.log(currentScore);
            };
            moduleObj.exports = moduleExports.executeGameRound;
        },
        function(moduleObj, moduleExports, moduleRequire) {
            moduleObj.exports = moduleRequire("fs");
        }
    ]
);
