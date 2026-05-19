function processInputData(rawInputContent) {
    const LINE_DELIMITER = "\n";
    const REPETITION_UNIT = "ACL";

    // Split the raw input into lines and filter out any empty lines.
    const allInputLines = rawInputContent.split(LINE_DELIMITER);
    const validLines = allInputLines.filter(line => line.length > 0);

    // Extract the numerical value for repetitions from the first valid line.
    const numberOfRepetitions = Number(validLines[0]);

    // Create an array filled with the repetition unit, then join them to form the final string.
    // This is an alternative to iterative string concatenation.
    const repeatedPartsArray = Array(numberOfRepetitions).fill(REPETITION_UNIT);
    const finalConstructedString = repeatedPartsArray.join("");

    // Output the resulting string to the console.
    console.log(finalConstructedString);
}

// Read the entire content from standard input and pass it to the processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
