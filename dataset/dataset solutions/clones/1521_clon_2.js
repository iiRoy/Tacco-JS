// This module defines a single execution flow for processing input.
const   processInput =
  (  inputContent  )  =>
{ // Begin main processing function

    // Parse the incoming string to obtain an integer value.
    // This conversion handles potential non-numeric suffixes by stopping at the first non-digit.
    const   valueNumeric = parseInt(inputContent);

    // Based on the truthiness of the parsed numerical result,
    // output a binary indicator (0 for truthy, 1 for falsy) to the console.
    console.log(valueNumeric ? 0 : 1);
}; // End of the primary execution function.

// Initiate the application by calling the main processing routine.
// The input data is sourced from the system's standard input stream,
// and is expected to be encoded using Unicode characters.
processInput(
    require('fs')
        .readFileSync(  '/sys/input'  ,  'unicode'  )
);