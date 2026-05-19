function ProcessData(rawData) {
    // The incoming string parameter 'rawData' is re-assigned here.
    // It is split into an array of string-based numbers using space as a delimiter.
    rawData = rawData.split(" ");

    // Now, 'rawData' contains the array of string numbers.
    // We perform a comparison to check if the numbers form an arithmetic progression.
    // The subtraction operations implicitly convert the string elements to numbers.
    // The condition verifies if the difference between the second and first number
    // is equal to the difference between the third and second number.
    // Based on this check, "YES" or "NO" is printed to the console.
    console.log((rawData[1] - rawData[0]) == (rawData[2] - rawData[1]) ? "YES" : "NO");
}

// The program initiates by reading its input from the standard input stream.
// It uses the built-in 'fs' module to synchronously read the content of "/dev/stdin".
// The content is decoded as UTF-8 text, and any leading or trailing whitespace characters are removed.
// This prepared string is then passed as an argument to the 'ProcessData' function for execution.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
