class DataStreamProcessor {
    constructor(sourceText) {
        this.linesOfData = sourceText.trim().split('\n');
        this.currentPosition = 0;
    }

    retrieveNextInteger() {
        return parseInt(this.linesOfData[this.currentPosition++], 10);
    }

    retrieveNextPairOfNumbers() {
        return this.linesOfData[this.currentPosition++].split(' ').map(Number);
    }
}

class PathMovement {
    constructor(direction, magnitude) {
        this.travelDirection = direction; 
        this.travelMagnitude = magnitude;
    }
}

const orientationMappings = {
    'PRIMARY': { north: 'N', east: 'E', south: 'S', west: 'W' },
    'EASTWARD': { north: 'E', east: 'S', south: 'W', west: 'N' },
    'SOUTHWARD': { north: 'S', east: 'W', south: 'N', west: 'E' },
    'WESTWARD': { north: 'W', east: 'N', south: 'E', west: 'S' }
};

function deriveMovements(pointCoordinates) {
    const derivedSegments = [];
    for (let pointIdx = 1; pointIdx < pointCoordinates.length; pointIdx++) {
        const prior = pointCoordinates[pointIdx - 1];
        const present = pointCoordinates[pointIdx];
        let travelWay, travelSpan;

        if (prior[0] === present[0]) { 
            if (prior[1] > present[1]) { travelWay = 'south'; travelSpan = prior[1] - present[1]; }
            else { travelWay = 'north'; travelSpan = present[1] - prior[1]; }
        } else { 
            if (prior[0] > present[0]) { travelWay = 'west'; travelSpan = prior[0] - present[0]; }
            else { travelWay = 'east'; travelSpan = present[0] - prior[0]; }
        }
        derivedSegments.push(new PathMovement(travelWay, travelSpan));
    }
    return derivedSegments;
}

function formatPathAsString(segmentSequence, orientationKey) {
    const directionSymbols = orientationMappings[orientationKey];
    return segmentSequence.map(seg => directionSymbols[seg.travelDirection] + seg.travelMagnitude).join('');
}

function invertSegmentOrder(segmentSequence) {
    return [...segmentSequence].reverse();
}

function processAllInputSets(sourceMaterial) {
    const processor = new DataStreamProcessor(sourceMaterial);
    const accumulatedResults = [];

    while (true) {
        const currentSetSize = processor.retrieveNextInteger();
        if (currentSetSize === 0) break;

        let primaryReferencePattern = '';
        const identifiedMatches = [];

        for (let currentPatternIndex = 0; currentPatternIndex < currentSetSize + 1; currentPatternIndex++) {
            const numPoints = processor.retrieveNextInteger();
            const currentPointSet = [];
            for (let k = 0; k < numPoints; k++) {
                currentPointSet.push(processor.retrieveNextPairOfNumbers());
            }

            const forwardSegments = deriveMovements(currentPointSet);
            const backwardSegments = invertSegmentOrder(forwardSegments);

            const forwardRepresentations = [
                formatPathAsString(forwardSegments, 'PRIMARY'),
                formatPathAsString(forwardSegments, 'EASTWARD'),
                formatPathAsString(forwardSegments, 'SOUTHWARD'),
                formatPathAsString(forwardSegments, 'WESTWARD')
            ];

            const backwardRepresentations = [
                formatPathAsString(backwardSegments, 'PRIMARY'),
                formatPathAsString(backwardSegments, 'EASTWARD'),
                formatPathAsString(backwardSegments, 'SOUTHWARD'),
                formatPathAsString(backwardSegments, 'WESTWARD')
            ];

            if (currentPatternIndex === 0) {
                primaryReferencePattern = forwardRepresentations[0];
            } else {
                const allPossibleForms = [...forwardRepresentations, ...backwardRepresentations];
                if (allPossibleForms.includes(primaryReferencePattern)) {
                    identifiedMatches.push(currentPatternIndex);
                }
            }
        }
        accumulatedResults.push(...identifiedMatches.map(String));
        accumulatedResults.push("+++++");
    }
    return accumulatedResults.join('\n');
}

var rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
console.log(processAllInputSets(rawInputData));