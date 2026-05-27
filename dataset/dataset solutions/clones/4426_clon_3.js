const NODE_NOT_VISITED_FLAG = -1;
const INITIAL_DISTANCE_VALUE = 0;
const STDIN_FILE_PATH = "/dev/stdin";
const UTF8_ENCODING = "UTF-8";
const ARRAY_DESTRUCTURE_LENGTH_TWO = 2;
const ARRAY_DESTRUCTURE_LENGTH_THREE = 3;

module.exports = function(modulesArray) {
    var moduleCache = {};

    function moduleLoader(moduleId) {
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }
        var moduleObject = moduleCache[moduleId] = {
            i: moduleId,
            l: false,
            exports: {}
        };
        modulesArray[moduleId].call(moduleObject.exports, moduleObject, moduleObject.exports, moduleLoader);
        moduleObject.l = true;
        return moduleObject.exports;
    }

    moduleLoader.m = modulesArray;
    moduleLoader.c = moduleCache;

    function defineModuleProperty(targetObject, propertyName, getterFunction) {
        const hasProperty = moduleLoader.o(targetObject, propertyName);
        if (!hasProperty) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true,
                get: getterFunction
            });
        }
    }
    moduleLoader.d = defineModuleProperty;

    function setModuleEsModuleFlags(exportsObject) {
        const hasSymbolSupport = typeof Symbol !== "undefined";
        const hasToStringTagSymbol = hasSymbolSupport && Symbol.toStringTag;

        if (hasToStringTagSymbol) {
            Object.defineProperty(exportsObject, Symbol.toStringTag, {
                value: "Module"
            });
        }
        Object.defineProperty(exportsObject, "__esModule", {
            value: true
        });
    }
    moduleLoader.r = setModuleEsModuleFlags;

    function interopRequireWildcard(moduleIdOrValue, modeFlags) {
        let moduleResult = moduleIdOrValue;
        const isModuleIdFlag = (modeFlags & 1);

        if (isModuleIdFlag) {
            moduleResult = moduleLoader(moduleIdOrValue);
        }

        const isDirectReturnFlag = (modeFlags & 8);
        if (isDirectReturnFlag) {
            return moduleResult;
        }

        const isEsModuleFlag = (modeFlags & 4);
        const isObjectAndEsModule = isEsModuleFlag && typeof moduleResult === "object" && moduleResult && moduleResult.__esModule;
        if (isObjectAndEsModule) {
            return moduleResult;
        }

        var newModuleObject = Object.create(null);
        moduleLoader.r(newModuleObject);
        Object.defineProperty(newModuleObject, "default", {
            enumerable: true,
            value: moduleResult
        });

        const isNotStringModule = typeof moduleResult !== "string";
        const shouldCopyPropertiesFlag = (modeFlags & 2);
        if (shouldCopyPropertiesFlag && isNotStringModule) {
            for (var propKey in moduleResult) {
                const propertyGetter = (function(key) {
                    return moduleResult[key];
                }).bind(null, propKey);
                moduleLoader.d(newModuleObject, propKey, propertyGetter);
            }
        }
        return newModuleObject;
    }
    moduleLoader.t = interopRequireWildcard;

    function interopRequireDefault(moduleExports) {
        const isEsModule = moduleExports && moduleExports.__esModule;
        const defaultExportGetter = isEsModule ?
            function() {
                return moduleExports.default;
            } :
            function() {
                return moduleExports;
            };
        moduleLoader.d(defaultExportGetter, "a", defaultExportGetter);
        return defaultExportGetter;
    }
    moduleLoader.n = interopRequireDefault;

    moduleLoader.o = function(targetObject, propertyName) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
    };
    moduleLoader.p = "";

    return moduleLoader(moduleLoader.s = 0);
}([
    function(module, exports, requireModule) {
        const fileSystemModule = requireModule(2);
        const rawFileContent = fileSystemModule.readFileSync(STDIN_FILE_PATH, UTF8_ENCODING);
        const inputLinesArray = rawFileContent.split("\n");
        requireModule(1)(inputLinesArray);
    },
    function(module, exports, requireModule) {
        "use strict";

        function destructureArray(iterableInput, expectedLength) {
            if (Array.isArray(iterableInput)) {
                return iterableInput;
            }

            var collectedElements = [];
            var iterationCompleted = false;
            var encounteredError = false;
            var caughtErrorValue = undefined;

            try {
                for (var iterator = iterableInput[Symbol.iterator](); !(iterationCompleted = (iterator.next()).done) && (collectedElements.push(iterator.value), !expectedLength || collectedElements.length !== expectedLength); iterationCompleted = true) {}
            } catch (err) {
                encounteredError = true;
                caughtErrorValue = err;
            } finally {
                try {
                    if (!iterationCompleted && iterator.return != null) {
                        iterator.return();
                    }
                } finally {
                    if (encounteredError) {
                        throw caughtErrorValue;
                    }
                }
            }
            return collectedElements;
        }

        module.exports = function(inputLines) {
            const nodeCount = Number(inputLines[0]);
            const adjacencyList = Array.from({
                length: nodeCount
            }, () => []);

            const configLineIndex = nodeCount;
            const configLineString = inputLines[configLineIndex];
            const configLineNumbers = configLineString.split(" ").map(Number);
            const [queryCount, initialNodeOneBased] = destructureArray(configLineNumbers, ARRAY_DESTRUCTURE_LENGTH_TWO);
            const initialNodeZeroBased = initialNodeOneBased - 1;

            const edgeDataLinesEndIndex = nodeCount - 1;
            for (let edgeIndex = 0; edgeIndex < edgeDataLinesEndIndex; edgeIndex++) {
                const currentEdgeLine = inputLines[edgeIndex + 1];
                const edgeNumericParts = currentEdgeLine.split(" ").map(Number);
                const [nodeA_oneBased, nodeB_oneBased, edgeCost] = destructureArray(edgeNumericParts, ARRAY_DESTRUCTURE_LENGTH_THREE);

                const nodeA_zeroBased = nodeA_oneBased - 1;
                const nodeB_zeroBased = nodeB_oneBased - 1;

                const isNodeBNotInitial = (nodeB_oneBased !== initialNodeOneBased);
                if (isNodeBNotInitial) {
                    adjacencyList[nodeA_zeroBased].push({
                        v: nodeB_zeroBased,
                        c: edgeCost
                    });
                }

                const isNodeANotInitial = (nodeA_oneBased !== initialNodeOneBased);
                if (isNodeANotInitial) {
                    adjacencyList[nodeB_zeroBased].push({
                        v: nodeA_zeroBased,
                        c: edgeCost
                    });
                }
            }

            const nodeDistances = new Array(nodeCount).fill(NODE_NOT_VISITED_FLAG);
            const traversalStack = [{
                v: initialNodeZeroBased,
                s: INITIAL_DISTANCE_VALUE
            }];

            while (traversalStack.length > 0) {
                const currentNodeData = traversalStack.pop();
                const currentVertex = currentNodeData.v;
                const currentPathSum = currentNodeData.s;

                const neighborsOfCurrent = adjacencyList[currentVertex];
                const numberOfNeighbors = neighborsOfCurrent.length;

                for (let neighborIndex = 0; neighborIndex < numberOfNeighbors; neighborIndex++) {
                    const neighborEdgeDetails = neighborsOfCurrent[neighborIndex];
                    const neighborVertex = neighborEdgeDetails.v;
                    const costToNeighbor = neighborEdgeDetails.c;

                    const hasNeighborBeenVisited = (nodeDistances[neighborVertex] !== NODE_NOT_VISITED_FLAG);
                    if (!hasNeighborBeenVisited) {
                        const newCalculatedDistance = currentPathSum + costToNeighbor;
                        nodeDistances[neighborVertex] = newCalculatedDistance;
                        traversalStack.push({
                            v: neighborVertex,
                            s: newCalculatedDistance
                        });
                    }
                }
            }

            const queriesStartIndex = nodeCount + 1;
            for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
                const currentQueryLine = inputLines[queryIndex + queriesStartIndex];
                const queryNodesNumericParts = currentQueryLine.split(" ").map(Number);
                const [firstQueryNodeOneBased, secondQueryNodeOneBased] = destructureArray(queryNodesNumericParts, ARRAY_DESTRUCTURE_LENGTH_TWO);

                const firstNodeZeroBased = firstQueryNodeOneBased - 1;
                const secondNodeZeroBased = secondQueryNodeOneBased - 1;

                const distanceToFirstNode = nodeDistances[firstNodeZeroBased];
                const distanceToSecondNode = nodeDistances[secondNodeZeroBased];

                const totalPathSumForQuery = distanceToFirstNode + distanceToSecondNode;
                console.log(totalPathSumForQuery);
            }
        };
    },
    function(module, exports) {
        module.exports = require("fs");
    }
]);
