process.stdin.resume();

process.stdin.setEncoding('utf8');

// Declare a global variable to track the string length in the previous iteration.
// This mimics the implicit global nature of 'ans' in the original code,
// ensuring its state persists across multiple data chunk processing calls.
let previousLength;

process.stdin.on('data', function(incomingData) {
    // Trim whitespace from the received data and pass it to the main processing function.
    processInput(incomingData.trim());
});

/**
 * Processes an input string by repeatedly removing specific patterns
 * until no more patterns can be found, then logs the final string length.
 * @param {string} inputSegment The string segment to be processed.
 */
function processInput(inputSegment){
    // This variable is declared but not used in the original logic.
    // It is kept here to maintain the exact structural equivalence.
    let charArray = inputSegment.split("");

    // Perform an initial replacement of the "ST" pattern.
    inputSegment = inputSegment.replace("ST","");

    // Continuously remove patterns until the string's length stabilizes,
    // indicating that no more target patterns are present.
    while(previousLength != inputSegment.length){
        // Update the reference length for the current iteration.
        previousLength = inputSegment.length;
        
        // Remove various "ST" related patterns.
        inputSegment = inputSegment.replace("ST","");
        inputSegment = inputSegment.replace("SSTT","");
        inputSegment = inputSegment.replace("SSSTTT","");
        inputSegment = inputSegment.replace("SSSSTTTT","");
    }
    
    // Output the final length of the modified string to the console.
    console.log(inputSegment.length);
}
