"use strict";

function readAndProcessStdinContent() {
    const fileSystemModule = require("fs");
    const rawFileContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    const trimmedContent = rawFileContent.replace(/\r?\n$/, "");
    return trimmedContent.split(/\r?\n/);
}

function processInputData(inputLines) {
    const parseLineOfNumbers = (lineString) => {
        return lineString.split(" ").map(Number);
    };

    const vectorCoordinatesA = parseLineOfNumbers(inputLines[1]);
    const vectorCoordinatesB = parseLineOfNumbers(inputLines[2]);

    function calculateMinkowskiDistance(firstVector, secondVector, powerValue) {
        const absoluteDifferencesPowered = firstVector.map(function(valA, index) {
            const differenceMagnitude = Math.abs(valA - secondVector[index]);
            return Math.pow(differenceMagnitude, powerValue);
        });

        const sumOfPoweredDifferences = absoluteDifferencesPowered.reduce(function(accumulator, currentValue) {
            return accumulator + currentValue;
        }, 0);

        const rootExponent = 1 / powerValue;
        return Math.pow(sumOfPoweredDifferences, rootExponent);
    }

    const minkowskiP1 = calculateMinkowskiDistance(vectorCoordinatesA, vectorCoordinatesB, 1);
    console.log(minkowskiP1);

    const minkowskiP2 = calculateMinkowskiDistance(vectorCoordinatesA, vectorCoordinatesB, 2);
    console.log(minkowskiP2);

    const minkowskiP3 = calculateMinkowskiDistance(vectorCoordinatesA, vectorCoordinatesB, 3);
    console.log(minkowskiP3);

    const allAbsoluteDifferences = vectorCoordinatesA.map(function(valA, index) {
        return Math.abs(valA - vectorCoordinatesB[index]);
    });

    const chebyshevDistance = Math.max.apply(null, allAbsoluteDifferences);
    console.log(chebyshevDistance);
}

processInputData(readAndProcessStdinContent());
