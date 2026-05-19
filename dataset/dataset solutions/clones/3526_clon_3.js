const parseNumericString = (strValue) => parseInt(strValue, 10);

function processInputData(rawData) {
    const dataLines = rawData.split('\n');

    const firstLineSegments = dataLines[0].split(' ');
    const xCoordinateStrings = dataLines[1].split(' ');
    const yCoordinateStrings = dataLines[2].split(' ');

    const numXPoints = parseNumericString(firstLineSegments[0]);
    const numYPoints = parseNumericString(firstLineSegments[1]);
    const initialXBoundary = parseNumericString(firstLineSegments[2]);
    const initialYBoundary = parseNumericString(firstLineSegments[3]);

    if (initialXBoundary >= initialYBoundary) {
        console.log('War');
        return;
    }

    const xCoordinates = xCoordinateStrings.map(parseNumericString);
    const yCoordinates = yCoordinateStrings.map(parseNumericString);

    const maximumXValue = Math.max(initialXBoundary, ...xCoordinates);
    const minimumYValue = Math.min(initialYBoundary, ...yCoordinates);

    if (minimumYValue >= maximumXValue) {
        console.log('War');
    } else {
        console.log('No War');
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
