const calculateResult = (sourceData) => {
  // Retrieve the first numerical component from the processed input line.
  // The input is expected to be a string containing two numbers separated by a space.
  const valA = sourceData[0] .split(" ")[0]-0;

  // Retrieve the second numerical component from the same input line.
  const valB = sourceData[0] .split(" ")[1]-0;

  // Determine the output based on a specific mathematical condition.
  if (valB % valA === 0) {
    // If the second value is perfectly divisible by the first, print their sum.
    console.log(valA + valB);
  } else {
    // Otherwise, if not divisible, print the difference (second minus first).
    console.log(valB - valA);
  }
};

// Initiate the calculation process using data obtained from standard input.
// The raw data is read, decoded, leading/trailing whitespace removed, and then split into an array of lines.
calculateResult(
  require('fs') .readFileSync('/dev/stdin', 'utf8') .trim() .split("\n")
);