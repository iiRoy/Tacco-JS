for (
    // Initialization of a string literal that forms part of a larger JavaScript expression.
    // This literal will be dynamically combined and used within an 'eval' function.
    let  expressionPiece  =  'characterSet.reverse().join("")-';

    // A numeric variable initialized to control the starting point of input reading.
    // It acts as an index for accessing elements from a split input array, starting from the second element.
    let  segmentIndex  =  1;

    // The loop's condition and update step:
    // It reads the entire content of standard input, decodes it as UTF-8,
    // splits the content into an array of strings using whitespace as a delimiter,
    // and then selects an element from this array using the current 'segmentIndex'.
    // 'segmentIndex' is incremented after each use for the next iteration.
    // The loop continues as long as a valid input segment is successfully retrieved and assigned.
    let  currentDataSegment  =  require("fs")
                                    .readFileSync("/dev/stdin", "utf8")
                                    .split(/\s/)[segmentIndex++];

) {
    // Inside the loop, the 'currentDataSegment' (which is a string) is first
    // broken down into an array of its individual characters using `split('')`.
    // This character array is then sorted alphabetically using `sort()`.
    // The resulting sorted character array is assigned to 'characterSet'.
    let  characterSet  =  currentDataSegment
                            .split('')
                            .sort();

    // The core computation involves evaluating a dynamically constructed JavaScript string.
    // The string is formed by concatenating 'expressionPiece' (e.g., "characterSet.reverse().join("")-")
    // with itself, followed by the numeric literal '0'.
    // This results in an expression of the form "X - X - 0", where X is the result of
    // `characterSet.reverse().join("")`. The outcome of such an evaluation will always be zero.
    // The 'characterSet' variable (defined just above) is implicitly referenced within 'expressionPiece'.
    console.log(eval(expressionPiece + expressionPiece + 0));
}