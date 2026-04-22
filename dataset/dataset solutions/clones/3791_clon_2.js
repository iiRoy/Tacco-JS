function processInputString(sourceText) {
 // This function serves as the primary entry point for processing the provided textual data.
 // It expects an input string containing lines separated by newline characters.

    let    rawContent = sourceText.trim(); // First, remove any leading or trailing whitespace from the overall input string.

    /*
     * The input content is expected to be structured into multiple lines.
     * The first line typically contains a numerical value (interpreted as a string),
     * and the second line holds the main character sequence for algorithmic analysis.
     */
    var lineData = rawContent.split("\n");

    // Retrieve the numerical value from the first line.
    // This value, initially a string, will be implicitly converted to a number
    // when used in numerical comparisons within the loop construct.
    let segmentCount = lineData[0];

    // Extract the primary character sequence from the second line of the input.
    var targetSequence = lineData[1];

    // Initialize an array to accumulate the results. Each result will be an integer
    // representing the count of unique common characters for a specific split point.
    let resultCollection = [];

    // Begin an iterative process to analyze different split points within the 'targetSequence'.
    // The loop variable 'splitIndex' ranges from 1 up to (but not including) 'segmentCount'.
    for( var splitIndex = 1; splitIndex < segmentCount; splitIndex++ )
    {
        // Obtain the first segment of the target sequence, from the beginning up to 'splitIndex'.
        // Then, convert this segment into an array of individual characters.
        var firstPartChars = targetSequence.substring(0, splitIndex).split('');

        // Filter the 'firstPartChars' array to retain only unique characters.
        // The filter condition ensures that only the first occurrence of each character is kept.
        var uniqueFirstPart = firstPartChars.filter( (charItem, idx, currentArray) => currentArray.indexOf(charItem) === idx );


        // Extract the second segment of the target sequence, starting from 'splitIndex'
        // and continuing to the end of the sequence. Convert this segment into a character array.
        // Note: The original code's `substr(i, num-1)` where `num` is string length effectively means `substr(i)`.
        var secondPartChars = targetSequence.substring(splitIndex).split('');

        // Filter the 'secondPartChars' array to extract only unique characters, similar to the first part.
        var uniqueSecondPart = secondPartChars.filter( (charItem, idx, currentArray) => currentArray.indexOf(charItem) === idx );

        // Combine the arrays of unique characters from both the first and second segments.
        var combinedUnique = uniqueFirstPart.concat(uniqueSecondPart);

        // Determine the characters that are present in both 'uniqueFirstPart' and 'uniqueSecondPart'.
        // This is achieved by finding characters in 'combinedUnique' that appear more than once.
        // A character is common if its initial appearance index differs from its last appearance index.
        var commonElements = combinedUnique.filter( function (charItem, idx, currentArray) {
                return currentArray.indexOf(charItem) === idx && idx !== currentArray.lastIndexOf(charItem);
            });

        // Store the total count of these identified common unique characters in the result collection.
        resultCollection.push(commonElements.length);
    }

    // After evaluating all possible split points, determine and output the highest count
    // of common unique characters found across all iterations.
    console.log(Math.max.apply(null, resultCollection));
}


// Initiate the processing by reading input from standard input.
// The entire content of '/dev/stdin' is read as a UTF-8 encoded string
// and then passed to the 'processInputString' function for execution.
processInputString( require("fs").readFileSync("/dev/stdin", "utf8") );