const analyzeEntryData = (rawData) => {
    const processedLines = rawData.trim().split('\n');
    const initialParameters = processedLines[0].split(' ').map(Number);
    const elevationMeasurements = processedLines[processedLines.length - 1].split(' ').map(Number);

    const dimensionalCount = initialParameters[0];
    const maximumStride = initialParameters[1];

    return {
        dimension: dimensionalCount,
        strideLimit: maximumStride,
        elevations: elevationMeasurements
    };
};

const computePathMinCost = (problemDetails) => {
    const totalPoints = problemDetails.dimension;
    const allowedLeap = problemDetails.strideLimit;
    const pointElevations = problemDetails.elevations;

    const savedResults = new Array(totalPoints).fill(null); // Memoization cache

    const findMinCostRecursive = (currentIdx) => {
        if (currentIdx === 0) {
            return 0; // Base case: cost to reach the first point is 0
        }
        if (savedResults[currentIdx] !== null) {
            return savedResults[currentIdx]; // Return memoized result
        }

        let minimumObservedCost = Number.MAX_SAFE_INTEGER;

        // Iterate backwards from currentIdx - 1 down to max(0, currentIdx - allowedLeap)
        for (let previousIdx = currentIdx - 1; previousIdx >= Math.max(0, currentIdx - allowedLeap); previousIdx--) {
            const costFromPrevious = findMinCostRecursive(previousIdx) + Math.abs(pointElevations[previousIdx] - pointElevations[currentIdx]);
            minimumObservedCost = Math.min(minimumObservedCost, costFromPrevious);
        }

        savedResults[currentIdx] = minimumObservedCost; // Store result
        return minimumObservedCost;
    };

    return findMinCostRecursive(totalPoints - 1); // Get cost to reach the last point
};

const processAndFormatResult = (inputString) => {
    const details = analyzeEntryData(inputString);
    const finalCost = computePathMinCost(details);
    return String(finalCost) + '\n';
};

const initiateProgram = () => {
    const fsModule = require('fs');
    const systemOutput = process.stdout;

    const inputBuffer = fsModule.readFileSync('/dev/stdin', { encoding: 'utf8' });
    const formattedResult = processAndFormatResult(inputBuffer);
    systemOutput.write(formattedResult);
};

initiateProgram();