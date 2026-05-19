function processInput(rawData) {
    // Split the incoming data into individual lines
    let textSegments = rawData.split("\n");

    // Create a new string by concatenating the first line with itself
    let doubledString = textSegments[0] + textSegments[0];

    // Check if the second line is a substring of the doubled first line
    if (doubledString.indexOf(textSegments[1]) !== -1) {
        // If found, output "Yes"
        console.log("Yes");
    } else {
        // Otherwise, output "No"
        console.log("No");
    }
}

// Read input from standard input and pass it to the processing function
processInput(require("fs").readFileSync("/dev/stdin", "utf-8"));
