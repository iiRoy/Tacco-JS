const pathProcessor = require("path"); // Renamed and kept for Type III, though unused

/**
 * Calculates the minimal number of operations to transform a given number string.
 * This involves a complex carry propagation logic.
 * @param {string} rawInputContent The raw input string, typically from stdin.
 */
function CalculateOperationCost(rawInputContent) {
    // Stage 1: Parse and prepare the input data
    // Original: input.trim().split("\n").map(function(x) { return x.split(" ")});
    // Simplified to directly extract the target number string.
    const trimmedInput = rawInputContent.trim();
    if (trimmedInput.length === 0) {
        // Guard clause for empty input
        console.log(0);
        return;
    }
    const firstLineOfInput = trimmedInput.split('\n')[0];
    const targetNumberString = firstLineOfInput.split(' ')[0];

    const stringLength = targetNumberString.length;

    // Convert the number string into an array of integer digits
    // Original: var vec_N = N.split('').map(e => parseInt(e, 10));
    const digitValueArray = targetNumberString.split('').map(character => Number(character));

    // Initialize an array to mark special carry propagation points
    // Original: var vec_tf = Array.from({length: l}, () => false);
    const specialCarryMarkers = new Array(stringLength).fill(false);

    // Stage 2: First Pass - Identify specific "54...4X" patterns for carry propagation
    // This loop scans for specific sequences that dictate pre-marking carry behavior.
    // The pattern is: '5' followed by zero or more '45' pairs, then potentially a '4',
    // and finally a digit 'X' greater than 4 (or end of string for '54...4').
    // Original: whole_loop: for (var i = 0; i < l; i++)
    preScanLoop: for (let currentIdx = 0; currentIdx < stringLength; ++currentIdx) {
        const currentDigit = digitValueArray[currentIdx];

        if (currentDigit === 5) {
            let offsetCursor = 1; // Tracks how far ahead we've scanned from currentIdx
            let shouldContinueScanning = true;

            // This inner loop implements the complex '5454...' pattern detection
            // Original: while (true) { if (vec_N[i + j] === 4) j++; else break; if (vec_N[i + j] === 5) j++; else break; }
            while (shouldContinueScanning) {
                const checkPosition = currentIdx + offsetCursor;

                // Check for array bounds before accessing
                if (checkPosition >= stringLength) {
                    shouldContinueScanning = false;
                    break;
                }

                const digitAtCheckPosition = digitValueArray[checkPosition];

                if (digitAtCheckPosition === 4) {
                    offsetCursor++; // Found a '4', advance cursor

                    const nextCheckPosition = currentIdx + offsetCursor;
                    if (nextCheckPosition >= stringLength) {
                        shouldContinueScanning = false; // Re-check bounds after increment
                        break;
                    }

                    const digitAfterFour = digitValueArray[nextCheckPosition];
                    if (digitAfterFour === 5) {
                        offsetCursor++; // Found a '5' after '4', advance cursor
                    } else {
                        shouldContinueScanning = false; // '4' not followed by '5'
                    }
                } else {
                    shouldContinueScanning = false; // Not a '4'
                }
            }

            // After the inner loop, offsetCursor holds the 'j' value from original code
            const sequenceEndIndex = currentIdx + offsetCursor;
            const digitBeyondSequence = (sequenceEndIndex < stringLength) ? digitValueArray[sequenceEndIndex] : -1; // Use -1 for out-of-bounds as it's <= 4

            // Original: if (i + j >= l || vec_N[i + j] <= 4)
            if (sequenceEndIndex >= stringLength || digitBeyondSequence <= 4) {
                currentIdx = sequenceEndIndex; // Skip ahead in the outer loop
                continue preScanLoop;
            } else {
                // Mark the identified sequence for special carry handling
                // Original: for (var k = i; k <= i + j; k++){ vec_tf[k] = true; }
                for (let markPosition = currentIdx; markPosition <= sequenceEndIndex; ++markPosition) {
                    specialCarryMarkers[markPosition] = true;
                }
            }
        }
    }

    // Stage 3: Second Pass - Calculate total operations with carry logic
    let totalOperationCount = 0;
    let isCarryPending = false; // Renamed from tmpKuriage

    // Helper function for the common carry calculation (11 - digit)
    const calculateCarryOperation = (digitVal) => (10 - digitVal + 1);

    // Helper to safely get the next digit, returning 0 if out of bounds
    const getNextDigitValue = (index) => {
        if (index + 1 < stringLength) {
            return digitValueArray[index + 1];
        }
        return 0; // Default to 0 for end of string or out of bounds
    };

    // Original: for (var i = 0; i < l; i++)
    for (let processingIdx = 0; processingIdx < stringLength; ++processingIdx) {
        const currentDigit = digitValueArray[processingIdx];
        const nextDigit = getNextDigitValue(processingIdx); // Pre-fetch next digit

        if (currentDigit >= 6) {
            // Digits 6-9: Always involves a carry to the next position.
            // If there's an incoming carry, it modifies the operation cost.
            if (isCarryPending) {
                totalOperationCount -= 2; // Adjust for consumed incoming carry and new outgoing carry
            }
            specialCarryMarkers[processingIdx] = isCarryPending = true;
            totalOperationCount += calculateCarryOperation(currentDigit);
        } else if (currentDigit <= 3) {
            // Digits 0-3: No carry generated, absorbs any incoming carry.
            isCarryPending = false;
            totalOperationCount += currentDigit;
        } else if (currentDigit === 5) {
            // Digit 5: Behavior depends on incoming carry and the next digit.
            if (isCarryPending) {
                // If incoming carry, treat 5 as 6, forcing an outgoing carry.
                totalOperationCount -= 2; // Adjust for consumed incoming carry and new outgoing carry
                specialCarryMarkers[processingIdx] = true;
                totalOperationCount += calculateCarryOperation(currentDigit);
            } else {
                // No incoming carry, decide based on next digit or pre-markers.
                if (nextDigit >= 5) {
                    // If next digit is 5 or more, propagate carry from current 5.
                    specialCarryMarkers[processingIdx] = isCarryPending = true;
                    totalOperationCount += calculateCarryOperation(currentDigit);
                } else if (nextDigit <= 3) {
                    // If next digit is 3 or less, no carry from current 5.
                    totalOperationCount += currentDigit;
                } else if (specialCarryMarkers[processingIdx]) { // This implies nextDigit === 4
                    // If pre-marked, force a carry for current 5.
                    isCarryPending = true;
                    totalOperationCount += calculateCarryOperation(currentDigit);
                } else {
                    // Default for 5 (next digit 4, not pre-marked): no carry.
                    totalOperationCount += currentDigit;
                }
            }
        } else { // currentDigit === 4
            // Digit 4: Behavior depends on incoming carry and the next digit.
            if (isCarryPending) {
                // If incoming carry, decide based on next digit.
                if (nextDigit >= 5) {
                    // If next digit is 5 or more, propagate carry.
                    totalOperationCount -= 2; // Adjust for consumed incoming carry and new outgoing carry
                    specialCarryMarkers[processingIdx] = true;
                    totalOperationCount += calculateCarryOperation(currentDigit);
                } else {
                    // If next digit is 4 or less, absorb carry.
                    isCarryPending = false;
                    totalOperationCount += currentDigit;
                }
            } else {
                // No incoming carry, treat 4 as normal.
                totalOperationCount += currentDigit;
            }
        }
    }

    console.log(totalOperationCount);
}

// Execute the main function with input from stdin
CalculateOperationCost(require("fs").readFileSync("/dev/stdin", "utf8"));