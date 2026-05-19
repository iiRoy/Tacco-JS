module.exports = function(modules) {
    const moduleCache = {};

    function requireModule(moduleId) {
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }
        const module = moduleCache[moduleId] = {
            id: moduleId,
            loaded: false,
            exports: {}
        };
        modules[moduleId].call(module.exports, module, module.exports, requireModule);
        module.loaded = true;
        return module.exports;
    }

    requireModule.m = modules;
    requireModule.c = moduleCache;

    requireModule.d = function(exportsObject, exportName, getter) {
        if (!requireModule.o(exportsObject, exportName)) {
            Object.defineProperty(exportsObject, exportName, {
                enumerable: true,
                get: getter
            });
        }
    };

    requireModule.r = function(exportsObject) {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(exportsObject, Symbol.toStringTag, {
                value: "Module"
            });
        }
        Object.defineProperty(exportsObject, "__esModule", {
            value: true
        });
    };

    requireModule.t = function(value, mode) {
        if (mode & 1) value = requireModule(value);
        if (mode & 8) return value;
        if (mode & 4 && typeof value === "object" && value && value.__esModule) return value;
        const namespaceObject = Object.create(null);
        requireModule.r(namespaceObject);
        Object.defineProperty(namespaceObject, "default", {
            enumerable: true,
            value: value
        });
        if (mode & 2 && typeof value !== "string") {
            for (const key in value) {
                requireModule.d(namespaceObject, key, ((k) => value[k]).bind(null, key));
            }
        }
        return namespaceObject;
    };

    requireModule.n = function(moduleExports) {
        const getter = moduleExports && moduleExports.__esModule ?
            () => moduleExports.default :
            () => moduleExports;
        requireModule.d(getter, "a", getter);
        return getter;
    };

    requireModule.o = function(object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
    };

    requireModule.p = "";

    return requireModule(requireModule.s = 0);
}([
    function(module, exports, requireModule) {
        "use strict";
        const fileSystem = requireModule(1);
        requireModule(2)(fileSystem.readFileSync("/dev/stdin", "utf8"));
    },
    function(module, exports) {
        module.exports = require("fs");
    },
    function(module, exports, requireModule) {
        "use strict";
        const InputProcessorClass = requireModule(3);
        const processGraphFunction = requireModule(5);
        module.exports = function(inputStringContent) {
            const inputReaderInstance = new InputProcessorClass(inputStringContent);
            processGraphFunction(inputReaderInstance);
        };
    },
    function(module, exports, requireModule) {
        "use strict";
        const DataQueueClass = requireModule(4);
        module.exports = class InputProcessor {
            constructor(inputString) {
                const tokens = inputString.trim().split(/\s+/g);
                this.dataQueue = new DataQueueClass(tokens);
            }
            readRaw() {
                return this.dataQueue.dequeue();
            }
            readInt() {
                return parseInt(this.dataQueue.dequeue(), 10);
            }
            clearInput() {
                this.dataQueue.clear();
            }
        };
    },
    function(module, exports, requireModule) {
        "use strict";
        module.exports = class DataQueue {
            constructor(initialElements = []) {
                this.items = initialElements;
                this.readIndex = 0;
            }
            enqueue(elementToAdd) {
                this.items.push(elementToAdd);
            }
            dequeue() {
                if (this.readIndex >= this.items.length) {
                    return undefined;
                }
                const dequeuedItem = this.items[this.readIndex];
                this.readIndex += 1;
                return dequeuedItem;
            }
            clear() {
                this.items = [];
                this.readIndex = 0;
            }
            get currentSize() {
                return this.items.length - this.readIndex;
            }
            get isEmpty() {
                return this.currentSize === 0;
            }
        };
    },
    function(module, exports, requireModule) {
        "use strict";

        function runBFS(startNodeIndex, adjacencyList, nodeStateArray, distanceKey, visitedKey) {
            nodeStateArray[startNodeIndex][visitedKey] = 1;
            nodeStateArray[startNodeIndex][distanceKey] = 0;

            const bfsQueue = [{ node: startNodeIndex, dist: 0 }];
            let queueReadPointer = 0;

            while (queueReadPointer < bfsQueue.length) {
                const currentNode = bfsQueue[queueReadPointer++];
                const neighbors = adjacencyList[currentNode.node];

                for (let i = 0; i < neighbors.length; i++) {
                    const neighborNode = neighbors[i];
                    if (nodeStateArray[neighborNode][visitedKey] !== 1) {
                        nodeStateArray[neighborNode][visitedKey] = 1;
                        nodeStateArray[neighborNode][distanceKey] = currentNode.dist + 1;
                        bfsQueue.push({ node: neighborNode, dist: currentNode.dist + 1 });
                    }
                }
            }
        }

        module.exports = function(reader) {
            const nodeCount = reader.readInt();
            const targetNodeIdx = reader.readInt() - 1;
            const agentNodeIdx = reader.readInt() - 1;

            const adjacencyList = Array.from({ length: nodeCount }, () => []);
            const nodeStateArray = Array.from({ length: nodeCount }, () => ({
                visitedByTarget: 0,
                visitedByAgent: 0,
                distanceToTarget: -1,
                distanceToAgent: -1
            }));

            for (let edgeIndex = 0; edgeIndex < nodeCount - 1; edgeIndex++) {
                const nodeA = reader.readInt() - 1;
                const nodeB = reader.readInt() - 1;
                adjacencyList[nodeA].push(nodeB);
                adjacencyList[nodeB].push(nodeA);
            }

            runBFS(agentNodeIdx, adjacencyList, nodeStateArray, "distanceToAgent", "visitedByAgent");
            runBFS(targetNodeIdx, adjacencyList, nodeStateArray, "distanceToTarget", "visitedByTarget");

            let maxAgentAdvantageDistance = 0;
            let minMeetingPointDistance = Number.MAX_SAFE_INTEGER;
            let foundMeetingPoint = false;

            for (let nodeIndex = 0; nodeIndex < nodeCount; nodeIndex++) {
                const currentAgentDistance = nodeStateArray[nodeIndex].distanceToAgent;
                const currentTargetDistance = nodeStateArray[nodeIndex].distanceToTarget;

                if (currentTargetDistance > currentAgentDistance) {
                    maxAgentAdvantageDistance = Math.max(maxAgentAdvantageDistance, currentTargetDistance);
                }
                if (currentTargetDistance === currentAgentDistance) {
                    foundMeetingPoint = true;
                    minMeetingPointDistance = Math.min(minMeetingPointDistance, currentTargetDistance);
                }
            }

            const finalCalculatedResult = foundMeetingPoint ?
                Math.max(maxAgentAdvantageDistance, minMeetingPointDistance) :
                maxAgentAdvantageDistance;

            console.log(finalCalculatedResult);
        };
    }
]);
