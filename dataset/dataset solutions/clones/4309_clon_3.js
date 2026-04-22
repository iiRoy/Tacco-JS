module.exports = (function (moduleSources) {
    const moduleCacheRegistry = {};

    function obtainModuleExports(moduleIdentifier) {
        if (moduleCacheRegistry[moduleIdentifier]) {
            return moduleCacheRegistry[moduleIdentifier].exports;
        }

        const currentModuleObject = moduleCacheRegistry[moduleIdentifier] = {
            id: moduleIdentifier,
            isLoaded: false,
            exports: {}
        };

        moduleSources[moduleIdentifier].call(
            currentModuleObject.exports,
            currentModuleObject,
            currentModuleObject.exports,
            obtainModuleExports
        );

        currentModuleObject.isLoaded = true;
        return currentModuleObject.exports;
    }

    obtainModuleExports.moduleDefinitions = moduleSources;
    obtainModuleExports.cache = moduleCacheRegistry;

    obtainModuleExports.configureExportGetter = function (targetObject, propertyName, getterFunction) {
        if (!obtainModuleExports.checkOwnProperty(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true,
                get: getterFunction
            });
        }
    };

    obtainModuleExports.setupESModule = function (moduleExportsObject) {
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(moduleExportsObject, Symbol.toStringTag, { value: 'Module' });
        }
        Object.defineProperty(moduleExportsObject, '__esModule', { value: true });
    };

    obtainModuleExports.interopDefault = function (moduleValue, flags) {
        if (flags & 1) {
            moduleValue = obtainModuleExports(moduleValue);
        }

        if (flags & 8) {
            return moduleValue;
        }

        if (flags & 4 && typeof moduleValue === 'object' && moduleValue && moduleValue.__esModule) {
            return moduleValue;
        }

        const interopObject = Object.create(null);
        obtainModuleExports.setupESModule(interopObject);

        Object.defineProperty(interopObject, 'default', {
            enumerable: true,
            value: moduleValue
        });

        if (flags & 2 && typeof moduleValue !== 'string') {
            for (const propName in moduleValue) {
                if (Object.prototype.hasOwnProperty.call(moduleValue, propName)) {
                    obtainModuleExports.configureExportGetter(interopObject, propName, (function (key) {
                        return moduleValue[key];
                    }).bind(null, propName));
                }
            }
        }
        return interopObject;
    };

    obtainModuleExports.getModuleNamespace = function (moduleExports) {
        const actualExportValue = moduleExports && moduleExports.__esModule
            ? function () { return moduleExports.default; }
            : function () { return moduleExports; };

        obtainModuleExports.configureExportGetter(actualExportValue, 'a', actualExportValue);
        return actualExportValue;
    };

    obtainModuleExports.checkOwnProperty = function (targetObject, propertyName) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
    };

    obtainModuleExports.assetPublicPath = "";

    return obtainModuleExports(0);

})([
    function (moduleObject, moduleOutputs, localModuleResolver) {
        let fileSystemUtility;
        try {
            fileSystemUtility = localModuleResolver(2);
        } catch (err) {
            console.error("ERROR: Failed to load file system utility. Cannot proceed.", err);
            return;
        }

        let inputContent;
        const standardInputPath = "/dev/stdin";
        try {
            inputContent = fileSystemUtility.readFileSync(standardInputPath, "UTF-8");
        } catch (readError) {
            console.error(`ERROR: Could not read from ${standardInputPath}. Ensure input is provided.`, readError);
            return;
        }

        const processInputFunction = localModuleResolver(1);

        if (typeof processInputFunction === 'function') {
            processInputFunction(inputContent);
        } else {
            console.error("ERROR: Module 1 did not export a valid processing function.");
        }
    },

    function (moduleReference, moduleOutput) {
        moduleReference.exports = function (inputDataString) {
            const dataLines = inputDataString.split("\n");

            if (dataLines.length < 4) {
                console.error("Input error: Expected at least 4 lines of data.");
                console.log("NO");
                return;
            }

            const inventoryCounts = new Map();
            const availableItemsLine = dataLines[1].trim();

            if (availableItemsLine.length > 0) {
                availableItemsLine.split(" ").forEach(itemStr => {
                    const itemNumericValue = Number(itemStr);
                    if (!isNaN(itemNumericValue)) {
                        inventoryCounts.set(itemNumericValue, (inventoryCounts.get(itemNumericValue) || 0) + 1);
                    } else {
                        console.warn(`Warning: Non-numeric item found in available items: '${itemStr}'. Skipping.`);
                    }
                });
            } else {
                 console.warn("Warning: Line 1 (available items) is empty.");
            }

            const shoppingListCounts = new Map();
            const requiredItemsLine = dataLines[3].trim();

            if (requiredItemsLine.length > 0) {
                requiredItemsLine.split(" ").forEach(itemStr => {
                    const itemNumericValue = Number(itemStr);
                    if (!isNaN(itemNumericValue)) {
                        shoppingListCounts.set(itemNumericValue, (shoppingListCounts.get(itemNumericValue) || 0) + 1);
                    } else {
                        console.warn(`Warning: Non-numeric item found in required items: '${itemStr}'. Skipping.`);
                    }
                });
            } else {
                console.warn("Warning: Line 3 (required items) is empty.");
            }


            let allRequirementsMet = true;

            for (const [requiredItemKey, requiredAmount] of shoppingListCounts.entries()) {
                const availableAmount = inventoryCounts.get(requiredItemKey) || 0;

                if (availableAmount < requiredAmount) {
                    allRequirementsMet = false;
                    break;
                }
            }

            if (allRequirementsMet) {
                console.log("YES");
            } else {
                console.log("NO");
            }
        };
    },

    function (modObject, modExports) {
        modObject.exports = require('node:fs');
    }
]);