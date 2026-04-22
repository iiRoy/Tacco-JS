/* This is a Type I clone of the original JavaScript code.
 * It maintains exact logical and structural equivalence,
 * only varying whitespace and comments as permitted by the definition.
 */

// Start the main loop, processing lines until a single dot is encountered.
while (
    (line = readline())
    != '.'
) {
    // Declare variables for line length, a stack array, and the return string.
    var len = line.length,
        arr = [],
        rtn = '';

    // Iterate through each character of the current line.
    for (
        var i = 0;
        i < len;
        i++
    ) {
        // Get the current character.
        char = line[i];

        // Check for opening brackets.
        if (
            char == '['
        ) {
            // Push opening square bracket onto the stack.
            arr.push(char);
        } else if (
            char == '('
        ) {
            // Push opening parenthesis onto the stack.
            arr.push(char);
        }
        // Check for closing brackets.
        else if (
            char == ']'
        ) {
            // Pop from stack and check if it matches the opening square bracket.
            if (
                arr.pop()
                != '['
            ) {
                // If not a match, set result to 'no' and break the loop.
                rtn = 'no';
                break;
            }
        } else if (
            char == ')'
        ) {
            // Pop from stack and check if it matches the opening parenthesis.
            if (
                arr.pop()
                != '('
            ) {
                // If not a match, set result to 'no' and break the loop.
                rtn = 'no';
                break;
            }
        }
    } // End of character iteration loop.

    // After processing the line, determine the final result.
    if (
        !rtn
        && arr.length == 0
    ) {
        // If no mismatch was found and the stack is empty, it's balanced.
        rtn = 'yes';
    } else {
        // Otherwise, it's not balanced (either mismatch or stack not empty).
        rtn = 'no';
    }

    // Print the result for the current line.
    print(rtn);
} // End of main while loop.