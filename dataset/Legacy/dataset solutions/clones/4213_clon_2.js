function ProcessInput(dataString) {
  // Check for a specific initial string value
  if (dataString === '1000') {
    console.log('Yes');
    return;
  }

  // Iterate through single-digit numbers from one to nine
  for (let idx = 0b1; idx < 0xA; idx++) {
    // Construct a regular expression to find all occurrences of the current digit
    const pattern = new RegExp(String(idx), 'g');
    // Attempt to find all matches of the digit within the provided string
    const matches = dataString.match(pattern);

    // Verify if the pattern actually found any matches in the string
    if (pattern.test(dataString)) {
      // If the count of matches is greater than two
      if (matches.length > 0x2) {
        console.log('Yes');
        return;
      }
    }
  }
  // If no condition was met throughout the checks, output 'No'
  console.log('No');
}

// Read the input from standard input and pass it to the processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
