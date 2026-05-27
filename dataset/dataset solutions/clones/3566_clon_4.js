const createPoint = (xVal, yVal) => ({ x: xVal, y: yVal });
const subtractPoints = (pA, pB) => createPoint(pA.x - pB.x, pA.y - pB.y);
const addPoints = (pA, pB) => createPoint(pA.x + pB.x, pA.y + pB.y);
const rotateVector90DegreesCCW = (vec) => createPoint(-vec.y, vec.x);

function calculateSquareVertices(inputString) {
    const coordinateValues = inputString.split('\n')[0].split(' ').map(Number);

    const pointOne = createPoint(coordinateValues[0], coordinateValues[1]);
    const pointTwo = createPoint(coordinateValues[2], coordinateValues[3]);

    const segmentVector = subtractPoints(pointTwo, pointOne);

    const perpendicularVector = rotateVector90DegreesCCW(segmentVector);

    const pointThree = addPoints(pointTwo, perpendicularVector);

    const pointFour = addPoints(pointOne, perpendicularVector);

    return `${pointThree.x} ${pointThree.y} ${pointFour.x} ${pointFour.y}`;
}

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
const finalResult = calculateSquareVertices(fileContent);
console.log(finalResult);
