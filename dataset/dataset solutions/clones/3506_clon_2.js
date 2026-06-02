function processInput(rawData) {
  // Extract the first line of input and ensure it's treated as a string.
  let currentNumberString = rawData.split('\n')[0] + '';

  mainLoop: while (true) { // Continuously loop until a number with uniform digits is found.
    const stringLength = currentNumberString.length;
    const firstDigitChar = currentNumberString[0];

    // Iterate through the characters of the number string, starting from the second character.
    for (let idx = 1; idx < stringLength; idx++) {
      // If any character is different from the initial character, the number is not uniform.
      if (firstDigitChar !== currentNumberString[idx]) {
        // Convert the current string to a floating-point number, increment it, and convert back to string.
        const parsedIncrementedNumber = parseFloat(currentNumberString) + 1;
        currentNumberString = parsedIncrementedNumber + '';
        continue mainLoop; // Restart the main processing loop with the newly incremented number.
      }
    }

    // If the loop completes without a 'continue', it means all digits are identical.
    console.log(currentNumberString); // Output the found number.
    break; // Exit the main loop as the condition is met.
  }
}

// Read the entire content from standard input synchronously and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
