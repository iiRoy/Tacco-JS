const calculateGeometricSum = (inputPayload) => {
    const lineSegments = inputPayload.split('\n').filter(Boolean);
    const pointCountMeasure = Number(lineSegments[0]);

    const pointCoordinates = lineSegments.slice(1).map(segment => {
        const [horizontal, vertical] = segment.split(/\s+/).map(Number);
        return { horizontal, vertical };
    });

    const allPointPairs = pointCoordinates.flatMap((firstPoint, firstIndex) =>
        pointCoordinates.slice(firstIndex + 1).map(secondPoint => [firstPoint, secondPoint])
    );

    const totalDistanceAccumulator = allPointPairs.reduce((currentSum, [pA, pB]) => {
        const deltaHorizontal = pA.horizontal - pB.horizontal;
        const deltaVertical = pA.vertical - pB.vertical;
        const pairDistance = Math.hypot(deltaHorizontal, deltaVertical);
        return currentSum + pairDistance;
    }, 0);

    const finalCalculatedValue = (totalDistanceAccumulator * 2) / pointCountMeasure;
    console.log(finalCalculatedValue);
};

const getRawInputSource = () => require('fs').readFileSync('/dev/stdin', 'utf8');
calculateGeometricSum(getRawInputSource());