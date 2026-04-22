// This function calculates the minimum operations to transform a number string based on specific rules.
function ExecuteProcess(rawData) {

  // Split the raw input string by newline characters to obtain an array of lines.
  let processedData = rawData.split("\n");

  // Check if the last element in the array is an empty string (due to trailing newline).
  // If it is, remove it to ensure clean data processing.
  if (processedData[processedData.length - 1] === '') {
    processedData.pop();
  }

  // The first line of the input array contains the target digit sequence.
  const digitSequence = processedData[0];

  // Initialize cost variables for dynamic programming.
  // 'carryUpCost' represents the minimum operations if a carry-up is forced from the previous position.
  let carryUpCost = 1;
  // 'noCarryCost' represents the minimum operations if no carry-up occurs from the previous position.
  let noCarryCost = 0;

  // Declare variables to store the calculated costs for the next iteration of the loop.
  let upcomingCarryUpCost, upcomingNoCarryCost;

  // Iterate through each character (digit) in the input digit sequence.
  for (let sequenceIndex = 0; sequenceIndex < digitSequence.length; ++sequenceIndex) {

    // Calculate the minimum cost for the 'carry-up' state for the current digit.
    // This considers two paths:
    // 1. Changing the current digit to 0 (cost: 9 - current_digit + previous_carry_up_cost).
    // 2. Changing the current digit to 10 (cost: 1 + previous_no_carry_cost + current_digit).
    upcomingCarryUpCost = Math.min(
      (9 - (+digitSequence[sequenceIndex])) + carryUpCost,
      1 + noCarryCost + (+digitSequence[sequenceIndex])
    );

    // Calculate the minimum cost for the 'no-carry' state for the current digit.
    // This also considers two paths:
    // 1. Changing the current digit to 10 (cost: 10 - current_digit + previous_carry_up_cost).
    // 2. Keeping the current digit as is (cost: previous_no_carry_cost + current_digit).
    upcomingNoCarryCost = Math.min(
      (10 - (+digitSequence[sequenceIndex])) + carryUpCost,
      noCarryCost + (+digitSequence[sequenceIndex])
    );

    // Update the cost variables for the next iteration of the loop.
    carryUpCost = upcomingCarryUpCost;
    noCarryCost = upcomingNoCarryCost;
  }

  // After processing all digits, the 'noCarryCost' holds the final minimum operations.
  console.log(noCarryCost);

}


// This section is responsible for reading input from the standard input stream
// and invoking the main processing function. It typically remains unchanged.
ExecuteProcess(
  require("fs").readFileSync("/dev/stdin", "utf8")
);