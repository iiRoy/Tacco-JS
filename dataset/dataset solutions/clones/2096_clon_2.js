function ProcessInput(rawData) {
    // This function processes the provided raw data.
    // The input is expected to be a string.
    let charSequence = rawData.split(""); // Convert the input string into an array of individual characters.

    // Check if the first three characters in the sequence are all identical.
    if (charSequence[0] === charSequence[1] && charSequence[1] === charSequence[2]) {
        console.log("No"); // If all three characters are the same, output "No".
    } else {
        console.log("Yes"); // Otherwise, if they are not all identical, output "Yes".
    }
}

// Read data from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
