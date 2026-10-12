function processData(rawData) {
  // Extract the first numeric value from the initial line of input.
  let firstNum = rawData[0].split(" ")[0] - 0;

  // Extract the second numeric value from the initial line of input.
  let secondNum = rawData[0].split(" ")[1] - 0;

  // Determine the output based on divisibility.
  if (secondNum % firstNum === 0) {
    // If the second number is perfectly divisible by the first, print their sum.
    console.log(firstNum + secondNum);
  } else {
    // Otherwise, print the difference (second minus first).
    console.log(secondNum - firstNum);
  }
}

// Read the entire standard input, decode it as UTF-8, remove leading/trailing whitespace,
// and then split it into an array of strings by newline characters.
processData(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
