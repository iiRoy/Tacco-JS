const getDivisorCount = (valueToCheck) => {
  // Initialize a counter to track the number of factors found for the given value.
  let divisorsFound = 0;

  // Iterate through potential divisors starting from zero up to and including the value itself.
  for (let currentDivisor = 0; currentDivisor <= valueToCheck; currentDivisor++) {
    // Check if the current number perfectly divides the target value.
    if (valueToCheck % currentDivisor === 0) {
      divisorsFound++; // If it's a divisor, increment the counter.
    }
  }

  // Return the total count of divisors found.
  return divisorsFound;
};


const runApplication = (rawData) => {
  // Convert the raw input string into a numerical integer.
  const parsedInput = Number(rawData);
  let finalAnswer = 0; // This variable will store the ultimate count meeting the criteria.

  // Loop through each number from zero up to the parsed input value.
  for (let currentNumber = 0; currentNumber <= parsedInput; currentNumber++) {
    // If the current number is an even number, skip it and proceed to the next iteration.
    if (currentNumber % 2 === 0) {
      continue;
    }

    // Call the helper function to determine how many divisors the current odd number has.
    // If the count of divisors is exactly eight, increment our final answer.
    if (getDivisorCount(currentNumber) === 8) {
      finalAnswer++;
    }
  }

  // Print the final calculated result to the console.
  console.log(finalAnswer);
};


// The following block of code is responsible for handling standard input/output.
// It reads all data from the standard input stream and then invokes the main processing function.
// This part should remain untouched to ensure proper execution in the environment.
runApplication(require("node:fs").readFileSync("/dev/stdin", "utf8"));