const subtractPoints = (coordA, coordB) => [coordA[0] - coordB[0], coordA[1] - coordB[1]];
const addPoints = (coordA, coordB) => [coordA[0] + coordB[0], coordA[1] + coordB[1]];
const rotateNinetyDegreesCounterClockwise = (vector) => [-vector[1], vector[0]];

function deriveSquareVertices(spatialData) {
    const numericalComponents = spatialData.split(" ").map(Number);
    
    const initialPoint = [numericalComponents[0], numericalComponents[1]];
    const secondPoint = [numericalComponents[2], numericalComponents[3]];

    const connectingVector = subtractPoints(secondPoint, initialPoint);
    const perpendicularVector = rotateNinetyDegreesCounterClockwise(connectingVector);

    const thirdPoint = addPoints(secondPoint, perpendicularVector);
    const fourthPoint = addPoints(initialPoint, perpendicularVector);
    
    return [...thirdPoint, ...fourthPoint].join(" ");
}