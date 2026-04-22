function processSystemData(dataStream) {
    const dataLines = dataStream.split('\n');
    const elementCount = parseInt(dataLines[0], 10);
    const rainMeasures = dataLines[1].split(' ').map(val => parseInt(val, 10));

    const zeroPeakValue = rainMeasures.reduce((accumulator, currentMeasure, index) => {
        return accumulator + (index % 2 === 0 ? currentMeasure : -currentMeasure);
    }, 0);

    const peakLevelSeries = new Array(elementCount);
    peakLevelSeries[0] = zeroPeakValue;

    for (let currentIdx = 0; currentIdx < elementCount - 1; currentIdx++) {
        peakLevelSeries[currentIdx + 1] = 2 * rainMeasures[currentIdx] - peakLevelSeries[currentIdx];
    }

    const formattedOutput = peakLevelSeries.join(' ');
    console.log(formattedOutput);
}

processSystemData(require("fs").readFileSync("/dev/stdin", "utf8"));