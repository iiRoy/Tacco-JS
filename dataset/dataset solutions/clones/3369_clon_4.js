function analyzeDimensions(dataStream) {
    const allLines = dataStream.split('\n').filter(line => line.trim() !== '');

    if (allLines.length === 0) {
        console.log(0);
        return;
    }

    const [primaryConfiguration, ...secondaryReadings] = allLines;

    const [, minimumHeight, minimumWidth] = primaryConfiguration.split(' ').map(Number);

    const matchesFound = secondaryReadings.filter(measurementEntry => {
        const [currentHeight, currentWidth] = measurementEntry.split(' ').map(Number);
        return currentHeight >= minimumHeight && currentWidth >= minimumWidth;
    }).length;

    console.log(matchesFound);
}