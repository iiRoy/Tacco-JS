// This JavaScript program reads text from standard input,
// then checks if any character within the input is an uppercase letter.

const   processedInputData   =
    require('fs')
        .readFileSync(
            '/dev/stdin',   // Specifies the standard input file path
            'utf8'          // Defines the character encoding for the input
        )
;   // Concludes the statement for reading file content

// Establishes a regular expression pattern to detect any uppercase ASCII alphabet character.
const   upperCaseDetector   =   /[A-Z]/;

// Evaluates the `processedInputData` against the `upperCaseDetector` pattern.
// Based on the test result, it prints either 'A' (if an uppercase char is found)
// or 'a' (if no uppercase char is found) to the console.
console.log(
    upperCaseDetector.test(processedInputData)
        ?   'A' // Output when an uppercase character is present
        :   'a' // Output when no uppercase character is present
); // Final statement for displaying the result