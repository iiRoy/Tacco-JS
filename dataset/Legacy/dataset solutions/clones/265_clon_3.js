var rawInputStr = require('fs').readFileSync('/dev/stdin', 'utf8');

function processInputData(dataString) {
    const trimmedContent = dataString.trim();
    const lineSegments = trimmedContent.split("\n");
    const numericalValues = lineSegments.map(Number);
    return numericalValues;
}

var numericalArray = processInputData(rawInputStr);

function calculatePyramidSurfaceArea(baseDimension, heightDimension) {
    const baseSquared = baseDimension * baseDimension;
    const fourTimesHeightSquared = 4 * heightDimension * heightDimension;
    const termUnderSquareRoot = fourTimesHeightSquared + baseSquared;
    const lateralSurfaceComponent = baseDimension * Math.sqrt(termUnderSquareRoot);
    const totalArea = lateralSurfaceComponent + baseSquared;
    return totalArea;
}

for (var currentIndex = 0; currentIndex < numericalArray.length; currentIndex += 2) {
    var baseValue = numericalArray[currentIndex];
    var heightValue = numericalArray[currentIndex + 1];

    if (baseValue === 0 && heightValue === 0) {
        break;
    }

    var computedSurface = calculatePyramidSurfaceArea(baseValue, heightValue);

    console.log(computedSurface.toFixed(5));
}
