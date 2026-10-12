const allModuleDefinitions = [
    function(module, exports, localRequire) {
        "use strict";
        const fileSystem = localRequire(1);
        if (!fileSystem || typeof fileSystem.readFileSync !== 'function') {
            throw new Error("Filesystem module not loaded correctly.");
        }
        const rawInputString = fileSystem.readFileSync("/dev/stdin", "utf8");
        const processedInputArray = rawInputString.trim().split(/\s+/g);
        const InputReaderClass = localRequire(2);
        const inputProcessor = new InputReaderClass(processedInputArray);
        const mainLogicFunction = localRequire(4);
        mainLogicFunction(inputProcessor);
    },
    function(module, exports) {
        module.exports = require("fs");
    },
    function(module, exports, localRequire) {
        "use strict";
        const QueueImplementation = localRequire(3);

        class InputReader {
            constructor(initialData) {
                this.dataQueue = new QueueImplementation(initialData);
            }

            _parseInteger(value) {
                return parseInt(value, 10);
            }

            readRawString() {
                return this.dataQueue.dequeue();
            }

            readInteger() {
                const rawValue = this.dataQueue.dequeue();
                return this._parseInteger(rawValue);
            }

            peekNextRaw() {
                return this.dataQueue.peek();
            }

            clearInputBuffer() {
                this.dataQueue.reset();
            }
        }
        module.exports = InputReader;
    },
    function(module, exports, localRequire) {
        "use strict";
        class SimpleQueue {
            constructor(initialItems = []) {
                this.queueItems = initialItems;
                this.currentSize = initialItems.length;
                this.headIndex = 0;
            }

            enqueue(itemToEnqueue) {
                this.queueItems.push(itemToEnqueue);
                this.currentSize++;
            }

            dequeue() {
                if (this.isEmpty) {
                    return undefined;
                }
                const dequeuedItem = this.queueItems[this.headIndex];
                this.headIndex++;
                this.currentSize--;
                return dequeuedItem;
            }

            peek() {
                if (this.isEmpty) {
                    return undefined;
                }
                return this.queueItems[this.headIndex];
            }

            reset() {
                this.queueItems = [];
                this.currentSize = 0;
                this.headIndex = 0;
            }

            get size() {
                return this.currentSize;
            }

            get isEmpty() {
                return this.currentSize === 0;
            }
        }
        module.exports = SimpleQueue;
    },
    function(module, exports, localRequire) {
        "use strict";

        /**
         * Calculates the value 'd' based on the given N, h, and w.
         * The formula is N*h*w / (4*h*w - N*(h+w)).
         * @param {number} N - The target value from input.
         * @param {number} h - Current height.
         * @param {number} w - Current width.
         * @returns {number} The calculated 'd' value.
         */
        const calculateDValue = (N, h, w) => {
            const numerator = N * h * w;
            const denominator = (4 * h * w) - (N * (h + w));

            if (denominator === 0) {
                return NaN;
            }
            return numerator / denominator;
        };

        module.exports = function(readerInstance) {
            const targetValueN = readerInstance.readInteger();
            const MAX_ITERATION_VALUE = 3500;

            for (let currentH = 1; currentH <= MAX_ITERATION_VALUE; currentH++) {
                for (let currentW = 1; currentW <= MAX_ITERATION_VALUE; currentW++) {
                    const calculatedD = calculateDValue(targetValueN, currentH, currentW);

                    const isInteger = Number.isInteger(calculatedD);
                    const isPositive = calculatedD > 0;
                    const isInBounds = calculatedD <= MAX_ITERATION_VALUE;

                    if (isInteger && isPositive && isInBounds) {
                        const solutionTuple = [currentH, currentW, calculatedD];
                        const outputString = solutionTuple.join(" ");
                        return void console.log(outputString);
                    }
                }
            }
        };
    }
];

module.exports = (function(moduleDefinitions) {
    const moduleCache = {};
    const hasOwnProp = Object.prototype.hasOwnProperty;

    function defineModuleProperty(target, property, descriptor) {
        Object.defineProperty(target, property, descriptor);
    }

    function customRequire(moduleId) {
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }
        const moduleObj = moduleCache[moduleId] = {
            id: moduleId,
            loaded: false,
            exports: {}
        };
        moduleDefinitions[moduleId].call(moduleObj.exports, moduleObj, moduleObj.exports, customRequire);
        moduleObj.loaded = true;
        return moduleObj.exports;
    }

    customRequire.allModules = moduleDefinitions;
    customRequire.cache = moduleCache;

    customRequire.defineExport = function(target, exportName, getter) {
        if (!hasOwnProp.call(target, exportName)) {
            defineModuleProperty(target, exportName, { enumerable: true, get: getter });
        }
    };

    customRequire.markAsEsModule = function(exportsObject) {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            defineModuleProperty(exportsObject, Symbol.toStringTag, { value: "Module" });
        }
        defineModuleProperty(exportsObject, "__esModule", { value: true });
    };

    customRequire.createModuleNamespaceObject = function(value, mode) {
        if (1 & mode && (value = customRequire(value))) return value;
        if (4 & mode && typeof value === "object" && value && value.__esModule) return value;
        const namespaceObject = Object.create(null);
        customRequire.markAsEsModule(namespaceObject);
        defineModuleProperty(namespaceObject, "default", { enumerable: true, value: value });
        if (2 & mode && typeof value !== "string") {
            for (const propName in value) {
                customRequire.defineExport(namespaceObject, propName, ((p) => value[p]).bind(null, propName));
            }
        }
        return namespaceObject;
    };

    customRequire.getModuleExports = function(module) {
        const getter = module && module.__esModule ? () => module.default : () => module;
        customRequire.defineExport(getter, "a", getter);
        return getter;
    };

    customRequire.hasOwn = function(object, property) {
        return hasOwnProp.call(object, property);
    };

    customRequire.publicPath = "";
    customRequire.entryModuleId = 0;

    return customRequire(customRequire.entryModuleId);
})(allModuleDefinitions);
