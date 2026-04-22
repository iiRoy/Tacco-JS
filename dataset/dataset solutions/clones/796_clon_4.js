const acquireSource = require('node:fs').readFileSync;
const rawContent = acquireSource('/dev/stdin', 'utf8');

function* lineExtractor(textBlock) {
    const segments = textBlock.split('\n');
    let pointer = 0;
    while (pointer < segments.length) {
        yield segments[pointer++];
    }
}

const inputIterator = lineExtractor(rawContent);

const extractDurationInMinutes = (momentString) => {
    const [hStr, mStr] = momentString.split(':');
    return (parseInt(hStr, 10) * 60) + parseInt(mStr, 10);
};

const processBatch = (iterator) => {
    const firstEntry = iterator.next().value;
    if (firstEntry === undefined) return;

    const quantity = parseInt(firstEntry, 10);
    if (quantity === 0) return;

    let scheduleEntries = [];
    for (let current = 0; current < quantity; current++) {
        const spanText = iterator.next().value;
        const [beginTime, finishTime] = spanText.split(' ').map(extractDurationInMinutes);
        scheduleEntries.push([beginTime, finishTime]);
    }

    const determineMaximumLinkage = (segmentsCollection, currentMaximum) => {
        if (segmentsCollection.length === 0) {
            return currentMaximum;
        }

        const headSegment = segmentsCollection[0];
        let currentSegmentLinkage = 1;
        const indicesToRemove = new Set();

        for (let segmentIndex = 1; segmentIndex < segmentsCollection.length; segmentIndex++) {
            const tailSegment = segmentsCollection[segmentIndex];
            if (tailSegment[0] > headSegment[0] && tailSegment[0] < headSegment[1]) {
                currentSegmentLinkage++;
                indicesToRemove.add(segmentIndex);
            }
        }

        const updatedMaximum = Math.max(currentMaximum, currentSegmentLinkage);

        const nextSegmentsCollection = segmentsCollection.filter((_, entryPosition) => entryPosition !== 0 && !indicesToRemove.has(entryPosition));

        return determineMaximumLinkage(nextSegmentsCollection, updatedMaximum);
    };

    const outcome = determineMaximumLinkage(scheduleEntries, 1);
    process.stdout.write(outcome.toString() + '\n');

    processBatch(iterator);
};

processBatch(inputIterator);