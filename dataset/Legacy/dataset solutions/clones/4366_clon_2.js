function ProcessInput(rawData) {
    // Split the entire raw input string by newline characters.
    // This creates an array where each element is a line from the input.
    let lineSegments = rawData.split('\n');

    // Extract the very first line from the array.
    // This operation modifies the 'lineSegments' array by removing its first element,
    // and assigns that removed element (the first line string) to 'firstSegment'.
    let firstSegment = lineSegments.shift();

    // Process each character of the 'firstSegment' string.
    // For every character 'charItem' in 'firstSegment':
    // 1. It attempts to split 'charItem' by a space. Since 'charItem' is a single character,
    //    this will result in an array containing just that character (e.g., ['1']).
    // 2. It then maps over this single-element array, parsing the character as an integer.
    //    If the character is not a valid number (like a space), parseInt will yield NaN.
    // The result is an array of single-element arrays, like `[[1], [NaN], [5]]`.
    let processedSegments = firstSegment.map(function(charItem) {
        return charItem.split(' ').map(function(innerChar) {
            return parseInt(innerChar, 10);
        });
    });

    // Initialize an accumulator variable to zero.
    let totalSum = 0;

    // Iterate through the 'processedSegments' array.
    // Each 'segmentPair' is expected to be a single-element array (e.g., `[1]` or `[NaN]`).
    // The expression `segmentPair[1] - segmentPair[0] + 1` will evaluate as follows:
    // - `segmentPair[1]` will be `undefined` because the inner arrays only have one element.
    // - `undefined - segmentPair[0]` will result in `NaN` (e.g., `undefined - 1` is `NaN`).
    // - Adding `1` to `NaN` still results in `NaN`.
    // Therefore, `totalSum` will accumulate `NaN` in each iteration, ultimately becoming `NaN`.
    processedSegments.forEach(function(segmentPair) {
        totalSum += (segmentPair[1] - segmentPair[0] + 1);
    });

    // Output the final calculated sum to the console, formatted as a decimal integer.
    // If 'totalSum' is `NaN`, this will print "NaN".
    console.log('%d', totalSum);
}

// Read the entire content of standard input synchronously as a UTF-8 string.
// Then, pass this string to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
