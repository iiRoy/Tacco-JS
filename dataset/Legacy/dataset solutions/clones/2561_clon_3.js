module.exports = (function(moduleDefinitions) {
    var moduleCache = {};

    function localRequire(moduleId) {
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }
        var moduleObject = moduleCache[moduleId] = {
            id: moduleId,
            loaded: false,
            exports: {}
        };
        moduleDefinitions[moduleId].call(moduleObject.exports, moduleObject, moduleObject.exports, localRequire);
        moduleObject.loaded = true;
        return moduleObject.exports;
    }

    localRequire.m = moduleDefinitions;
    localRequire.c = moduleCache;
    localRequire.d = function(exportsObject, exportName, getter) {
        if (!localRequire.o(exportsObject, exportName)) {
            Object.defineProperty(exportsObject, exportName, {
                enumerable: true,
                get: getter
            });
        }
    };
    localRequire.r = function(exportsObject) {
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exportsObject, Symbol.toStringTag, {
                value: 'Module'
            });
        }
        Object.defineProperty(exportsObject, '__esModule', {
            value: true
        });
    };
    localRequire.t = function(value, mode) {
        if (mode & 1) value = localRequire(value);
        if (mode & 8) return value;
        if ((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
        var newObject = Object.create(null);
        localRequire.r(newObject);
        Object.defineProperty(newObject, 'default', {
            enumerable: true,
            value: value
        });
        if (mode & 2 && typeof value != 'string') {
            for (var key in value) {
                localRequire.d(newObject, key, ((k) => value[k]).bind(null, key));
            }
        }
        return newObject;
    };
    localRequire.n = function(moduleValue) {
        var getter = moduleValue && moduleValue.__esModule ?
            function() {
                return moduleValue['default'];
            } :
            function() {
                return moduleValue;
            };
        localRequire.d(getter, 'a', getter);
        return getter;
    };
    localRequire.o = function(object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
    };
    localRequire.p = "";

    return localRequire(localRequire.s = 0);

})([
    function(module, exports, require) {
        "use strict";
        var fileSystemModule = require(1);
        var mainProcessorFunction = require(2);
        mainProcessorFunction(fileSystemModule.readFileSync("/dev/stdin", "utf8"));
    },
    function(module, exports) {
        module.exports = require("fs");
    },
    function(module, exports, require) {
        "use strict";
        var InputDataParser = require(3);
        var processHeapOperations = require(5);
        module.exports = function(inputStringContent) {
            var parserInstance = new InputDataParser(inputStringContent);
            processHeapOperations(parserInstance);
        };
    },
    function(module, exports, require) {
        "use strict";
        var SimpleQueue = require(4);
        module.exports = class InputDataParser {
            constructor(inputString) {
                const trimmedInput = inputString.trim();
                const tokensArray = trimmedInput.split(/\s+/g);
                this.inputQueue = new SimpleQueue(tokensArray);
            }
            readNextString() {
                return this.inputQueue.dequeueElement();
            }
            readNextInteger() {
                const stringValue = this.inputQueue.dequeueElement();
                return parseInt(stringValue, 10);
            }
            clearAllInput() {
                this.inputQueue.resetQueue();
            }
        };
    },
    function(module, exports, require) {
        "use strict";
        module.exports = class SimpleQueue {
            constructor(initialItems = []) {
                this.items = initialItems;
                this.currentSize = initialItems.length;
                this.readIndex = 0;
            }
            enqueueElement(element) {
                this.currentSize += 1;
                this.items.push(element);
            }
            dequeueElement() {
                if (this.readIndex >= this.items.length) {
                    return undefined;
                }
                var dequeuedItem = this.items[this.readIndex];
                this.currentSize -= 1;
                this.readIndex += 1;
                return dequeuedItem;
            }
            resetQueue() {
                this.items = [];
                this.currentSize = 0;
                this.readIndex = 0;
            }
        };
    },
    function(module, exports, require) {
        "use strict";
        var BinaryHeap = require(6);
        module.exports = function(inputParserInstance) {
            const initialItemCount = inputParserInstance.readNextInteger();
            const operationCount = inputParserInstance.readNextInteger();

            const priceHeap = new BinaryHeap();

            for (let itemIndex = 0; itemIndex < initialItemCount; itemIndex++) {
                const itemPrice = inputParserInstance.readNextInteger();
                priceHeap.insertItem(itemPrice);
            }

            for (let opIndex = 0; opIndex < operationCount; opIndex++) {
                const currentTopValue = priceHeap.peekTop();
                if (currentTopValue === undefined) {
                    break;
                }
                priceHeap.extractTop();
                const reducedValue = Math.floor(currentTopValue / 2);
                priceHeap.insertItem(reducedValue);
            }

            let totalSum = 0;
            while (priceHeap.currentSize > 0) {
                const valueToAdd = priceHeap.peekTop();
                priceHeap.extractTop();
                totalSum += valueToAdd;
            }
            console.log(totalSum);
        };
    },
    function(module, exports, require) {
        "use strict";

        function isLessOrEqual(valA, valB) {
            return valA <= valB;
        }

        function isGreaterOrEqual(valA, valB) {
            return valA >= valB;
        }

        module.exports = class BinaryHeap {
            constructor(initialElements = [], isMinHeap = true, customCompareFn = undefined) {
                this.compareFunction = customCompareFn || (isMinHeap ? isLessOrEqual : isGreaterOrEqual);
                this.heapArray = initialElements;
                this.currentSize = this.heapArray.length;
                this.heapifyStructure();
            }

            heapifyStructure() {
                if (this.currentSize === 0) return;

                let lastParentNodeIndex = Math.floor((this.currentSize / 2) - 1);
                if (lastParentNodeIndex < 0) {
                    lastParentNodeIndex = 0;
                }

                for (let i = lastParentNodeIndex; i >= 0; i--) {
                    this.downHeap(i);
                }
            }

            downHeap(parentIdx) {
                const totalElements = this.currentSize;
                let currentPosition = parentIdx;

                while (true) {
                    const leftChildIndex = 2 * currentPosition + 1;
                    const rightChildIndex = 2 * currentPosition + 2;
                    let candidateChildValue;
                    let candidateChildIndex;

                    const hasLeftChild = leftChildIndex < totalElements;
                    const hasRightChild = rightChildIndex < totalElements;

                    if (hasLeftChild && hasRightChild) {
                        if (this.compareFunction(this.heapArray[leftChildIndex], this.heapArray[rightChildIndex])) {
                            candidateChildValue = this.heapArray[leftChildIndex];
                            candidateChildIndex = leftChildIndex;
                        } else {
                            candidateChildValue = this.heapArray[rightChildIndex];
                            candidateChildIndex = rightChildIndex;
                        }
                    } else if (hasLeftChild) {
                        candidateChildValue = this.heapArray[leftChildIndex];
                        candidateChildIndex = leftChildIndex;
                    } else {
                        break;
                    }

                    if (this.compareFunction(candidateChildValue, this.heapArray[currentPosition])) {
                        const tempSwapValue = this.heapArray[currentPosition];
                        this.heapArray[currentPosition] = this.heapArray[candidateChildIndex];
                        this.heapArray[candidateChildIndex] = tempSwapValue;
                        currentPosition = candidateChildIndex;
                    } else {
                        break;
                    }
                }
            }

            upHeap(childIdx) {
                let currentIdx = childIdx;
                while (currentIdx > 0) {
                    const parentIdx = Math.floor((currentIdx - 1) / 2);
                    if (this.compareFunction(this.heapArray[currentIdx], this.heapArray[parentIdx])) {
                        const tempValue = this.heapArray[parentIdx];
                        this.heapArray[parentIdx] = this.heapArray[currentIdx];
                        this.heapArray[currentIdx] = tempValue;
                        currentIdx = parentIdx;
                    } else {
                        break;
                    }
                }
            }

            insertItem(itemValue) {
                this.currentSize += 1;
                this.heapArray.push(itemValue);
                this.upHeap(this.currentSize - 1);
            }

            peekTop() {
                if (this.currentSize === 0) {
                    return undefined;
                }
                return this.heapArray[0];
            }

            extractTop() {
                if (this.currentSize === 0) {
                    return false;
                }
                if (this.currentSize === 1) {
                    this.heapArray.pop();
                    this.currentSize--;
                    return true;
                }

                this.heapArray[0] = this.heapArray.pop();
                this.currentSize -= 1;
                this.downHeap(0);
                return true;
            }

            getAllValues() {
                return [...this.heapArray];
            }
        };
    }
]);
