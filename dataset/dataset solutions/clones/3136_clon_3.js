// This script is designed to compute a specific geometric difference based on input dimensions.

// Function to process and calculate results from provided data.
const computeGeometricDifference = (sourceData) => {
  // Validate the presence of input data.
  if (!sourceData || typeof sourceData !== 'string' || sourceData.trim().length === 0) {
    console.error('Error: No valid input data was supplied for processing.');
    return; // Terminate execution if input is invalid.
  }

  // Split the input string into individual lines.
  const inputLines = sourceData.split('\n');

  // Ensure there are at least two lines of input for the dimensions.
  if (inputLines.length < 2) {
    console.error('Error: Insufficient input lines. Expected a minimum of two lines.');
    return;
  }

  // Process the first line of dimensions.
  const primaryDimensions = inputLines[0].split(' ').map(Number);
  // Process the second line of dimensions.
  const secondaryDimensions = inputLines[1].split(' ').map(Number);

  // Validate that each line contains at least two numeric values.
  if (primaryDimensions.length < 2 || secondaryDimensions.length < 2) {
    console.error('Error: Each line must contain at least two numeric values for height and width.');
    return;
  }

  // Extract and rename the dimension variables for clarity.
  const initialHeight = primaryDimensions[0];
  const initialWidth = primaryDimensions[1];
  const subtractedHeight = secondaryDimensions[0];
  const subtractedWidth = secondaryDimensions[1];

  // Perform validation on the parsed numeric values.
  if (isNaN(initialHeight) || isNaN(initialWidth) || isNaN(subtractedHeight) || isNaN(subtractedWidth)) {
    console.error('Error: One or more input values could not be parsed as valid numbers.');
    return;
  }

  // Calculate the difference in heights and widths.
  // These intermediate variables help clarify the calculation steps.
  const netHeight = initialHeight - subtractedHeight;
  const netWidth = initialWidth - subtractedWidth;

  // The original expression: (h1 * w1) - (w1 * h2 + (h1 - h2) * w2)
  // Is algebraically equivalent to: (h1 - h2) * (w1 - w2)
  // This transformation simplifies the computation significantly.
  const finalCalculatedValue = netHeight * netWidth;

  // Output the final computed result to the console.
  console.log(finalCalculatedValue);
};

// This block handles the reading of data from standard input.
const initiateProgramExecution = () => {
  try {
    const fileSystemModule = require('fs'); // Dynamically import the file system module.
    // Read the entire content from /dev/stdin as a UTF-8 string.
    const stdInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
    // Pass the read content to the main processing function.
    computeGeometricDifference(stdInputContent);
  } catch (exception) {
    // Provide specific error messages based on the type of exception.
    if (exception.code === 'ENOENT') {
      console.error('File Error: Standard input (/dev/stdin) was not found or accessible.');
    } else {
      console.error('An unforeseen error transpired during input acquisition:', exception.message);
    }
  }
};

// Begin the program by calling the initiation function.
initiateProgramExecution();