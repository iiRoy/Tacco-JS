"use strict";

// Helper function to calculate profit arrays for a given direction
function calculateDirectionalProfits(pointCount, totalDistance, currentPositions, currentValues) {
    const clockwiseProfits = new Array(pointCount + 1);
    clockwiseProfits[0] = 0;
    for (let i = 1; i <= pointCount; i++) {
        const travelDistance = currentPositions[i] - currentPositions[i - 1];
        clockwiseProfits[i] = clockwiseProfits[i - 1] + currentValues[i] - travelDistance;
    }

    const counterClockwiseProfits = new Array(pointCount + 1);
    counterClockwiseProfits[pointCount] = 0; // Base case for returning from the end point
    for (let i = pointCount - 1; i >= 0; i--) {
        const collectedValue = currentValues[i + 1];
        // The original code uses X[n+2] - X[n+1] for R[n].
        // This means the distance between currentPositions[i+1] and currentPositions[i+2].
        // currentPositions array has N+2 elements (0 to N+1), where currentPositions[N+1] is totalDistance.
        const segmentDistance = currentPositions[i + 2] - currentPositions[i + 1];
        counterClockwiseProfits[i] = counterClockwiseProfits[i + 1] + collectedValue - segmentDistance;
    }
    return { clockwise: clockwiseProfits, counterClockwise: counterClockwiseProfits };
}

// Helper function to determine the maximum profit from calculated arrays
function evaluateMaxProfit(initialMax, cwProfits, ccwProfits, currentPositions, pointCount) {
    let currentOverallMax = initialMax;
    for (let cwIndex = 0; cwIndex <= pointCount; cwIndex++) {
        // Strategy 1: Go clockwise to cwIndex and stop
        currentOverallMax = Math.max(currentOverallMax, cwProfits[cwIndex]);

        // Strategy 2: Go clockwise to cwIndex, return to start (cost currentPositions[cwIndex]),
        // then make a separate trip counter-clockwise from totalDistance to ccwIndex+1
        for (let ccwIndex = cwIndex; ccwIndex < pointCount; ccwIndex++) {
            const profitFromCombinedTrips = cwProfits[cwIndex] - currentPositions[cwIndex] + ccwProfits[ccwIndex];
            currentOverallMax = Math.max(currentOverallMax, profitFromCombinedTrips);
        }
    }
    return currentOverallMax;
}

function solveProblem(inputContent) {
    const inputReader = new InputParser(inputContent);
    const MIN_POSSIBLE_PROFIT = Number.MIN_SAFE_INTEGER;

    const numPoints = inputReader.readInt();
    const totalCircumference = inputReader.readInt();

    // Initialize positions and values arrays
    const pointPositions = [0]; // X[0] = 0
    const pointValues = [0];    // V[0] = 0
    for (let i = 1; i <= numPoints; i++) {
        pointPositions.push(inputReader.readInt());
        pointValues.push(inputReader.readInt());
    }
    // Add totalCircumference as the last position for calculation boundary
    pointPositions.push(totalCircumference);

    let maximumAchievableProfit = MIN_POSSIBLE_PROFIT;

    // --- Phase 1: Clockwise calculations ---
    const { clockwise: cwProfitsA, counterClockwise: ccwProfitsA } = calculateDirectionalProfits(
        numPoints,
        totalCircumference,
        pointPositions,
        pointValues
    );
    maximumAchievableProfit = evaluateMaxProfit(
        maximumAchievableProfit,
        cwProfitsA,
        ccwProfitsA,
        pointPositions,
        numPoints
    );

    // --- Phase 2: Counter-clockwise calculations (by transforming coordinates) ---
    // The original code transforms X and V arrays in-place.
    // We will create new transformed arrays to keep the logic clean.

    // Transform positions:
    // Original X: [0, X1, X2, ..., XN, C]
    // After X[n] = C - X[n]: [C, C-X1, C-X2, ..., C-XN, 0]
    // After X.reverse(): [0, C-XN, C-X(N-1), ..., C-X1, C]
    const transformedPositionsForCCW = [0];
    for (let i = numPoints; i >= 1; i--) {
        transformedPositionsForCCW.push(totalCircumference - pointPositions[i]);
    }
    transformedPositionsForCCW.push(totalCircumference); // The "end" point C remains C

    // Transform values:
    // Original V: [0, V1, V2, ..., VN]
    // After V.shift(): [V1, V2, ..., VN]
    // After V.push(0): [V1, V2, ..., VN, 0]
    // After V.reverse(): [0, VN, V(N-1), ..., V1]
    const transformedValuesForCCW = [0];
    for (let i = numPoints; i >= 1; i--) {
        transformedValuesForCCW.push(pointValues[i]);
    }

    const { clockwise: cwProfitsB, counterClockwise: ccwProfitsB } = calculateDirectionalProfits(
        numPoints,
        totalCircumference,
        transformedPositionsForCCW,
        transformedValuesForCCW
    );
    maximumAchievableProfit = evaluateMaxProfit(
        maximumAchievableProfit,
        cwProfitsB,
        ccwProfitsB,
        transformedPositionsForCCW,
        numPoints
    );

    console.log(maximumAchievableProfit);
}

class InputParser {
    #readIndex = 0;
    #tokenizedInput;

    constructor(inputStringContent) {
        this.#validateArgument(inputStringContent, 'Input string content cannot be undefined.');
        // Split by newline or space, then filter out any empty strings that result from multiple delimiters
        this.#tokenizedInput = inputStringContent.split(/\n|\s/).filter(s => s !== '');
    }

    #validateArgument(arg, errorMessage) {
        if (typeof arg === 'undefined') {
            throw new Error(errorMessage);
        }
    }

    readInt() {
        if (this.#readIndex >= this.#tokenizedInput.length) {
            throw new Error('Attempted to read past end of input: No more tokens available.');
        }
        const token = this.#tokenizedInput[this.#readIndex++];
        const value = parseInt(token, 10);
        if (isNaN(value)) {
            throw new Error(`Expected an integer, but received non-numeric value: '${token}'`);
        }
        return value;
    }

    readIntArray(count) {
        this.#validateArgument(count, 'Count for readIntArray must be provided.');
        if (count <= 0) {
            throw new Error('Count for readIntArray must be 1 or greater.');
        }
        const resultArray = new Array(count);
        for (let i = 0; i < count; i++) {
            resultArray[i] = this.readInt();
        }
        return resultArray;
    }

    readString() {
        if (this.#readIndex >= this.#tokenizedInput.length) {
            throw new Error('Attempted to read past end of input: No more tokens available.');
        }
        return this.#tokenizedInput[this.#readIndex++];
    }

    readStringArray(count) {
        this.#validateArgument(count, 'Count for readStringArray must be provided.');
        if (count <= 0) {
            throw new Error('Count for readStringArray must be 1 or greater.');
        }
        const resultArray = new Array(count);
        for (let i = 0; i < count; i++) {
            resultArray[i] = this.readString();
        }
        return resultArray;
    }
}

// Entry point for execution in Node.js environment
if (typeof window === "undefined") {
    solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
}
