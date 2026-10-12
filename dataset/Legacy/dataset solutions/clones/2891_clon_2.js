(function() {
  // This function processes the given raw data.
  function ProcessInput(rawData) {
    // Split the input by newline and take the first line.
    let processedString = rawData.split("\n")[0];

    // Initialize a counter for occurrences of 'x'.
    let xCount = 0;

    // Iterate through each character of the processed string.
    for (let charIndex = 0; charIndex < processedString.length; charIndex++) {
      // If the current character is 'x', increment the counter.
      if (processedString[charIndex] === 'x') {
        xCount++;
      }
    }

    // Check if the count of 'x' is 8 or more.
    if (xCount >= 8) {
      // If so, print 'NO'.
      console.log('NO');
    } else {
      // Otherwise, print 'YES'.
      console.log('YES');
    }
  }

  // Read input from standard input and pass it to the processing function.
  ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
})();
