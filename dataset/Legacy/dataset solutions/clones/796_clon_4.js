var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.split('\n');

let currentLineContent;
while ((currentLineContent = lines.shift()) !== undefined) {
    const intervalCount = parseInt(currentLineContent);
    if (intervalCount === 0) break;

    const initialIntervals = [];
    for (let i = 0; i < intervalCount; i++) {
        const timeEntry = lines.shift();
        const [startMomentStr, endMomentStr] = timeEntry.split(' ');
        const startTimestamp = +(new Date('2000-01-01 ' + startMomentStr));
        const endTimestamp = +(new Date('2000-01-01 ' + endMomentStr));
        initialIntervals.push([startTimestamp, endTimestamp]);
    }

    const intervalRegistry = new Map(initialIntervals.map((intervalData, index) => [index, intervalData]));
    const processedKeys = new Set();
    let maximumTrainConcurrency = 1;

    for (const [primaryKey, primaryInterval] of intervalRegistry.entries()) {
        if (processedKeys.has(primaryKey)) {
            continue;
        }

        let currentTrainPotential = 1;
        const keysToMarkProcessed = new Set();

        for (const [secondaryKey, secondaryInterval] of intervalRegistry.entries()) {
            if (secondaryKey <= primaryKey) { // Only consider intervals appearing after the primary one
                continue;
            }
            if (processedKeys.has(secondaryKey)) { // Skip if already marked as processed by a prior primary interval
                continue;
            }

            // Check if secondaryInterval starts strictly within primaryInterval
            // Original condition: !(primaryInterval[1] <= secondaryInterval[0] || secondaryInterval[0] <= primaryInterval[0])
            // Simplified: primaryInterval[1] > secondaryInterval[0] && secondaryInterval[0] > primaryInterval[0]
            // Which is: primaryInterval[0] < secondaryInterval[0] < primaryInterval[1]
            if (primaryInterval[0] < secondaryInterval[0] && secondaryInterval[0] < primaryInterval[1]) {
                currentTrainPotential++;
                keysToMarkProcessed.add(secondaryKey);
            }
        }

        maximumTrainConcurrency = Math.max(maximumTrainConcurrency, currentTrainPotential);

        // Mark intervals that were "consumed" by this primary interval for future iterations
        keysToMarkProcessed.forEach(key => processedKeys.add(key));
    }
    console.log(maximumTrainConcurrency);
}
