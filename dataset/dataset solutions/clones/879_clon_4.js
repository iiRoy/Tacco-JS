(function(sourceData) {
    const timeToMinutes = (timeStr) => {
        const timeParts = timeStr.split(':').map(Number);
        return timeParts[0] * 60 + timeParts[1];
    };

    const [headerLine, ...dataEntries] = sourceData.trim().split('\n');
    const [eventCount, minimumInterval] = headerLine.split(' ').map(Number);

    const processingResult = dataEntries.slice(0, eventCount).reduce((accumulator, currentEntry) => {
        const entrySegments = currentEntry.split(' ');
        const entryStartTime = timeToMinutes(entrySegments[0]);
        const entryIdentifier = entrySegments[1];
        const entryEndTime = timeToMinutes(entrySegments[2]);

        const timeDifference = entryStartTime - accumulator.priorEndingMoment;

        if (timeDifference >= minimumInterval) {
            accumulator.qualifiedRecords.push(`${entryIdentifier} ${timeDifference}`);
        }

        accumulator.priorEndingMoment = entryEndTime;
        return accumulator;
    }, { priorEndingMoment: 86400, qualifiedRecords: [] });

    const finalOutput = [
        processingResult.qualifiedRecords.length,
        ...processingResult.qualifiedRecords
    ].join('\n');

    console.log(finalOutput);
})(require('fs').readFileSync('/dev/stdin', 'utf8').trim());