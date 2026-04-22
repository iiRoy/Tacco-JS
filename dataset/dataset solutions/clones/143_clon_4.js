const dataAccess = require('node:fs');

const processInputData = () => {
    const rawTextContent = dataAccess.readFileSync(0, 'utf8');
    const statementLines = rawTextContent.split('\n').filter(Boolean);

    const evaluateLineSegment = (segmentFragment) => {
        const valueSequence = segmentFragment.split(',').map(Number);

        const pointCollection = [
            { xVal: valueSequence[0], yVal: valueSequence[1] },
            { xVal: valueSequence[2], yVal: valueSequence[3] },
            { xVal: valueSequence[4], yVal: valueSequence[5] },
            { xVal: valueSequence[6], yVal: valueSequence[7] }
        ];

        const computeGradient = (firstPoint, secondPoint) => {
            return (secondPoint.yVal - firstPoint.yVal) / (secondPoint.xVal - firstPoint.xVal);
        };

        const gradientAtoB = computeGradient(pointCollection[0], pointCollection[1]);
        const gradientBtoC = computeGradient(pointCollection[1], pointCollection[2]);
        const gradientCtoD = computeGradient(pointCollection[2], pointCollection[3]);
        const gradientDtoA = computeGradient(pointCollection[3], pointCollection[0]);

        const allGradients = [gradientAtoB, gradientBtoC, gradientCtoD, gradientDtoA];

        const nonNegativeCount = allGradients.reduce((accumulator, currentGradient) => {
            return accumulator + (currentGradient >= 0 ? 1 : 0);
        }, 0);

        console.log(nonNegativeCount % 2 === 1 ? 'YES' : 'NO');
    };

    statementLines.forEach(evaluateLineSegment);
};

processInputData();