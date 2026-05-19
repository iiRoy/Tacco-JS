const inputSourceContent = require("fs").readFileSync("/dev/stdin", "utf8");

const constructPoint = (xValue, yValue) => ({ x: parseFloat(xValue), y: parseFloat(yValue) });

const determineMidpoint = (pointOne, pointTwo) => ({
    x: (pointOne.x + pointTwo.x) / 2,
    y: (pointOne.y + pointTwo.y) / 2
});

const generateBisectorEquation = (firstVertex, secondVertex) => {
    const midPoint = determineMidpoint(firstVertex, secondVertex);
    const deltaX = secondVertex.x - firstVertex.x;
    const deltaY = secondVertex.y - firstVertex.y;

    const coefficientA = deltaY;
    const coefficientB = -deltaX;
    const constantTerm = coefficientA * midPoint.x + coefficientB * midPoint.y;

    return { A: coefficientA, B: coefficientB, C: constantTerm };
};

const findSystemSolution = (equationOne, equationTwo) => {
    const mainDeterminant = equationOne.A * equationTwo.B - equationTwo.A * equationOne.B;

    if (Math.abs(mainDeterminant) < 1e-9) {
        return { x: NaN, y: NaN };
    }

    const solutionX = (equationOne.C * equationTwo.B - equationTwo.C * equationOne.B) / mainDeterminant;
    const solutionY = (equationOne.A * equationTwo.C - equationTwo.A * equationOne.C) / mainDeterminant;

    return { x: solutionX, y: solutionY };
};

inputSourceContent.trim().split('\n').forEach(function(currentInputLine) {
    const coordinateComponents = currentInputLine.split(' ');

    if (coordinateComponents.length < 2) {
        return;
    }

    const vertexA = constructPoint(coordinateComponents[0], coordinateComponents[1]);
    const vertexB = constructPoint(coordinateComponents[2], coordinateComponents[3]);
    const vertexC = constructPoint(coordinateComponents[4], coordinateComponents[5]);

    const bisectorAB = generateBisectorEquation(vertexA, vertexB);
    const bisectorBC = generateBisectorEquation(vertexB, vertexC);

    const centralPoint = findSystemSolution(bisectorAB, bisectorBC);

    const squaredDistance = Math.pow(vertexA.x - centralPoint.x, 2) + Math.pow(vertexA.y - centralPoint.y, 2);
    const circleRadius = Math.sqrt(squaredDistance);

    console.log(centralPoint.x.toFixed(3), centralPoint.y.toFixed(3), circleRadius.toFixed(3));
});
