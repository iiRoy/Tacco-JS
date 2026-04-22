const findIntegerRoot = (value) => {
    if (value < 0n) throw new Error("Argument must be non-negative.");
    if (value === 0n) return 0n;

    let lowerBound = 1n;
    // For inputs a, b < 2^32, their product a*b < 2^64.
    // The square root of a*b is less than 2^32.
    // So, 2^32 is a safe and efficient upper bound for binary search.
    let upperBound = 2n**32n;
    if (value < upperBound) { // If the value itself is smaller, use it as a tighter bound
        upperBound = value;
    }

    let resultRoot = 1n; // Stores the largest integer whose square is <= value

    while (lowerBound <= upperBound) {
        const midPoint = lowerBound + (upperBound - lowerBound) / 2n;
        const midSquare = midPoint * midPoint;

        if (midSquare === value) {
            return midPoint;
        } else if (midSquare < value) {
            resultRoot = midPoint;
            lowerBound = midPoint + 1n;
        } else {
            upperBound = midPoint - 1n;
        }
    }
    return resultRoot;
};

// This function replicates the specific behavior of the original sqrt64:
// It returns ceil(sqrt(N)) if N is not a perfect square, and sqrt(N) if N is a perfect square.
const determineAdjustedRoot = (value) => {
    const floorRoot = findIntegerRoot(value);
    if (floorRoot * floorRoot === value) {
        return floorRoot;
    } else {
        return floorRoot + 1n;
    }
};

const executeProcessing = (inputDataString) => {
    const dataLines = inputDataString.split("\n");
    const operationCount = BigInt(dataLines[0]);

    // Process each query line using a functional array iteration
    Array.from({ length: Number(operationCount) }, (_, index) => {
        const currentLineIndex = index + 1;
        const [firstNumeric, secondNumeric] = dataLines[currentLineIndex].split(" ").map(Number);

        const minimumValue = BigInt(Math.min(firstNumeric, secondNumeric));
        const maximumValue = BigInt(Math.max(firstNumeric, secondNumeric));

        const productOfValues = minimumValue * maximumValue;
        // The original 'c' was `sqrt64(product) - 1`.
        const computedThreshold = determineAdjustedRoot(productOfValues) - 1n;

        let calculatedOutcome = (minimumValue - 1n) * 2n;

        if (minimumValue < maximumValue - 1n) {
            calculatedOutcome++;
        }

        const differenceThresholdMin = computedThreshold - minimumValue;
        if (differenceThresholdMin > 0n) { // Equivalent to Math.max(c - a, 0)
            calculatedOutcome += differenceThresholdMin * 2n;
        }

        // Original condition: `Math.floor(a / c * b) === c`
        // For BigInts, (A * B) / C is equivalent to Math.floor((A * B) / C) for positive numbers.
        // We must handle division by zero for computedThreshold.
        // In original JS, `Math.floor(positive / 0 * positive)` results in `Infinity`.
        // `Infinity === 0` is `false`. So, if `computedThreshold` is `0n`, the condition is false.
        let specialConditionMet = false;
        if (computedThreshold === 0n) {
            specialConditionMet = false;
        } else {
            specialConditionMet = ((minimumValue * maximumValue) / computedThreshold === computedThreshold);
        }

        if (specialConditionMet) {
            calculatedOutcome--;
        }

        console.log(Number(calculatedOutcome));
    });
};

executeProcessing(require("fs").readFileSync("/dev/stdin", "utf8"));