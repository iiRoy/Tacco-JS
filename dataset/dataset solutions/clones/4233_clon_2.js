// Define a utility function to load Node.js modules.
function retrieveModule(moduleIdentifier) {
  return require(moduleIdentifier);
}

// Define a utility function to acquire content from a specified file path.
function acquireFileContents(pathSpecifier, encodingFormat) {
  // Obtain the file system module using our utility.
  const fsInstance = retrieveModule('fs');
  // Read the file synchronously using the acquired module instance.
  return fsInstance.readFileSync(pathSpecifier, encodingFormat);
}

// This primary function processes an incoming string of numerical data.
function processNumericalData(rawInputText) {

  // First, ensure the input string is clean by removing any leading or trailing whitespace.
  rawInputText = rawInputText.trim();

  // Establish a constant for the decimal radix when parsing integers.
  const radixDecimal = 10;

  // Divide the cleaned input string by spaces to get individual number strings.
  // Convert the first segment to an integer, representing the initial quantity.
  const firstQuantity = Number.parseInt(rawInputText.split(" ")[0], radixDecimal);

  // Convert the second segment to an integer, representing a specific interval size.
  const secondQuantity = Number.parseInt(rawInputText.split(" ")[1], radixDecimal);

  // Convert the third segment to an integer, which acts as a modification factor.
  const thirdQuantity = Number.parseInt(rawInputText.split(" ")[2], radixDecimal);


  // Compute an intermediate difference based on the first and third quantities.
  let computedDifference = firstQuantity - 2 * thirdQuantity;


  // Calculate a base count by dividing the intermediate difference by the sum of the second and third quantities.
  // Using Math.trunc to extract the integer portion of the division result.
  let finalCalculatedValue = Math.trunc(computedDifference / (secondQuantity + thirdQuantity));


  // Evaluate a condition to determine if an additional increment is required for the count.
  // This checks if the remaining portion of the difference is sufficient to cover another interval.
  if (computedDifference - finalCalculatedValue * (secondQuantity + thirdQuantity) >= secondQuantity) {
    // If the condition is met, output the incremented final count.
    console.log(finalCalculatedValue + 1);
  } else {
    // Otherwise, output the base calculated count without incrementing.
    console.log(finalCalculatedValue);
  }

}


// Define the standard input file path and the desired character encoding.
const standardInputPath = '/dev/stdin';
const utf8Encoding = 'utf8';

// Initiate the data processing by calling the main function with contents read from standard input.
processNumericalData(acquireFileContents(standardInputPath, utf8Encoding));