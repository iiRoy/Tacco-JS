function processInput (inputString) {
    // Split the incoming string by spaces to get an array of substrings.
    inputString = inputString.split(" ");

    // Join the array elements back into a single string, then parse it as an integer.
    // The default separator for .join() is a comma.
    let numericValue = parseInt(inputString.join());

    // Check if the resulting integer is perfectly divisible by 4.
    if (numericValue % 4 === 0) {
        console.log("YES\n"); // Output "YES" followed by a newline if divisible.
    } else {
        console.log("NO\n");  // Otherwise, output "NO" followed by a newline.
    }
}

// Read the entire content from standard input, decode it as UTF-8, and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
