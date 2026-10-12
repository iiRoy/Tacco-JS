/*
 * This is a Type I clone of the provided JavaScript code.
 *
 * According to the strict definition of Type I cloning:
 * - Every identifier, variable name, function name, operator, and expression
 *   remains completely unchanged.
 * - Only whitespace (indentation, spacing, blank lines) and comments
 *   (added, removed, or modified) are altered.
 *
 * Note: The original input code contains a JavaScript syntax error
 * (specifically, a 'for' statement following a comma operator in an expression list,
 * which is syntactically invalid). As Type I cloning strictly requires
 * preserving the exact sequence of all tokens, this clone also retains that
 * syntactic structure, including the error, to maintain strict Type I compliance.
 */

// Initialize the 'n' variable with a newline character.
n = '\n'

// The comma operator here is intended to chain 'n' assignment with the 'for' loop.
// This specific syntax (expression, statement) is invalid in JavaScript,
// but it is preserved as per Type I cloning rules.
, /* This comma operator connects the 'n' assignment with the 'for' loop statement. */
for (
    // Initialization block of the for-loop.
    // 1. Initialize counters 'w', 'x', 'y', 'z' to zero.
    w = x = y = z = 0

    // 2. Read the content of '/dev/stdin', decode it as UTF-8,
    //    and then split the string into an array 'i' using whitespace or commas as delimiters.
    , i = require("fs")
        .readFileSync(
            "/dev/stdin",   // Path to the input file to be read.
            "utf8"          // Encoding to use for reading the file.
        )
        .split(
            /\s|,/          // Regular expression to split the string by whitespace or comma.
        )

    // 3. Initialize 'c' (current character) and 'j' (index) to -1.
    , c = j = -1

    ; // End of the for-loop's initialization expressions.

    // Condition block of the for-loop.
    // This expression first increments 'j' by 2, then assigns the element
    // at the new index `i[j]` to 'c'. The loop continues as long as 'c'
    // evaluates to a truthy value (i.e., not undefined or null).
    c = i[j += 2]

    ; // End of the for-loop's condition expression.

    // The increment block of the for-loop is empty.
    // The index increment (j += 2) is handled within the condition expression.
)

    // Body of the for-loop.
    // This entire block forms a single statement due to the comma operator
    // chaining multiple expressions, terminated by a semicolon.

    // First expression in the loop body: Log the current index 'j' and character 'c'.
    console.log(j, c)

    // Comma operator chaining the console.log call with the subsequent
    // conditional increment logic.
    , /* This comma operator connects the logging operation with the counter update. */

    // Second expression in the loop body: Conditionally increment counters.
    // If 'c' is 'A', increment 'w'.
    c == 'A'
        ? w++
    // Else if 'c' is 'B', increment 'x'.
    : c == 'B'
        ? x++
    // Else if 'c' is 'O', increment 'z'.
    : c == 'O'
        ? z++
    // Else (for any other character), increment 'y'.
    : y++

    // The semicolon terminates the single statement that constitutes the loop body.
    ;

// This console.log statement executes after the for-loop has completed its iterations.
// It prints the final accumulated counts of 'w', 'x', 'y', and 'z',
// with each count separated by the newline character 'n'.
console.log(w + n + x + n + y + n + z)