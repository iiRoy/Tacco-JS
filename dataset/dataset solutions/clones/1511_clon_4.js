function processNumericalInput(entryData) {
    const cleanEntry = entryData.trim();
    const primaryValue = parseInt(cleanEntry, 10);

    const upperBoundary = primaryValue - 1;
    let aggregateSum = 0;

    for (let factor = 1; factor <= upperBoundary; factor++) {
        aggregateSum += Math.floor(upperBoundary / factor);
    }

    console.log(aggregateSum);
}

function obtainRawContent() {
    return require("fs").readFileSync("/dev/stdin", "utf8");
}

processNumericalInput(obtainRawContent());