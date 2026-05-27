// This function is designed to process incoming textual information.
function processInputData(rawData) {
    // Obtain the very last character from the provided string.
    let finalCharacter = rawData.slice(-1);

    // Evaluate if the concluding character is the letter 's'.
    if (finalCharacter === "s") {
        // If the last character is 's', append "es" to the original string for pluralization.
        console.log(rawData + "es");
    } else {
        // Otherwise, simply append "s" to the original string to form the plural.
        console.log(rawData + "s");
    }
}

// The following code segment is responsible for reading data from standard input
// and subsequently invoking the primary data processing function.
// It is crucial not to modify this part to ensure correct program execution.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
