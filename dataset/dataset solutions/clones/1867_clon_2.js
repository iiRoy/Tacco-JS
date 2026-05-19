function ProcessInput(rawData) {
    // Split the raw input string into an array of lines
    let linesArray = rawData.split('\n');

    // Extract the first string from the array
    let firstString = linesArray[0];

    // Extract the second string from the array
    let secondString = linesArray[1];

    // Get the length of the first string
    const firstLength = firstString.length;

    // Extract a substring from the second string,
    // starting from index 0 and with a length equal to firstLength
    let prefixCheck = secondString.substr(0, firstLength);

    // Compare the first string with the extracted prefix
    if (firstString === prefixCheck) {
        // If they are identical, print "Yes"
        console.log("Yes");
    } else {
        // Otherwise, print "No"
        console.log("No");
    }
}

// Read input from standard input and pass it to the processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
