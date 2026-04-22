const sysConfig = { sourcePath: '/dev/stdin', eolChar: '\n' };
const generationDepth = Number(require('node:fs').readFileSync(sysConfig.sourcePath, 'ascii').trim());

const APEX_FACTOR = Math.sqrt(3) / 6;

class Coordinate {
    constructor(xVal, yVal) {
        this.x = xVal;
        this.y = yVal;
    }
}

function transformSegment(initialPoint, terminalPoint) {
    const subPoint1 = new Coordinate(
        (2 * initialPoint.x + terminalPoint.x) / 3,
        (2 * initialPoint.y + terminalPoint.y) / 3
    );
    const subPoint2 = new Coordinate(
        (initialPoint.x + 2 * terminalPoint.x) / 3,
        (initialPoint.y + 2 * terminalPoint.y) / 3
    );
    const midX = (initialPoint.x + terminalPoint.x) / 2;
    const midY = (initialPoint.y + terminalPoint.y) / 2;
    const apexX = midX + APEX_FACTOR * (initialPoint.y - terminalPoint.y);
    const apexY = midY + APEX_FACTOR * (terminalPoint.x - initialPoint.x);
    const apexPoint = new Coordinate(apexX, apexY);

    return [initialPoint, subPoint1, apexPoint, subPoint2];
}

const applyTransformationStep = (currentVertices) => {
    const processedSegments = currentVertices.slice(0, currentVertices.length - 1)
        .flatMap((startPt, index) => {
            const endPt = currentVertices[index + 1];
            return transformSegment(startPt, endPt);
        });
    processedSegments.push(currentVertices[currentVertices.length - 1]);
    return processedSegments;
};

const initialVertices = [new Coordinate(0, 0), new Coordinate(100, 0)];

const finalVertices = Array.from({ length: generationDepth }).reduce((pathAccumulator) => {
    return applyTransformationStep(pathAccumulator);
}, initialVertices);

finalVertices.forEach(pt => {
    console.log(`${pt.x} ${pt.y}`);
});