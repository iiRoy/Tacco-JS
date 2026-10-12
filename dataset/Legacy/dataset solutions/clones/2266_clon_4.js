function processDataStream(rawData) {
    const contentLines = rawData.split('\n');
    const entryCount = Number(contentLines[0]);
    const activationPhrase = contentLines[contentLines.length - 1];

    const dataSegments = contentLines.slice(1, entryCount + 1);

    const triggerPointIndex = dataSegments.findIndex(segment => segment.includes(activationPhrase));

    let totalValue = 0;

    if (triggerPointIndex !== -1) {
        const segmentsToAggregate = dataSegments.slice(triggerPointIndex + 1);

        totalValue = segmentsToAggregate.reduce((currentSum, lineText) => {
            const parts = lineText.split(' ');
            return currentSum + Number(parts[1]);
        }, 0);
    }

    console.log(totalValue);
}

processDataStream(require('fs').readFileSync('/dev/stdin', 'utf8'));
