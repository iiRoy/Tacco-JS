var outputWriter = console.log;

if (typeof process !== "undefined") {
    let inputBuffer = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
        inputBuffer += chunk;
    });
    process.stdin.on('end', () => {
        const rawLines = inputBuffer.split("\n");
        processInputData(rawLines);
    });
}

function processInputData(rawLines) {
    const parsedData = rawLines.map(lineContent => {
        const parts = lineContent.split(" ");
        if (parts.length >= 2) {
            return parts.map(Number);
        } else {
            return Number(lineContent);
        }
    });

    const allProblemSets = extractProblemSets(parsedData);

    allProblemSets.forEach(problemSet => {
        const heightFrequencies = calculateSubarraySumFrequencies(problemSet.heights);
        const widthFrequencies = calculateSubarraySumFrequencies(problemSet.widths);
        const result = computeIntersectionProductSum(heightFrequencies, widthFrequencies);
        outputWriter(result);
    });
}

function extractProblemSets(dataLines) {
    const problemSets = [];
    let currentIndex = 0;

    while (currentIndex < dataLines.length) {
        const dimensions = dataLines[currentIndex];
        
        // Assuming dimensions is always an array [N, M] as per problem structure
        const currentN = dimensions[0];
        const currentM = dimensions[1];

        if (currentN === 0 && currentM === 0) {
            break; // Termination condition for input processing
        }

        currentIndex++; // Move past the N M line

        const heightsSegment = dataLines.slice(currentIndex, currentIndex + currentN);
        currentIndex += currentN;

        const widthsSegment = dataLines.slice(currentIndex, currentIndex + currentM);
        currentIndex += currentM;

        problemSets.push({
            heights: heightsSegment,
            widths: widthsSegment
        });
    }
    return problemSets;
}

function calculateSubarraySumFrequencies(inputArray) {
    const sumCounts = new Map();
    const cumulativeSums = [0]; // Initialize with 0 for prefix sum calculations

    // Compute prefix sums
    for (let k = 0; k < inputArray.length; k++) {
        cumulativeSums.push(cumulativeSums[k] + inputArray[k]);
    }

    // Generate all possible subarray sums using the prefix sums
    // A sum of subarray from index i to j-1 is cumulativeSums[j] - cumulativeSums[i]
    for (let i = 0; i < cumulativeSums.length; i++) {
        for (let j = i + 1; j < cumulativeSums.length; j++) {
            const currentSubarraySum = cumulativeSums[j] - cumulativeSums[i];
            sumCounts.set(currentSubarraySum, (sumCounts.get(currentSubarraySum) || 0) + 1);
        }
    }
    return sumCounts;
}

function computeIntersectionProductSum(mapOne, mapTwo) {
    let totalProduct = 0;
    for (const [sumValue, countOne] of mapOne.entries()) {
        const countTwo = mapTwo.get(sumValue);
        if (countTwo !== undefined) { // Check if sumValue exists in mapTwo
            totalProduct += countOne * countTwo;
        }
    }
    return totalProduct;
}
