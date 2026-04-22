const ioHandler = require('readline-sync');

/*
 * This function orchestrates the primary data processing flow.
 * It continuously reads numerical inputs, performs calculations,
 * and outputs results until a specific termination condition is met.
 */
function executeSequence()
{
  let cycleCount = 0; /* Index for the main execution loop */
  let cumulativeTotal = 0; // Variable to accumulate values
  let subCycle = 0; // Counter for internal iterations


  while (
    true
  ) // The primary processing loop runs indefinitely until explicitly broken
  {
    cumulativeTotal = 0; // Reset the sum for each new processing block

    let primaryText = ioHandler.question(
      ''
    ); // Capture a line of input as a string

    let primaryMagnitude = parseInt(primaryText, 10); // Transform the input string into an integer base 10


    if (
      primaryMagnitude === 0
    ) // Check if the termination value (zero) has been provided
    {
      break; // Exit the main processing loop
    }

    // Initiate a secondary loop based on a quarter of the primary magnitude
    for (
      subCycle = 0;
      subCycle < primaryMagnitude / 4;
      subCycle++
    )
    {
      let secondaryText = ioHandler.question(
        ''
      ); // Obtain another input string

      let elementAmount = parseInt(secondaryText, 10); // Convert this string to an integer

      cumulativeTotal += elementAmount; // Add the parsed integer to the running total
    }

    console.log(
      cumulativeTotal
    ); // Display the computed total for the current block

    cycleCount++; // Increment the main cycle counter (its value is not used for logic, but for tracking)
  }
}

// Invoke the main execution sequence to begin processing
executeSequence();