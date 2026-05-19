function processInput(inputString) {
    // Convert the incoming string into an array of individual characters.
    let charArray = inputString.split("");

    // Evaluate if the first character or the second character is the digit '9'.
    if (charArray[0] === "9" || charArray[1] === "9") {
        // If the condition is met, output a positive confirmation.
        console.log("Yes\n");
    } else {
        // Otherwise, output a negative confirmation.
        console.log("No\n");
    }
}

// Read the entire content from standard input as a UTF-8 encoded string,
// then pass it to our processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
