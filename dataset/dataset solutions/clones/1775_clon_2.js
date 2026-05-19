// This function serves as the primary entry point for processing the provided input data.
function processInputData(dataLines) {
  // The first line of input contains two space-separated integers:
  // 'targetValue' (x in original) - the number around which to search.
  // 'forbiddenCount' (n in original) - the count of numbers that are not allowed.
  const [targetValue, forbiddenCount] = dataLines[0].trim().split(" ").map(valStr => parseInt(valStr, 10));

  // Check if there are any numbers explicitly forbidden.
  if (forbiddenCount !== 0) {
    // If 'forbiddenCount' is not zero, the second line of input contains
    // a list of space-separated integers representing the forbidden numbers.
    const excludedNumbers = dataLines[1].trim().split(" ").map(numStr => parseInt(numStr, 10));

    // Initialize an offset counter. This counter will be used to check numbers
    // incrementally further away from the 'targetValue' in both directions.
    let currentOffset = 0;

    // Begin an infinite loop to search for the closest non-forbidden number.
    // The loop will terminate once the first valid number is found.
    while (true) {
      // First, check the number that is 'currentOffset' less than 'targetValue'.
      // If this number is NOT present in the 'excludedNumbers' list, it's a valid candidate.
      if (!excludedNumbers.includes(targetValue - currentOffset)) {
        console.log(targetValue - currentOffset); // Output this valid number.
        break; // Exit the loop as the closest number has been found.
      }

      // If the number (targetValue - currentOffset) was forbidden,
      // then check the number that is 'currentOffset' greater than 'targetValue'.
      // If this number is NOT present in the 'excludedNumbers' list, it's a valid candidate.
      if (!excludedNumbers.includes(targetValue + currentOffset)) {
        console.log(targetValue + currentOffset); // Output this valid number.
        break; // Exit the loop as the closest number has been found.
      }

      // If both (targetValue - currentOffset) and (targetValue + currentOffset) were forbidden,
      // increment the offset to check numbers further away in the next iteration.
      currentOffset++;
    }
  } else {
    // If 'forbiddenCount' is zero, it means there are no forbidden numbers.
    // In this scenario, the 'targetValue' itself is the closest and only possible answer.
    console.log(targetValue);
  }
}

// This section handles reading input from standard input and initiating the processing.
// It reads the entire content of '/dev/stdin' as a UTF-8 string,
// removes any leading/trailing whitespace, and then splits the string into an array of lines.
// This array of lines is then passed to the 'processInputData' function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
