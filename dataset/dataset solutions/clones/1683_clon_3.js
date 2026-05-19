function processInputData(rawInputString) {
    const lineDelimiter = "\n";
    const fieldDelimiter = " ";

    const allInputLines = rawInputString.split(lineDelimiter);

    const totalTestCasesString = allInputLines[0];
    const totalTestCases = parseInt(totalTestCasesString, 10);

    const collectedCaseData = [];
    let currentLineIndex = 1; // Points to the line containing the count for the current test case

    // A small utility function to parse a single line of space-separated values
    const parseLineFields = (lineContent) => {
        return lineContent.split(fieldDelimiter);
    };

    for (let caseIteration = 0; caseIteration < totalTestCases; caseIteration++) {
        const caseDataRowCountString = allInputLines[currentLineIndex];
        const caseDataRowCount = parseInt(caseDataRowCountString, 10);

        const currentCaseDataSet = [];
        // The actual data rows for this case start one line after the count line
        const startOfDataRows = currentLineIndex + 1;
        const endOfDataRows = startOfDataRows + caseDataRowCount;

        for (let dataRowIteration = startOfDataRows; dataRowIteration < endOfDataRows; dataRowIteration++) {
            const dataLineContent = allInputLines[dataRowIteration];
            currentCaseDataSet.push(parseLineFields(dataLineContent));
        }

        collectedCaseData.push(currentCaseDataSet);

        // Update the line index to point to the next test case's count line
        // It moves past the current case's count line and all its data lines.
        currentLineIndex = endOfDataRows;
    }
    // The 'collectedCaseData' array now holds the structured input,
    // mirroring the 'rakudas' array in the original code.
    // No further operations are performed on it, preserving original behavior.
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
