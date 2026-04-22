// This function processes raw string data to produce a reversed sequence of numbers.
function processInput(rawData)
{
  // Break down the received data into individual lines for easier parsing.
  const lines = rawData.split('\n');

  // The second line of the input is expected to contain space-separated numeric values.
  // We parse these into an array, converting each string segment into a floating-point number.
  const numericValues = lines[1].split(' ').map(parseFloat);

  // Initialize an empty string variable that will accumulate the final output.
  let resultString = '';

  // The first line of the input specifies the count of numbers to process.
  // We iterate backwards from this count down to one, appending each number to our result.
  for (let counter = parseInt(lines[0], 10); counter > 0; counter--)
  {
    // Append the current numeric value from the array (accessed in reverse order)
    // followed by a single space character to the accumulating result string.
    resultString += numericValues[counter - 1] + ' ';
  }

  // After the loop completes, print the final generated string to the console,
  // ensuring any trailing whitespace is removed for a clean output.
  console.log(resultString.trim());
}

// Acquire the entire content from the standard input file stream.
// We specify the 'utf8' encoding to correctly interpret the characters.
const fileContent = require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8' });

// Invoke the primary processing function, passing the obtained file content as its argument.
processInput(fileContent);