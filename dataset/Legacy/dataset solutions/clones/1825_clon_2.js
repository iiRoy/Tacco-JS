function ProcessInput(rawData) {
  // The incoming raw string is divided into individual lines.
  let linesArray = rawData.split("\n");

  // Extract components from the initial line, separated by spaces.
  const firstLineParts = linesArray[0].split(' ');

  // Convert string parts into integer values for time and deduction.
  const startHour = parseInt(firstLineParts[0], 10);
  const startMinute = parseInt(firstLineParts[1], 10);
  const endHour = parseInt(firstLineParts[2], 10);
  const endMinute = parseInt(firstLineParts[3], 10);
  const deductionMinutes = parseInt(firstLineParts[4], 10);

  // Calculate the total number of minutes from midnight for both time points.
  const totalStartMinutes = (60 * startHour) + startMinute;
  const totalEndMinutes = (60 * endHour) + endMinute;

  // Determine the final duration by subtracting the start time and the deduction.
  const resultValue = totalEndMinutes - totalStartMinutes - deductionMinutes;

  // Display the computed result.
  console.log(resultValue);
}

// This part of the code is responsible for reading input from the standard input stream
// and passing it to the primary processing function. It must remain unchanged.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
