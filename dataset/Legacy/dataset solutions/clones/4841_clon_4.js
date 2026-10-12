module.exports = function(moduleDefinitions) {
    const moduleCache = new Map();

    function retrieveModule(moduleId) {
        if (moduleCache.has(moduleId)) {
            return moduleCache.get(moduleId).output;
        }

        const currentModule = {
            identifier: moduleId,
            isLoaded: false,
            output: {}
        };
        moduleCache.set(moduleId, currentModule);

        Reflect.apply(moduleDefinitions[moduleId], currentModule.output, [currentModule, currentModule.output, retrieveModule]);

        currentModule.isLoaded = true;
        return currentModule.output;
    }

    retrieveModule.defineExport = function(targetObject, propertyName, getterFunction) {
        if (!Object.prototype.hasOwnProperty.call(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true,
                get: getterFunction
            });
        }
    };

    retrieveModule.markESModule = function(targetObject) {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(targetObject, Symbol.toStringTag, {
                value: "Module"
            });
        }
        Object.defineProperty(targetObject, "__esModule", {
            value: true
        });
    };

    retrieveModule.interop = function(moduleReference, flags) {
        let processedModule = (flags & 1) ? retrieveModule(moduleReference) : moduleReference;
        if (flags & 8) return processedModule;
        if ((flags & 4) && typeof processedModule === "object" && processedModule && processedModule.__esModule) return processedModule;

        let namespaceObject = Object.create(null);
        retrieveModule.markESModule(namespaceObject);
        Object.defineProperty(namespaceObject, "default", {
            enumerable: true,
            value: processedModule
        });

        if ((flags & 2) && typeof processedModule !== "string") {
            for (let keyName in processedModule) {
                retrieveModule.defineExport(namespaceObject, keyName, ((k) => processedModule[k]).bind(null, keyName));
            }
        }
        return namespaceObject;
    };

    retrieveModule.getDefault = function(moduleReference) {
        const getter = moduleReference && moduleReference.__esModule ? () => moduleReference.default : () => moduleReference;
        retrieveModule.defineExport(getter, "a", getter);
        return getter;
    };

    retrieveModule.hasOwn = function(targetObject, propertyName) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
    };

    retrieveModule.publicPath = "";

    return retrieveModule(0);
}([
    function(moduleInstance, moduleExports, moduleLoader) {
        const processInput = moduleLoader(1);
        const fileSystemAccess = moduleLoader(2);
        processInput(fileSystemAccess.readFileSync("/dev/stdin", "UTF-8").split("\n"));
    },
    function(moduleInstance, moduleExports, moduleLoader) {
        moduleExports = function(inputLines) {
            const [elementCountString, limitValueString] = inputLines[0].split(" ");
            const elementCount = Number(elementCountString);
            const limitValue = Number(limitValueString);

            const valueSequence = inputLines[1].split(" ").map(Number);

            let totalDamageReduction = 0;

            const processElementsRecursively = (currentIndex) => {
                if (currentIndex >= elementCount) {
                    return;
                }

                let currentElement = valueSequence[currentIndex];

                if (currentElement > limitValue) {
                    const excessAmount = currentElement - limitValue;
                    totalDamageReduction += excessAmount;
                    valueSequence[currentIndex] = limitValue;
                    currentElement = limitValue;
                }

                if (currentIndex < elementCount - 1) {
                    const nextElement = valueSequence[currentIndex + 1];
                    if (currentElement + nextElement > limitValue) {
                        const combinedExcessAmount = currentElement + nextElement - limitValue;
                        totalDamageReduction += combinedExcessAmount;
                        valueSequence[currentIndex + 1] -= combinedExcessAmount;
                    }
                }

                processElementsRecursively(currentIndex + 1);
            };

            processElementsRecursively(0);

            console.log(totalDamageReduction);
        };
        moduleInstance.output = moduleExports;
    },
    function(moduleInstance, moduleExports, moduleLoader) {
        moduleExports = require("fs");
        moduleInstance.output = moduleExports;
    }
]);
