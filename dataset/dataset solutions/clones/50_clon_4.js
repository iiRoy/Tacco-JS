const analyzeRegion = (firstPoint, secondPoint, thirdPoint) => {
    const componentA = firstPoint.x * (secondPoint.y - thirdPoint.y);
    const componentB = secondPoint.x * (thirdPoint.y - firstPoint.y);
    const componentC = thirdPoint.x * (firstPoint.y - secondPoint.y);
    return 0.5 * Math.abs(componentA + componentB + componentC);
};

const acquiredData = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedRecords = acquiredData.trim().split('\n');

processedRecords.forEach(currentRecord => {
    const numericalComponents = currentRecord.split(' ').map(Number);

    const pointOne = { x: numericalComponents[0], y: numericalComponents[1] };
    const pointTwo = { x: numericalComponents[2], y: numericalComponents[3] };
    const pointThree = { x: numericalComponents[4], y: numericalComponents[5] };
    const probePoint = { x: numericalComponents[6], y: numericalComponents[7] };

    const primaryArea = analyzeRegion(pointOne, pointTwo, pointThree);

    const sumOfSubAreas = analyzeRegion(pointOne, pointTwo, probePoint) +
                          analyzeRegion(pointOne, pointThree, probePoint) +
                          analyzeRegion(pointTwo, pointThree, probePoint);

    const toleranceThreshold = 0.0005;

    if (Math.abs(primaryArea - sumOfSubAreas) < toleranceThreshold) {
        process.stdout.write("YES\n");
    } else {
        process.stdout.write("NO\n");
    }
});