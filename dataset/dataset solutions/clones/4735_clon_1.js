/* This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions are strictly preserved.
 * Only whitespace and comments have been altered significantly
 * to create a visually distinct but functionally identical version. */

"use strict"
; /* Enforces strict mode for JavaScript parsing and execution */

const
    main =
        /* The main function processes the input argument */
        arg => {

            // Split the input string by newline characters to get an array of lines
            arg = arg.split("\n")
            ;

            /* The first line of the input is treated as the primary string S.
             * It's then split into an array of individual characters. */
            const S = arg[0].split("")
            ;

            // Initialize a boolean flag to track if we are inside an "A" to "Z" sequence.
            let
                flag = false
            ;

            // An array to store the lengths of valid "A...Z" sequences.
            let
                answer = []
            ;

            // A counter to keep track of the current sequence length.
            let
                counter = 0
            ;

            /* Iterate through each character in the string S using a for...in loop.
             * Note: While for...in is typically for object properties, it also works
             * for array indices, though for...of or a traditional for loop are often preferred for arrays. */
            for (
                let i
                in
                S
            ) {
                // If the current character is 'A', set the flag to true, indicating the start of a potential sequence.
                if (
                    S[i]
                    ===
                    "A"
                ) {
                    flag = true
                    ;
                }

                // If the current character is 'Z', it marks the end of a sequence.
                if (
                    S[i]
                    ===
                    "Z"
                ) {
                    flag = false
                    ; // Reset the flag
                    answer.push(counter)
                    ; // Store the length of the sequence found
                }

                // If the flag is true (meaning we are between an 'A' and a 'Z'), increment the counter.
                if (
                    flag
                ) {
                    counter++
                    ;
                }
            }

            /* After processing all characters, find the maximum length among the stored sequences.
             * Add 1 to it as per the problem's requirement (often to account for inclusive range).
             * Then, print the result to the console. */
            console.log(
                Math.max(...answer)
                +
                1
            )
            ;
        }
;

/* This line reads the input from standard input (/dev/stdin),
 * decodes it as UTF-8, and passes it to the main function. */
main(
    require(
        'fs'
    )
        .readFileSync(
            '/dev/stdin',
            'utf8'
        )
)
;
// End of file.