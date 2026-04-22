const determinePeakWindowValue = (dataSeries, segmentLength) => {
    if (segmentLength <= 0 || dataSeries.length < segmentLength) {
        return undefined;
    }

    let currentSegmentTotal = 0;
    for (let currentPosition = 0; currentPosition < segmentLength; currentPosition++) {
        currentSegmentTotal += dataSeries[currentPosition];
    }

    let maximumAchieved = currentSegmentTotal;

    for (let currentPosition = segmentLength; currentPosition < dataSeries.length; currentPosition++) {
        currentSegmentTotal += dataSeries[currentPosition] - dataSeries[currentPosition - segmentLength];
        if (currentSegmentTotal > maximumAchieved) {
            maximumAchieved = currentSegmentTotal;
        }
    }
    return maximumAchieved;
};

const processInputData = () => {
    const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
    const lines = rawData.trim().split('\n');

    const problemSet = [];
    let currentSeries = [];
    let currentSpan = 0;

    for (const textLine of lines) {
        if (textLine === "0 0") {
            break;
        }

        const numericValues = textLine.split(' ').map(Number);

        if (numericValues.length === 2) {
            if (currentSeries.length > 0 && currentSpan > 0) {
                problemSet.push({ series: [...currentSeries], span: currentSpan });
            }
            currentSeries = [];
            currentSpan = numericValues[1];
        } else if (numericValues.length === 1) {
            currentSeries.push(numericValues[0]);
        }
    }

    if (currentSeries.length > 0 && currentSpan > 0) {
        problemSet.push({ series: [...currentSeries], span: currentSpan });
    }

    problemSet.forEach(issue => {
        const outcome = determinePeakWindowValue(issue.series, issue.span);
        console.log(outcome);
    });
};

processInputData();