const diskIOHandler = require('node:fs');

const transformToTemporalUnits = (chronometricString) => {
    const parsedUnits = chronometricString.split(':');
    return (parseInt(parsedUnits[0], 10) * 60) + parseInt(parsedUnits[1], 10);
};

const sourceFeedContent = diskIOHandler.readFileSync(0, 'utf8');
const segmentedEntries = sourceFeedContent.split(/\r?\n/).filter(line => line.trim().length > 0);

const initialParameters = segmentedEntries[0].split(' ');
const segmentQuantity = parseInt(initialParameters[0], 10);
const minimumInterval = parseInt(initialParameters[1], 10);

const travelLogRecords = segmentedEntries.slice(1, 1 + segmentQuantity);

const primaryRecordComponents = travelLogRecords[0].split(' ');
const commencementState = {
    eligiblePassages: [],
    priorArrivalEpoch: transformToTemporalUnits(primaryRecordComponents[2]),
    priorArrivalLocation: primaryRecordComponents[3]
};

const concludingSummary = travelLogRecords.slice(1).reduce((accumulator, presentLogEntry) => {
    const currentRecordDetails = presentLogEntry.split(' ');
    const currentDepartureEpoch = transformToTemporalUnits(currentRecordDetails[0]);
    const currentArrivalEpoch = transformToTemporalUnits(currentRecordDetails[2]);
    const currentArrivalLocation = currentRecordDetails[3];

    const temporalDiscrepancy = currentDepartureEpoch - accumulator.priorArrivalEpoch;
    if (minimumInterval <= temporalDiscrepancy) {
        accumulator.eligiblePassages.push([accumulator.priorArrivalLocation, temporalDiscrepancy]);
    }

    accumulator.priorArrivalEpoch = currentArrivalEpoch;
    accumulator.priorArrivalLocation = currentArrivalLocation;

    return accumulator;
}, commencementState);

console.log(concludingSummary.eligiblePassages.length);

concludingSummary.eligiblePassages.forEach(passageDetail => {
    console.log(`${passageDetail[0]} ${passageDetail[1]}`);
});