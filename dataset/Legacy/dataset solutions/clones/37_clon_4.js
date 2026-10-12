const fileSystem = require("fs");
const rawInput = fileSystem.readFileSync("/dev/stdin", "utf8");
const lineData = rawInput.trim().split("\n");

lineData.forEach(currentLine => {
    const upperBoundary = Number(currentLine);
    const nonPrimeRegistry = new Set();

    if (upperBoundary >= 0) {
        nonPrimeRegistry.add(0);
    }
    if (upperBoundary >= 1) {
        nonPrimeRegistry.add(1);
    }

    for (let currentFactor = 2; currentFactor * currentFactor <= upperBoundary; currentFactor++) {
        if (!nonPrimeRegistry.has(currentFactor)) {
            for (let currentMultiple = currentFactor * currentFactor; currentMultiple <= upperBoundary; currentMultiple += currentFactor) {
                nonPrimeRegistry.add(currentMultiple);
            }
        }
    }

    const totalPrimeCount = Array.from({ length: upperBoundary + 1 }, (_, index) => index)
        .filter(numberCandidate => numberCandidate >= 2 && !nonPrimeRegistry.has(numberCandidate))
        .length;

    console.log(totalPrimeCount);
});
