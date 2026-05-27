function processInput(rawInput) {
    const lines = rawInput.split("\n");
    const elementCount = parseInt(lines[0], 10);
    const valleyHeights = lines[1].split(" ").map(Number);

    const mountainHeights = calculateMountainHeights(elementCount, valleyHeights);

    console.log(formatOutput(mountainHeights));
}

function calculateMountainHeights(count, heights) {
    const prefixSums = Array(count).fill(0);
    let minEvenTerm = 0;
    let maxOddTerm = Infinity;
    let currentSum = 0;

    for (let i = 0; i < count; i++) {
        prefixSums[i] = currentSum;
        if (i % 2 === 0) { // k is even, so (-1)^k is 1. We need P_k + Y >= 0 => Y >= -P_k
            minEvenTerm = Math.max(minEvenTerm, -currentSum);
        } else { // k is odd, so (-1)^k is -1. We need P_k - Y >= 0 => Y <= P_k
            maxOddTerm = Math.min(maxOddTerm, currentSum);
        }
        currentSum = heights[i] - currentSum; // This calculates P_{i+1} based on P_i
    }

    let initialY;
    if (count % 2 !== 0) { // N is odd
        // 2Y = v_{N-1} - P_{N-1}
        // P_{N-1} is currentSum after loop for i = N-1
        initialY = (heights[count - 1] - currentSum) / 2;
    } else { // N is even
        // Y is not uniquely determined by the closing condition.
        // We need to find an integer Y such that minEvenTerm <= Y <= maxOddTerm.
        // Since a solution is guaranteed, we can pick the smallest valid integer Y.
        initialY = Math.ceil(minEvenTerm);
    }

    const finalMountains = Array(count);
    for (let k = 0; k < count; k++) {
        const term = prefixSums[k] + (k % 2 === 0 ? initialY : -initialY);
        finalMountains[k] = 2 * term;
    }

    return finalMountains;
}

function formatOutput(dataElements) {
    return dataElements.join(' ') + '\n';
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
