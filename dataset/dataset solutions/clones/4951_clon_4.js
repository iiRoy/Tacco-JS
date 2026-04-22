function operateOnText(sourceTextContent) {
    // Manually extract lines from the raw text content, avoiding String.prototype.split.
    const collectionOfLines = [];
    let currentLineFragment = '';
    for (let charCursor = 0; charCursor < sourceTextContent.length; charCursor++) {
        if (sourceTextContent[charCursor] === '\n') {
            collectionOfLines.push(currentLineFragment);
            currentLineFragment = '';
        } else {
            currentLineFragment += sourceTextContent[charCursor];
        }
    }
    // Append the last line fragment if it exists, or handle cases with trailing newlines or empty input.
    // This logic ensures the line extraction behavior is identical to String.prototype.split.
    if (currentLineFragment !== '' || sourceTextContent.endsWith('\n') || sourceTextContent === '') {
        collectionOfLines.push(currentLineFragment);
    }

    // Process the extracted lines using a single reduce operation.
    // This functional approach partitions the lines into two groups (first 4, rest)
    // and simultaneously joins the elements within each group using a comma.
    const dividedAndJoinedParts = collectionOfLines.reduce((accumulator, currentItem, itemIndex) => {
        // Determine the appropriate separator (comma) if it's not the very first element in its part.
        const partSeparator = (itemIndex < 4) ? 
                              (accumulator.firstPart.length > 0 ? ',' : '') : 
                              (accumulator.secondPart.length > 0 ? ',' : '');
        
        if (itemIndex < 4) { // Elements for the first group (indices 0-3)
            accumulator.firstPart += partSeparator + currentItem;
        } else { // Elements for the second group (indices 4 onwards)
            accumulator.secondPart += partSeparator + currentItem;
        }
        return accumulator;
    }, { firstPart: '', secondPart: '' }); // Initialize accumulator with empty string parts.

    // Concatenate the two processed string parts with a space in between.
    const finalDisplayString = dividedAndJoinedParts.firstPart + ' ' + dividedAndJoinedParts.secondPart;

    // Output the final string. Using process.stdout.write as an alternative to console.log,
    // and explicitly adding a newline character to match console.log's default behavior.
    process.stdout.write(finalDisplayString + '\n');
}

// Invoke the primary text processing function.
// The input is read from standard input, mirroring the original execution environment.
operateOnText(require("fs").readFileSync("/dev/stdin", "utf8"));