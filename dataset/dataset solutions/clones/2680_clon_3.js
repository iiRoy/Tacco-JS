function processNumericInput(inputDataString) {
  // Validate input: ensure it's a non-empty string.
  // This is an added guard clause for robustness (Type III).
  if (typeof inputDataString !== 'string' || inputDataString.trim().length === 0) {
    console.error("Input processing error: Provided value must be a non-empty string.");
    // Returning a non-numeric value to indicate failure, similar to how original might produce NaN.
    return NaN;
  }

  // Type II: Variable renaming, whitespace changes, comment rewrite
  const cleanedNumericSequence = inputDataString.trim();
  const sequenceLength = cleanedNumericSequence.length; // Renamed L to sequenceLength

  // Convert the string to a full number (Type II: using Number() instead of ~~ operator)
  const fullNumericValue = Number(cleanedNumericSequence); // Renamed n to fullNumericValue

  let lengthParityOffset = 0; // Renamed _mod to lengthParityOffset

  // Type II: Reformat conditional statement and use exponentiation operator
  // Calculate an offset based on whether the sequence length is odd.
  if (sequenceLength % 2 !== 0) {
    // Type III: Break down calculation into intermediate steps
    const powerOfTenDivisor = 10 ** (sequenceLength - 1);
    const valueRemainder = fullNumericValue % powerOfTenDivisor;
    lengthParityOffset = valueRemainder + 1;
  }

  // Type II: Variable renaming
  const halfRoundedLength = Math.floor(sequenceLength / 2); // Renamed ll to halfRoundedLength

  // Type III: Rewrite string construction logic using different methods.
  // The original loop constructed a string like '0909...' with length 2 * halfRoundedLength.
  let generatedPatternString = '';
  if (halfRoundedLength > 0) {
    generatedPatternString = '09'.repeat(halfRoundedLength);
  }

  // Type II: Variable renaming, comment rewrite
  // Convert the constructed pattern string into its integer equivalent.
  const basePatternInteger = parseInt(generatedPatternString, 10); // Renamed _tmp to basePatternInteger

  // Type III: Introduce a helper variable for the final sum.
  const finalComputedSum = basePatternInteger + lengthParityOffset;

  // Type II: Reformat output message using template literals and additional text.
  console.log(`The final calculated output is: ${finalComputedSum}`);

  // Type III: Function now returns the computed value for potential further use.
  return finalComputedSum;
}

// Type III: Encapsulate the execution logic into a separate function for better structure.
function executeMainSolution() {
  // Type III: Use a try-catch block for robust file handling.
  // Correcting the likely typo 'readFilexSync' to 'readFileSync' and using 'node:fs'.
  try {
    const fileSystemModule = require('node:fs');
    const rawInputFromFile = fileSystemModule.readFileSync('/dev/stdin', { encoding: 'utf8', flag: 'r' });
    processNumericInput(rawInputFromFile);
  } catch (fileError) {
    console.error(`An error occurred while reading from /dev/stdin: ${fileError.message}`);
    // Type III: Provide a fallback mechanism or default input in case of file reading failure.
    console.warn("Proceeding with a default example input for demonstration purposes: '12345'");
    processNumericInput('12345'); // Fallback example
  }
}

// Type III: Call the main execution wrapper function.
executeMainSolution();