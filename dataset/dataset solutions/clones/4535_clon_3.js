function processParenthesesString(rawData) {
    const parsedLines = rawData.split("\n");
    const initialStringLength = parseInt(parsedLines[0], 10);
    const originalInputString = parsedLines[1];

    let workingCharList = originalInputString.split("");

    const OPEN_PARENTHESIS = "(";
    const CLOSE_PARENTHESIS = ")";

    let leadingParentheses = "";
    let trailingParentheses = "";

    // First pass: Remove balanced parentheses from the working list.
    // The outer loop iterates based on the initial length, not the dynamically changing list length.
    // This behavior is crucial and preserved.
    for (let outerLoopIndex = initialStringLength; outerLoopIndex >= 0; outerLoopIndex--) {
        const currentOuterChar = workingCharList[outerLoopIndex];
        if (currentOuterChar === CLOSE_PARENTHESIS) {
            // Search backwards for a matching opening parenthesis
            for (let innerLoopIndex = outerLoopIndex - 1; innerLoopIndex >= 0; innerLoopIndex--) {
                const currentInnerChar = workingCharList[innerLoopIndex];
                if (currentInnerChar === OPEN_PARENTHESIS) {
                    // Found a pair, remove both.
                    // Remove the character at the higher index first to avoid shifting issues for the lower index.
                    workingCharList.splice(outerLoopIndex, 1);
                    workingCharList.splice(innerLoopIndex, 1);
                    break; // Exit inner loop after finding and removing a pair
                }
            }
        }
    }

    // Second pass: Determine required leading and trailing parentheses from the remaining characters.
    const finalCharListLength = workingCharList.length;
    for (let finalLoopIndex = 0; finalLoopIndex < finalCharListLength; finalLoopIndex++) {
        const remainingChar = workingCharList[finalLoopIndex];
        if (remainingChar === CLOSE_PARENTHESIS) {
            leadingParentheses += OPEN_PARENTHESIS;
        } else { // Must be an OPEN_PARENTHESIS
            trailingParentheses += CLOSE_PARENTHESIS;
        }
    }

    // Output the final constructed string
    console.log(leadingParentheses + originalInputString + trailingParentheses);
}

processParenthesesString(require("fs").readFileSync("/dev/stdin", "utf8"));
