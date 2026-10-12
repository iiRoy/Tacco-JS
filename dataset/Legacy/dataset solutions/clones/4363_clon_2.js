function processInput(rawData) {
  // Remove any leading or trailing whitespace from the provided string data.
  rawData = rawData.trim();

  // Divide the cleaned string into parts using a space as a delimiter,
  // then convert each part into a numerical value.
  const numericValues = rawData.split(" ").map(Number);

  // Evaluate if the first element or the second element in the array
  // of numbers is strictly equal to the integer 9.
  if (numericValues[0] === 9 || numericValues[1] === 9) {
    // If either condition holds true, print 'Yes' to the console.
    console.log('Yes');
  } else {
    // Otherwise, if neither condition is met, print 'No' to the console.
    console.log('No');
  }
}

// Read the entire content of the standard input stream as a UTF-8 encoded string,
// and then pass this content to our primary processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
