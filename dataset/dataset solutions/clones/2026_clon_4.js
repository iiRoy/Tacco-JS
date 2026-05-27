function processInput(rawInputContent) {
    const [lineOne, lineTwo] = rawInputContent.trim().split('\n');
    const [totalCircumference, pointCount] = lineOne.split(' ').map(Number);
    const pointLocations = lineTwo.split(' ').map(Number);

    const intermediateGaps = pointLocations.slice(0, pointCount - 1).map((currentLocation, idx) => {
        return pointLocations[idx + 1] - currentLocation;
    });

    const circularGap = totalCircumference - pointLocations[pointCount - 1] + pointLocations[0];

    const allGapMeasurements = [...intermediateGaps, circularGap];

    const largestGap = Math.max(...allGapMeasurements);

    console.log(totalCircumference - largestGap);
}

processInput(require("fs").readFileSync("/dev/stdin","utf8"));
