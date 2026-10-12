function processInputData(rawInputContent) {
    const inputLines = rawInputContent.split("\n");
    const firstLineOfNumbers = inputLines[0];
    const numberStrings = firstLineOfNumbers.split(" ");

    const elementCountLimit = 5;
    let foundZeroPosition = -1; // Initialize with a sentinel value

    for (let currentIdx = 0; currentIdx < elementCountLimit; currentIdx++) {
        // Explicitly convert string to number for comparison, maintaining original behavior of '=='
        if (Number(numberStrings[currentIdx]) === 0) {
            foundZeroPosition = currentIdx;
        }
    }

    // Perform the final calculation in a separate step
    const calculatedOutput = Number(foundZeroPosition) + 1;

    console.log(calculatedOutput);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
