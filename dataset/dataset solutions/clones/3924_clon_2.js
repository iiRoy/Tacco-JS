function ProcessInput(inputString) {
  // Split the entire input string by newline characters to get individual lines.
  let lineData = inputString.split('\n');

  // The first line contains the number of queries. Convert it to a number.
  const queryCount = +lineData[0];

  // Iterate through each query.
  for (let idx = 0; idx < queryCount; idx++) {
    // For each query, parse the numbers from the corresponding line.
    // The numbers are space-separated, so split and convert them to integers.
    let currentNumbers = lineData[idx + 1].split(' ').map(val => +val);

    // Determine the maximum of the two numbers.
    let maxVal = Math.max(currentNumbers[0], currentNumbers[1]);
    // Determine the minimum of the two numbers.
    let minVal = Math.min(currentNumbers[0], currentNumbers[1]);

    // Calculate an intermediate value 'c' based on the product of minVal and maxVal.
    let calcVal = Math.ceil(Math.sqrt(minVal * maxVal)) - 1;

    // Initialize the result with a base calculation.
    let resultValue = (minVal - 1) * 2;

    // Adjust the result based on a comparison between minVal and maxVal.
    if (minVal < maxVal - 1) {
      resultValue++;
    }

    // Further adjust the result using the intermediate value 'c'.
    resultValue += Math.max(calcVal - minVal, 0) * 2;

    // Apply a final adjustment if a specific condition involving floor division is met.
    if (Math.floor(minVal / calcVal * maxVal) === calcVal) {
      resultValue--;
    }

    // Output the final calculated result for the current query.
    console.log(resultValue);
  }
}

// Read the input from standard input and pass it to the main processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
