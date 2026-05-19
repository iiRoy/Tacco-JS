function ProcessInput(rawData) {
    // Split the entire input string into individual lines based on the newline character.
    const inputLines = rawData.split("\n");

    // The first line is expected to contain three space-separated values.
    const firstLineParts = inputLines[0].split(" ");

    // Extract the individual string values from the parsed first line.
    const valA = firstLineParts[0];
    const valB = firstLineParts[1];
    const valC = firstLineParts[2];

    // The second line provides a single value, which will be used as an exponent.
    const exponentVal = inputLines[1];

    let maxNumber; // This variable will store the lexicographically largest of valA, valB, or valC.
    let remainingSum; // This variable will store the string concatenation of the other two values.

    // Determine the largest string value among valA, valB, and valC using lexicographical comparison.
    // Then, concatenate the other two values.
    if (valA >= valB && valA >= valC) {
        maxNumber = valA;
        remainingSum = valB + valC; // String concatenation
    } else if (valB >= valC) {
        maxNumber = valB;
        remainingSum = valA + valC; // String concatenation
    } else {
        maxNumber = valC;
        remainingSum = valA + valB; // String concatenation
    }

    // Perform the final calculation.
    // Note: maxNumber and exponentVal are implicitly converted to numbers for the Math.pow and multiplication operations.
    // The result of the multiplication (a number) is then concatenated with remainingSum (a string),
    // resulting in a final string value.
    const finalResult = maxNumber * Math.pow(2, exponentVal) + remainingSum;

    // Display the computed result to the standard output.
    console.log(finalResult);
}

// Read the entire content of standard input as a UTF-8 string and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
