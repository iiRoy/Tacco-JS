'use strict'

const processInput = inputData => {
    const trimmedInputContent = inputData.trim();
    const inputLines = trimmedInputContent.split('\n');

    const firstLineSegments = inputLines[0].split(' ');
    const numCoordinates = parseInt(firstLineSegments[0], 10);
    const numCheckpoints = parseInt(firstLineSegments[1], 10);

    const rawCoordinateStrings = inputLines.slice(1, numCoordinates + 1);
    const rawCheckpointStrings = inputLines.slice(numCoordinates + 1, numCheckpoints + numCoordinates + 1);

    // Helper function to convert a space-separated string into a coordinate object
    const parseCoordinateString = coordinateString => {
        const numericValues = coordinateString.split(' ').map(valStr => parseInt(valStr, 10));
        return {
            x: numericValues[0],
            y: numericValues[1]
        };
    };

    // Helper function to calculate Manhattan distance between two points
    const calculateManhattanDistance = (pointOne, pointTwo) => {
        const deltaX = Math.abs(pointOne.x - pointTwo.x);
        const deltaY = Math.abs(pointOne.y - pointTwo.y);
        return deltaX + deltaY;
    };
    
    const coordinatesList = rawCoordinateStrings.map(parseCoordinateString);
    const checkpointsList = rawCheckpointStrings.map(parseCoordinateString);

    const closestCheckpointIndices = [];
    const INITIAL_MAX_DISTANCE = Number.MAX_SAFE_INTEGER; // A large constant for initial minimum distance

    coordinatesList.forEach((currentCoordinate, coordIdx) => {
        let currentMinimumDistance = INITIAL_MAX_DISTANCE;
        let selectedCheckpointIndex = 0; // Default to the first checkpoint, will be updated

        checkpointsList.forEach((currentCheckpoint, checkpointIdx) => {
            const calculatedDistance = calculateManhattanDistance(currentCoordinate, currentCheckpoint);
            
            if (calculatedDistance < currentMinimumDistance) {
                currentMinimumDistance = calculatedDistance;
                selectedCheckpointIndex = checkpointIdx;
            }
        });
        
        closestCheckpointIndices.push(selectedCheckpointIndex);
    });

    closestCheckpointIndices.forEach(idxValue => console.log(idxValue + 1));
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf-8'));
