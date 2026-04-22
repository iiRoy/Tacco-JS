process.stdin.on("data", function(inputDataBuffer) {
    // Define an array of prefixes for the days of the week.
    // Sunday is index 0, Monday is index 1, and so on.
    const weekDayNameStarts = ["Sun", "Mon", "Tues", "Wednes", "Thurs", "Fri", "Satur"];

    // Initialize a Date object for calculations.
    let workingDateInstance = new Date();

    // The problem specifies a fixed year for all calculations.
    const designatedYear = 2004;
    workingDateInstance.setFullYear(designatedYear);

    // Convert the incoming data buffer to a string,
    // remove leading/trailing whitespace, and split it into individual lines.
    // Handles various newline characters.
    const processedInputLines = inputDataBuffer.toString().trim().split(/\r?\n/);

    // A flag to indicate if processing should be halted early,
    // mimicking the behavior of the original's `some()` method returning `1`.
    let shouldTerminateProcessing = false;

    // Iterate over each line provided in the input.
    for (const currentInputEntry of processedInputLines) {
        // If the termination flag is set, break out of the loop immediately.
        if (shouldTerminateProcessing) {
            break;
        }

        // Split each line by one or more spaces to extract month and day.
        const datePartsArray = currentInputEntry.split(/\s+/);

        // Validate the structure of the input line.
        // Expecting at least two parts: month and day.
        if (datePartsArray.length < 2) {
            // Malformed input acts as a stop condition.
            shouldTerminateProcessing = true;
            continue; // Skip to the next iteration, which will then break.
        }

        // Attempt to parse the month and day values as integers.
        const parsedMonth = Number.parseInt(datePartsArray[0], 10);
        const parsedDay = Number.parseInt(datePartsArray[1], 10);

        // Comprehensive validation for the month value.
        // It must be a valid number between 1 and 12.
        if (Number.isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
            // Invalid month indicates a problem, so stop further processing.
            shouldTerminateProcessing = true;
            continue;
        }

        // Validate the day value.
        // It must be a valid number. (Further range validation is implicitly handled by Date object)
        if (Number.isNaN(parsedDay) || parsedDay < 1) { // A day cannot be less than 1.
            shouldTerminateProcessing = true;
            continue;
        }

        // Set the month (0-indexed) and day for the working date instance.
        // The `setMonth` method also accepts the day as a second argument.
        workingDateInstance.setMonth(parsedMonth - 1, parsedDay);

        // Retrieve the numerical representation of the day of the week (0 for Sunday, 6 for Saturday).
        const currentDayOfWeekIndex = workingDateInstance.getDay();

        // Construct the full day name using template literals and log it to the console.
        console.log(`${weekDayNameStarts[currentDayOfWeekIndex]}day`);
    }
}).resume(); // Ensure the standard input stream remains active to receive data.