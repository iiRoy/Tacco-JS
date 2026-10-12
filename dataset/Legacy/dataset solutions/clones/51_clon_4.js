const fileSystem = require('fs');

const rawInputContent = fileSystem.readFileSync(0, 'utf8');

const inputLines = rawInputContent.trim().split('\n');

const createPoint = (xCoord, yCoord) => ({
    x: Number(xCoord),
    y: Number(yCoord)
});

const vectorDifference = (pointB, pointA) => ({
    x: pointB.x - pointA.x,
    y: pointB.y - pointA.y
});

const calculateScalarCrossProduct = (vecA, vecB) => (
    vecA.x * vecB.y - vecA.y * vecB.x
);

inputLines.forEach(currentLineData => {
    const coordinateStrings = currentLineData.split(' ');
    let currentCoordIndex = 0;

    const pointOne = createPoint(coordinateStrings[currentCoordIndex++], coordinateStrings[currentCoordIndex++]);
    const pointTwo = createPoint(coordinateStrings[currentCoordIndex++], coordinateStrings[currentCoordIndex++]);
    const pointThree = createPoint(coordinateStrings[currentCoordIndex++], coordinateStrings[currentCoordIndex++]);
    const queryPoint = createPoint(coordinateStrings[currentCoordIndex++], coordinateStrings[currentCoordIndex++]);

    const vectorA = vectorDifference(pointTwo, pointOne);
    const vectorAP = vectorDifference(queryPoint, pointTwo);
    
    const vectorB = vectorDifference(pointThree, pointTwo);
    const vectorBP = vectorDifference(queryPoint, pointThree);

    const vectorC = vectorDifference(pointOne, pointThree);
    const vectorCP = vectorDifference(queryPoint, pointOne);

    const crossProductResultA = calculateScalarCrossProduct(vectorA, vectorAP);
    const crossProductResultB = calculateScalarCrossProduct(vectorB, vectorBP);
    const crossProductResultC = calculateScalarCrossProduct(vectorC, vectorCP);

    const signResultA = Math.sign(crossProductResultA);
    const signResultB = Math.sign(crossProductResultB);
    const signResultC = Math.sign(crossProductResultC);

    if (signResultA === signResultB && signResultB === signResultC && signResultA !== 0) {
        console.log('YES');
    } else {
        console.log('NO');
    }
});
