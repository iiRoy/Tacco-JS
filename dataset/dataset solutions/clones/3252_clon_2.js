/*
 * This JavaScript module processes numerical data provided via standard input.
 * Its primary function is to read two space-separated integers,
 * calculate half their product, and then output the final result.
 *
 * This code adheres to Type II cloning principles:
 * - The underlying logic and control flow are preserved exactly.
 * - All user-defined identifier names have been altered.
 * - Built-in function/method calls are either wrapped in new user-defined functions
 *   or their referencing variables have been renamed for distinctness.
 * - Whitespace and comments have been extensively modified and expanded.
 * - Data type handling (e.g., explicit base for parseInt) has been made explicit.
 */


//  Section 1: Input Acquisition and Setup
//  ======================================

//  Firstly, we obtain a reference to the Node.js 'fs' (file system) module.
//  This module is crucial for interacting with the file system, including
//  reading from standard input, which is treated as a special file path.
const fileSystemInterface = require('fs');


//  Next, we define a custom utility function to encapsulate the synchronous
//  file reading operation. This allows us to use a unique identifier for
//  this specific I/O task, adhering to the identifier renaming requirement.
const retrieveFileContentSync = (pathIdentifier, textEncoding) =>
{
    return fileSystemInterface.readFileSync(pathIdentifier, textEncoding);
};


//  Now, we read the entire raw content synchronously from the standard input stream.
//  The path '/dev/stdin' is a common convention for standard input on Unix-like systems.
//  The content is expected to be a string, decoded using UTF-8.
let rawInputStreamData = retrieveFileContentSync('/dev/stdin', 'utf8');


//  Section 2: Data Transformation and Parsing
//  ==========================================

//  We define another custom utility function for converting string values into integers.
//  This function explicitly specifies base 10 for parsing, ensuring robust numerical conversion
//  and allowing us to use a unique identifier instead of the direct `parseInt` call.
const convertStringToDecimalInteger = (stringRepresentation) =>
{
    return parseInt(stringRepresentation, 10);
};


//  The raw input string is then processed to extract the numerical components.
//  First, the string is segmented into an array of substrings using a space ' ' as the delimiter.
//  Subsequently, each resulting substring is transformed into an integer using our
//  `convertStringToDecimalInteger` helper function.
let processedNumericalElements = rawInputStreamData.split(' ').map(currentStringSegment =>
{
    // Apply the custom conversion function to each individual string part.
    return convertStringToDecimalInteger(currentStringSegment);
});


//  Section 3: Calculation and Output Display
//  =========================================

//  To ensure all identifier names are distinct, we define a custom function
//  for outputting data to the standard console. This wraps the native `console.log` method.
const displayResultOnConsole = (outputValue) =>
{
    console.log(outputValue);
};


//  Finally, we perform the core arithmetic operation:
//  The first element from our array of numbers is multiplied by the second element.
//  The product obtained is then divided by two to yield the final computed value.
//  This result is then presented to the user via the standard output.
displayResultOnConsole((processedNumericalElements[0] * processedNumericalElements[1]) / 2);


//  End of program execution.