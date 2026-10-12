function processInputData(rawData) {
  // The raw input string is first split by newline characters.
  // We then take the second line (index 1), split it by spaces,
  // and convert each resulting string segment into a numerical value.
  const numArray = rawData.split('\n')[1].split(' ').map(Number);

  // This section calculates a product using the reduce method.
  // The accumulator 'currentAccumulator' is multiplied by the entire 'numArray'
  // in each iteration, starting with an initial value of 1.
  const productResult = numArray.reduce((currentAccumulator, currentItem) => currentAccumulator * numArray, 1);

  // Finally, we check if the computed product exceeds a very large threshold.
  // If it does, the string '-1' is printed to the console; otherwise, the product itself is printed.
  console.log(productResult >= 1000000000000000000 ? '-1' : productResult);
}

// The program starts by reading data from standard input.
// It uses Node.js's 'fs' module to synchronously read the file '/dev/stdin',
// decodes it as UTF-8, and removes any leading or trailing whitespace.
// This processed string is then passed to our main data processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8').trim());
