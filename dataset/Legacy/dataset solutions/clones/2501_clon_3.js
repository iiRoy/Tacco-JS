module.exports = function(moduleDefinitions) {
    var moduleCache = {};

    function loadModule(moduleId) {
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }

        var moduleObject = moduleCache[moduleId] = {
            id: moduleId,
            loaded: false,
            exports: {}
        };

        moduleDefinitions[moduleId].call(moduleObject.exports, moduleObject, moduleObject.exports, loadModule);

        moduleObject.loaded = true;
        return moduleObject.exports;
    }

    loadModule.moduleDefinitions = moduleDefinitions;
    loadModule.cache = moduleCache;

    loadModule.defineExportProperty = function(targetObject, propertyName, getterFunction) {
        if (!loadModule.hasOwn(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true,
                get: getterFunction
            });
        }
    };

    loadModule.markAsEsModule = function(exportsObject) {
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exportsObject, Symbol.toStringTag, {
                value: 'Module'
            });
        }
        Object.defineProperty(exportsObject, '__esModule', {
            value: true
        });
    };

    loadModule.createNamespaceObject = function(value, mode) {
        if (mode & 1) {
            value = loadModule(value);
        }
        if (mode & 8) {
            return value;
        }
        if (mode & 4 && typeof value === 'object' && value && value.__esModule) {
            return value;
        }

        var namespaceObject = Object.create(null);
        loadModule.markAsEsModule(namespaceObject);
        Object.defineProperty(namespaceObject, 'default', {
            enumerable: true,
            value: value
        });

        if (mode & 2 && typeof value !== 'string') {
            for (var key in value) {
                loadModule.defineExportProperty(namespaceObject, key, (function(prop) {
                    return function() {
                        return value[prop];
                    };
                }).bind(null, key));
            }
        }
        return namespaceObject;
    };

    loadModule.getModuleExports = function(moduleExports) {
        var getter = moduleExports && moduleExports.__esModule ?
            function() {
                return moduleExports.default;
            } :
            function() {
                return moduleExports;
            };
        loadModule.defineExportProperty(getter, 'a', getter);
        return getter;
    };

    loadModule.hasOwn = function(object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
    };

    loadModule.publicPath = "";

    return loadModule(loadModule.s = 0);
}([
    function(module, exports, requireModule) {
        "use strict";
        var fsModule = requireModule(1);
        var processInput = requireModule(2);

        const STD_IN_PATH = "/dev/stdin";

        processInput(fsModule.readFileSync(STD_IN_PATH, "utf8"));
    },
    function(module, exports) {
        module.exports = require("fs");
    },
    function(module, exports, requireModule) {
        "use strict";
        var InputReaderClass = requireModule(3);
        var solveFunction = requireModule(5);

        module.exports = function(inputString) {
            var readerInstance = new InputReaderClass(inputString);
            solveFunction(readerInstance);
        };
    },
    function(module, exports, requireModule) {
        "use strict";
        var QueueClass = requireModule(4);

        module.exports = class InputReader {
            constructor(rawInput) {
                var tokens = rawInput.trim().split(/\s+/g);
                this.inputQueue = new QueueClass(tokens);
            }

            readNextRaw() {
                return this.inputQueue.dequeue();
            }

            readNextInt() {
                const token = this.inputQueue.dequeue();
                return parseInt(token, 10);
            }

            finalizeInput() {
                this.inputQueue.clear();
            }
        };
    },
    function(module, exports, requireModule) {
        "use strict";
        module.exports = class Queue {
            constructor(initialItems = []) {
                this.items = initialItems;
                this.currentSize = initialItems.length;
                this.currentIndex = 0;
            }

            enqueue(item) {
                this.currentSize += 1;
                this.items.push(item);
            }

            dequeue() {
                var dequeuedItem = this.items[this.currentIndex];
                this.currentSize -= 1;
                this.currentIndex += 1;
                return dequeuedItem;
            }

            clear() {
                this.items = [];
                this.currentSize = 0;
                this.currentIndex = 0;
            }
        };
    },
    function(module, exports, requireModule) {
        "use strict";
        var floydWarshallAlgorithm = requireModule(6);

        const INFINITY_DIST = 9999999999;

        function createMatrix(rows, cols, initialValue) {
            const matrix = new Array(rows);
            for (let r = 0; r < rows; r++) {
                matrix[r] = new Array(cols).fill(initialValue);
            }
            return matrix;
        }

        const toZeroIndexed = (node) => node - 1;

        module.exports = function(inputReader) {
            const numNodes = inputReader.readNextInt();
            const numEdges = inputReader.readNextInt();
            const maxPathLength = inputReader.readNextInt();

            let adjMatrix = createMatrix(numNodes, numNodes, INFINITY_DIST);

            for (let nodeIdx = 0; nodeIdx < numNodes; nodeIdx++) {
                adjMatrix[nodeIdx][nodeIdx] = 0;
            }

            for (let edgeIdx = 0; edgeIdx < numEdges; edgeIdx++) {
                const nodeA = toZeroIndexed(inputReader.readNextInt());
                const nodeB = toZeroIndexed(inputReader.readNextInt());
                const weight = inputReader.readNextInt();

                adjMatrix[nodeA][nodeB] = weight;
                adjMatrix[nodeB][nodeA] = weight;
            }

            const shortestPaths1 = floydWarshallAlgorithm(adjMatrix);

            let thresholdMatrix = createMatrix(numNodes, numNodes, INFINITY_DIST);
            for (let rowIdx = 0; rowIdx < numNodes; rowIdx++) {
                for (let colIdx = 0; colIdx < numNodes; colIdx++) {
                    if (shortestPaths1[rowIdx][colIdx] <= maxPathLength) {
                        thresholdMatrix[rowIdx][colIdx] = 1;
                    } else if (rowIdx === colIdx) {
                        thresholdMatrix[rowIdx][colIdx] = 0;
                    }
                }
            }

            const shortestPaths2 = floydWarshallAlgorithm(thresholdMatrix);

            const numQueries = inputReader.readNextInt();
            for (let queryIdx = 0; queryIdx < numQueries; queryIdx++) {
                const queryStartNode = toZeroIndexed(inputReader.readNextInt());
                const queryEndNode = toZeroIndexed(inputReader.readNextInt());

                const resultPathLength = shortestPaths2[queryStartNode][queryEndNode];

                if (resultPathLength === INFINITY_DIST) {
                    console.log(-1);
                } else {
                    console.log(resultPathLength - 1);
                }
            }
        };
    },
    function(module, exports, requireModule) {
        "use strict";

        function deepCloneMatrix(sourceMatrix) {
            const clonedMatrix = [];
            for (let r = 0; r < sourceMatrix.length; r++) {
                clonedMatrix.push(sourceMatrix[r].slice());
            }
            return clonedMatrix;
        }

        module.exports = function(graphMatrix) {
            const matrixSize = graphMatrix.length;
            let distMatrix = deepCloneMatrix(graphMatrix);

            for (let kNode = 0; kNode < matrixSize; kNode++) {
                for (let iNode = 0; iNode < matrixSize; iNode++) {
                    for (let jNode = 0; jNode < matrixSize; jNode++) {
                        const pathThroughK = distMatrix[iNode][kNode] + distMatrix[kNode][jNode];
                        if (distMatrix[iNode][jNode] > pathThroughK) {
                            distMatrix[iNode][jNode] = pathThroughK;
                        }
                    }
                }
            }
            return distMatrix;
        };
    }
]);
