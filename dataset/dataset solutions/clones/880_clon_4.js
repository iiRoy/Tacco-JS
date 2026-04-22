const acquireSourceData = (locationSource) => {
    const rawContentBuffer = require('fs').readFileSync(locationSource, 'utf8');
    return rawContentBuffer.trim().split('\n');
};

const deriveMinutesFromText = (chronologicalStamp) => {
    const [momentHour, momentMinute] = chronologicalStamp.split(':').map(Number);
    return momentHour * 60 + momentMinute;
};

const processEventSequences = (remainingSourceLines, collectionOfSummaries = []) => {
    if (remainingSourceLines.length === 0) {
        return collectionOfSummaries;
    }

    const [sequenceCount, gapAllowance] = remainingSourceLines.shift().split(' ').map(Number);

    const currentSequenceEntries = remainingSourceLines.splice(0, sequenceCount);

    const { detectedIntervals } = currentSequenceEntries.reduce((registry, currentActivityRecord, entryOrdinal) => {
        const recordComponents = currentActivityRecord.split(' ');
        const presentStartMoment = deriveMinutesFromText(recordComponents[0]);
        const presentEndMoment = deriveMinutesFromText(recordComponents[2]);
        const activityIdentifier = recordComponents[3];

        if (entryOrdinal > 0) {
            const spanDuration = presentStartMoment - registry.previousEndMoment;
            if (spanDuration >= gapAllowance) {
                registry.detectedIntervals.push(`${registry.previousIdentifier} ${spanDuration}`);
            }
        }

        registry.previousEndMoment = presentEndMoment;
        registry.previousIdentifier = activityIdentifier;
        return registry;
    }, { detectedIntervals: [], previousEndMoment: 0, previousIdentifier: '' });

    collectionOfSummaries.push({
        intervalCount: detectedIntervals.length,
        intervalDetails: detectedIntervals
    });

    return processEventSequences(remainingSourceLines, collectionOfSummaries);
};

const entireChronicleData = acquireSourceData('/dev/stdin');
const finalReport = processEventSequences(entireChronicleData);

finalReport.forEach(reportEntry => {
    console.log(reportEntry.intervalCount);
    reportEntry.intervalDetails.forEach(detailItem => console.log(detailItem));
});