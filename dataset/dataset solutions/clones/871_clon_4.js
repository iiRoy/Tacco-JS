function Main(inputData) {
    "use strict";

    const outputWriter = console.log;
    const dataParser = new InputScanner(inputData, " \n");

    const nodeCount = dataParser.fetchInteger();
    const edgeCount = dataParser.fetchInteger();

    const adjacencyLists = new Map(); // Map<number, number[]>
    const edgeWeightMap = new Map(); // Map<number, Map<number, number>>
    const incomingEdgeCounts = new Map(); // Map<number, number>
    const allGraphNodes = new Set(); // To keep track of all nodes present in edges or explicitly initialized

    for (let i = 0; i < nodeCount; i++) {
        adjacencyLists.set(i, []);
        edgeWeightMap.set(i, new Map());
        incomingEdgeCounts.set(i, 0);
        allGraphNodes.add(i);
    }

    for (let k = 0; k < edgeCount; k++) {
        const sourceNode = dataParser.fetchInteger();
        const targetNode = dataParser.fetchInteger();
        const weightValue = dataParser.fetchInteger();

        adjacencyLists.get(sourceNode).push(targetNode);
        edgeWeightMap.get(sourceNode).set(targetNode, weightValue);
        incomingEdgeCounts.set(targetNode, (incomingEdgeCounts.get(targetNode) || 0) + 1);
        allGraphNodes.add(sourceNode);
        allGraphNodes.add(targetNode);
    }

    const processingQueue = [];
    for (const nodeIdentifier of allGraphNodes) {
        if ((incomingEdgeCounts.get(nodeIdentifier) || 0) === 0) {
            processingQueue.push(nodeIdentifier);
        }
    }

    const sortedNodes = [];
    let queueIndex = 0;
    while (queueIndex < processingQueue.length) {
        const currentVertex = processingQueue[queueIndex++];
        sortedNodes.push(currentVertex);

        for (const neighborVertex of adjacencyLists.get(currentVertex) || []) {
            incomingEdgeCounts.set(neighborVertex, incomingEdgeCounts.get(neighborVertex) - 1);
            if (incomingEdgeCounts.get(neighborVertex) === 0) {
                processingQueue.push(neighborVertex);
            }
        }
    }

    const longestPathValues = new Map(); // Map<number, number>
    for (const nodeIdentifier of allGraphNodes) {
        longestPathValues.set(nodeIdentifier, 0);
    }

    for (let i = sortedNodes.length - 1; i >= 0; i--) {
        const currentVertex = sortedNodes[i];
        let currentMaxExtension = 0;

        const outgoingEdges = adjacencyLists.get(currentVertex);
        if (outgoingEdges && outgoingEdges.length > 0) {
            for (const nextVertex of outgoingEdges) {
                const edgeWeight = edgeWeightMap.get(currentVertex).get(nextVertex);
                const pathFromNext = longestPathValues.get(nextVertex);
                currentMaxExtension = Math.max(currentMaxExtension, edgeWeight + pathFromNext);
            }
        }
        longestPathValues.set(currentVertex, currentMaxExtension);
    }

    outputWriter(longestPathValues.get(0) || 0);
}

const InputScanner = (function() {
    function* tokenStreamGenerator(textSource, delimiterChars) {
        const delimiterRegex = new RegExp(`[${delimiterChars.split('').map(d => `\\${d}`).join('')}]+`, 'g');
        let lastMatchEnd = 0;
        let currentMatch;
        while ((currentMatch = delimiterRegex.exec(textSource)) !== null) {
            const extractedToken = textSource.substring(lastMatchEnd, currentMatch.index).trim();
            if (extractedToken !== "") {
                yield extractedToken;
            }
            lastMatchEnd = delimiterRegex.lastIndex;
        }
        const finalToken = textSource.substring(lastMatchEnd).trim();
        if (finalToken !== "") {
            yield finalToken;
        }
    }

    function InputScanner(sourceText, tokenSeparator) {
        this.tokenIterator = tokenStreamGenerator(sourceText.replace(/\r/g, ''), tokenSeparator);
        this.cachedToken = null;
        this.advanceCursor();
    }

    InputScanner.prototype = {
        advanceCursor: function() {
            const iterationResult = this.tokenIterator.next();
            this.cachedToken = iterationResult.done ? null : iterationResult.value;
            return !iterationResult.done;
        },
        hasRemaining: function() {
            return this.cachedToken !== null;
        },
        fetch: function() {
            if (this.cachedToken === null) {
                throw new RangeError("No more input tokens.");
            }
            const tokenValue = this.cachedToken;
            this.advanceCursor();
            return tokenValue;
        },
        fetchNumber: function() {
            const stringValue = this.fetch();
            const numericValue = Number(stringValue);
            if (isNaN(numericValue)) {
                throw new TypeError(`'${stringValue}' cannot be converted to a number.`);
            }
            return numericValue;
        },
        fetchInteger: function(base = 10) {
            const numericValue = this.fetchNumber();
            if (!Number.isInteger(numericValue)) {
                throw new TypeError(`'${numericValue}' is not an integer.`);
            }
            return numericValue;
        }
    };

    return InputScanner;
}());

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
