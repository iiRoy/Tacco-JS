function ProcessInput(rawData) {
  // This function processes the input data to perform a Caesar cipher-like shift.

  // Split the raw input string into an array of lines.
  const inputLines = rawData.split("\n");

  // Extract the shift amount from the first line and convert it to an integer.
  const shiftAmount = ~~inputLines[0];

  // Convert the second line of input into an array of individual characters.
  const inputChars = [...inputLines[1]];

  // Define the standard English alphabet as an array of characters.
  const alphabetArray = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];

  // Iterate over each character in the input string and apply the shift.
  const shiftedString = inputChars.reduce((accumulator, currentChar) => {
    // Find the current character's position in the alphabet.
    // Add the shift amount, then use modulo 26 to wrap around the alphabet.
    const shiftedIndex = (alphabetArray.indexOf(currentChar) + shiftAmount) % 26;

    // Append the new, shifted character to the accumulator string.
    return accumulator += alphabetArray[shiftedIndex];
  }, ""); // Initialize the accumulator as an empty string.

  // Output the final shifted string to the console.
  console.log(shiftedString);
}

// The following line reads input from standard input and calls the main processing function.
// It should not be modified as it handles the environment's input mechanism.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
