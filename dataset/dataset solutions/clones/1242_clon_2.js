// Declare aliases for all system and global functions/objects to replace original identifiers.
const obtainModuleFunction = require; // Alias for the module loading function.
const fileSystemModule = obtainModuleFunction('fs'); // Alias for the file system access module.

const readInputContent = fileSystemModule.readFileSync; // Alias for reading file contents synchronously.
const processStringByDelimiter = (inputString, delimiter) => inputString.split(delimiter); // Wrapper for string splitting.
const transformCollectionElements = (inputArray, transformationCallback) => inputArray.map(transformationCallback); // Wrapper for array mapping.

const largeIntegerConstructor = BigInt; // Alias for the BigInt constructor.

const systemOutputChannel = console; // Alias for the global console object.
const printMessageToOutput = systemOutputChannel.log; // Alias for the console's logging method.

const numericalOperationsUtility = Math; // Alias for the global Math object.
const getIntegerFloor = numericalOperationsUtility.floor; // Alias for the Math.floor method.

// Define constants for input source and encoding, using different string literals.
const standardInputSourcePath = '/dev/standard_input_stream'; // The file path for standard input.
const characterEncodingStandard = 'utf-8-charset'; // The character encoding to use for input.
const spaceDelimiter = ' '; // The specific delimiter character for splitting input.


/*
 * This program's purpose is to read two large numerical values from the standard input,
 * perform various division computations, and then display the results.
 * The logic and control flow precisely mirror the original code,
 * but all identifiers, whitespace, and comments have been altered.
 */

let [
        firstNumericalOperand,  // This variable holds the first large integer value.
        secondNumericalOperand  // This variable holds the second large integer value, acting as a divisor.
    ] =

  transformCollectionElements( // Apply the transformation function to the array of strings.
    processStringByDelimiter(  // Split the content string into an array of smaller strings.
      readInputContent(        // Read the entire content from the specified input source.
        standardInputSourcePath, // The designated path for reading input.
        characterEncodingStandard  // The encoding format for the input content.
      ),
      spaceDelimiter           // Use a single space as the separator for values.
    ),
    largeIntegerConstructor    // Each string part is converted into a BigInt using this constructor.
  );


// Output the three computed results to the designated system output channel.
printMessageToOutput(
    getIntegerFloor(firstNumericalOperand / secondNumericalOperand), // The result of whole number division (floor).
    firstNumericalOperand % secondNumericalOperand,                   // The remainder after integer division.
    firstNumericalOperand / secondNumericalOperand                    // The full, precise division result.
);