'use strict';

const fetchLineData = () => new Promise(resolve => {
    let rawDataAccumulator = '';
    const inputSourceStream = process.stdin;

    inputSourceStream.resume();
    inputSourceStream.setEncoding('utf8');

    inputSourceStream.on('data', (dataSegment) => {
        rawDataAccumulator += dataSegment;
    });

    inputSourceStream.on('end', () => {
        resolve(rawDataAccumulator);
    });
});

const convertDegreesToRadians = (degreesValue) => {
    return degreesValue * (Math.PI / 180);
};

const deriveGeometricMeasures = (firstSideLength, secondSideLength, angleDegrees) => {
    const angleRadians = convertDegreesToRadians(angleDegrees);

    const firstSideSquared = Math.pow(firstSideLength, 2);
    const secondSideSquared = Math.pow(secondSideLength, 2);
    const cosineComponent = 2 * firstSideLength * secondSideLength * Math.cos(angleRadians);
    const thirdSideSquared = firstSideSquared + secondSideSquared - cosineComponent;

    const thirdSideLength = Math.sqrt(thirdSideSquared);

    const totalPerimeter = firstSideLength + secondSideLength + thirdSideLength;

    const sineOfAngle = Math.sin(angleRadians);

    const productOfTwoSides = firstSideLength * secondSideLength;
    const surfaceArea = (productOfTwoSides * sineOfAngle) / 2;

    const altitudeValue = secondSideLength * sineOfAngle;

    return { surfaceArea, totalPerimeter, altitudeValue };
};

(async () => {
    const rawInputString = await fetchLineData();

    const [firstSideLength, secondSideLength, angleDegrees] = rawInputString.split(' ').map(Number);

    const { surfaceArea, totalPerimeter, altitudeValue } = deriveGeometricMeasures(
        firstSideLength,
        secondSideLength,
        angleDegrees
    );

    console.log(`${surfaceArea} ${totalPerimeter} ${altitudeValue}`);
})();
