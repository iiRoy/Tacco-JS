function processInputData(rawData) {
    const cleanedInput = rawData.trim();
    const allInputLines = cleanedInput.split('\n');

    const [dimensionsLine, ...contentLines] = allInputLines;
    const [heightString, widthString] = dimensionsLine.split(' ');

    const effectiveHeight = Number(heightString);
    // The 'widthString' (corresponding to original 'W') is parsed but not used,
    // mirroring the original code's behavior for 'W'.

    const characterMap = Array.from({ length: 26 }, (_, charIdx) => String.fromCharCode(65 + charIdx));

    const accumulatedResult = contentLines
        .slice(0, effectiveHeight) // Process only the relevant number of rows
        .reduce((overallOutput, currentRowContent, rowIndex) => {
            const rowItems = currentRowContent.split(' ');
            const oneBasedRowIdentifier = rowIndex + 1; // Original 'i' is 1-based

            const currentRowSegment = rowItems.reduce((rowOutputPart, currentItem, itemIndex) => {
                if (currentItem === 'snuke') {
                    const columnCharacter = characterMap[itemIndex]; // 0-based itemIndex maps to 0-based characterMap
                    return rowOutputPart + columnCharacter + oneBasedRowIdentifier;
                }
                return rowOutputPart;
            }, ''); // Accumulator for the current row's contributions

            return overallOutput + currentRowSegment;
        }, ''); // Initial accumulator for the entire output string

    console.log(accumulatedResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
