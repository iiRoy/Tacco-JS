const processInput = (rawInput) => {
    const lines = rawInput.trim().split('\n');
    const firstLineNumbers = lines[0].match(/\d+/g).map(Number);
    return {
        factorA: firstLineNumbers[0],
        divisorB: firstLineNumbers[1],
        upperBoundN: firstLineNumbers[2]
    };
};

const computeValue = (a, b, x) => Math.floor(a * x / b) - a * Math.floor(x / b);

function Solution(inputData) {
    const { factorA, divisorB, upperBoundN } = processInput(inputData);

    let finalOutcome = 0;
    const maxIterations = 31;

    const potentialCounts = Array.from(
        { length: Math.min(Math.max(0, upperBoundN), maxIterations) },
        (_, index) => upperBoundN - index
    );

    const firstPositiveCount = potentialCounts.find(currentCount => {
        const currentComputedValue = computeValue(factorA, divisorB, currentCount);
        return currentComputedValue > 0;
    });

    if (firstPositiveCount !== undefined) {
        finalOutcome = computeValue(factorA, divisorB, firstPositiveCount);
    }

    console.log(finalOutcome);
}

Solution(require("fs").readFileSync("/dev/stdin", "utf8"));
