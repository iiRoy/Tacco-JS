function processStreamContent(dataBlock) {
    const patternForData = /^(-?\d+)\s+(-?\d+)/;
    const matchResult = dataBlock.match(patternForData);

    let numberOne, numberTwo;

    if (matchResult && matchResult.length >= 3) {
        // Successfully extracted two numeric strings
        numberOne = +matchResult[1]; // Convert using unary plus
        numberTwo = +matchResult[2]; // Convert using unary plus
    } else {
        // If the pattern doesn't match (e.g., malformed input like "1" or "abc"),
        // original's parseInt would yield NaN for one or both numbers.
        // We mimic this behavior, as NaN * X results in NaN.
        numberOne = NaN;
        numberTwo = NaN;
    }

    console.log(numberOne * numberTwo);
}

// Invoke the processing function with standard input
processStreamContent(require("fs").readFileSync("/dev/stdin", "utf8"));