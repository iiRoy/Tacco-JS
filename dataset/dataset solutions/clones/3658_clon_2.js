// This module handles numerical calculations based on provided text input.
function analyzeAndSum(incomingTextData) {
    // Split the complete text into an array of string entries, delimited by newlines.
    const textSegments = incomingTextData.split('\n');

    // Convert the first segment to a number and then negate it.
    // The multiplication by -1 inherently performs type coercion from string to number.
    let negatedFirstNumber = textSegments[0] * -1;

    // Take the second segment, split it by spaces, and compute the sum of its numerical parts.
    let cumulativeSumFromSecondLine = textSegments[1]
                                                    .split(' ')
                                                    .reduce((currentTotal, itemString) => {
                                                        // Use double bitwise NOT (~~) for efficient string-to-number conversion.
                                                        return (~~currentTotal) + (~~itemString);
                                                    });

    // Display the final aggregate result to the standard output.
    console.log(negatedFirstNumber + cumulativeSumFromSecondLine);
}

// Invoke the primary processing function.
// It reads input from the standard input stream, assuming UTF-8 encoding.
analyzeAndSum(require("fs").readFileSync("/dev/stdin", "utf8"));