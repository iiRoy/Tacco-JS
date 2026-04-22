// This function serves as the primary entry point for processing input data.
function processCommandLineInput
(
  /* This parameter holds the raw string content read from the input source. */
  inputContentString
)
{
  // Establish a consistent reference to the integer parsing utility.
  const convertToInt = Number .  parseInt;

  // Transform the provided string into an integer value for computations.
  let parsedNumericValue = convertToInt( inputContentString );

  // Secure a local reference to the JavaScript Math object for mathematical operations.
  const mathOperations =   Math  ;

  // Obtain a direct reference to the system's standard output object.
  const systemOutput = console;

  // Execute the core calculation: divide by two, round up, and subtract one, then print.
  systemOutput.log( mathOperations . ceil( parsedNumericValue / 2 ) - 1 );
}

// --- Program Execution Flow ---

// Create an alias for Node.js's module loading function.
const getModule = require;

// Load the necessary file system capabilities using the alias.
const fileSystemHandler = getModule('fs');

// Isolate the specific function for reading file content.
const readFromFile = fileSystemHandler . readFileSync;

// Define the standard input file path as a constant string.
const standardInputPathIdentifier = '/dev/stdin';

// Declare the desired text encoding format.
const encodingOption = 'utf8';

// Invoke the main processing function, feeding it content from standard input.
processCommandLineInput
(
  readFromFile( standardInputPathIdentifier, encodingOption )
);