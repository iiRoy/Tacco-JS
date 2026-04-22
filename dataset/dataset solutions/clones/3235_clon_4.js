function calculateMetrics(sourceString) {
    const extractedNumbers = sourceString.match(/\d+/g).map(Number);

    const universeCapacity = extractedNumbers[0];
    const groupOneSize = extractedNumbers[1];
    const groupTwoSize = extractedNumbers[2];

    const minimumGroupSize = (groupOneSize < groupTwoSize) ? groupOneSize : groupTwoSize;

    const aggregateSize = groupOneSize + groupTwoSize;
    const excessBeyondCapacity = aggregateSize - universeCapacity;
    
    // This calculates Math.max(0, excessBeyondCapacity)
    const requiredOverlap = excessBeyondCapacity * (excessBeyondCapacity > 0);

    console.log(`${minimumGroupSize} ${requiredOverlap}`);
}

calculateMetrics(require("fs").readFileSync("/dev/stdin", "utf8"));