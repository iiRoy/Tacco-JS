const RADIAN_CONVERSION_FACTOR = Math.PI / 180;
const ROTATION_ANGLE_DEG = 60;
const COSINE_OF_ROTATION_VAL = Math.cos(ROTATION_ANGLE_DEG * RADIAN_CONVERSION_FACTOR);
const SINE_OF_ROTATION_VAL = Math.sin(ROTATION_ANGLE_DEG * RADIAN_CONVERSION_FACTOR);

const formatAndOutputCoordinates = (coordinatePair) => {
    console.log(coordinatePair[0].toFixed(8) + ' ' + coordinatePair[1].toFixed(8));
};

const combineVectors = (vecA, vecB) => [vecA[0] + vecB[0], vecA[1] + vecB[1]];
const differentiateVectors = (vecA, vecB) => [vecA[0] - vecB[0], vecA[1] - vecB[1]];
const scaleVectorByFactor = (vec, factor) => [vec[0] * factor, vec[1] * factor];

function* fractalSequenceProducer(currentIteration, initialSegmentStart, initialSegmentEnd) {
    if (currentIteration === 0) {
        return;
    }

    const segmentVector = differentiateVectors(initialSegmentEnd, initialSegmentStart);
    const oneThirdSegment = scaleVectorByFactor(segmentVector, 1 / 3);

    const firstBreakPoint = combineVectors(initialSegmentStart, oneThirdSegment);
    const secondBreakPoint = combineVectors(initialSegmentStart, scaleVectorByFactor(oneThirdSegment, 2));

    const middleSegment = differentiateVectors(secondBreakPoint, firstBreakPoint);
    const rotatedMiddle = [
        middleSegment[0] * COSINE_OF_ROTATION_VAL - middleSegment[1] * SINE_OF_ROTATION_VAL,
        middleSegment[0] * SINE_OF_ROTATION_VAL + middleSegment[1] * COSINE_OF_ROTATION_VAL
    ];
    const apexPoint = combineVectors(firstBreakPoint, rotatedMiddle);

    yield* fractalSequenceProducer(currentIteration - 1, initialSegmentStart, firstBreakPoint);
    yield firstBreakPoint;
    yield* fractalSequenceProducer(currentIteration - 1, firstBreakPoint, apexPoint);
    yield apexPoint;
    yield* fractalSequenceProducer(currentIteration - 1, apexPoint, secondBreakPoint);
    yield secondBreakPoint;
    yield* fractalSequenceProducer(currentIteration - 1, secondBreakPoint, initialSegmentEnd);
}

(function entryPoint() {
    const depthValue = Number(require('node:fs').readFileSync(0, 'utf8').trim()); 
    
    const startingCoordinate = [0, 0];
    const endingCoordinate = [100, 0];

    formatAndOutputCoordinates(startingCoordinate);

    for (const currentPoint of fractalSequenceProducer(depthValue, startingCoordinate, endingCoordinate)) {
        formatAndOutputCoordinates(currentPoint);
    }
    
    formatAndOutputCoordinates(endingCoordinate);
})();