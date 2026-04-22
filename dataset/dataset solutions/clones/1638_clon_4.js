function PositionCounter(sizeLimit) {
    const internalRegister = new Array(sizeLimit + 1).fill(0);
    const capacity = sizeLimit;

    this.adjustValue = function(position, alteration) {
        position++; // Convert to 1-based index for BIT operations
        while (position <= capacity) {
            internalRegister[position] += alteration;
            position += position & (-position);
        }
    };

    this.retrieveSum = function(position) {
        position++; // Convert to 1-based index for BIT operations
        let total = 0;
        while (position > 0) {
            total += internalRegister[position];
            position -= position & (-position);
        }
        return total;
    };

    this.queryRangeDistinct = function(lowerBound, upperBound) {
        return this.retrieveSum(upperBound) - this.retrieveSum(lowerBound - 1);
    };
}

function ProcessSequence(dataStream) {
    const streamLines = dataStream.split("\n");

    const [totalElements, numRequests] = streamLines.shift().split(" ").map(Number);
    const numericCollection = streamLines.shift().split(" ").map(Number);

    const lastKnownPosition = new Map(); // Stores the most recent index for each value
    const priorLocations = new Array(totalElements).fill(-1); // Index of previous occurrence for element at current index

    for (let currentPosition = 0; currentPosition < totalElements; currentPosition++) {
        const itemValue = numericCollection[currentPosition];
        if (lastKnownPosition.has(itemValue)) {
            priorLocations[currentPosition] = lastKnownPosition.get(itemValue);
        }
        lastKnownPosition.set(itemValue, currentPosition);
    }

    const requestsByEndpoint = new Array(totalElements);
    for (let currentPos = 0; currentPos < totalElements; currentPos++) {
        requestsByEndpoint[currentPos] = [];
    }

    const finalResults = new Array(numRequests); // Placeholder for query results

    for (let requestIndex = 0; requestIndex < numRequests; requestIndex++) {
        let [startBoundary, endBoundary] = streamLines[requestIndex].split(" ").map(Number);
        startBoundary--; // Adjust to 0-based index
        endBoundary--;   // Adjust to 0-based index
        requestsByEndpoint[endBoundary].push({ initialBoundary: startBoundary, originalIdentifier: requestIndex });
    }

    const distinctCounter = new PositionCounter(totalElements);

    for (let currentPosition = 0; currentPosition < totalElements; currentPosition++) {
        const previousOccurrenceIndex = priorLocations[currentPosition];

        if (previousOccurrenceIndex !== -1) {
            distinctCounter.adjustValue(previousOccurrenceIndex, -1); // Remove contribution of older occurrence
        }
        distinctCounter.adjustValue(currentPosition, 1); // Add contribution of current (rightmost) occurrence

        // Process all queries that end at the currentPosition
        for (const requestInfo of requestsByEndpoint[currentPosition]) {
            const { initialBoundary, originalIdentifier } = requestInfo;
            const distinctCount = distinctCounter.queryRangeDistinct(initialBoundary, currentPosition);
            finalResults[originalIdentifier] = distinctCount;
        }
    }

    for (let k = 0; k < numRequests; k++) {
        console.log(finalResults[k]);
    }
}

ProcessSequence(require("fs").readFileSync("/dev/stdin", "utf8"));