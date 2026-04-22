// This function processes all incoming raw data.
function ProcessInput(rawData) {

    // Split the entire input string into an array of lines.
    let linesArray = rawData.split("\n");

    // Extract the first line which contains space-separated parameters.
    const paramsStr = linesArray[0].split(" ");
    let firstNum = parseInt(paramsStr[0], 10); // The first numerical parameter.
    let secondNum = parseInt(paramsStr[1], 10); // The second numerical parameter.

    // Retrieve the second line which is the main string for manipulation.
    let originalString = linesArray[1];

    // Adjust the second number to be a zero-based index.
    let targetIdx = secondNum - 1;

    // Get the character at the computed index from the original string.
    let charToExamine = originalString[targetIdx];

    // Determine the replacement character based on the character examined.
    let replacementCharValue;
    if (charToExamine === 'A') {
        replacementCharValue = 'a';
    } else if (charToExamine === 'B') {
        replacementCharValue = 'b';
    } else {
        replacementCharValue = 'c';
    }

    // Construct the final string by replacing a character based on the original logic.
    // The original logic uses substr in a specific way that affects the indices.
    // First part: substring from index 0 with length (targetIdx - 1).
    let prefixPart = originalString.substr(0, targetIdx - 1);
    // Second part: substring from index (targetIdx + 1) to the end.
    let suffixPart = originalString.substr(targetIdx + 1);

    let finalOutputString = prefixPart + replacementCharValue + suffixPart;

    // Display the final, altered string to standard output.
    console.log(finalOutputString);

}


// The following section handles standard input/output.
// Do not modify this part as it is crucial for the execution environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));