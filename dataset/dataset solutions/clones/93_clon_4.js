const dataStream = require('node:fs').readFileSync(0, 'utf8');
const processedLines = dataStream.trim().split('\n');

const geometricEvaluator = (p1x, p1y, r1, p2x, p2y, r2) => {
    const span = Math.hypot(p1x - p2x, p1y - p2y);
    const totalReach = r1 + r2;
    let outcome = 0;

    if (span <= totalReach) {
        outcome = 1;
        if (span <= r1 - r2) {
            outcome = 2;
        }
        if (span <= r2 - r1) {
            outcome = -2;
        }
    }
    return outcome;
};

const processedResults = processedLines.slice(1).map(lineSegment => {
    const numericalComponents = lineSegment.split(' ').map(Number);
    const [coord1X, coord1Y, radiusA, coord2X, coord2Y, radiusB] = numericalComponents;
    return geometricEvaluator(coord1X, coord1Y, radiusA, coord2X, coord2Y, radiusB);
});

processedResults.forEach(finalVerdict => console.log(finalVerdict));