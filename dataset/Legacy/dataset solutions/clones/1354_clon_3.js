process.stdin.resume();
process.stdin.setEncoding('utf8');

function calculateRectangleProperties(lengthDimension, widthDimension) {
    const sumOfDimensions = lengthDimension + widthDimension;
    const perimeterResult = sumOfDimensions * 2;
    const areaResult = lengthDimension * widthDimension;
    return { calculatedArea: areaResult, calculatedPerimeter: perimeterResult };
}

process.stdin.on('data', function (inputDataChunk) {
    const inputParts = inputDataChunk.split(" ");

    const firstDimensionString = inputParts[0];
    const secondDimensionString = inputParts[1];

    const lengthValue = parseInt(firstDimensionString, 10);
    const widthValue = parseInt(secondDimensionString, 10);

    const propertyResults = calculateRectangleProperties(lengthValue, widthValue);

    const finalArea = propertyResults.calculatedArea;
    const finalPerimeter = propertyResults.calculatedPerimeter;

    console.log(finalArea + " " + finalPerimeter);
});
