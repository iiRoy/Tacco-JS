// This module processes input data to perform a character shift transformation.
function ProcessInputData(rawData) {
  // Split the raw input into individual lines for processing.
  const linesOfInput = rawData.split("\n");

  // Validate that we have at least two lines of input.
  if (linesOfInput.length < 2) {
    console.error("Error: Insufficient input data. Expected at least two lines.");
    return; // Exit if input is malformed.
  }

  // Extract the numeric shift value from the first line.
  // Using parseInt for explicit conversion, ensuring it's base 10.
  const rotationValue = parseInt(linesOfInput[0], 10);
  
  // Basic validation for the rotation value.
  if (isNaN(rotationValue)) {
    console.error("Error: Invalid rotation value provided. Must be a number.");
    return;
  }

  // Extract the string to be transformed from the second line.
  // Convert it into an array of characters for easier iteration.
  const plainSequence = Array.from(linesOfInput[1]);
 
  // Define the size of the English alphabet.
  const ALPHABET_LENGTH = 26;

  // Generate an array representing the uppercase English alphabet dynamically.
  // This helps avoid hardcoding the string "ABCDEFGHIJKLMNOPQRSTUVWXYZ".
  const charMap = [];
  for (let i = 0; i < ALPHABET_LENGTH; i++) {
    charMap.push(String.fromCharCode('A'.charCodeAt(0) + i));
  }

  // Initialize an array to store the transformed characters.
  const transformedOutputChars = [];
 
  // Iterate through each character in the original sequence.
  for (const originalChar of plainSequence) {
    // Determine ASCII code for comparison.
    const charCode = originalChar.charCodeAt(0);
    const charA_Code = 'A'.charCodeAt(0);
    const charZ_Code = 'Z'.charCodeAt(0);

    // Only process uppercase English letters.
    if (charCode >= charA_Code && charCode <= charZ_Code) {
      // Calculate the zero-based index of the character within the alphabet.
      const initialIndex = charCode - charA_Code;
      
      // Calculate the effective shift amount, ensuring it's positive and within alphabet bounds.
      // Adding ALPHABET_LENGTH before modulo handles potential negative rotationValue gracefully.
      const effectiveShift = (rotationValue % ALPHABET_LENGTH + ALPHABET_LENGTH) % ALPHABET_LENGTH;
      
      // Apply the effective shift to find the new index.
      const shiftedIndex = (initialIndex + effectiveShift) % ALPHABET_LENGTH;
      
      // Append the new character from our alphabet map to the result array.
      transformedOutputChars.push(charMap[shiftedIndex]);
    } else {
      // If the character is not an uppercase letter, append it as is (e.g., spaces, punctuation).
      // This provides robustness for inputs beyond strict 'A-Z' characters.
      transformedOutputChars.push(originalChar);
    }
  }
 
  // Join the array of transformed characters back into a single string.
  const finalEncodedString = transformedOutputChars.join('');
 
  // Display the generated output to the console.
  console.log(finalEncodedString);
}

// This section handles standard input/output operations.
// It reads all data from standard input and then calls the main processing function.
// Do not modify this part of the code for the challenge itself.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));