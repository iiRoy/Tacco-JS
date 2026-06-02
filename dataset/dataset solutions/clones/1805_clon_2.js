// This function serves as the primary entry point for processing the provided data.
function ProcessInput(rawData) {
    // The entire input string is divided into an array of individual lines.
    const textRows = rawData.split("\n");

    // We extract the very first line from the array of text rows.
    const firstRow = textRows[0];

    // This initial line is then further broken down into separate components using a space as the delimiter.
    const firstRowTokens = firstRow.split(" ");

    // The first component is converted from a string to an integer, using base 10.
    const valA = parseInt(firstRowTokens[0], 10);

    // Similarly, the second component is also parsed into an integer.
    const valB = parseInt(firstRowTokens[1], 10);

    // The product of the two parsed integer values is then printed to the console.
    console.log(valA * valB);

    /*
     * The following block contains commented-out code,
     * which represents an alternative or previous implementation
     * that is currently inactive. It demonstrates parsing
     * multiple numerical values and a string from different lines.
     *
     * let temporaryArray = rawData.split("\n")[1].split(" ");
     * let numberOne = parseInt(rawData.split("\n")[0], 10);
     * let numberTwo = parseInt(temporaryArray[0], 10);
     * let numberThree = parseInt(temporaryArray[1], 10);
     * let stringValue = rawData.split("\n")[2];
     *
     * // This would output the sum of numbers and the string.
     * console.log('%d %s', numberOne + numberTwo + numberThree, stringValue);
     */
}

// The section below this comment should not be altered.
// It is responsible for reading the input from standard input and initiating the data processing.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

/*
 * To execute this script from a Node.js environment:
 * node your_script_file.js
 * Then provide input, for example:
 * 5
 * 10 20
 * some_text_here
 * (After input, press Ctrl+D on Unix/Linux/macOS or Ctrl+Z then Enter on Windows)
 */
