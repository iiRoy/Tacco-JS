module.exports = function(moduleDefinitions) {
    var moduleCache = {};

    function moduleLoader(moduleId) {
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }
        var currentModule = moduleCache[moduleId] = {
            id: moduleId,
            loaded: false,
            exports: {}
        };
        moduleDefinitions[moduleId].call(currentModule.exports, currentModule, currentModule.exports, moduleLoader);
        currentModule.loaded = true;
        return currentModule.exports;
    }

    moduleLoader.definitions = moduleDefinitions;
    moduleLoader.cache = moduleCache;

    moduleLoader.defineExport = function(targetObject, exportName, getterFunction) {
        moduleLoader.hasOwn(targetObject, exportName) || Object.defineProperty(targetObject, exportName, {
            enumerable: true,
            get: getterFunction
        });
    };

    moduleLoader.markAsEsModule = function(targetObject) {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(targetObject, Symbol.toStringTag, {
                value: "Module"
            });
        }
        Object.defineProperty(targetObject, "__esModule", {
            value: true
        });
    };

    moduleLoader.interopRequire = function(moduleRef, flags) {
        if (1 & flags) {
            moduleRef = moduleLoader(moduleRef);
        }
        if (8 & flags) {
            return moduleRef;
        }
        if (4 & flags && typeof moduleRef === "object" && moduleRef && moduleRef.__esModule) {
            return moduleRef;
        }
        var newModuleObject = Object.create(null);
        moduleLoader.markAsEsModule(newModuleObject);
        Object.defineProperty(newModuleObject, "default", {
            enumerable: true,
            value: moduleRef
        });
        if (2 & flags && typeof moduleRef !== "string") {
            for (var propName in moduleRef) {
                moduleLoader.defineExport(newModuleObject, propName, (function(key) {
                    return moduleRef[key];
                }).bind(null, propName));
            }
        }
        return newModuleObject;
    };

    moduleLoader.getDefaultExport = function(moduleRef) {
        var defaultGetter = moduleRef && moduleRef.__esModule ?
            function() {
                return moduleRef.default;
            } :
            function() {
                return moduleRef;
            };
        moduleLoader.defineExport(defaultGetter, "a", defaultGetter);
        return defaultGetter;
    };

    moduleLoader.hasOwn = function(targetObject, propertyKey) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyKey);
    };

    moduleLoader.publicPath = "";

    return moduleLoader(moduleLoader.startupModule = 0);
}([
    /* Module 0 */
    function(currentModule, moduleExports, localRequire) {
        "use strict";
        var fileSystemModule = localRequire(1);
        var inputProcessorInstance = new(localRequire(2))(fileSystemModule.readFileSync("/dev/stdin", "utf8").trim().split(/\s+/g));
        localRequire(4)(inputProcessorInstance);
    },
    /* Module 1 */
    function(currentModule, moduleExports) {
        moduleExports.exports = require("fs");
    },
    /* Module 2 */
    function(currentModule, moduleExports, localRequire) {
        "use strict";
        var dataQueueClass = localRequire(3);
        moduleExports.exports = class InputHandler {
            constructor(initialData) {
                this.dataStream = new dataQueueClass(initialData);
            }
            readRaw() {
                return this.dataStream.dequeueElement();
            }
            readInt() {
                return parseInt(this.dataStream.dequeueElement(), 10);
            }
            finishInput() {
                this.dataStream.clearQueue();
            }
        };
    },
    /* Module 3 */
    function(currentModule, moduleExports, localRequire) {
        "use strict";
        moduleExports.exports = class DataQueue {
            constructor() {
                var initialElements = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
                this.elementCount = initialElements.length;
                this.elementStorage = initialElements;
                this.currentIndex = 0;
            }
            enqueueElement(itemToAdd) {
                this.elementCount += 1;
                this.elementStorage.push(itemToAdd);
            }
            dequeueElement() {
                var retrievedItem = this.elementStorage[this.currentIndex];
                this.elementCount -= 1;
                this.currentIndex += 1;
                return retrievedItem;
            }
            clearQueue() {
                this.elementStorage = [];
                this.elementCount = 0;
                this.currentIndex = 0;
            }
        };
    },
    /* Module 4 */
    function(currentModule, moduleExports, localRequire) {
        "use strict";
        moduleExports.exports = function(inputReader) {
            var targetValue = inputReader.readInt();
            for (var firstNumerator = 1; firstNumerator <= 3500; firstNumerator++) {
                for (var secondNumerator = 1; secondNumerator <= 3500; secondNumerator++) {
                    var resultDenominator = targetValue * firstNumerator * secondNumerator / (4 * firstNumerator * secondNumerator - targetValue * (firstNumerator + secondNumerator));
                    if (resultDenominator % 1 === 0 && resultDenominator > 0 && resultDenominator <= 3500) {
                        var outputValues = [firstNumerator, secondNumerator, resultDenominator];
                        return void console.log(outputValues.join(" "));
                    }
                }
            }
        };
    }
]);
