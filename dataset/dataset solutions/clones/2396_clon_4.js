module.exports = (function(moduleDefinitions) {
    const moduleRegistry = new Map();
    const moduleLoader = (moduleId) => {
        if (moduleRegistry.has(moduleId)) {
            return moduleRegistry.get(moduleId).exports;
        }

        const moduleObject = {
            id: moduleId,
            loaded: false,
            exports: {}
        };
        moduleRegistry.set(moduleId, moduleObject);

        moduleDefinitions[moduleId].call(moduleObject.exports, moduleObject, moduleObject.exports, moduleLoader);
        moduleObject.loaded = true;
        return moduleObject.exports;
    };

    moduleLoader.moduleDefinitions = moduleDefinitions;
    moduleLoader.moduleCache = moduleRegistry;

    moduleLoader.defineExport = (target, key, getter) => {
        if (!Object.prototype.hasOwnProperty.call(target, key)) {
            Object.defineProperty(target, key, {
                enumerable: true,
                get: getter
            });
        }
    };

    moduleLoader.markAsESModule = (targetModule) => {
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(targetModule, Symbol.toStringTag, { value: 'Module' });
        }
        Object.defineProperty(targetModule, '__esModule', { value: true });
    };

    moduleLoader.interopRequire = (moduleRef, mode) => {
        if (mode & 1) moduleRef = moduleLoader(moduleRef);
        if (mode & 8) return moduleRef;
        if ((mode & 4) && typeof moduleRef === 'object' && moduleRef && moduleRef.__esModule) return moduleRef;
        const interopObject = Object.create(null);
        moduleLoader.markAsESModule(interopObject);
        moduleLoader.defineExport(interopObject, 'default', () => moduleRef);
        if (mode & 2 && typeof moduleRef !== 'string') {
            for (const prop in moduleRef) {
                moduleLoader.defineExport(interopObject, prop, ((key) => moduleRef[key]).bind(null, prop));
            }
        }
        return interopObject;
    };

    moduleLoader.defaultExportGetter = (moduleRef) => {
        const getter = moduleRef && moduleRef.__esModule ? () => moduleRef.default : () => moduleRef;
        moduleLoader.defineExport(getter, 'a', getter);
        return getter;
    };

    moduleLoader.hasOwn = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);

    moduleLoader.publicPath = "";

    moduleLoader.moduleDefinitions.entryPoint = 1;
    return moduleLoader(moduleLoader.moduleDefinitions.entryPoint);
})([
    function(moduleObject, exportsObject, requireFunction) {
        "use strict";
        moduleObject.exports = class ElementQueue {
            constructor(initialElements = []) {
                this.storageArray = [...initialElements];
                this.readPointer = 0;
            }

            enqueueItem(itemValue) {
                this.storageArray.push(itemValue);
            }

            dequeueItem() {
                if (this.readPointer >= this.storageArray.length) {
                    return undefined;
                }
                const retrievedItem = this.storageArray[this.readPointer];
                this.readPointer++;
                return retrievedItem;
            }

            get currentSize() {
                return this.storageArray.length - this.readPointer;
            }

            resetQueue() {
                this.storageArray = [];
                this.readPointer = 0;
            }
        };
    },
    function(moduleObject, exportsObject, requireFunction) {
        "use strict";
        (() => {
            const fileSystemAccess = requireFunction(2);
            const processInputData = requireFunction(3);
            const standardInputContent = fileSystemAccess.readFileSync("/dev/stdin", "utf8");
            processInputData(standardInputContent);
        })();
    },
    function(moduleObject, exportsObject, requireFunction) {
        moduleObject.exports = require("fs");
    },
    function(moduleObject, exportsObject, requireFunction) {
        "use strict";
        moduleObject.exports = (rawInputString) => {
            const InputProcessorClass = requireFunction(4);
            const MainAlgorithmFunction = requireFunction(5);
            const processorInstance = new InputProcessorClass(rawInputString);
            MainAlgorithmFunction(processorInstance);
        };
    },
    function(moduleObject, exportsObject, requireFunction) {
        "use strict";
        moduleObject.exports = class DataParser {
            constructor(sourceText) {
                this.tokenBuffer = sourceText.trim().split(/\s+/g);
                this.currentPosition = 0;
            }

            retrieveRawToken() {
                if (this.currentPosition >= this.tokenBuffer.length) {
                    return undefined;
                }
                return this.tokenBuffer[this.currentPosition++];
            }

            retrieveNumericToken() {
                const rawToken = this.retrieveRawToken();
                return Number.parseInt(rawToken, 10);
            }

            flushBuffer() {
                this.tokenBuffer = [];
                this.currentPosition = 0;
            }
        };
    },
    function(moduleObject, exportsObject, requireFunction) {
        "use strict";
        moduleObject.exports = function(inputSource) {
            const totalNodes = inputSource.retrieveNumericToken();

            const nodeActivityCounts = new Map();
            const nodeLastObservedValues = new Map();

            for (let k = 0; k < totalNodes; k++) {
                nodeActivityCounts.set(k, 0);
                nodeLastObservedValues.set(k, 0);
            }

            let peakActivityValue = 0;
            const recordedEdgeValues = [];

            Array.from({ length: totalNodes - 1 }).forEach(() => {
                const originIndex = inputSource.retrieveNumericToken() - 1;
                const destinationIndex = inputSource.retrieveNumericToken() - 1;

                let currentOriginCount = nodeActivityCounts.get(originIndex);
                currentOriginCount++;

                if (currentOriginCount === nodeLastObservedValues.get(originIndex)) {
                    currentOriginCount++;
                }
                nodeActivityCounts.set(originIndex, currentOriginCount);

                peakActivityValue = Math.max(peakActivityValue, currentOriginCount);
                nodeLastObservedValues.set(destinationIndex, currentOriginCount);
                recordedEdgeValues.push(currentOriginCount);
            });

            console.log(peakActivityValue);
            recordedEdgeValues.forEach(value => console.log(value));
        };
    }
]);
