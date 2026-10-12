function ProcessInput(rawData) {
    // Initialize a variable to hold the raw input data.
    let initialData = rawData;

    // This variable is declared but not used in the current logic.
    let unusedResult = '';

    // Extract the first line from the input and then the first word from that line.
    let textSegment = initialData.split('\n')[0];
    textSegment = textSegment.split(' ')[0];

    // Convert the processed string into an array of individual characters.
    let charSequence = Array.from(textSegment);

    // Iterate through each character in the sequence to apply transformation rules.
    for (let charIndex = 0; charIndex < charSequence.length; charIndex++) {
        // Check if the current character is a placeholder '?'.
        if (charSequence[charIndex] === '?') {
            // Special handling for the very first character in the sequence.
            if (charIndex === 0) {
                // If the sequence contains only one character, replace it with 'D'.
                if (charSequence.length === 1) {
                    charSequence = 'D'; // Note: This reassigns charSequence to a string, which will cause a TypeError later if not handled.
                }
                // If the next character is 'P', replace current '?' with 'D'.
                else if (charSequence[charIndex + 1] === 'P') {
                    charSequence[charIndex] = 'D';
                }
                // If the next character is 'D', replace current '?' with 'P'.
                else if (charSequence[charIndex + 1] === 'D') {
                    charSequence[charIndex] = 'P';
                }
                // If the next character is also '?', replace current '?' with 'P'.
                else if (charSequence[charIndex + 1] === '?') {
                    charSequence[charIndex] = 'P';
                }
            }
            // Handling for characters that are not the first in the sequence.
            // If the previous character was 'P', replace current '?' with 'D'.
            else if (charSequence[charIndex - 1] === 'P') {
                charSequence[charIndex] = 'D';
            }
            // If the previous character was 'D', replace current '?' with 'P'.
            else if (charSequence[charIndex - 1] === 'D') {
                charSequence[charIndex] = 'P';
            }
        }
    }

    // Join the array of characters back into a single string.
    // This will throw a TypeError if 'charSequence' was reassigned to a string earlier (e.g., 'D').
    let finalOutput = charSequence.join('');

    // Output the resulting string to the console.
    console.log(finalOutput);
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
