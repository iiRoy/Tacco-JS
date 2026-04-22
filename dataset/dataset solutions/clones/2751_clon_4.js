class DataStreamProcessor {
    #lineBuffer;
    #currentLinePosition;
    #segmentCache;

    constructor(sourceData) {
        this.#lineBuffer = sourceData.trim().split("\n");
        this.#currentLinePosition = 0;
        this.#segmentCache = [];
    }

    pullNumericValue(asString = false) {
        if (this.#segmentCache.length === 0) {
            if (this.#currentLinePosition >= this.#lineBuffer.length) {
                return undefined;
            }
            this.#segmentCache = this.#lineBuffer[this.#currentLinePosition].split(" ");
        }
        const value = this.#segmentCache.pop();
        if (this.#segmentCache.length === 0) {
            this.#currentLinePosition++;
        }
        return asString ? value : Number(value);
    }

    pullLineValues(asStrings = false) {
        if (this.#currentLinePosition >= this.#lineBuffer.length) {
            return undefined;
        }
        this.#segmentCache = [];
        const parts = this.#lineBuffer[this.#currentLinePosition++].split(" ");
        return asStrings ? parts : parts.map(Number);
    }

    pullMatrixValues(lineCount, asStrings = false) {
        const collectedRows = [];
        for (let i = 0; i < lineCount; i++) {
            if (this.#currentLinePosition >= this.#lineBuffer.length) {
                break;
            }
            this.#segmentCache = [];
            collectedRows.push(this.#lineBuffer[this.#currentLinePosition++].split(" "));
        }
        return asStrings ? collectedRows : collectedRows.map(row => row.map(Number));
    }

    pullRawTextLines(lineCount, asStrings = false) {
        const collectedLines = [];
        for (let i = 0; i < lineCount; i++) {
            if (this.#currentLinePosition >= this.#lineBuffer.length) {
                break;
            }
            this.#segmentCache = [];
            collectedLines.push(this.#lineBuffer[this.#currentLinePosition++]);
        }
        return asStrings ? collectedLines : collectedLines.map(Number);
    }
}

const DataAcquisition = (sourceText) => new DataStreamProcessor(sourceText);

function generateMultiArray(initialContent, ...dimensions) {
    if (dimensions.length === 0) {
        return initialContent;
    }
    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);

    return Array.from({ length: currentDimensionSize }, () =>
        generateMultiArray(initialContent, ...remainingDimensions)
    );
}

class ComponentOrganizer {
    #parentOrSizeArray;

    constructor(maximumIndex) {
        this.#parentOrSizeArray = Array(maximumIndex + 1).fill(-1);
    }

    locateRepresentative(elementIndex) {
        if (this.#parentOrSizeArray[elementIndex] < 0) {
            return elementIndex;
        }
        return this.#parentOrSizeArray[elementIndex] = this.locateRepresentative(this.#parentOrSizeArray[elementIndex]);
    }

    areElementsUnified(itemX, itemY) {
        return this.locateRepresentative(itemX) === this.locateRepresentative(itemY);
    }

    unifyElements(itemX, itemY) {
        let rootX = this.locateRepresentative(itemX);
        let rootY = this.locateRepresentative(itemY);

        if (rootX === rootY) {
            return 0;
        }

        if (this.#parentOrSizeArray[rootY] <= this.#parentOrSizeArray[rootX]) {
            this.#parentOrSizeArray[rootY] += this.#parentOrSizeArray[rootX];
            this.#parentOrSizeArray[rootX] = rootY;
        } else {
            this.#parentOrSizeArray[rootX] += this.#parentOrSizeArray[rootY];
            this.#parentOrSizeArray[rootY] = rootX;
        }
        return 1;
    }

    getComponentSize(elementIndex) {
        return -this.#parentOrSizeArray[this.locateRepresentative(elementIndex)];
    }
}

let directionalAssignments;
let nodeFlipStates;
let supplementaryConnections;
let totalNodesInNetwork;

function traverseAndAdjust(currentVertex, parentVertex) {
    for (const adjacentVertex of supplementaryConnections[currentVertex]) {
        if (adjacentVertex === parentVertex) {
            continue;
        }
        traverseAndAdjust(adjacentVertex, currentVertex);
    }

    if (parentVertex === 0) {
        return;
    }

    if (nodeFlipStates[currentVertex]) {
        directionalAssignments.push(`${currentVertex} ${parentVertex}`);
    } else {
        directionalAssignments.push(`${parentVertex} ${currentVertex}`);
        nodeFlipStates[parentVertex] = 1 - nodeFlipStates[parentVertex];
    }
}

function processNetworkTopology() {
    const dataStream = DataAcquisition(require("fs").readFileSync("/dev/stdin", "utf8"));

    totalNodesInNetwork = dataStream.pullNumericValue();
    const totalLinkCount = dataStream.pullNumericValue();

    if (totalLinkCount % 2 !== 0) {
        return -1;
    }

    const componentHandler = new ComponentOrganizer(totalNodesInNetwork);
    directionalAssignments = [];
    supplementaryConnections = generateMultiArray([], totalNodesInNetwork + 1);
    nodeFlipStates = generateMultiArray(0, totalNodesInNetwork + 1);

    const allNetworkLinks = dataStream.pullMatrixValues(totalLinkCount);

    for (let k = 0; k < totalLinkCount; k++) {
        const [endpointA, endpointB] = allNetworkLinks[k];
        if (componentHandler.unifyElements(endpointA, endpointB)) {
            directionalAssignments.push(`${endpointA} ${endpointB}`);
            nodeFlipStates[endpointA] = 1 - nodeFlipStates[endpointA];
        } else {
            supplementaryConnections[endpointA].push(endpointB);
            supplementaryConnections[endpointB].push(endpointA);
        }
    }

    traverseAndAdjust(1, 0);

    return directionalAssignments.join("\n");
}

console.log(processNetworkTopology());