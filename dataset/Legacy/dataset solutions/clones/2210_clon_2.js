function ProcessInput(rawData) {
  // Divide the incoming string into an array of substrings using space as a delimiter.
  const dataParts = rawData.split(" ");

  // Convert the first element of the array to a numerical type.
  const firstValue = Number(dataParts[0]);

  // Convert the second element of the array to a numerical type.
  const secondValue = Number(dataParts[1]);

  // Evaluate if the two obtained numerical values are strictly identical.
  if (firstValue === secondValue) {
    // If the values match, print 'Yes' to the standard output.
    console.log('Yes');
  } else {
    // Otherwise, if the values do not match, print 'No' to the standard output.
    console.log('No');
  }
}

// This section is responsible for reading input from the standard input stream
// and passing it to the primary processing function. It should remain unaltered.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
