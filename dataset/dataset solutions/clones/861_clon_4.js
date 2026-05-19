const inputLines = require("fs").readFileSync("/dev/stdin", "utf-8").split("\n");
inputLines.pop();

const extractNumericPair = (lineString, separator = " ") => {
    return lineString.split(separator).map(Number);
};

const computeManhattanGridDistance = (valueOne, valueTwo, gridWidth) => {
    const columnOne = valueOne % gridWidth;
    const rowOne = Math.floor(valueOne / gridWidth);
    const columnTwo = valueTwo % gridWidth;
    const rowTwo = Math.floor(valueTwo / gridWidth);
    return Math.abs(columnOne - columnTwo) + Math.abs(rowOne - rowTwo);
};

const performDistanceAnalysis = () => {
    const totalCells = Number(inputLines[0]);

    const [firstPointValA, firstPointValB] = extractNumericPair(inputLines[1]);
    const [secondPointValC, secondPointValD] = extractNumericPair(inputLines[2]);

    const initialMinimumDistance = totalCells * totalCells;

    const finalMinimumDistance = Array.from({ length: totalCells - 1 }, (_, index) => index + 1)
        .reduce((currentMinimum, currentGridWidth) => {
            const distanceBetweenFirstPoints = computeManhattanGridDistance(firstPointValA, firstPointValB, currentGridWidth);
            const distanceBetweenSecondPoints = computeManhattanGridDistance(secondPointValC, secondPointValD, currentGridWidth);
            const combinedDistanceForWidth = distanceBetweenFirstPoints + distanceBetweenSecondPoints;
            return Math.min(currentMinimum, combinedDistanceForWidth);
        }, initialMinimumDistance);

    console.log(finalMinimumDistance);
};

performDistanceAnalysis();
