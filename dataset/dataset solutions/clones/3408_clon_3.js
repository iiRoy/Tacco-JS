// Function to ascertain the appropriate festive greeting based on the provided date.
function determineHolidayMessage(rawDateInput) {
  // Define constants for the specific holiday dates.
  const CHRISTMAS_DAY_NUMBER = 25;
  const CHRISTMAS_EVE_NUMBER = 24;
  const CHRISTMAS_EVE_EVE_NUMBER = 23;

  // Define a default message for days not specifically covered.
  const FALLBACK_GREETING = 'Christmas Eve Eve Eve';

  // A mapping of specific days to their respective holiday messages.
  // Using a Map allows for easy lookup and clear association.
  const holidayMessages = new Map([
    [CHRISTMAS_DAY_NUMBER, 'Christmas'],
    [CHRISTMAS_EVE_NUMBER, 'Christmas Eve'],
    [CHRISTMAS_EVE_EVE_NUMBER, 'Christmas Eve Eve']
  ]);

  // Attempt to parse the input string into an integer representing the day of the month.
  // Using trim() to handle potential leading/trailing whitespace in the input.
  let parsedDay = parseInt(rawDateInput.trim(), 10);

  // Initialize a variable to hold the final message before it's displayed.
  let finalGreeting = '';

  // Perform basic validation on the parsed input.
  // If the parsing results in a non-numeric value or a day that doesn't make sense (e.g., zero or negative).
  if (isNaN(parsedDay) || parsedDay <= 0) {
    // In a real-world scenario, this might throw an error or return a specific "invalid input" message.
    // For this clone, we'll fall back to the default message for simplicity and to match original problem's implicit handling.
    finalGreeting = FALLBACK_GREETING; // Or a more explicit error message like "Invalid Day Input"
  } else {
    // Look up the message in our map.
    // If the day is found, use its specific message. Otherwise, use the fallback greeting.
    finalGreeting = holidayMessages.get(parsedDay) || FALLBACK_GREETING;
  }

  // Display the determined holiday message to the console.
  console.log(finalGreeting);
}

// Helper function to abstract the input reading process.
// This improves modularity and testability.
function acquireStandardInput() {
  try {
    // Utilize the Node.js 'fs' module to synchronously read from standard input.
    // The 'utf8' encoding ensures proper character handling.
    const fileContentBuffer = require('fs').readFileSync('/dev/stdin', 'utf8');
    // Return the content, removing any potential trailing newline characters.
    return fileContentBuffer.trim();
  } catch (ioError) {
    // Log any errors that occur during file reading.
    // In a production environment, more sophisticated error handling or a default value might be used.
    console.error("Failed to read input from standard stream:", ioError.message);
    return ''; // Return an empty string or a default value to prevent further errors.
  }
}

// The entry point for the application.
// It orchestrates reading input and then determining the holiday message.
determineHolidayMessage(acquireStandardInput());