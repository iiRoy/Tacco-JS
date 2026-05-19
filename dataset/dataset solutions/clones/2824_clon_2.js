function processInput(rawData) {
  // Split the entire input string by newline characters to get individual lines.
  const lines = rawData.split('\n');

  // Process the first line to extract initial parameters.
  // It splits the line by spaces and converts each part to an integer.
  const firstLineData = lines[0].split(' ').map(itemStr => parseInt(itemStr, 10));

  // Determine the upper bound for the loop, based on the first parameter plus one.
  const numElements = firstLineData[0] + 1;

  // Extract the target sum value from the second parameter of the first line.
  const targetSum = firstLineData[1];

  // Process the second line to get the list of numbers.
  // It splits the line by spaces and converts each part to an integer.
  const dataList = lines[1].split(' ').map(itemStr => parseInt(itemStr, 10));

  // Iterate from 1 up to and including 'numElements'.
  for (let idx = 1; idx <= numElements; idx++) {
    // Calculate the sum of elements from the beginning of 'dataList' up to the current 'idx'.
    // The slice method creates a new array, and reduce sums its elements.
    const currentSum = dataList.slice(0, idx).reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    // Check if the accumulated sum has reached or exceeded the target sum.
    if (currentSum >= targetSum) {
      // If the condition is met, print the current index and terminate the function.
      console.log(idx);
      return;
    }
  }

  // If the loop completes without finding a sum that meets the condition,
  // print 'numElements - 1' as per the problem's logic.
  console.log(numElements - 1);
}

// Read the entire content of standard input as a UTF-8 string
// and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
