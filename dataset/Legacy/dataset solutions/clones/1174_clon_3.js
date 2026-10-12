function processTriangleData() {
    const fileSystemModule = require('fs');
    const inputFilePath = '/dev/stdin';

    const readAndParseInput = (path, fsMod) => {
        const rawData = fsMod.readFileSync(path).toString();
        const parsedNumbers = rawData.split(" ").map(Number);
        return parsedNumbers;
    };

    const triangleMeasurements = readAndParseInput(inputFilePath, fileSystemModule);

    const sideA = triangleMeasurements[0];
    const sideB = triangleMeasurements[1];
    const angleC_degrees = triangleMeasurements[2];

    const DEGREES_TO_RADIANS_FACTOR = Math.PI / 180;

    const angleC_radians = angleC_degrees * DEGREES_TO_RADIANS_FACTOR;

    const square = (value) => value * value;

    const height = Math.sin(angleC_radians) * sideB;
    const adjacentSegment = Math.cos(angleC_radians) * sideB;

    const sideC = Math.sqrt(square(sideA - adjacentSegment) + square(height));

    const area = (sideA * height) / 2;
    const perimeter = sideA + sideB + sideC;

    const outputString = area + '\n' + perimeter + '\n' + height;

    console.log(outputString);
}

processTriangleData();
