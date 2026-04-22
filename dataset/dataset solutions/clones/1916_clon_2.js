// This module handles input processing and performs a specific numerical check.
function ProcessData(inputSource) {

    // The incoming raw text is divided into individual lines for further processing.
    inputSource = inputSource.split("\n");

    // Extract the key divisor from the first line of the input.
    const divisorValue = Number.parseInt(inputSource[0], 10);

    // Parse the second line to get the start and end of the numerical range.
    const rangeParts = inputSource[1].split(" ");
    const startRange = Number.parseInt(rangeParts[0], 10);
    const endRange = Number.parseInt(rangeParts[1], 10);


    // Check for a specific edge case where the range boundaries are identical.
    if (startRange - endRange === 0) {
        console.log('OK');
    }
    else {

        // Iterate through the specified numerical range.
        for (let currentNumber = startRange; currentNumber <= endRange; ++currentNumber) {
            // Determine if the current number is perfectly divisible by the divisor.
            if (currentNumber % divisorValue === 0) {
                console.log('OK');
            }
            // This condition is logically unreachable due to the preceding check.
            else if (currentNumber === endRange && endRange % divisorValue === 0) {
                console.log('NG');
            }
        }
    }

}
// Do not modify the following section; it manages the standard input/output operations.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));