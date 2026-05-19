function processInputData(dataArray) {
  // Extract the very first character from the provided input array.
  let firstChar = dataArray[0];

  // Check the character and print its complementary base.
  if (firstChar === 'A') {
    console.log('T');
  }

  if (firstChar === 'C') {
    console.log('G');
  }

  if (firstChar === 'G') {
    console.log('C');
  }

  if (firstChar === 'T') {
    console.log('A');
  }
}

// Read input from standard input, decode it as UTF-8, split by newlines,
// and then pass the resulting array to our processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
