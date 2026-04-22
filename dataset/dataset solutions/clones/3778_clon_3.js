const processNumericInput = (rawInputStr) => {
  if (!rawInputStr || typeof rawInputStr !== 'string') {
    // Basic validation: input must be a non-empty string.
    console.error("Error: Provided input is not a valid string.");
    return;
  }

  const cleanedInput = rawInputStr.trim();
  let numericalValue = Number.parseInt(cleanedInput, 10); // Explicitly use base 10

  if (Number.isNaN(numericalValue)) {
    // Guard clause: ensure the string can be converted to a number.
    console.error("Error: Input string could not be parsed into a number.");
    return;
  }

  // Convert the numerical value back to a string to easily extract individual digits.
  const numberAsText = String(numericalValue);
  const totalDigitCount = numberAsText.length;

  const digitCollection = [];

  // Extract digits by iterating through the string representation.
  for (let currentPosition = 0; currentPosition < totalDigitCount; currentPosition++) {
    const digitChar = numberAsText[currentPosition];
    // Convert each character digit back to its numeric form.
    digitCollection.push(Number.parseInt(digitChar, 10));
  }

  // Calculate the cumulative sum of all extracted digits.
  let accumulatedSum = 0;
  for (const individualDigit of digitCollection) {
    accumulatedSum += individualDigit;
  }

  // Apply a specific transformation rule to the sum.
  // If the sum happens to be 1, substitute it with 10.
  const finalOutputValue = (accumulatedSum === 1) ? 10 : accumulatedSum;

  console.log(finalOutputValue);
};

// Main execution block to handle input from standard input.
try {
  const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
  processNumericInput(fileContent);
} catch (fileReadError) {
  // Catch potential errors during file reading (e.g., file not found, permissions).
  console.error("An issue occurred while attempting to read from /dev/stdin:", fileReadError.message);
  // Exit the process with an error code to indicate failure.
  process.exit(1);
}