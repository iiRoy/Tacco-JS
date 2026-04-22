/*
 * Module: DayOfWeekProcessor
 * Functionality: This script receives date information via standard input,
 *                computes the corresponding day of the week, and outputs it.
 *                All calculations are anchored to the year 2004.
 */

// Attach an event observer to the standard input stream to process incoming data.
process.stdin.on(
	"data",
	function( incomingPayloadBuffer ) {
		// Define an array containing the initial parts of weekday names.
		var dayNamePrefixes = [
				"Sun",
				"Mon",
				"Tues",
				"Wednes",
				"Thurs",
				"Fri",
				"Satur"
			],
			// Initialize a new JavaScript Date object for date operations.
			workingDateObject = new Date();

		// Set the specific year for all subsequent date calculations to 2004.
		// Note: The 'setYear' method is deprecated, but preserved for structural fidelity.
		workingDateObject.setYear(2004);

		// Convert the incoming buffer to a string, remove leading/trailing whitespace,
		// then divide it into individual lines, and iterate through them.
		// The `.some()` method is used to allow early termination of the loop.
		String(incomingPayloadBuffer)
			.trim()
			.split("\n")
			.some(
				function( currentInputLine ) {
					// Parse each line, which is expected to contain month and day separated by a space.
					// Example format: "1 15" for January 15th.
					currentInputLine = currentInputLine.split(" ");

					// Validate the first component (month). If it's not a valid number,
					// it indicates the end of meaningful input or an error.
					if ( !Number(currentInputLine[0]) ) {
						return true; // Return true to signal `.some()` to stop iterating.
					}

					// Update the month and day of the working Date object.
					// JavaScript's `setMonth` method uses 0-indexed months (January is 0).
					workingDateObject.setMonth(
						Number(currentInputLine[0]) - 1, // Adjust month value for 0-indexing.
						Number(currentInputLine[1])      // Use the second component as the day.
					);

					// Output the calculated full weekday name to the console.
					console.log(
						dayNamePrefixes[workingDateObject.getDay()] + "day"
					);
				}
			);
	}
).resume(); // Keep the standard input stream active to receive more data.