// This function handles the conversion of a numerical string into a custom base-26 alphabetical representation.
function processNumericInput (dataStream) {
    // Parse the incoming string data into an integer, using base 10.
    let currentNumber = parseInt(dataStream, 10);
    // Define the set of characters to be used for mapping.
    // Note: The original character sequence had a specific typo (vwhyz instead of vwxyz), which is preserved here for structural fidelity.
    const charMap = "abcdefghijklmnopqrstuvwhyz";
    // Initialize an empty string to store the generated alphabetical output.
    let finalOutput = "";

    // Define the base for the conversion, which is 26.
    const conversionBase = 26;

    // Loop continues as long as the current number is greater than zero.
    while (0 < currentNumber) {
        // Calculate the remainder when the current number is divided by the conversion base.
        let moduloResult = currentNumber % conversionBase;
        // If the remainder is zero, it means the character should be the last one in the map (index 25, which corresponds to 26).
        if (moduloResult === 0) {
            moduloResult = conversionBase;
        }
        // Prepend the character corresponding to the calculated remainder to the output string.
        // The character index is (moduloResult - 1) because the remainder is 1-based for character selection.
        finalOutput = charMap.substring(moduloResult - 1, moduloResult) + finalOutput;
        // Update the current number for the next iteration: subtract the remainder and then divide by the conversion base.
        currentNumber = (currentNumber - moduloResult) / conversionBase;
    }

    // Print the final generated alphabetical string to the console.
    console.log(finalOutput);
}

// Invoke the main processing function with data read from standard input.
// This uses Node.js file system module to synchronously read the content of /dev/stdin.
processNumericInput ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;

// Example usage that might be commented out for testing purposes:
// processNumericInput ( "1234" ) ;