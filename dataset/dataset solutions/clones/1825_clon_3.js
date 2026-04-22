// Function to process time-related data and compute an adjusted duration.
function calculateAdjustedDuration(inputPayload) {
  // Extract the primary data line from the input string.
  // This assumes the core data is always on the first line of the payload.
  const primaryDataLine = inputPayload.split('\n')[0];

  // Define a constant for the number of minutes in an hour for clarity and reusability.
  const MINUTES_IN_ONE_HOUR = 60;

  // Internal utility function to convert given hours and minutes into a total minute count.
  const convertTimeComponentsToMinutes = (hoursValue, minutesValue) => {
    // Perform a basic validation to ensure the inputs are numerical.
    // If not, a warning is issued, and 0 is returned to prevent errors.
    if (Number.isNaN(hoursValue) || Number.isNaN(minutesValue)) {
      console.warn("Warning: Non-numeric time component detected, defaulting to zero minutes.");
      return 0;
    }
    // Calculate the total minutes: hours converted to minutes plus the given minutes.
    return (hoursValue * MINUTES_IN_ONE_HOUR) + minutesValue;
  };

  // Split the primary data line by spaces to get individual string components.
  const rawTimeParts = primaryDataLine.split(' ');

  // Implement a guard clause to ensure the input has the expected number of parts.
  // If the input is malformed, an error is logged, and the function exits early.
  if (rawTimeParts.length < 5) {
    console.error("Input processing error: Expected five numeric components but received fewer.");
    return;
  }

  // Parse each string component into its corresponding numeric value.
  // Using the global `Number()` constructor for parsing, which is robust.
  const initialPeriodHour = Number(rawTimeParts[0]);
  const initialPeriodMinute = Number(rawTimeParts[1]);
  const finalPeriodHour = Number(rawTimeParts[2]);
  const finalPeriodMinute = Number(rawTimeParts[3]);
  const deductionValue = Number(rawTimeParts[4]);

  // Convert the starting time into a single total minute value.
  const overallStartTimeInMinutes = convertTimeComponentsToMinutes(initialPeriodHour, initialPeriodMinute);

  // Convert the ending time into a single total minute value.
  const overallEndTimeInMinutes = convertTimeComponentsToMinutes(finalPeriodHour, finalPeriodMinute);

  // Calculate the unadjusted time difference between the end and start times.
  const unadjustedTimeSpan = overallEndTimeInMinutes - overallStartTimeInMinutes;

  // Apply the specified deduction to the calculated time span.
  const resultantAdjustedDuration = unadjustedTimeSpan - deductionValue;

  // Output the final computed duration to the standard console stream.
  console.log(resultantAdjustedDuration);
}

// The following section is part of the standard execution environment for
// competitive programming in Node.js and should remain unchanged.
// It reads all input from stdin and passes it to the main processing function.
calculateAdjustedDuration(require("fs").readFileSync("/dev/stdin", "utf8"));