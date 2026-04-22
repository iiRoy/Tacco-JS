function computeAcronym(sourceText) {
    // This function processes an input string to generate an acronym.
    // It assumes the input contains at least three space-separated words.

    // Remove any leading or trailing whitespace from the raw input string.
    let processedText = sourceText.trim();

    // Split the cleaned string into its constituent parts based on spaces.
    // We are interested in the first, second, and third segments.
    let firstWordSegment = processedText.split(" ")[0]; // Captures the initial component.
    let secondWordSegment = processedText.split(" ")[1]; // Obtains the middle component.
    let thirdWordSegment = processedText.split(" ")[2]; // Retrieves the final component.

    // Construct the acronym by taking the first character of each segment,
    // converting it to uppercase, and then concatenating these characters.
    console.log(
        firstWordSegment.slice(0, 1).toUpperCase() +
        secondWordSegment.slice(0, 1).toUpperCase() +
        thirdWordSegment.slice(0, 1).toUpperCase()
    );
}



// The main execution point of this script.
// It reads data from standard input (e.g., from a pipe or file redirection)
// and passes it to the `computeAcronym` function for processing.
computeAcronym(
    require('fs')
        .readFileSync('/dev/stdin', 'utf8')
);