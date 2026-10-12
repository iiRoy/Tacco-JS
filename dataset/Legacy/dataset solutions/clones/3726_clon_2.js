function processInput(rawData) {
  // Split the raw input string into an array of individual lines.
  const inputLines = rawData.split('\n');

  // Parse the first number from the first line.
  // The first line contains two space-separated integers.
  const firstVal = inputLines[0].split(' ').map(strNum => parseInt(strNum, 10))[0];

  // Parse the second number from the first line.
  const secondVal = inputLines[0].split(' ').map(strNum => parseInt(strNum, 10))[1];

  // Parse the array of numbers from the second line.
  // This line contains space-separated integers.
  const dataArray = inputLines[1].split(' ').map(strNum => parseInt(strNum, 10));

  // Perform a calculation based on the parsed values.
  // This formula computes a specific result.
  let finalOutcome = Math.ceil((firstVal - secondVal) / (secondVal - 1)) + 1;

  // Output the computed result to the console.
  console.log(finalOutcome);
}

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
