"use strict";

function computeVectorNorm(firstVector, secondVector, exponentValue) {
    let accumulatedPowerSum = 0;
    let currentIdx = 0;
    const vectorLength = firstVector.length;

    while (currentIdx < vectorLength) {
        const absoluteDifference = Math.abs(firstVector[currentIdx] - secondVector[currentIdx]);
        accumulatedPowerSum += Math.pow(absoluteDifference, exponentValue);
        currentIdx++;
    }
    return Math.pow(accumulatedPowerSum, 1 / exponentValue);
}

function findChebyshevDistance(firstVector, secondVector) {
    let maximumAbsoluteDifference = 0;
    let currentIdx = 0;
    const vectorLength = firstVector.length;

    while (currentIdx < vectorLength) {
        const currentAbsoluteDiff = Math.abs(firstVector[currentIdx] - secondVector[currentIdx]);
        if (currentAbsoluteDiff > maximumAbsoluteDifference) {
            maximumAbsoluteDifference = currentAbsoluteDiff;
        }
        currentIdx++;
    }
    return maximumAbsoluteDifference;
}

main(require("fs").readFileSync("/dev/stdin", "utf8").replace(/\r?\n$/, "").split(/\r?\n/));

function main(inputLines){
    const vectorA = Array.from(inputLines[1].split(" "), Number);
    const vectorB = Array.from(inputLines[2].split(" "), Number);

    console.log(computeVectorNorm(vectorA, vectorB, 1));
    console.log(computeVectorNorm(vectorA, vectorB, 2));
    console.log(computeVectorNorm(vectorA, vectorB, 3));
    console.log(findChebyshevDistance(vectorA, vectorB));
}
