function processInput(rawData) {
  rawData = rawData.trim(); // Remove leading/trailing whitespace from the input string.

  // Parse the first number from the input, though its value isn't used later.
  const firstNum = parseInt(rawData.split(" ")[0], 10);

  // Extract the second line of input, split it by spaces, and store as an array of strings.
  const symbolArray = rawData.split('\n')[1].split(' ').map((element) => (element));

  // Initialize a counter for the number of distinct symbols found.
  let distinctSymbols = 0;

  // Check for the presence of specific symbols and increment the counter if found.
  if (symbolArray.indexOf("P") !== -1) {
    distinctSymbols++;
  }

  if (symbolArray.indexOf("W") !== -1) {
    distinctSymbols++;
  }

  if (symbolArray.indexOf("G") !== -1) {
    distinctSymbols++;
  }

  if (symbolArray.indexOf("Y") !== -1) {
    distinctSymbols++;
  }

  // Output "Three" or "Four" based on the final count of distinct symbols.
  if (distinctSymbols === 3) {
    console.log("Three");
  } else {
    console.log("Four");
  }
}

// Read the entire content of standard input as a UTF-8 string and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
