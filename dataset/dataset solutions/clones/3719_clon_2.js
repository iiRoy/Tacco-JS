function processInput(rawData) {
  // Process the raw input string: split by newline, take the first line, then split into individual characters.
  let charArray = rawData.split('\n')[0].split('');

  // Initialize counters for positive and negative signs.
  let positiveCount = 0;
  let negativeCount = 0;

  // Iterate through each character in the processed array.
  for (let idx = 0; idx < charArray.length; idx++) {
    // Check if the current character is a plus sign.
    if (charArray[idx] === '+') {
      positiveCount++; // Increment the positive counter.
    } else {
      negativeCount++; // Otherwise, it's a minus sign, so increment the negative counter.
    }
  }

  // Output the difference between the count of plus signs and minus signs.
  console.log(positiveCount - negativeCount);
}

// Read input from standard input and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
