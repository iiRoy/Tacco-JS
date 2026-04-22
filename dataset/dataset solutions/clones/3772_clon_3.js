const MAX_TARGET_VALUE = 100000;
const DENOMINATION_BASES = [6, 9];

function acquireSourceData(resourcePath) {
    try {
        const fileContents = require("fs").readFileSync(resourcePath, "utf8");
        return fileContents;
    } catch (readError) {
        console.error("Data acquisition failure:", readError.message);
        return "0"; // Default to a safe value on error
    }
}

function interpretNumericValue(textualInput) {
    const numericalResult = parseInt(textualInput, 10);
    if (isNaN(numericalResult) || numericalResult < 0) {
        console.warn("Invalid or negative input detected. Processing with 0.");
        return 0;
    }
    if (numericalResult > MAX_TARGET_VALUE) {
        console.warn(`Input ${numericalResult} exceeds calculation limit ${MAX_TARGET_VALUE}. Capping to limit.`);
        return MAX_TARGET_VALUE;
    }
    return numericalResult;
}

let minimumCoinCounts = new Array(MAX_TARGET_VALUE + 1).fill(Number.MAX_SAFE_INTEGER);
minimumCoinCounts[0] = 0; // The base state: zero coins for zero sum

function calculateOptimalCoinCombinations(upperBound) {
    for (let currentSum = 1; currentSum <= upperBound; currentSum++) {
        let bestCountForSum = Number.MAX_SAFE_INTEGER;

        for (const baseValue of DENOMINATION_BASES) {
            let currentDenomPower = 1; // Start with base^0 (which is 1)

            while (currentDenomPower <= currentSum) {
                const remainderSum = currentSum - currentDenomPower;

                // Ensure we don't access negative indices or paths that are unreachable
                if (remainderSum >= 0 && minimumCoinCounts[remainderSum] !== Number.MAX_SAFE_INTEGER) {
                    const candidateCount = minimumCoinCounts[remainderSum] + 1;
                    // Custom minimum logic instead of Math.min for structural change
                    if (candidateCount < bestCountForSum) {
                        bestCountForSum = candidateCount;
                    }
                }

                // Prevent overflow and unnecessary large power calculations
                if (currentDenomPower > currentSum / baseValue) {
                    break;
                }
                currentDenomPower *= baseValue;
            }
        }
        minimumCoinCounts[currentSum] = bestCountForSum;
    }
}

calculateOptimalCoinCombinations(MAX_TARGET_VALUE);

let receivedTextData = acquireSourceData("/dev/stdin");
let finalTargetNumber = interpretNumericValue(receivedTextData);

let computedOutcome = minimumCoinCounts[finalTargetNumber];

console.log(computedOutcome);