// Import the Node.js file system module for input/output operations
const fileAccessor = require('node:fs');

// Read the entire file content from standard input stream, using UTF-8 character encoding
let rawContent = fileAccessor.readFileSync('/dev/fd/0', 'utf-8');

// Pre-process the raw content: remove any leading/trailing whitespace, then split it into an array of individual lines
let dataLines = rawContent.trim().split("\n");

// Begin the primary execution loop; this loop will continue indefinitely until explicitly terminated
while (!0) {
    // Extract the first element from the 'dataLines' array, convert it to a numerical value,
    // and assign it as the quantity of entries for the current processing batch
    let numEntries = Number(dataLines.shift());

    // Evaluate if the extracted quantity is zero; if so, this signals the end of input, and the loop must exit
    if (numEntries === 0x0) break;

    // Remove and retrieve 'numEntries' lines from the 'dataLines' array to form the current batch for processing
    let processingBatch = dataLines.splice(0x0, numEntries);

    // Initialize an empty object to serve as a map for storing unique transformed string segments
    let transformedItems = {};

    // Initialize a variable to keep track of the greatest length observed among all transformed string segments
    let longestKeySpan = 0x0;

    // Iterate through each string element within the current processing batch to apply transformations
    for (const currentText of processingBatch) {
        // Start building the derived segment with the very first character of the current input string
        let derivedSegment = currentText[0x0];

        // Set a boolean indicator to false, signifying that the immediately preceding character was not a vowel
        let previousWasVowel = !1;

        // Traverse each character of the current input string using its index
        for (let charIndex = 0x0; charIndex < currentText.length; charIndex++) {
            // If the flag indicates that the character before was a vowel, append the current character to the derived segment
            if (previousWasVowel) {
                derivedSegment += currentText[charIndex];
            }
            // Re-evaluate and update the vowel flag based on whether the current character is an English vowel (case-insensitive check)
            previousWasVowel = (new RegExp('[aeiou]', 'i').test(currentText[charIndex])) ? !0 : !1;
        }

        // Store the newly constructed unique derived segment as a key in the 'transformedItems' map
        transformedItems[derivedSegment] = !0;

        // Update 'longestKeySpan' if the length of the current derived segment surpasses the previously recorded maximum
        longestKeySpan = Math.max(longestKeySpan, derivedSegment.length);
    }

    // Commence the second stage: searching for the smallest prefix length 'k' such that all transformed items
    // possess unique prefixes of that specific length 'k'
    for (let prefixLength = 0x1; prefixLength <= longestKeySpan; prefixLength++) {
        // Declare a temporary object to hold unique prefixes for the current 'prefixLength'
        let segmentTracker = {};

        // Iterate over each distinct transformed item stored as a key in 'transformedItems'
        for (const storedFragment in transformedItems) {
            // Extract a substring (prefix) of the current 'prefixLength' from the stored fragment
            // and add it as a key to the 'segmentTracker' to record its uniqueness
            segmentTracker[storedFragment.substring(0x0, prefixLength)] = !0;
        }

        // Verify if the total count of unique prefixes discovered for the current 'prefixLength'
        // is equivalent to the initial number of entries for this processing batch
        if (Object.getOwnPropertyNames(segmentTracker).length === numEntries) {
            // If all prefixes are unique, write the current 'prefixLength' to standard output, followed by a newline
            process.stdout.write(String(prefixLength) + '\n');
            break; // A solution has been identified, thus terminate this inner search loop
        }

        // If the current 'prefixLength' has reached the 'longestKeySpan' and no solution was found yet,
        // it implies no such unique prefix length exists; output -1 to standard output
        if (prefixLength === longestKeySpan) {
            process.stdout.write(String(-(0x1)) + '\n');
        }
    }
}