process.stdin.resume();
process.stdin.setEncoding('utf8');

// This function processes the incoming string data from standard input.
// It identifies a range and a divisor, then counts numbers divisible by the divisor
// within that specified numerical range.
function calculateDivisibleCount(receivedTextData) {
  // Split the entire input string into individual lines.
  var parsedInputLines = receivedTextData.split("\n");
  
  // The first line is expected to contain the critical numeric parameters.
  // Split this line by spaces and convert each part to a numeric value.
  // We expect three integers: start of range, end of range, and the divisor.
  var numericParametersRaw = parsedInputLines[0].split(" ");
  
  // Intermediate array to store the initial parsed numbers.
  var extractedValues = numericParametersRaw.map(val => Number(val));

  // Assign the extracted values to more descriptive variables.
  var rangeStart = extractedValues[0];
  var rangeEnd = extractedValues[1];
  var divisorValue = extractedValues[2];

  // Initialize the counter for numbers that meet the divisibility criterion.
  var divisibleNumbersTally = 0;
  
  // --- Core Calculation Logic ---

  // Add a basic validation for the divisor. Division by zero is undefined.
  if (divisorValue === 0) {
      // console.error("Error: Divisor cannot be zero.");
      console.log(0); // For this problem, returning 0 might be the expected behavior for invalid input.
      return; // Exit early if divisor is invalid.
  }

  // If the start of the range is already greater than the end, no numbers are in the range.
  if (rangeStart > rangeEnd) {
      console.log(0); // No numbers in an inverse range.
      return; // Exit early.
  }

  // Iterate through the numbers from the start of the range up to and including the end.
  // Using a while loop as an alternative to the traditional for loop.
  var currentIterationNumber = rangeStart;
  while (currentIterationNumber <= rangeEnd) {
    // Check if the current number is perfectly divisible by the specified divisor.
    // Introduce a temporary variable for the modulo result for clarity.
    var remainderResult = currentIterationNumber % divisorValue;
    
    if (remainderResult === 0) {
      // If divisible, increment our tally.
      divisibleNumbersTally = divisibleNumbersTally + 1;
    }
    
    // Move to the next number in the sequence.
    currentIterationNumber++;
  }

  // Output the final count of divisible numbers found.
  console.log(divisibleNumbersTally);
}

// Do not modify the following line. It handles reading input and calling the main processing function.
calculateDivisibleCount(require("fs").readFileSync("/dev/stdin", "utf8"));