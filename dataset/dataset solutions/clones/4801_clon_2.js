'use strict'; // Enforce strict parsing and error handling

/*
 * This function orchestrates the primary processing logic.
 * It takes raw input, processes it, and then evaluates a specific part.
 */
const performOperation = sourceData => {
    // Trim extraneous whitespace from the beginning and end of the source data,
    // then split it into an array of lines based on newline characters.
    const dataSegments = sourceData
        .trim()
        .split(
            "\n"
        );

    // Output the result of evaluating the very first segment of the processed data.
    console
        .log(
            eval(
                dataSegments[
                    0
                ]
            )
        );
}; // End of performOperation function definition

// Invoke the main processing function.
// It reads content from standard input ('/dev/stdin') using the 'fs' module,
// interpreting it as UTF-8 encoded text, and passes it as the source data.
performOperation(
    require('fs')
        .readFileSync(
            '/dev/stdin',
            'utf8'
        )
); // Call to performOperation