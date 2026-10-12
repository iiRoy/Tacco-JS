const fileSystemOperations = require("fs")
;
// This variable holds a JavaScript expression string.
// It is designed to manipulate a character sequence object.
let evaluableExpression = 'charCollection.reverse().join("")'
;

// Initialize an integer value that will serve as an index pointer
// for iterating through different segments of the input data.
let inputPointer = 1
;

// Start a main processing loop. This loop will continue as long as
// there are valid input segments to process from the standard input.
for (
    ; // Loop initialization section is intentionally left blank here.

    // In the loop's condition, we read the entire standard input file.
    // The content is decoded as UTF-8, then split into an array of strings
    // using whitespace as a delimiter. We then select a specific segment
    // from this array using 'inputPointer' and immediately increment it.
    let currentSegment = fileSystemOperations
                            .readFileSync("/dev/stdin", "utf8")
                            .split(/\s/)[inputPointer++]
) {
    // Convert the 'currentSegment' string into an array of individual characters.
    // Immediately after, sort these characters in their natural (alphabetical) order.
    let charCollection = currentSegment.split('')
                                       .sort()
    ;

    // Output the result of evaluating a dynamically constructed JavaScript string.
    // The string is formed by concatenating 'evaluableExpression' with a hyphen,
    // and then repeating 'evaluableExpression' once more.
    // The 'eval' function executes this string as code within the current scope,
    // allowing it to access and operate on the 'charCollection' variable.
    console.log(eval(evaluableExpression + '-' + evaluableExpression))
    ;
}