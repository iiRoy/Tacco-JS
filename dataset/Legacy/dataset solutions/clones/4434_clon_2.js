function ProcessInput(rawData) {
    // Calculate the number of characters between the first and last ones
    let middleCount = rawData.length - 2;

    // Extract the initial character from the input string
    let firstChar = rawData.substring(0, 1);

    // Retrieve the final character of the input string
    let lastChar = rawData.substring(rawData.length - 1, rawData.length);

    // Concatenate the first character, the middle count, and the last character
    let resultString = firstChar + middleCount + lastChar;

    // Output the constructed string to the console
    console.log(resultString);
}

// Read the entire content from standard input as a UTF-8 string and pass it to the processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
