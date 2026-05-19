// This function is designed to process a given input string.
function processInput(rawData) {
  // The input string is split into an array of string arguments.
  const parameters = rawData.split(" ");
  // The first argument is parsed as an integer, representing a count.
  const count = parseInt(parameters[0], 10);
  // The second argument is parsed as an integer, representing a starting number.
  const startValue = parseInt(parameters[1], 10);

  // An array is initialized to hold a sequence of numbers.
  var valueList = [];

  // A loop iterates 'count' times to populate the 'valueList'.
  // The loop variable 'idx' is implicitly global if not in strict mode, mirroring the original 'i'.
  for (idx = 0; idx < count; idx++) {
    // Each element is the 'startValue' incremented by the current loop index.
    valueList.push(startValue + idx);
  }

  // Calculate the sum of the arithmetic progression.
  // This is a common formula: (first_term + last_term) * number_of_terms / 2.
  const totalSum = (valueList[0] + valueList[count - 1]) * count / 2;

  // Conditional logic to determine the final output based on the contents of 'valueList'.
  // Check if the number 0 is present in the generated list.
  if (valueList.indexOf(0) >= 0) {
    // If 0 is found, the total sum is printed directly.
    console.log(totalSum);
  }
  // Otherwise, if the last element in the list is negative.
  else if (valueList[count - 1] < 0) {
    // The total sum minus the last element is printed.
    console.log(totalSum - valueList[count - 1]);
  }
  // Otherwise (if 0 is not found and the last element is non-negative, implying the first element is also non-negative).
  else {
    // The total sum minus the first element is printed.
    console.log(totalSum - valueList[0]);
  }
}

// The script reads input from standard input, typically '/dev/stdin' in Unix-like environments.
// The content is read as a UTF-8 string and passed to the 'processInput' function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
