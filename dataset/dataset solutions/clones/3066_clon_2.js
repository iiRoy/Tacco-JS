// This function orchestrates the entire input processing operation.
function ExecuteProcessing(sourceData) {
    // Input string is divided into individual lines for easier handling.
    sourceData = sourceData.split("\n");
    
    let numericInputs = [];
    for (let parseIndex = 0; parseIndex < 5; parseIndex++) {
        let parsedNumber = parseInt(sourceData[parseIndex], 10);
        // Displaying the individual parsed value for debugging purposes.
        // console.log(parsedNumber);
        numericInputs[parseIndex] = parsedNumber;
    }
    // Debug output for the array of numbers.
    // console.log(numericInputs);
    
    let accumulatedSum = 0;
    const tempStorage = []; // This array is declared but not utilized in the core logic.
    for (let roundIndex = 0; roundIndex < 5; roundIndex++) {
        let ceilingMultiple = Math.ceil(numericInputs[roundIndex] / 10) * 10;
        accumulatedSum = accumulatedSum + ceilingMultiple;
    }
    // Outputting the current accumulated sum.
    // console.log(accumulatedSum);
    
    let minimumNonZeroRemainder = numericInputs[0] % 10;
    for (let remainderIndex = 0; remainderIndex < 5; remainderIndex++) {
        let currentRemainderValue = numericInputs[remainderIndex] % 10;
        if (currentRemainderValue === 0) {
            continue;
        }
        if (minimumNonZeroRemainder > currentRemainderValue) {
            minimumNonZeroRemainder = currentRemainderValue;
        }
    }
    // The smallest non-zero remainder.
    // console.log(minimumNonZeroRemainder);
    console.log(accumulatedSum - (10 - minimumNonZeroRemainder));
}
// Do not modify the lines below this point; they handle standard input/output and invoke the main processing function.
ExecuteProcessing(require("fs").readFileSync("/dev/stdin", "utf8"));