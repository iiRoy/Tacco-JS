const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineSegments = fileContent.trim().split('\n');

const operationCount = Number(lineSegments.shift());

const determineGeometricRelation = (circleDataParameters) => {
    const [xCoordA, yCoordA, radiusA, xCoordB, yCoordB, radiusB] = circleDataParameters;

    const deltaX = xCoordA - xCoordB;
    const deltaY = yCoordA - yCoordB;
    const centerDistance = Math.hypot(deltaX, deltaY);

    const radiiSum = radiusA + radiusB;
    const radiusDiffAB = radiusA - radiusB;
    const radiusDiffBA = radiusB - radiusA;

    const outcomeRules = [
        { condition: (d, sR, dr1, dr2) => d > sR, result: 0 },
        { condition: (d, sR, dr1, dr2) => d <= dr1, result: 2 },
        { condition: (d, sR, dr1, dr2) => d <= dr2, result: -2 },
        { condition: (d, sR, dr1, dr2) => true, result: 1 }
    ];

    const foundRule = outcomeRules.find(rule =>
        rule.condition(centerDistance, radiiSum, radiusDiffAB, radiusDiffBA)
    );

    return foundRule.result;
};

const results = lineSegments.slice(0, operationCount).map(line => {
    const numericValues = line.split(' ').map(Number);
    return determineGeometricRelation(numericValues);
});

results.forEach(res => console.log(res));
