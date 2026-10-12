"use strict";

const primeModulus = 1000000007;

const createFibonacciSequence = (limit) => {
    if (limit <= 0) return [];
    if (limit === 1) return [1];
    const fibs = [1, 1];
    for (let i = 2; i < limit; i++) {
        fibs[i] = fibs[i - 1] + fibs[i - 2];
    }
    return fibs;
};

const getTransitionCoefficient = (leftCount, rightCount, fibonacciNumbers) => {
    const leftValue = (leftCount >= 0 && leftCount < fibonacciNumbers.length) ? fibonacciNumbers[leftCount] : 0;
    const rightValue = (rightCount >= 0 && rightCount < fibonacciNumbers.length) ? fibonacciNumbers[rightCount] : 0;
    return (leftValue * rightValue) % primeModulus;
};

const calculateGridPaths = (gridHeight, gridWidth, targetColumnIndex) => {
    const fibonacciSeries = createFibonacciSequence(gridWidth);

    let currentPathRow = Array(gridWidth).fill(0);
    currentPathRow[0] = fibonacciSeries[gridWidth - 1];
    if (gridWidth > 1) {
        currentPathRow[1] = fibonacciSeries[gridWidth - 2];
    }

    const finalPathRow = Array.from({ length: gridHeight - 1 }).reduce((previousPathRow, _, levelIndex) => {
        const nextPathRow = Array(gridWidth).fill(0);
        for (let currentColumn = 0; currentColumn < gridWidth; currentColumn++) {
            let accumulatedPaths = 0;

            const stayFactor = getTransitionCoefficient(gridWidth - currentColumn - 1, currentColumn, fibonacciSeries);
            accumulatedPaths = (accumulatedPaths + previousPathRow[currentColumn] * stayFactor) % primeModulus;

            if (currentColumn - 1 >= 0) {
                const leftMoveFactor = getTransitionCoefficient(gridWidth - currentColumn - 1, currentColumn - 1, fibonacciSeries);
                accumulatedPaths = (accumulatedPaths + previousPathRow[currentColumn - 1] * leftMoveFactor) % primeModulus;
            }

            if (currentColumn + 1 < gridWidth) {
                const rightMoveFactor = getTransitionCoefficient(gridWidth - currentColumn - 2, currentColumn, fibonacciSeries);
                accumulatedPaths = (accumulatedPaths + previousPathRow[currentColumn + 1] * rightMoveFactor) % primeModulus;
            }
            nextPathRow[currentColumn] = accumulatedPaths;
        }
        return nextPathRow;
    }, currentPathRow);

    return finalPathRow[targetColumnIndex - 1];
};

const parseInputData = (rawInputString) => {
    const inputLines = rawInputString.trim().split("\n");
    const [hValue, wValue, kValue] = inputLines[0].split(" ").map(Number);
    return { hValue, wValue, kValue };
};

const executeSolution = (inputContent) => {
    const { hValue, wValue, kValue } = parseInputData(inputContent);
    const finalResult = calculateGridPaths(hValue, wValue, kValue);
    console.log(finalResult);
};

executeSolution(require("fs").readFileSync("/dev/stdin", "utf8"));
