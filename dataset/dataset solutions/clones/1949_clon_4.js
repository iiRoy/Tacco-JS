const acquireContent = require('fs').readFileSync;
const sourceData = acquireContent('/dev/stdin', 'utf8');

let totalCount = 0;
const targetDivisor = 2019;
const minimalSpan = 4; // Corresponds to length >= 4

// Iterate through all possible starting positions for substrings
for (let beginIndex = 0; beginIndex < sourceData.length; ++beginIndex) {
    let currentModulus = 0; // Stores the current substring's numeric value modulo targetDivisor

    // Iterate through all possible ending positions (inclusive) for the current starting position.
    // The original code's inner loop `j` goes up to `N.length - 1`.
    // Since `input.substring(i, j)` includes characters from `i` up to `j-1`,
    // the inclusive end index `finalIndex` corresponds to `j-1`.
    // Thus, `finalIndex` can go up to `(sourceData.length - 1) - 1 = sourceData.length - 2`.
    for (let finalIndex = beginIndex; finalIndex <= sourceData.length - 2; ++finalIndex) {
        // Convert character to integer without using parseInt
        const digitChar = sourceData.charCodeAt(finalIndex);
        const currentDigit = digitChar - 48; // ASCII '0' is 48

        // Update the current value modulo targetDivisor
        currentModulus = (currentModulus * 10 + currentDigit) % targetDivisor;

        // Calculate the length of the current substring
        const currentSpan = finalIndex - beginIndex + 1;

        // Check if the current substring meets the length requirement and is divisible by the target divisor
        if (currentSpan >= minimalSpan && currentModulus === 0) {
            totalCount++;
        }
    }
}

// Output the final count using an alternative to console.log
process.stdout.write(String(totalCount) + '\n');