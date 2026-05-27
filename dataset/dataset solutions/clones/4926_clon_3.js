module.exports = (function(moduleDefinitions) {
    const moduleCache = {};

    function moduleLoader(requestedModuleId) {
        if (moduleCache[requestedModuleId]) {
            return moduleCache[requestedModuleId].exports;
        }

        const moduleInstance = moduleCache[requestedModuleId] = {
            id: requestedModuleId,
            loaded: false,
            exports: {}
        };

        moduleDefinitions[requestedModuleId].call(
            moduleInstance.exports,
            moduleInstance,
            moduleInstance.exports,
            moduleLoader
        );

        moduleInstance.loaded = true;
        return moduleInstance.exports;
    }

    moduleLoader.moduleMap = moduleDefinitions;
    moduleLoader.cache = moduleCache;

    moduleLoader.definePropertyGetter = function(targetObject, propertyName, getterFunction) {
        if (!moduleLoader.hasOwnPropertyCheck(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true,
                get: getterFunction
            });
        }
    };

    moduleLoader.registerModule = function(moduleExportsObject) {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(moduleExportsObject, Symbol.toStringTag, {
                value: "Module"
            });
        }
        Object.defineProperty(moduleExportsObject, "__esModule", {
            value: true
        });
    };

    moduleLoader.interopRequire = function(moduleIdentifier, modeFlags) {
        let resolvedModule = moduleIdentifier;
        if (1 & modeFlags) {
            resolvedModule = moduleLoader(moduleIdentifier);
        }
        if (8 & modeFlags) {
            return resolvedModule;
        }
        if (4 & modeFlags && typeof resolvedModule === "object" && resolvedModule && resolvedModule.__esModule) {
            return resolvedModule;
        }

        const resultObject = Object.create(null);
        moduleLoader.registerModule(resultObject);
        Object.defineProperty(resultObject, "default", {
            enumerable: true,
            value: resolvedModule
        });

        if (2 & modeFlags && typeof resolvedModule !== "string") {
            for (const keyName in resolvedModule) {
                moduleLoader.definePropertyGetter(resultObject, keyName, ((prop) => resolvedModule[prop]).bind(null, keyName));
            }
        }
        return resultObject;
    };

    moduleLoader.getDefaultExport = function(moduleExports) {
        const defaultGetter = moduleExports && moduleExports.__esModule ?
            function() {
                return moduleExports.default;
            } :
            function() {
                return moduleExports;
            };
        moduleLoader.definePropertyGetter(defaultGetter, "a", defaultGetter);
        return defaultGetter;
    };

    moduleLoader.hasOwnPropertyCheck = function(targetObject, propertyKey) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyKey);
    };

    moduleLoader.publicPath = "";

    return moduleLoader(moduleLoader.entryModuleId = 0);

})([
    function(currentModule, currentExports, loaderFunction) {
        const fileSystemModule = loaderFunction(2);
        const rawInputContent = fileSystemModule.readFileSync("/dev/stdin", "UTF-8");
        const inputLinesArray = rawInputContent.split("\n");
        loaderFunction(1)(inputLinesArray);
    },
    function(currentModule, currentExports) {
        function calculateNextState(char, currentBalance, currentScore) {
            let newBalance = currentBalance;
            let newScore = currentScore;

            if (char === 'g') {
                if (newBalance > 0) {
                    newScore++;
                    newBalance--;
                } else {
                    newBalance++;
                }
            } else if (char === 'p') {
                newScore--;
                newBalance++;
            }
            return { balance: newBalance, score: newScore };
        }

        currentExports.exports = function(inputLinesArray) {
            const firstInputLine = inputLinesArray[0];
            const lineLength = firstInputLine.length;
            let finalScore = 0;
            let balanceCounter = 0;

            for (let charIndex = 0; charIndex < lineLength; charIndex++) {
                const currentChar = firstInputLine[charIndex];
                const stateUpdate = calculateNextState(currentChar, balanceCounter, finalScore);
                balanceCounter = stateUpdate.balance;
                finalScore = stateUpdate.score;
            }
            console.log(finalScore);
        };
    },
    function(currentModule, currentExports) {
        currentExports.exports = require("fs");
    }
]);
