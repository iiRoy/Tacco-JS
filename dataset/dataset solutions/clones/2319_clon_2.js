// This function serves as the primary entry point for processing the given text input.
function processInput(rawData) {
    // The input string is first cleaned by removing leading/trailing whitespace,
    // and then split into an array of strings based on newline characters.
    let processedLines = rawData.trim().split("\n");

    // The first element of the processed lines array is converted to an integer,
    // assuming a decimal (base 10) representation.
    const firstVal = parseInt(processedLines[0], 10);
    // Similarly, the second element is parsed into an integer.
    const secondVal = parseInt(processedLines[1], 10);

    // A constant array of predefined numbers is declared.
    const candidateNumbers = [1, 2, 3];

    // The candidateNumbers array is filtered. The filter operation retains only those numbers
    // that are not equal to 'firstVal' AND not equal to 'secondVal'.
    // The arrow function 'currentNum => currentNum !== firstVal && currentNum !== secondVal'
    // defines the condition for filtering.
    let resultArray = candidateNumbers.filter(currentNum => currentNum !== firstVal && currentNum !== secondVal);

    // The first element of the 'resultArray' (which should contain the unique number)
    // is then printed to the standard output.
    console.log(resultArray[0]);
}

// The program initiates by reading the content of standard input.
// 'require("fs").readFileSync("/dev/stdin", "utf8")' reads the entire file
// located at '/dev/stdin' as a UTF-8 encoded string.
// This string is then passed as an argument to the 'processInput' function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
