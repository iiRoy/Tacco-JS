module.exports = (function(moduleDefinitions) {
    var moduleCache = {};

    function moduleLoader(targetModuleId) {
        if (moduleCache[targetModuleId]) {
            return moduleCache[targetModuleId].exports;
        }
        var moduleInstance = moduleCache[targetModuleId] = {
            id: targetModuleId,
            loaded: false,
            exports: {}
        };
        moduleDefinitions[targetModuleId].call(moduleInstance.exports, moduleInstance, moduleInstance.exports, moduleLoader);
        moduleInstance.loaded = true;
        return moduleInstance.exports;
    }

    moduleLoader.modules = moduleDefinitions;
    moduleLoader.cache = moduleCache;

    moduleLoader.defineGetter = function(exportObject, propertyName, getterFunction) {
        if (!moduleLoader.hasOwnPropertyCheck(exportObject, propertyName)) {
            Object.defineProperty(exportObject, propertyName, {
                enumerable: true,
                get: getterFunction
            });
        }
    };

    moduleLoader.defineESM = function(exportObject) {
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exportObject, Symbol.toStringTag, {
                value: 'Module'
            });
        }
        Object.defineProperty(exportObject, '__esModule', {
            value: true
        });
    };

    moduleLoader.createNamespaceObject = function(moduleReference, typeFlags) {
        if (typeFlags & 1) {
            moduleReference = moduleLoader(moduleReference);
        }
        if (typeFlags & 8) {
            return moduleReference;
        }
        if (typeFlags & 4 && typeof moduleReference === 'object' && moduleReference && moduleReference.__esModule) {
            return moduleReference;
        }
        var namespaceObject = Object.create(null);
        moduleLoader.defineESM(namespaceObject);
        Object.defineProperty(namespaceObject, 'default', {
            enumerable: true,
            value: moduleReference
        });
        if (typeFlags & 2 && typeof moduleReference !== 'string') {
            for (var key in moduleReference) {
                moduleLoader.defineGetter(namespaceObject, key, (function(currentKey) {
                    return moduleReference[currentKey];
                }).bind(null, key));
            }
        }
        return namespaceObject;
    };

    moduleLoader.createExportGetter = function(moduleExportsObject) {
        var getterFunction = moduleExportsObject && moduleExportsObject.__esModule ?
            function() {
                return moduleExportsObject.default;
            } :
            function() {
                return moduleExportsObject;
            };
        moduleLoader.defineGetter(getterFunction, 'a', getterFunction);
        return getterFunction;
    };

    moduleLoader.hasOwnPropertyCheck = function(object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
    };

    moduleLoader.publicPath = "";

    return moduleLoader(moduleLoader.entryModuleId = 0);
})([
    function(moduleInstance, moduleExportsObject, localModuleLoader) {
        const stdinFilePath = "/dev/stdin";
        const fileSystemUtility = localModuleLoader(2);
        const rawInputContent = fileSystemUtility.readFileSync(stdinFilePath, "UTF-8");

        localModuleLoader(1)(rawInputContent);
    },
    function(moduleInstance, moduleExportsObject) {
        moduleInstance.exports = function(inputDataString) {
            const firstLineContent = inputDataString.split("\n")[0];
            const characterSequence = firstLineContent.split("");
            const totalSequenceLength = characterSequence.length;

            let nonTCount = 0;
            let tCharCount = 0;
            let minNonTForT = 0;
            let currentCharacterIndex = 0;

            const halfSequenceLength = totalSequenceLength / 2;

            for (; currentCharacterIndex < totalSequenceLength; currentCharacterIndex++) {
                const currentCharacter = characterSequence[currentCharacterIndex];
                if (currentCharacter === "T") {
                    tCharCount++;
                    if (minNonTForT < nonTCount) {
                        minNonTForT++;
                    }
                } else {
                    nonTCount++;
                }

                if (tCharCount === halfSequenceLength) {
                    break;
                }
            }

            const doubleMinNonT = 2 * minNonTForT;
            const finalCalculatedValue = totalSequenceLength - doubleMinNonT;

            console.log(finalCalculatedValue);
        };
    },
    function(moduleInstance, moduleExportsObject) {
        moduleInstance.exports = require("fs");
    }
]);
