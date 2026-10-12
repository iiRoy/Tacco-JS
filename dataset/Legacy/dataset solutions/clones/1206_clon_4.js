const inputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

let parsedNumericValues;

if (inputContent === '') {
    // Special handling for an empty input string.
    // "".split(" ") results in [""]
    // [""] then mapped with parseInt results in [NaN]
    parsedNumericValues = [NaN];
} else {
    // Use Array.from to iterate over each character of the input string.
    // The reduce method builds an array of string segments, replicating the behavior of split(" ").
    const { segments } = Array.from(inputContent).reduce((accumulator, char, index, array) => {
        if (char === ' ') {
            // If a space is encountered, the current buffer is a complete segment.
            accumulator.segments.push(accumulator.currentBuffer);
            // Reset the buffer for the next segment.
            accumulator.currentBuffer = '';
        } else {
            // If it's not a space, append the character to the current buffer.
            accumulator.currentBuffer += char;
        }

        // If this is the last character in the string, push the final buffer content
        // as the last segment. This handles both cases:
        // 1. String ends with a non-space character (e.g., "1 2 3" -> "3")
        // 2. String ends with a space (e.g., "1 2 " -> "")
        if (index === array.length - 1) {
            accumulator.segments.push(accumulator.currentBuffer);
        }
        return accumulator;
    }, { currentBuffer: '', segments: [] }); // Initial accumulator state

    // After building the segments, map them to integers using parseInt.
    parsedNumericValues = segments.map(val => parseInt(val, 10));
}
