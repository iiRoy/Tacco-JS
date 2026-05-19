const appSettings = {
    sourcePath: '/dev/stdin',
    lineDelimiter: '\n'
};

const inputDataLines = require('fs').readFileSync(appSettings.sourcePath, 'utf-8').split(appSettings.lineDelimiter);

const createPoint = (coordX, coordY) => {
    return { x: coordX, y: coordY };
};

const generateKochSegment = (startPoint, endPoint, currentIteration) => {
    const zeroIterations = 0;
    if (currentIteration === zeroIterations) {
        return [];
    }

    const angleRad = Math.PI / 3.0;
    const cosineVal = Math.cos(angleRad);
    const sineVal = Math.sin(angleRad);

    const segmentA = createPoint(
        (2 * startPoint.x + endPoint.x) / 3,
        (2 * startPoint.y + endPoint.y) / 3
    );
    const segmentB = createPoint(
        (startPoint.x + 2 * endPoint.x) / 3,
        (startPoint.y + 2 * endPoint.y) / 3
    );

    const deltaX = segmentB.x - segmentA.x;
    const deltaY = segmentB.y - segmentA.y;

    const segmentC = createPoint(
        deltaX * cosineVal - deltaY * sineVal + segmentA.x,
        deltaX * sineVal + deltaY * cosineVal + segmentA.y
    );
    
    const segmentPoints = [];
    const nextIteration = currentIteration - 1;

    segmentPoints.push(...generateKochSegment(startPoint, segmentA, nextIteration));
    segmentPoints.push(segmentA);
    segmentPoints.push(...generateKochSegment(segmentA, segmentC, nextIteration));
    segmentPoints.push(segmentC);
    segmentPoints.push(...generateKochSegment(segmentC, segmentB, nextIteration));
    segmentPoints.push(segmentB);
    segmentPoints.push(...generateKochSegment(segmentB, endPoint, nextIteration));

    return segmentPoints;
};

const computeKochCurve = (totalIterations) => {
    const initialStartPoint = createPoint(0.0, 0.0);
    const initialEndPoint = createPoint(100.0, 0.0);

    if (totalIterations === 0) {
        return [initialStartPoint, initialEndPoint];
    }
    
    const intermediateKochPoints = generateKochSegment(initialStartPoint, initialEndPoint, totalIterations);
    
    return [initialStartPoint, ...intermediateKochPoints, initialEndPoint];
};

const requestedIterations = parseInt(inputDataLines[0]);

const finalKochPoints = computeKochCurve(requestedIterations);

finalKochPoints.forEach(currentPoint => {
    const formattedX = currentPoint.x.toFixed(8);
    const formattedY = currentPoint.y.toFixed(8);
    console.log(formattedX, formattedY);
});
