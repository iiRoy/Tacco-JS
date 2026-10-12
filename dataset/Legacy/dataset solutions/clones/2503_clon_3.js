module.exports = (function(moduleDefinitions) {
    const moduleCache = {};

    function loadModule(moduleId) {
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }

        const currentModule = moduleCache[moduleId] = {
            i: moduleId,
            l: false,
            exports: {}
        };

        moduleDefinitions[moduleId].call(currentModule.exports, currentModule, currentModule.exports, loadModule);
        currentModule.l = true;
        return currentModule.exports;
    }

    loadModule.moduleMap = moduleDefinitions;
    loadModule.cache = moduleCache;

    loadModule.defineGetter = function(target, property, getterFunction) {
        if (!loadModule.hasOwn(target, property)) {
            Object.defineProperty(target, property, {
                enumerable: true,
                get: getterFunction
            });
        }
    };

    loadModule.registerModule = function(targetModule) {
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(targetModule, Symbol.toStringTag, {
                value: 'Module'
            });
        }
        Object.defineProperty(targetModule, '__esModule', {
            value: true
        });
    };

    loadModule.interopRequire = function(moduleValue, flags) {
        if (flags & 1) {
            moduleValue = loadModule(moduleValue);
        }
        if (flags & 8) {
            return moduleValue;
        }
        if (flags & 4 && typeof moduleValue === 'object' && moduleValue && moduleValue.__esModule) {
            return moduleValue;
        }
        const newModuleObject = Object.create(null);
        loadModule.registerModule(newModuleObject);
        Object.defineProperty(newModuleObject, 'default', {
            enumerable: true,
            value: moduleValue
        });
        if (flags & 2 && typeof moduleValue !== 'string') {
            for (const key in moduleValue) {
                loadModule.defineGetter(newModuleObject, key, ((k) => moduleValue[k]).bind(null, key));
            }
        }
        return newModuleObject;
    };

    loadModule.createDefaultExport = function(moduleRef) {
        const defaultExportGetter = moduleRef && moduleRef.__esModule ?
            () => moduleRef.default :
            () => moduleRef;
        loadModule.defineGetter(defaultExportGetter, "a", defaultExportGetter);
        return defaultExportGetter;
    };

    loadModule.hasOwn = function(object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
    };

    loadModule.publicPath = "";

    // --- Module Definitions (renamed and refactored) ---

    // Module 0: Entry point
    moduleDefinitions[0] = function(currentModule, exports, requireModule) {
        "use strict";
        const fileSystem = requireModule(1);
        const mainSolver = requireModule(2);

        const readInputFromFile = (filePath, encoding) => fileSystem.readFileSync(filePath, encoding);
        const inputContent = readInputFromFile("/dev/stdin", "utf8");

        mainSolver(inputContent);
    };

    // Module 1: fs module
    moduleDefinitions[1] = function(currentModule, exports) {
        currentModule.exports = require("fs");
    };

    // Module 2: Main application logic orchestrator
    moduleDefinitions[2] = function(currentModule, exports, requireModule) {
        "use strict";
        const InputProcessor = requireModule(3);
        const GraphSolver = requireModule(5);

        currentModule.exports = function(inputString) {
            const inputReaderInstance = new InputProcessor(inputString);
            GraphSolver(inputReaderInstance);
        };
    };

    // Module 3: InputProcessor Class
    moduleDefinitions[3] = function(currentModule, exports, requireModule) {
        "use strict";
        const TokenQueue = requireModule(4);

        currentModule.exports = class InputProcessor {
            constructor(rawInputString) {
                const tokens = rawInputString.trim().split(/\s+/g);
                this.tokenQueue = new TokenQueue(tokens);
            }

            readNextRaw() {
                return this.tokenQueue.dequeue();
            }

            readNextInt() {
                return parseInt(this.tokenQueue.dequeue(), 10);
            }

            clearInputBuffer() {
                this.tokenQueue.reset();
            }
        };
    };

    // Module 4: TokenQueue Class (Queue implementation)
    moduleDefinitions[4] = function(currentModule, exports) {
        "use strict";
        currentModule.exports = class TokenQueue {
            constructor(initialElements = []) {
                this.itemCount = initialElements.length;
                this.dataStore = initialElements;
                this.headIndex = 0;
            }

            enqueue(item) {
                this.itemCount += 1;
                this.dataStore.push(item);
            }

            dequeue() {
                if (this.headIndex >= this.dataStore.length) { // Guard clause for empty queue
                    return undefined;
                }
                const item = this.dataStore[this.headIndex];
                this.itemCount -= 1;
                this.headIndex += 1;
                return item;
            }

            reset() {
                this.dataStore = [];
                this.itemCount = 0;
                this.headIndex = 0;
            }
        };
    };

    // Module 5: Graph Solver Logic
    moduleDefinitions[5] = function(currentModule, exports, requireModule) {
        "use strict";
        const floydWarshallAlgorithm = requireModule(6);

        currentModule.exports = function(inputReader) {
            const INFINITY_VALUE = 99999999999;

            const numNodes = inputReader.readNextInt();
            const numEdges = inputReader.readNextInt();
            const maxPathLength = inputReader.readNextInt();

            const createSquareMatrix = (size, fillValue) => {
                const matrix = new Array(size);
                for (let i = 0; i < size; i++) {
                    matrix[i] = new Array(size).fill(fillValue);
                }
                return matrix;
            };

            let adjacencyMatrix = createSquareMatrix(numNodes, INFINITY_VALUE);

            for (let i = 0; i < numNodes; i++) {
                adjacencyMatrix[i][i] = 0; // Distance to self is 0
            }

            for (let edgeIndex = 0; edgeIndex < numEdges; edgeIndex++) {
                const startNode = inputReader.readNextInt();
                const endNode = inputReader.readNextInt();
                const edgeWeight = inputReader.readNextInt();
                adjacencyMatrix[startNode - 1][endNode - 1] = edgeWeight;
                adjacencyMatrix[endNode - 1][startNode - 1] = edgeWeight;
            }

            const initialPathsMatrix = floydWarshallAlgorithm(adjacencyMatrix);

            const transformedAdjacencyMatrix = createSquareMatrix(numNodes, INFINITY_VALUE);
            for (let row = 0; row < numNodes; row++) {
                for (let col = 0; col < numNodes; col++) {
                    if (initialPathsMatrix[row][col] <= maxPathLength) {
                        transformedAdjacencyMatrix[row][col] = 1;
                    }
                }
            }

            const finalPathsMatrix = floydWarshallAlgorithm(transformedAdjacencyMatrix);

            const numQueries = inputReader.readNextInt();
            const queryResults = [];

            for (let queryIndex = 0; queryIndex < numQueries; queryIndex++) {
                const queryStartNode = inputReader.readNextInt();
                const queryEndNode = inputReader.readNextInt();
                const calculatedPathLength = finalPathsMatrix[queryStartNode - 1][queryEndNode - 1];

                if (calculatedPathLength === INFINITY_VALUE) {
                    queryResults.push(-1);
                } else {
                    queryResults.push(calculatedPathLength - 1);
                }
            }

            console.log(queryResults.join("\n"));
        };
    };

    // Module 6: Floyd-Warshall Algorithm
    moduleDefinitions[6] = function(currentModule, exports) {
        "use strict";
        currentModule.exports = function(graphMatrix) {
            const numVertices = graphMatrix.length;
            const distanceMatrix = [];

            for (let i = 0; i < numVertices; i++) {
                distanceMatrix.push(Array.from(graphMatrix[i]));
            }

            for (let kNode = 0; kNode < numVertices; kNode++) {
                for (let startNode = 0; startNode < numVertices; startNode++) {
                    for (let endNode = 0; endNode < numVertices; endNode++) {
                        const pathThroughK = distanceMatrix[startNode][kNode] + distanceMatrix[kNode][endNode];
                        if (distanceMatrix[startNode][endNode] > pathThroughK) {
                            distanceMatrix[startNode][endNode] = pathThroughK;
                        }
                    }
                }
            }
            return distanceMatrix;
        };
    };

    return loadModule(loadModule.entryModuleId = 0);
})([]);
