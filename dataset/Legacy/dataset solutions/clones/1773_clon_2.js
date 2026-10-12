function ProcessInput(inputData) {
  // The initial raw input string is processed.
  // First, any leading or trailing whitespace is removed.
  // Then, the string is split into an array of lines based on newline characters.
  let processedLines = inputData.trim().split('\n');

  // From the first line of the processed input, we extract two pieces of information.
  // The first part (before the first space) is converted to a number and stored as the target value.
  let targetValue = Number(processedLines[0].split(' ')[0]);
  // The second part (after the first space) is stored as a string representing a count.
  let countOfExcluded = processedLines[0].split(' ')[1];

  // A conditional check: if the count of excluded items is zero,
  // it implies that the target value itself is the desired output.
  if (countOfExcluded == 0) {
    console.log(targetValue); // Output the target value directly.
    return; // Exit the function as the task is complete.
  }

  // If there are excluded items, we parse the second line of input.
  // This line contains space-separated values which represent numbers to be excluded.
  const excludedNumbers = processedLines[1].split(' ');

  // We now search for the closest non-excluded number to our target value.
  // The search iterates outwards, checking numbers at increasing distances from the target.
  // The loop runs from an offset of 1 up to 100.
  for (let iteratorIndex = 1; iteratorIndex < 101; iteratorIndex++) {
    // First, check the number that is 'iteratorIndex' units less than the target value.
    // We convert this number to a string for comparison with the 'excludedNumbers' array.
    if (!excludedNumbers.includes(`${targetValue - iteratorIndex}`)) {
      console.log(targetValue - iteratorIndex); // If not excluded, output it.
      return; // Exit the function.
    }
    // If the number (targetValue - iteratorIndex) was excluded,
    // then check the number that is 'iteratorIndex' units greater than the target value.
    else if (!excludedNumbers.includes(`${targetValue + iteratorIndex}`)) {
      console.log(targetValue + iteratorIndex); // If not excluded, output it.
      return; // Exit the function.
    }
  }

  // If the loop completes without finding any non-excluded number within the range,
  // it indicates an unexpected scenario or an error condition.
  console.log('error'); // Output an error message.
  return; // Ensure the function always has a return path.
}

// The main execution block:
// It reads the entire content of standard input as a UTF-8 string.
// This content is then passed to the 'ProcessInput' function for processing.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
