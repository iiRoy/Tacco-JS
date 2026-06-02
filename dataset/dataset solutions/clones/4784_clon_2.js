// This function processes raw input data to generate a specific sequence of directional movements.
function ProcessInput(rawData) {
  // The input string is first split by newline, taking only the first line.
  // Then, that line is split by spaces, and each resulting substring is converted to a number.
  let numericValues = rawData.split('\n')[0].split(' ').map(Number);

  // An object is created to store two key coordinates derived from the numeric input.
  // The third element of the parsed array is assigned to 'horizontal', and the fourth to 'vertical'.
  const coordinates = {
    horizontal: numericValues[2], // Corresponds to the 'x' value in the original code.
    vertical: numericValues[3]    // Corresponds to the 'y' value in the original code.
  };

  // An empty string is initialized to accumulate the sequence of movements.
  let resultString = '';

  // Phase 1: Generate initial movements.

  // Append 'U' (Up) to the string 'vertical' number of times.
  for (let idx = 0; idx < coordinates.vertical; idx++) {
    resultString += 'U';
  }

  // Append 'R' (Right) to the string 'horizontal' number of times.
  for (let idx = 0; idx < coordinates.horizontal; idx++) {
    resultString += 'R';
  }

  // Append 'D' (Down) to the string 'vertical' number of times.
  for (let idx = 0; idx < coordinates.vertical; idx++) {
    resultString += 'D';
  }

  // Append 'L' (Left) to the string 'horizontal' number of times.
  for (let idx = 0; idx < coordinates.horizontal; idx++) {
    resultString += 'L';
  }

  // Append an additional 'L' (Left) movement.
  resultString += 'L';

  // Phase 2: Generate subsequent movements based on incremented coordinates.

  // Append 'U' (Up) to the string 'vertical + 1' number of times.
  for (let idx = 0; idx < coordinates.vertical + 1; idx++) {
    resultString += 'U';
  }

  // Append 'R' (Right) to the string 'horizontal + 1' number of times.
  for (let idx = 0; idx < coordinates.horizontal + 1; idx++) {
    resultString += 'R';
  }

  // Append the sequence 'DR' (Down, Right).
  resultString += 'DR';

  // Append 'D' (Down) to the string 'vertical + 1' number of times.
  for (let idx = 0; idx < coordinates.vertical + 1; idx++) {
    resultString += 'D';
  }

  // Append 'L' (Left) to the string 'horizontal + 1' number of times.
  for (let idx = 0; idx < coordinates.horizontal + 1; idx++) {
    resultString += 'L';
  }

  // Append a final 'U' (Up) movement.
  resultString += 'U';

  // The complete generated movement sequence is printed to the console.
  console.log(resultString);
}

// The program reads input from standard input using Node.js's file system module,
// decodes it as UTF-8, and then passes it to the main processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
