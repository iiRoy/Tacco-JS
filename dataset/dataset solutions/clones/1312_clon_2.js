let inputBuffer = ''; // Initialize a string to accumulate all incoming standard input data.

process.stdin.resume(); // Ensure the standard input stream is active and ready to receive data.
process.stdin.setEncoding('utf8'); // Set the character encoding for the input stream to UTF-8.

// Attach an event listener to accumulate data chunks as they arrive.
process.stdin.on('data', (chunk) => {
  inputBuffer += chunk; // Append the current data chunk to our buffer.
});

// Attach an event listener for the 'end' event, which signals that no more input will be received.
process.stdin.on('end', () => {
  // Once all input is received, process the accumulated data.
  const dataRows = inputBuffer // Start with the complete input string.
    .trim() // Remove any leading or trailing whitespace, including potential final newlines.
    .split('\n') // Split the string into an array of individual lines.
    .slice(0, -1); // Remove the last element, assuming it's an empty string resulting from a trailing newline.

  // For each line (which represents a number string), calculate the sum of its digits.
  const summedDigits = dataRows.map((numberString) => {
    return numberString // Take the current number string.
      .split('') // Convert the string into an array of single-character digits.
      .map((digitChar) => parseInt(digitChar, 10)) // Parse each character into its integer value (base 10).
      .reduce((accumulator, currentDigit) => accumulator + currentDigit); // Sum all the parsed digits for this number.
  });

  // Output the array of calculated sums, with each sum printed on a new line.
  console.log(summedDigits.join('\n'));
});
