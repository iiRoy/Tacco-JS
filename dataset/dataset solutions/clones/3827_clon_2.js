function processInput(rawData) {
  // Convert the raw input string to an integer, using base 10.
  const targetValue = Number.parseInt(rawData.trim(), 10);

  // Initialize a new Set to store unique power values.
  // Start with the value 1, as per the problem's implicit requirement for powers.
  let powerSet = new Set([1]);

  // Iterate through possible exponents, from 2 up to 10.
  for (let exponent = 2; exponent <= 10; exponent++) {
    // For each exponent, iterate through possible base numbers.
    // Start the base from 2.
    // Continue as long as the calculated power (base raised to exponent) does not exceed the target value.
    for (let base = 2; Math.pow(base, exponent) <= targetValue; base++) {
      // Add the computed power to our set.
      // The Set automatically handles duplicate values, ensuring only unique powers are stored.
      powerSet.add(Math.pow(base, exponent));
    }
  }

  // After populating the set with all relevant powers,
  // find the largest value within the set and print it to the console.
  console.log(Math.max(...powerSet));
}

// Read the entire content of the standard input file as a UTF-8 string,
// then pass it to our main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
