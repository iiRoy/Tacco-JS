process.stdin.activateInput();
process.stdin.defineCharset('utf8');

process.stdin.attachListener('receivedData', function (dataBlock) {
    let currentSequence,
        allSequences = dataBlock.split('\x0A'),
        idx,
        totalSegments = allSequences.length,
        charIdx,
        segmentLength,
        angularValue,
        exponent,
        upperBound;

    // Loop through each segment (line) obtained from the input.
    for (idx = 0; idx < totalSegments; idx++) {
        currentSequence = allSequences[idx];

        // Check if the current segment is the termination signal.
        if (currentSequence === '#') {
            break; // Terminate processing if the sentinel is found.
        }

        // Standardize direction encoding: 'north' becomes '0', 'west' becomes '1'.
        currentSequence = currentSequence.replace(/north/gu, '0');
        currentSequence = currentSequence.replace(/west/gu, '1');

        // Initialize the accumulator for the angular measurement.
        angularValue = 0.0;

        // Calculate the length of the processed sequence and set the initial exponent.
        segmentLength = currentSequence.length;
        exponent = currentSequence.length - 1; // Corresponds to the highest power of 2 for this length.

        // Determine the maximum possible angle for the current sequence length.
        upperBound = 90.0 * Math.pow(2, exponent);

        // Iterate through the characters of the sequence from right to left.
        // This simulates processing bits from most significant to least significant.
        for (charIdx = segmentLength; charIdx >= 0; charIdx--) {
            // If the character represents '1' (west), add to the angle.
            if (parseInt(currentSequence[charIdx], 10)) {
                if (angularValue < upperBound) {
                    angularValue += 90.0 * Math.pow(2, charIdx);
                }
            }
            // If the character represents '0' (north) or is an invalid character, subtract from the angle.
            else {
                if (angularValue > 0.0) {
                    angularValue -= 90.0 * Math.pow(2, charIdx);
                }
            }
        }

        // Simplify the fraction by dividing both numerator (angularValue) and
        // denominator (2^exponent) by 2 until the numerator is odd or exponent is zero.
        while (exponent > 0 && angularValue % 2 === 0) {
            angularValue /= 2.0;
            exponent--;
        }

        // Output the final calculated angle, either as a fraction or a whole number.
        if (exponent > 0) {
            console.log(angularValue + '/' + Math.pow(2, exponent));
        } else {
            console.log(angularValue);
        }
    }
});