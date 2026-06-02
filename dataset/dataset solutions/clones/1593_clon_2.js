const ProcessInput = (rawData) => {
  // Split the raw input string by newline characters to get an array of lines.
  const dataLines = rawData.split('\n');

  // Extract the first line, ensure it's a string, and then split it into an array of individual characters.
  const weatherChars = dataLines[0].toString().split('');

  // Initialize a variable to keep track of the count of specific weather patterns.
  let rainyStreakCount = 0;

  // Iterate over the weather characters using the reduce method.
  // The 'previousChar' accumulator stores the character from the prior iteration.
  weatherChars.reduce((previousChar, currentChar) => {
    // Check if the previous character was 'R' (Rain) and the current character is also 'R'.
    // If both conditions are true, increment the counter.
    if (previousChar === 'R' && currentChar === 'R') {
      rainyStreakCount++;
    }
    // Check if this is the very first character being processed (indicated by 'previousChar' being the initial empty string)
    // and if the current character is 'R'. If so, increment the counter.
    if (previousChar === '' && currentChar === 'R') {
      rainyStreakCount++;
    }
    // Return the current character to be used as 'previousChar' in the next iteration.
    return currentChar;
  }, ''); // The initial value for 'previousChar' (the accumulator) is an empty string.

  // Print the final calculated count to the standard output.
  console.log(rainyStreakCount);
};

// Read the entire content of standard input as a UTF-8 string and pass it to the processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
