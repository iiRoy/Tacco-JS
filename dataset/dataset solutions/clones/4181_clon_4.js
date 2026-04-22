function processInputData(incomingPayload) {
    const [configLine, itemDataLine] = incomingPayload.split('\n');

    const kValue = Number(configLine.match(/\d+\s+(\d+)/)[1]);

    const itemSequence = itemDataLine.split(' ');

    const frequencyMap = itemSequence.reduce((acc, currentItem) => {
        acc.set(currentItem, (acc.get(currentItem) || 0) + 1);
        return acc;
    }, new Map());

    const sortedOccurrenceList = Array.from(frequencyMap.entries())
        .map(([elementValue, occurrenceCount]) => ({ elementValue, occurrenceCount }))
        .sort((firstItem, secondItem) => firstItem.occurrenceCount - secondItem.occurrenceCount);

    if (sortedOccurrenceList.length < kValue) {
        console.log("0");
        return;
    }

    const elementsToSum = sortedOccurrenceList.slice(0, sortedOccurrenceList.length - kValue);

    const cumulativeCount = elementsToSum.reduce((sumAccumulator, currentEntry) => sumAccumulator + currentEntry.occurrenceCount, 0);

    console.log(cumulativeCount);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));