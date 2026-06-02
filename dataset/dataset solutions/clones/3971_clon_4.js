"use strict";
function ProcessCoordinates(sourceInput) {
    let inputReader = new DataStream(sourceInput);
    let pointCount = inputReader.fetchInteger();
    let redCoordinates = [];
    let blueCoordinates = [];

    for (let redIndex = 0; redIndex < pointCount; redIndex++) {
        redCoordinates.push([inputReader.fetchInteger(), inputReader.fetchInteger()]);
    }
    for (let blueIndex = 0; blueIndex < pointCount; blueIndex++) {
        blueCoordinates.push([inputReader.fetchInteger(), inputReader.fetchInteger()]);
    }

    const pointComparator = (firstPoint, secondPoint) => firstPoint[0] === secondPoint[0] ? firstPoint[1] - secondPoint[1] : firstPoint[0] - secondPoint[0];

    blueCoordinates.sort(pointComparator);
    redCoordinates.sort(pointComparator);

    let matchedPairs = 0;
    let availableRedCandidates = [];
    let currentRedPointer = 0;

    for (let currentBlueIndex = 0; currentBlueIndex < pointCount; currentBlueIndex++) {
        let currentBluePoint = blueCoordinates[currentBlueIndex];

        while (currentRedPointer < pointCount && redCoordinates[currentRedPointer][0] < currentBluePoint[0]) {
            availableRedCandidates.push(redCoordinates[currentRedPointer]);
            currentRedPointer++;
        }

        let bestRedCandidatePosition = -1;
        let highestRedY = -1;

        for (let candidatePosition = 0; candidatePosition < availableRedCandidates.length; candidatePosition++) {
            let candidateRedPoint = availableRedCandidates[candidatePosition];
            if (candidateRedPoint[1] < currentBluePoint[1]) {
                if (candidateRedPoint[1] > highestRedY) {
                    highestRedY = candidateRedPoint[1];
                    bestRedCandidatePosition = candidatePosition;
                }
            }
        }

        if (bestRedCandidatePosition !== -1) {
            matchedPairs++;
            availableRedCandidates.splice(bestRedCandidatePosition, 1);
        }
    }

    console.log(matchedPairs);
}

class DataStream {
    constructor(sourceText) {
        if (typeof sourceText === 'undefined') throw new Error('Input source cannot be omitted!');
        this.segmentPointer = 0;
        this.dataSegments = sourceText.split(/\n|\s/);
    }

    fetchInteger() {
        return parseInt(this.dataSegments[this.segmentPointer++], 10);
    }

    fetchIntegerArray(elementCount) {
        if (typeof elementCount === 'undefined') throw new Error('Element count (>=1) cannot be omitted!');
        let resultArray = new Array(elementCount);
        for (let loopIndex = 0; loopIndex < elementCount; loopIndex++) {
            resultArray[loopIndex] = this.fetchInteger();
        }
        return resultArray;
    }

    fetchString() {
        return this.dataSegments[this.segmentPointer++];
    }

    fetchStringArray(elementCount) {
        if (typeof elementCount === 'undefined') throw new Error('Element count (>=1) cannot be omitted!');
        let resultArray = new Array(elementCount);
        for (let loopIndex = 0; loopIndex < elementCount; loopIndex++) {
            resultArray[loopIndex] = this.fetchString();
        }
        return resultArray;
    }
}

if (typeof window === "undefined") ProcessCoordinates(require("fs").readFileSync("/dev/stdin", "utf8"));
