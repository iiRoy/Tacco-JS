function* obtainInputLines() {
    const rawContent = require("fs").readFileSync("/dev/stdin", "utf8").trim();
    const lines = rawContent.split("\n");
    let lineIndex = 0;
    while (lineIndex < lines.length) {
        yield lines[lineIndex++];
    }
}

function convertLineToNumericArray(inputLine) {
    return inputLine.split(" ").map(Number);
}

function executeSolution() {
    const inputSequencer = obtainInputLines();

    const [circuitLength, numStops] = convertLineToNumericArray(inputSequencer.next().value);
    const stopCoordinates = convertLineToNumericArray(inputSequencer.next().value);

    const pathSegments = stopCoordinates.map((currentCoordinate, index, allCoordinates) => {
        const nextCoordinate = allCoordinates[(index + 1) % allCoordinates.length];
        if (index === allCoordinates.length - 1) {
            return circuitLength - currentCoordinate + allCoordinates[0];
        } else {
            return nextCoordinate - currentCoordinate;
        }
    });

    pathSegments.sort((first, second) => first - second);

    const finalSum = pathSegments.slice(0, -1).reduce((totalAccumulator, segmentValue) => totalAccumulator + segmentValue, 0);

    console.log(finalSum);
}

executeSolution();