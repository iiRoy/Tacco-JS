function ProcessInput(rawData) {
  // Split the raw input string by newline characters to get individual lines.
  let processedLines = rawData.split("\n");

  // Take the first line and split it by '/' to get date components.
  const dateParts = processedLines[0].split("/");

  // Initialize the era status to "Heisei".
  let eraStatus = "Heisei";

  // Parse the year and month from the date components.
  const yearValue = parseInt(dateParts[0]);
  const monthValue = parseInt(dateParts[1]);

  // Check if the date falls into the "TBD" era.
  // This happens if the year is 2020 or later,
  // OR if the year is 2019 AND the month is 5 (May) or later.
  if (yearValue >= 2020 || (yearValue >= 2019 && monthValue >= 5)) {
    eraStatus = "TBD"; // Update the status if the condition is met.
  }

  // Output the determined era status to the console.
  console.log('%s', eraStatus);

  // Return the final era status.
  return eraStatus;
}

// This function is typically used for local debugging in a browser environment.
function testFunction(testCaseIndex) {
  // Retrieve input data from a DOM element based on the provided index.
  const testInputData = document.getElementById("input" + testCaseIndex).value;
  // Call the main processing function with the retrieved test data.
  ProcessInput(testInputData);
}

// Execute the main processing function with input read from standard input.
// This is common in competitive programming environments.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
