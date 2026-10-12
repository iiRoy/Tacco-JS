const fileSystem = require('fs');
const rawContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

const lineSegmentsData = rawContent.trim().split('\n');
const epsilonValue = 1e-10;

for (const currentLine of lineSegmentsData) {
    const coordinateValues = currentLine.split(' ').map(Number);

    const deltaX1 = coordinateValues[2] - coordinateValues[0];
    const deltaY1 = coordinateValues[3] - coordinateValues[1];

    const deltaX2 = coordinateValues[6] - coordinateValues[4];
    const deltaY2 = coordinateValues[7] - coordinateValues[5];

    const dotProductResult = (deltaX1 * deltaX2) + (deltaY1 * deltaY2);

    const resultIndicator = Math.abs(dotProductResult) < epsilonValue ? "YES" : "NO";

    console.log(resultIndicator);
}
