'use strict';

function processInputData(incomingText) {
    const linesOfData = incomingText.split(/\r?\n/).filter(Boolean);

    // The first line often contains a count (N), but it's not explicitly used in the logic
    // beyond implicitly defining the number of data entries. We proceed with the rest.

    // Transform the raw lines into a collection of structured elements.
    // Using 'reduce' provides a different approach to array construction compared to 'map'.
    const structuredElements = linesOfData.slice(1).reduce((accumulatorCollection, currentEntryLine, currentRelativeIndex) => {
        const segmentParts = currentEntryLine.split(' ');
        accumulatorCollection.push({
            designationField: segmentParts[0],
            numericValue: Number(segmentParts[1]),
            originalIdentifier: currentRelativeIndex + 1 // 1-based indexing for output
        });
        return accumulatorCollection;
    }, []);

    // Arrange the collection of elements based on specific criteria.
    // The comparator uses 'localeCompare' for strings and direct subtraction for numbers,
    // ensuring the same sort order as the original but with different syntax.
    structuredElements.sort((firstEntry, secondEntry) => {
        // Primary sort: 'designationField' (string) in ascending alphabetical order
        const primaryOrder = firstEntry.designationField.localeCompare(secondEntry.designationField);

        if (primaryOrder !== 0) {
            return primaryOrder; // If designations differ, that determines the order
        }

        // Secondary sort: If 'designationField's are identical, compare by 'numericValue' (descending)
        return secondEntry.numericValue - firstEntry.numericValue;
    });

    // Extract only the original identifiers from the sorted collection.
    const finalSequenceOfIdentifiers = structuredElements.map(element => element.originalIdentifier);

    // Present the final sequence of identifiers, each on a new line.
    console.log(finalSequenceOfIdentifiers.join('\n'));
}

// Invoke the data processing function with content read from standard input.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));