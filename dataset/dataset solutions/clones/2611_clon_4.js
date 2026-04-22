const makeTokenReader = (rawDocument) => {
    const tokenSeries = rawDocument.trim().split(/\s+/).filter(Boolean);
    let tokenIndex = 0;

    const fetchNextNumeric = () => {
        if (tokenIndex >= tokenSeries.length) {
            throw new Error("Input supply exhausted.");
        }
        const dataPoint = tokenSeries[tokenIndex];
        tokenIndex++;
        return Number(dataPoint);
    };

    return { fetchNextNumeric };
};

const determineDirectionalAngle = (horizontalCoord, verticalCoord) => {
    const radianMeasure = Math.atan2(verticalCoord, horizontalCoord);
    let degreeMeasure = radianMeasure * 180 / Math.PI;
    return (degreeMeasure + 360) % 360;
};

const performVectorAggregation = (sourceReader, angleResolver) => {
    const initialVectorCount = sourceReader.fetchNextNumeric();
    const vectorCollection = [];

    for (let pointIterator = 0; pointIterator < initialVectorCount; pointIterator++) {
        const xValue = sourceReader.fetchNextNumeric();
        const yValue = sourceReader.fetchNextNumeric();
        if (xValue === 0 && yValue === 0) continue;

        vectorCollection.push({
            coordX: xValue,
            coordY: yValue,
            angularPosition: angleResolver(xValue, yValue)
        });
    }

    const samplingResolution = 10000;

    const maximumMagnitudeSquared = Array.from({ length: samplingResolution }, (_, sampleIdx) => {
        const currentSweepAngle = (sampleIdx + 0.5) / samplingResolution * 360;

        const accumulatedResultant = vectorCollection.reduce((currentSum, currentVector) => {
            const angleDifferenceBetween = currentVector.angularPosition - currentSweepAngle;
            const normalizedAngleDelta = (angleDifferenceBetween + 180 + 360) % 360 - 180;

            if (normalizedAngleDelta > -90 && normalizedAngleDelta < 90) {
                return {
                    totalX: currentSum.totalX + currentVector.coordX,
                    totalY: currentSum.totalY + currentVector.coordY
                };
            }
            return currentSum;
        }, { totalX: 0, totalY: 0 });

        return accumulatedResultant.totalX * accumulatedResultant.totalX + accumulatedResultant.totalY * accumulatedResultant.totalY;
    }).reduce((currentMaxSquare, calculatedSquare) => Math.max(currentMaxSquare, calculatedSquare), 0);

    return Math.sqrt(maximumMagnitudeSquared);
};

const inputSource = makeTokenReader(require("fs").readFileSync("/dev/stdin", "utf8"));
console.log(performVectorAggregation(inputSource, determineDirectionalAngle));