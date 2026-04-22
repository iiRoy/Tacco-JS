const processExternalData = (incomingText) => {
    const lines = incomingText.split('\n');
    const totalEntries = parseInt(lines[0], 10);
    const spatialCoordinates = [];

    for (let index = 1; index <= totalEntries; ++index) {
        if (lines[index]) {
            const parts = lines[index].split(' ').map(Number);
            spatialCoordinates.push({ horizontal: parts[0], vertical: parts[1] });
        }
    }
    return spatialCoordinates;
};

const determineOverallSpread = (dataPoints) => {
    if (!dataPoints || dataPoints.length < 2) {
        return 0;
    }

    let minSumComponent = Infinity;
    let maxSumComponent = -Infinity;
    let minDifferenceComponent = Infinity;
    let maxDifferenceComponent = -Infinity;

    dataPoints.forEach(currentDatum => {
        const sumValue = currentDatum.horizontal + currentDatum.vertical;
        const differenceValue = currentDatum.horizontal - currentDatum.vertical;

        minSumComponent = Math.min(minSumComponent, sumValue);
        maxSumComponent = Math.max(maxSumComponent, sumValue);
        minDifferenceComponent = Math.min(minDifferenceComponent, differenceValue);
        maxDifferenceComponent = Math.max(maxDifferenceComponent, differenceValue);
    });

    const sumExtent = maxSumComponent - minSumComponent;
    const differenceExtent = maxDifferenceComponent - minDifferenceComponent;

    return Math.max(sumExtent, differenceExtent);
};

(function () {
    const rawContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    const parsedLocations = processExternalData(rawContent);
    const finalMeasure = determineOverallSpread(parsedLocations);
    process.stdout.write(finalMeasure.toString() + '\n');
})();