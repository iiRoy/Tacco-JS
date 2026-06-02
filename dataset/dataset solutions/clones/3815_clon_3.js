module.exports = (moduleDefinitions) => {
    const moduleCache = {};

    const customRequire = (moduleId) => {
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }
        const moduleObject = moduleCache[moduleId] = {
            id: moduleId,
            loaded: false,
            exports: {}
        };
        moduleDefinitions[moduleId].call(moduleObject.exports, moduleObject, moduleObject.exports, customRequire);
        moduleObject.loaded = true;
        return moduleObject.exports;
    };

    customRequire.moduleDefinitions = moduleDefinitions;
    customRequire.moduleCache = moduleCache;

    customRequire.definePropertyGetter = (targetObject, propertyName, getterFunction) => {
        if (!customRequire.hasOwnPropertyCheck(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true,
                get: getterFunction
            });
        }
    };

    customRequire.markAsEsModule = (targetModule) => {
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(targetModule, Symbol.toStringTag, {
                value: 'Module'
            });
        }
        Object.defineProperty(targetModule, '__esModule', {
            value: true
        });
    };

    customRequire.createNamespaceObject = (moduleValue, mode) => {
        if (mode & 1) {
            moduleValue = customRequire(moduleValue);
        }
        if (mode & 8) {
            return moduleValue;
        }
        if ((mode & 4) && typeof moduleValue === 'object' && moduleValue && moduleValue.__esModule) {
            return moduleValue;
        }
        const namespaceObject = Object.create(null);
        customRequire.markAsEsModule(namespaceObject);
        Object.defineProperty(namespaceObject, 'default', {
            enumerable: true,
            value: moduleValue
        });
        if (mode & 2 && typeof moduleValue !== 'string') {
            for (const key in moduleValue) {
                customRequire.definePropertyGetter(namespaceObject, key, ((k) => moduleValue[k]).bind(null, key));
            }
        }
        return namespaceObject;
    };

    customRequire.createDefaultExportGetter = (module) => {
        const getter = module && module.__esModule ?
            () => module.default :
            () => module;
        customRequire.definePropertyGetter(getter, 'a', getter);
        return getter;
    };

    customRequire.hasOwnPropertyCheck = (object, property) => Object.prototype.hasOwnProperty.call(object, property);

    customRequire.publicPath = "";

    return customRequire(customRequire.entryModuleId = 0);
};

([function(module, exports, require) {
    "use strict";
    const fsModule = require(1);
    const inputContent = fsModule.readFileSync("/dev/stdin", "utf8");
    require(2)(inputContent);
}, function(module, exports) {
    module.exports = require("fs");
}, function(module, exports, require) {
    "use strict";
    const InputProcessorClass = require(3);
    const mainLogicFunction = require(5);

    module.exports = (inputString) => {
        const inputReaderInstance = new InputProcessorClass(inputString);
        mainLogicFunction(inputReaderInstance);
    };
}, function(module, exports, require) {
    "use strict";
    const QueueClass = require(4);

    module.exports = class InputReader {
        constructor(rawInputString) {
            const tokens = rawInputString.trim().split(/\s+/g);
            this.inputQueue = new QueueClass(tokens);
        }

        readRawToken() {
            return this.inputQueue.dequeue();
        }

        readInt() {
            const token = this.inputQueue.dequeue();
            return parseInt(token, 10);
        }

        clearInput() {
            this.inputQueue.resetQueue();
        }
    };
}, function(module, exports) {
    "use strict";
    module.exports = class Queue {
        constructor(initialItems = []) {
            this.size = initialItems.length;
            this.queueItems = initialItems;
            this.currentIndex = 0;
        }

        enqueue(itemToEnqueue) {
            this.size += 1;
            this.queueItems.push(itemToEnqueue);
        }

        dequeue() {
            const dequeuedItem = this.queueItems[this.currentIndex];
            this.size -= 1;
            this.currentIndex += 1;
            return dequeuedItem;
        }

        resetQueue() {
            this.queueItems = [];
            this.size = 0;
            this.currentIndex = 0;
        }
    };
}, function(module, exports, require) {
    "use strict";

    // Helper function to find the maximum value in a specified slice of an array.
    // This function replicates the original loop's behavior, including its bounds.
    const findMaxInArraySlice = (arr, startIndex, endIndex) => {
        let currentMax = 0;
        for (let k = startIndex; k <= endIndex; k++) {
            currentMax = Math.max(currentMax, arr[k]);
        }
        return currentMax;
    };

    module.exports = (reader) => {
        const arraySize = reader.readInt();
        const inputNumbers = new Array(arraySize);

        // Populate the inputNumbers array by reading integers from the reader.
        for (let idx = 0; idx < arraySize; idx++) {
            inputNumbers[idx] = reader.readInt();
        }

        // Initialize dpValues array with zeros. Its size is arraySize + 1.
        const dpValues = new Array(arraySize + 1).fill(0);

        // Calculate DP values based on consecutive numbers.
        // IMPORTANT: The original loop iterates from 1 to arraySize (inclusive)
        // and accesses inputNumbers[loopCounter].
        // This means inputNumbers[0] is effectively skipped, and inputNumbers[arraySize]
        // is accessed, which is out of bounds for a 0-indexed array of size 'arraySize'.
        // Accessing inputNumbers[arraySize] will result in 'undefined'.
        // This specific behavior (including potential 'undefined' access and NaN propagation)
        // must be preserved for exact observable equivalence.
        for (let loopCounter = 1; loopCounter <= arraySize; loopCounter++) {
            const currentNumber = inputNumbers[loopCounter];
            // If currentNumber is undefined, currentNumber - 1 becomes NaN.
            // dpValues[NaN] is undefined. undefined + 1 results in NaN.
            // Consequently, dpValues[undefined] will be set to NaN.
            const previousDpValue = dpValues[currentNumber - 1];
            dpValues[currentNumber] = previousDpValue + 1;
        }

        // Find the maximum consecutive length from the dpValues array.
        // The original loop for finding max also iterates from 1 to arraySize (inclusive).
        const maxConsecutiveLength = findMaxInArraySlice(dpValues, 1, arraySize);

        // The final result is the total array size minus the maximum consecutive length found.
        console.log(arraySize - maxConsecutiveLength);
    };
}]);
