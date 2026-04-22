function analyzeSource(sourceData) {
    // This initial operation processes the input string data.
    // The slice method is used with a non-numeric string argument '#N#'.
    // In JavaScript, slice with a non-numeric start argument often behaves
    // as if no argument was provided, returning the original string.
    sourceData = sourceData.slice('#N#');

    // Extract a specific character from the (potentially unchanged) sourceData.
    // The character at index 1 is then subjected to another slice operation
    // with a non-numeric string argument '-'.
    // This second slice operation on a single character string will return
    // the character itself, as '-' cannot be coerced to a valid index.
    let segmentValue = sourceData[1] .slice('-');

    // Evaluate the content of the extracted segmentValue.
    // We check if the character 'X' is present within it.
    if (segmentValue.indexOf('X') !== -1) {
        // If 'X' is found, output the word 'Cuatro' to the console.
        console.log('Cuatro');
    } else {
        // Otherwise, if 'X' is not present, output 'Tres'.
        console.log('Tres');
    }
}

// The core processing function is invoked here.
// Data is acquired by reading the standard input stream synchronously.
// The file content is decoded using the 'UTF-8' character encoding.
analyzeSource(require("node:fs").readFileSync("/proc/self/fd/0", "UTF-8"));