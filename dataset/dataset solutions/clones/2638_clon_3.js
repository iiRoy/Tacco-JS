module.exports = (function(moduleDefinitions) {
    const moduleCache = {};

    function customRequire(moduleId) {
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }

        const moduleObject = { id: moduleId, loaded: false, exports: {} };
        moduleCache[moduleId] = moduleObject;

        moduleDefinitions[moduleId].call(moduleObject.exports, moduleObject, moduleObject.exports, customRequire);
        moduleObject.loaded = true;
        return moduleObject.exports;
    }

    customRequire.definePropertyGetter = function(obj, prop, getter) {
        if (!customRequire.hasOwn(obj, prop)) {
            Object.defineProperty(obj, prop, { enumerable: true, get: getter });
        }
    };

    customRequire.hasOwn = function(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    };

    const entryModuleId = 0;
    return customRequire(entryModuleId);
})(
    [
        function(module, exports, localRequire) {
            const fileSystemModule = localRequire(2);
            const mainLogicFunction = localRequire(1);
            mainLogicFunction(fileSystemModule.readFileSync("/dev/stdin", "UTF-8"));
        },
        function(module, exports, localRequire) {
            "use strict";

            class CustomQueue {
                constructor() {
                    this.size = 0;
                    this.headSentinel = { value: undefined, prev: undefined, next: undefined };
                    this.tailSentinel = { value: undefined, prev: undefined, next: undefined };
                    this.headSentinel.next = this.tailSentinel;
                    this.tailSentinel.prev = this.headSentinel;
                }

                enqueue(itemValue) {
                    this.size++;
                    const newNode = { value: itemValue, prev: undefined, next: undefined };

                    const lastNodeInQueue = this.tailSentinel.prev;
                    lastNodeInQueue.next = newNode;
                    newNode.prev = lastNodeInQueue;
                    newNode.next = this.tailSentinel;
                    this.tailSentinel.prev = newNode;
                }

                dequeue() {
                    if (this.size === 0) {
                        return undefined;
                    }

                    this.size--;
                    const dequeuedNode = this.headSentinel.next;
                    const dequeuedValue = dequeuedNode.value;

                    this.headSentinel.next = dequeuedNode.next;
                    dequeuedNode.next.prev = this.headSentinel;

                    return dequeuedValue;
                }

                getValuesAsArray() {
                    const collectedValues = [];
                    let currentNode = this.headSentinel.next;
                    while (currentNode !== this.tailSentinel) {
                        collectedValues.push(currentNode.value);
                        currentNode = currentNode.next;
                    }
                    return collectedValues;
                }
            }

            module.exports = function(inputString) {
                const inputLines = inputString.split("\n");

                const parseLineOfNumbers = (lineContent) => lineContent.split(" ").map(Number);
                const parseLineOfNodes = (lineContent) => lineContent.split(" ").map(s => Number(s) - 1);

                const [nodeCount, queryCount] = parseLineOfNumbers(inputLines[0]);

                const adjacencyList = Array.from({ length: nodeCount }, () => []);

                for (let edgeIndex = 0; edgeIndex < nodeCount - 1; edgeIndex++) {
                    const [nodeA, nodeB] = parseLineOfNodes(inputLines[edgeIndex + 1]);
                    adjacencyList[nodeA].push(nodeB);
                    adjacencyList[nodeB].push(nodeA);
                }

                const nodeValues = new Array(nodeCount).fill(0);

                for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
                    const [targetNodeId, valueToAdd] = parseLineOfNumbers(inputLines[queryIndex + nodeCount]);
                    nodeValues[targetNodeId - 1] += valueToAdd;
                }

                const bfsQueue = new CustomQueue();
                const visitedNodes = new Array(nodeCount).fill(0);

                bfsQueue.enqueue(0);
                visitedNodes[0] = 1;

                while (bfsQueue.size > 0) {
                    const currentNode = bfsQueue.dequeue();

                    for (const neighborNode of adjacencyList[currentNode]) {
                        if (!visitedNodes[neighborNode]) {
                            nodeValues[neighborNode] += nodeValues[currentNode];
                            visitedNodes[neighborNode] = 1;
                            bfsQueue.enqueue(neighborNode);
                        }
                    }
                }

                console.log(nodeValues.join(" "));
            };
        },
        function(module, exports) {
            module.exports = require("fs");
        }
    ]
);
