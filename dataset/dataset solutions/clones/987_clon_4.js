let incomingData = '';
process.stdin.on('data', fragment => {
    incomingData += fragment.toString();
});

process.stdin.on('end', () => {
    const parsedLines = incomingData.split('\n').filter(lineEntry => lineEntry.length > 0);
    const numericCollection = parsedLines[1].split(' ').map(value => Number(value));

    processSequence(numericCollection);
});

function processSequence(initialItems) {
    const sequenceReports = [];

    sequenceReports.push([...initialItems]);

    initialItems.reduce((sortedSegment, currentItem, itemIndex) => {
        if (itemIndex === 0) {
            return [currentItem];
        }

        let placementSpot = 0;
        while (placementSpot < sortedSegment.length && sortedSegment[placementSpot] < currentItem) {
            placementSpot++;
        }

        const nextSortedSegment = [
            ...sortedSegment.slice(0, placementSpot),
            currentItem,
            ...sortedSegment.slice(placementSpot)
        ];

        const presentFullState = [
            ...nextSortedSegment,
            ...initialItems.slice(itemIndex + 1)
        ];
        sequenceReports.push(presentFullState);

        return nextSortedSegment;
    }, []);

    sequenceReports.forEach(report => {
        process.stdout.write(report.join(' ') + '\n');
    });
}