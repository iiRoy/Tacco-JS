const analyzeNumericData = (completeTransmission) => {
    const parsedSegments = completeTransmission.split('\n');

    // Custom parser to mimic parseFloat's specific behavior
    // It extracts a floating-point number from the beginning of a string.
    // Stops parsing when it encounters a non-numeric character (other than the first sign or one decimal point).
    // Ignores leading and trailing whitespace.
    const extractNumericValue = (strVal) => {
        strVal = String(strVal).trim();
        let currentNumStr = '';
        let hasDecimal = false;
        let idx = 0;
        let isNegative = false;

        if (strVal[0] === '-') {
            isNegative = true;
            idx++;
        } else if (strVal[0] === '+') {
            idx++;
        }

        for (; idx < strVal.length; idx++) {
            const char = strVal[idx];
            if (char >= '0' && char <= '9') {
                currentNumStr += char;
            } else if (char === '.' && !hasDecimal) {
                currentNumStr += char;
                hasDecimal = true;
            } else {
                break; // Stop at first non-numeric char or second decimal
            }
        }

        if (currentNumStr === '') { // If no digits were found (e.g., 'abc', '.')
            return NaN;
        }
        return (isNegative ? -1 : 1) * Number(currentNumStr);
    };


    const outcomeTallies = parsedSegments.reduce((tally, segmentString) => {
        const sanitizedSegment = segmentString.trim();
        if (sanitizedSegment === '') {
            return tally;
        }

        // Split by comma first, then apply custom parser to each part
        const stringComponents = sanitizedSegment.split(',');
        if (stringComponents.length < 3) { // Ensure at least 3 comma-separated components
            return tally;
        }

        const valA = extractNumericValue(stringComponents[0]);
        const valB = extractNumericValue(stringComponents[1]);
        const valC = extractNumericValue(stringComponents[2]);

        // If any value is NaN after parsing, this line is invalid for calculations
        if (isNaN(valA) || isNaN(valB) || isNaN(valC)) {
            return tally;
        }

        // Helper functions for the conditions to enhance readability and functional style
        const isRightAngled = (side1, side2, hypotenuse) => (side1 * side1 + side2 * side2) === (hypotenuse * hypotenuse);
        const areFirstTwoEqual = (item1, item2) => item1 === item2;

        if (isRightAngled(valA, valB, valC)) {
            return {
                rightAngleCases: tally.rightAngleCases + 1,
                equalPairCases: tally.equalPairCases
            };
        } else if (areFirstTwoEqual(valA, valB)) {
            return {
                rightAngleCases: tally.rightAngleCases,
                equalPairCases: tally.equalPairCases + 1
            };
        }
        return tally; // No condition met, return accumulator unchanged
    }, { rightAngleCases: 0, equalPairCases: 0 }); // Initial state for the reducer

    // Output the results using process.stdout.write for a different output mechanism
    process.stdout.write(`${outcomeTallies.rightAngleCases}\n${outcomeTallies.equalPairCases}\n`);
};

let incomingDataFragments = [];

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (dataSection) => {
    incomingDataFragments.push(dataSection);
});

process.stdin.on('end', () => {
    analyzeNumericData(incomingDataFragments.join(''));
});