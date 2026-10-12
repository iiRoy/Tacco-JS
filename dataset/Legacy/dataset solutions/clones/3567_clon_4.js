const fileSystem = require('fs');

const acquireInputData = (sourcePath) => {
    const rawText = fileSystem.readFileSync(sourcePath, 'utf8');
    const allLines = rawText.split('\n');
    const firstLineContent = allLines.shift();
    return firstLineContent.split(' ').map(Number);
};

const constructPoint = (horizontal, vertical) => ({
    x: horizontal,
    y: vertical
});

const deriveVector = (originPoint, destinationPoint) => ({
    dx: destinationPoint.x - originPoint.x,
    dy: destinationPoint.y - originPoint.y
});

const rotateVectorRight = (initialVector) => ({
    dx: initialVector.dy,
    dy: -initialVector.dx
});

const displacePointByVector = (baseCoordinate, displacementVector) => ({
    x: baseCoordinate.x + displacementVector.dx,
    y: baseCoordinate.y + displacementVector.dy
});

const numericalValues = acquireInputData('/dev/stdin');

const initialX = numericalValues[0];
const initialY = numericalValues[1];
const secondX = numericalValues[2];
const secondY = numericalValues[3];

const coordinateA = constructPoint(initialX, initialY);
const coordinateB = constructPoint(secondX, secondY);

// This vector represents (coordinateA - coordinateB)
const vectorFromBToA = deriveVector(coordinateB, coordinateA);

// This vector represents the 90-degree clockwise rotation of vectorFromBToA
const orthogonalVector = rotateVectorRight(vectorFromBToA);

// Calculate the third point by adding the orthogonal vector to coordinateB
const coordinateC = displacePointByVector(coordinateB, orthogonalVector);
// Calculate the fourth point by adding the orthogonal vector to coordinateA
const coordinateD = displacePointByVector(coordinateA, orthogonalVector);

console.log('%d %d %d %d', coordinateC.x, coordinateC.y, coordinateD.x, coordinateD.y);
