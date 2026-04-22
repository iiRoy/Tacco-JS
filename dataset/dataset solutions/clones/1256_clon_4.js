(() => {
    'use strict';

    const ioManager = require('fs');
    const rawDataStream = ioManager.readFileSync('/dev/stdin', 'utf-8');

    const evaluateNumericSequence = (dataPayload) => {
        const textSegments = dataPayload.trim().split('\n');
        const firstLineValue = parseInt(textSegments[0].trim(), 10); // Parsed but not utilized, consistent with original

        const numberStringTokens = textSegments[1].trim().split(' ');

        const initialStatistics = {
            lowest: 1000000,
            highest: -1000000,
            aggregate: 0
        };

        const finalStatistics = numberStringTokens.reduce((accumulator, currentString) => {
            const parsedNumericalValue = parseInt(currentString, 10);

            if (isNaN(parsedNumericalValue)) {
                // If any token parses to NaN, the total sum becomes NaN,
                // matching the original's behavior where `sum += NaN` results in NaN.
                accumulator.aggregate = NaN;
            } else {
                // Only add to aggregate if it hasn't become NaN yet
                if (!isNaN(accumulator.aggregate)) {
                    accumulator.aggregate += parsedNumericalValue;
                }

                if (parsedNumericalValue > accumulator.highest) {
                    accumulator.highest = parsedNumericalValue;
                }
                if (parsedNumericalValue < accumulator.lowest) {
                    accumulator.lowest = parsedNumericalValue;
                }
            }
            return accumulator;
        }, initialStatistics);

        console.log(`${finalStatistics.lowest} ${finalStatistics.highest} ${finalStatistics.aggregate}`);
    };

    evaluateNumericSequence(rawDataStream);
})();