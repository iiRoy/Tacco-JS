// This module handles character sequence evaluation.
class TextProcessor {
    // Internal state variable to keep track of counts.
    currentCount;

    // Default constructor for the processor.
    constructor( ) {
        this.currentCount = 0;
    }

    // Function to process an incoming string of characters.
    // It modifies an internal counter based on 'I' and 'D' characters.
    // @param {string} sourceText - The text string to be processed.
    // @returns {number} The final calculated outcome.
    evaluateString( sourceText )
    {
        this.currentCount = 0; // Resetting the internal counter for new processing.
        let finalResult = 0;   // Variable to hold the result before returning.

        // Determine the total length of the provided text.
        const textLen = sourceText.length;

        // Looping through every single character in the supplied text.
        for (
            let charPos = 0;
            charPos < textLen;
            charPos++
            )
        {
            // Check for an 'I' character to increment the counter.
            if ( sourceText.charAt(charPos) == 'I' ) {
                this.currentCount++; // Incrementing the count.
                finalResult = this.currentCount; // Storing the current count as the result.
            }
            // Otherwise, check for a 'D' character to decrement the counter.
            else if ( sourceText.charAt(charPos) == 'D' )
            {
                this.currentCount--; // Decrementing the count.
            }
        }
        return finalResult; // Returning the computed outcome.
    }
}

// --- Main execution block simulation ---

// Simulating console input acquisition.
// In a browser, this might be 'prompt()'; in Node.js, 'readline'.
// For this example, we'll use a predefined string.
const testInput = "IIIDIDII"; // Sample string for processing.

// Creating a new instance of our text processing utility.
const myProcessor = new TextProcessor( );

// Initiating the string evaluation process.
// The return value is computed but not explicitly used or displayed here,
// mirroring the original Java main method's behavior.
myProcessor.evaluateString(testInput);