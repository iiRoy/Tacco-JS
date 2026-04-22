const dataStream = require('fs').readFileSync(0, 'utf8');
const eventLogEntries = dataStream.trim().split('\n');

const configurationParameters = eventLogEntries.shift().split(' ').map(Number);
const totalUnits = configurationParameters[0];
const boundaryMeasure = configurationParameters[2]; // This value is only used for the final synthetic event.

// Initialize records for each unit
const unitRecords = Array.from({ length: totalUnits }, (_, unitIdentifier) => ({
    currentValue: 0,
    cumulativeEffect: 0,
    originalOrdinal: unitIdentifier
}));

let currentTimestamp = 0;
let currentDominator = {
    ordinal: 0,
    value: 0
};

// Helper function to re-scan and identify the unit with the highest value
// Tie-breaking: smallest ordinal wins, and if all values are non-positive, ordinal 0 wins.
const pinpointDominator = (recordsCollection) => {
    let peakValueReference = 0; // Matches original's 'MAX=0'
    let peakOrdinalReference = 0; // Matches original's 'm=0'

    recordsCollection.forEach((recordEntry, entryIndex) => {
        if (recordEntry.currentValue > peakValueReference) {
            peakValueReference = recordEntry.currentValue;
            peakOrdinalReference = entryIndex;
        }
        // If recordEntry.currentValue === peakValueReference, peakOrdinalReference is not updated.
        // This implicitly means the smallest index that first set peakValueReference wins.
    });
    return { ordinal: peakOrdinalReference, value: peakValueReference };
};

// Append the final synthetic event
eventLogEntries.push(`1 ${boundaryMeasure} 0`);

for (const singleEventLine of eventLogEntries) {
    const parsedEventDetails = singleEventLine.split(' ').map(Number);
    const affectedUnitIndex = parsedEventDetails[0] - 1; // Convert to 0-based index
    const eventTimePoint = parsedEventDetails[1];
    const valueModification = parsedEventDetails[2];

    // Distribute cumulative effect to the previously dominant unit
    unitRecords[currentDominator.ordinal].cumulativeEffect += eventTimePoint - currentTimestamp;
    currentTimestamp = eventTimePoint;

    // Apply the value modification to the affected unit
    unitRecords[affectedUnitIndex].currentValue += valueModification;

    // Re-evaluate the dominant unit based on the change
    if (valueModification > 0) {
        // If value increased, check if it becomes the new dominant
        if (unitRecords[affectedUnitIndex].currentValue > currentDominator.value) {
            currentDominator = {
                ordinal: affectedUnitIndex,
                value: unitRecords[affectedUnitIndex].currentValue
            };
        } else if (unitRecords[affectedUnitIndex].currentValue === currentDominator.value) {
            // Tie-breaking: smaller ordinal wins
            if (affectedUnitIndex < currentDominator.ordinal) {
                currentDominator = {
                    ordinal: affectedUnitIndex,
                    value: unitRecords[affectedUnitIndex].currentValue
                };
            }
        }
    } else if (valueModification < 0) {
        // If value decreased AND it was the dominant unit, a full re-scan is necessary
        if (affectedUnitIndex === currentDominator.ordinal) {
            currentDominator = pinpointDominator(unitRecords);
        }
        // If it decreased but wasn't dominant, no change in dominant status.
    }
}

// Sort the unit records for final output
unitRecords.sort((unitA, unitB) => {
    // Primary sort key: cumulativeEffect (descending)
    if (unitA.cumulativeEffect === unitB.cumulativeEffect) {
        // Secondary sort key: originalOrdinal (ascending)
        return unitA.originalOrdinal - unitB.originalOrdinal;
    }
    return unitB.cumulativeEffect - unitA.cumulativeEffect;
});

// Output the 1-based original ordinal of the top unit
console.log(unitRecords[0].originalOrdinal + 1);