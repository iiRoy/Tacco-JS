const fileSystemUtility = require('node:fs');

// Acquire the entire content from the standard input stream.
const rawDataPayload = fileSystemUtility.readFileSync('/dev/stdin', { encoding: 'utf8' });

// Pre-process the input by removing any leading/trailing whitespace from the whole block,
// then breaking it into individual line entries. This mimics the original's global trim.
const processedSegments = rawDataPayload.trim().split('\n');

// The first segment is our primary string for containment checks.
const principalString = processedSegments[0];

// The second segment specifies the total number of subsequent query items.
const queryTotal = parseInt(processedSegments[1], 10);

// Extract the actual query items, starting from the third segment up to the specified total.
const candidateQueries = processedSegments.slice(2, 2 + queryTotal);

// Iterate through each candidate query to determine its presence in the principal string.
const detectionOutcomes = candidateQueries.map(function(currentQuery) {
    let matchDetected = false; // Flag to indicate if the current query is found

    // Special case: an empty string is always considered "found" within any string.
    if (currentQuery.length === 0) {
        matchDetected = true;
    } 
    // Proceed with search only if the query is not longer than the principal string.
    else if (currentQuery.length <= principalString.length) {
        // Outer loop: Iterate through all possible starting positions for the query within the principal string.
        for (let principalPosition = 0; principalPosition <= principalString.length - currentQuery.length; principalPosition++) {
            let segmentMatches = true; // Assume a match for the current starting position

            // Inner loop: Compare characters of the query with the corresponding segment of the principal string.
            for (let queryCharacterOffset = 0; queryCharacterOffset < currentQuery.length; queryCharacterOffset++) {
                if (principalString[principalPosition + queryCharacterOffset] !== currentQuery[queryCharacterOffset]) {
                    segmentMatches = false; // A character mismatch was found, so this starting position doesn't work.
                    break; // Exit the inner loop.
                }
            }

            if (segmentMatches) {
                matchDetected = true; // The entire query matched at this principalPosition.
                break; // Exit the outer loop as the query has been found.
            }
        }
    }

    // Return '1' if the query was found, '0' otherwise, represented as a string.
    return matchDetected ? '1' : '0';
});

// Output each computed outcome on a new line using an alternative output method.
detectionOutcomes.forEach(function(finalVerdict) {
    process.stdout.write(finalVerdict + '\n');
});