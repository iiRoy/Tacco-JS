const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

const lineFragments = rawData.trim().split('\n');
const configValues = lineFragments.shift().split(' ').map(Number);

const elementCount = configValues[0];
const terminalMoment = configValues[2];

let elementRecords = Array.from({ length: elementCount }, (_, i) => ({
    originalKey: i,
    magnitude: 0,
    tally: 0
}));

lineFragments.push([1, terminalMoment, 0].join(' '));

const eventChronicle = lineFragments.map(line => {
    const parts = line.split(' ').map(Number);
    return {
        affectedKey: parts[0] - 1,
        timestamp: parts[1],
        delta: parts[2]
    };
});

const determineForemost = (presentRecords) => {
    let peakMagnitude = -Infinity;
    let peakKey = -1;

    for (const entry of presentRecords) {
        if (entry.magnitude > peakMagnitude) {
            peakMagnitude = entry.magnitude;
            peakKey = entry.originalKey;
        } else if (entry.magnitude === peakMagnitude && entry.originalKey < peakKey) {
            peakKey = entry.originalKey;
        }
    }
    return { position: peakKey, worth: peakMagnitude };
};

const culminatedStatus = eventChronicle.reduce((accumulator, activeIncident) => {
    let [transformingRecords, priorTimestamp, previousForemostKey] = accumulator;

    // Create a new array of records to maintain immutability for the reduce pattern
    let subsequentRecords = transformingRecords.map(e => ({ ...e }));

    const durationSegment = activeIncident.timestamp - priorTimestamp;

    if (previousForemostKey !== -1) {
        subsequentRecords[previousForemostKey].tally += durationSegment;
    }

    // Capture the state of the foremost element *before* the current incident's value change
    const foremostBeforeChange = transformingRecords[previousForemostKey];

    // Apply the value change for the affected entity
    subsequentRecords[activeIncident.affectedKey].magnitude += activeIncident.delta;

    let nextForemostKey;

    if (activeIncident.delta > 0) {
        const impactedEntry = subsequentRecords[activeIncident.affectedKey];

        if (impactedEntry.magnitude > foremostBeforeChange.magnitude) {
            nextForemostKey = impactedEntry.originalKey;
        } else if (impactedEntry.magnitude === foremostBeforeChange.magnitude && impactedEntry.originalKey <= foremostBeforeChange.originalKey) {
            nextForemostKey = impactedEntry.originalKey;
        } else {
            nextForemostKey = previousForemostKey;
        }
    } else if (activeIncident.delta < 0) {
        const leadingElement = determineForemost(subsequentRecords);
        nextForemostKey = leadingElement.position;
    } else { // activeIncident.delta === 0
        nextForemostKey = previousForemostKey;
    }

    return [subsequentRecords, activeIncident.timestamp, nextForemostKey];
}, [elementRecords, 0, determineForemost(elementRecords).position]);

const resolvedRecords = culminatedStatus[0];

const orderedRecords = resolvedRecords.sort((a, b) => {
    if (a.tally === b.tally) {
        return a.originalKey - b.originalKey;
    }
    return b.tally - a.tally;
});

console.log(orderedRecords[0].originalKey + 1);