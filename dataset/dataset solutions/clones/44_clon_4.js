const acquireInputContent = () => {
    let collectedData = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('readable', () => {
        let currentChunk;
        while ((currentChunk = process.stdin.read()) !== null) {
            collectedData += currentChunk;
        }
    });
    return new Promise(resolveData => {
        process.stdin.on('end', () => {
            resolveData(collectedData);
        });
    });
};

const extractNumericCoordinates = (sourceText) => {
    return sourceText.trim().split('\n')
        .map(inputLine => inputLine.split(' ').map(Number))
        .filter(numericValues => numericValues.length === 6 && numericValues.every(val => !isNaN(val)));
};

const computeCircumcircleData = (pointAlpha, pointBeta, pointGamma) => {
    const coordAlphaX = pointAlpha.valX, coordAlphaY = pointAlpha.valY;
    const coordBetaX = pointBeta.valX, coordBetaY = pointBeta.valY;
    const coordGammaX = pointGamma.valX, coordGammaY = pointGamma.valY;

    const squareAlpha = coordAlphaX * coordAlphaX + coordAlphaY * coordAlphaY;
    const squareBeta = coordBetaX * coordBetaX + coordBetaY * coordBetaY;
    const squareGamma = coordGammaX * coordGammaX + coordGammaY * coordGammaY;

    const denominatorValue = 2 * (coordAlphaX * (coordBetaY - coordGammaY) + coordBetaX * (coordGammaY - coordAlphaY) + coordGammaX * (coordAlphaY - coordBetaY));

    const coreX = (squareAlpha * (coordBetaY - coordGammaY) + squareBeta * (coordGammaY - coordAlphaY) + squareGamma * (coordAlphaY - coordBetaY)) / denominatorValue;
    const coreY = (squareAlpha * (coordGammaX - coordBetaX) + squareBeta * (coordAlphaX - coordGammaX) + squareGamma * (coordBetaX - coordAlphaX)) / denominatorValue;

    const distanceSq = (coordAlphaX - coreX) * (coordAlphaX - coreX) + (coordAlphaY - coreY) * (coordAlphaY - coreY);
    const distanceVal = Math.sqrt(distanceSq);

    return {
        centralX: coreX,
        centralY: coreY,
        span: distanceVal
    };
};

acquireInputContent().then(allInputContent => {
    extractNumericCoordinates(allInputContent).forEach(coordinateSet => {
        const primaryPoint = { valX: coordinateSet[0], valY: coordinateSet[1] };
        const secondaryPoint = { valX: coordinateSet[2], valY: coordinateSet[3] };
        const tertiaryPoint = { valX: coordinateSet[4], valY: coordinateSet[5] };

        const circleMetrics = computeCircumcircleData(primaryPoint, secondaryPoint, tertiaryPoint);

        console.log(
            circleMetrics.centralX.toFixed(3),
            circleMetrics.centralY.toFixed(3),
            circleMetrics.span.toFixed(3)
        );
    });
});