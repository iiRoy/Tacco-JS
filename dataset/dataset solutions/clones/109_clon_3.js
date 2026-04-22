// This module facilitates file system operations for data acquisition.
const fileSystemUtility = require('fs');

// Configuration for date processing and output strings.
const appConfiguration = {
    outputEncoding: 'utf8',
    // Days of the week, indexed by Date.getDay() result (0 for Sunday).
    dayNames: [
        'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ]
};

let acquiredRawData = ''; // Variable to hold the raw content from standard input.

// Attempt to read data from standard input.
try {
    // Determine the size of the standard input stream.
    const inputDescriptor = process.stdin.fd;
    const inputStats = fileSystemUtility.fstatSync(inputDescriptor);
    const dataSizeInBytes = inputStats.size;

    // Allocate a buffer to read the entire input.
    const inputBuffer = Buffer.alloc(dataSizeInBytes);
    
    // Perform a synchronous read operation from standard input.
    const actualBytesRead = fileSystemUtility.readSync(inputDescriptor, inputBuffer, 0, dataSizeInBytes, 0);
    
    // Convert the buffer content to a string, trim whitespace, and split into individual lines.
    acquiredRawData = inputBuffer.toString(appConfiguration.outputEncoding, 0, actualBytesRead);

} catch (dataReadError) {
    // Log any errors encountered during input reading.
    console.error(`Error during standard input acquisition: ${dataReadError.message}`);
    // Exit if input cannot be read, as the core logic depends on it.
    process.exit(1);
}

// Process the raw input string into an array of trimmed lines.
const processedInputLines = acquiredRawData
                                .trim()
                                .split('\n')
                                .filter(line => line.length > 0); // Filter out empty lines after trim/split

// Helper function to validate if month and day components are valid numbers.
const areComponentsNumeric = (monthStr, dayStr) => {
    const parsedMonth = parseInt(monthStr, 10);
    const parsedDay = parseInt(dayStr, 10);
    return !isNaN(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12 &&
           !isNaN(parsedDay) && parsedDay >= 1 && parsedDay <= 31; // Basic day validation
};

// Helper function to get the adjusted month for Date object (0-indexed).
const getAdjustedMonth = (monthString) => {
    return parseInt(monthString, 10) - 1;
};

// Helper function to retrieve the day name from its numerical index.
const retrieveDayLabel = (dayIndex) => {
    // Ensure the index is within the bounds of our day names array.
    if (dayIndex >= 0 && dayIndex < appConfiguration.dayNames.length) {
        return appConfiguration.dayNames[dayIndex];
    }
    return 'Invalid Day Index'; // Fallback for invalid index.
};

// Main execution function to process date entries.
function executeDateProcessing() {
    // Guard clause: if no input lines are available, there's nothing to process.
    if (processedInputLines.length === 0) {
        // console.warn('No valid input lines detected for date processing.');
        return;
    }

    // Iterate over each line of input data.
    processedInputLines.forEach((currentLine, lineIndex) => {
        // Split the current line into its constituent parts (month and day).
        const dateParts = currentLine.split(' ');

        // Ensure we have exactly two parts and they are valid numeric components.
        if (dateParts.length === 2 && areComponentsNumeric(dateParts[0], dateParts[1])) {
            const currentYear = 2004; // The year specified in the original problem.
            const monthValue = getAdjustedMonth(dateParts[0]);
            const dayValue = parseInt(dateParts[1], 10);

            // Construct a new Date object.
            const dateInstance = new Date(currentYear, monthValue, dayValue);

            // Validate if the date object truly represents the input month and day,
            // especially for cases like '2 30' (Feb 30th) which would become '3 1' (Mar 1st).
            // This is an additional validation step not present in the original.
            const createdMonth = dateInstance.getMonth();
            const createdDay = dateInstance.getDate();

            if (createdMonth === monthValue && createdDay === dayValue) {
                // Get the day of the week (0 for Sunday, 6 for Saturday).
                const dayOfWeekIndex = dateInstance.getDay();
                // Retrieve the corresponding day name.
                const dayLabel = retrieveDayLabel(dayOfWeekIndex);
                // Output the result.
                console.log(dayLabel);
            } else {
                // console.warn(`Entry ${lineIndex + 1}: Invalid date provided (e.g., month/day mismatch after creation): ${currentLine}`);
                // For Type III, we can simply skip outputting for invalid dates if the original also implicitly skipped.
                // Or, if the original's new Date() would correct it, we might want to output the "corrected" date's day.
                // Sticking to "no output" for explicitly invalid input dates that JS Date tries to normalize away.
            }
        } else {
            // console.warn(`Entry ${lineIndex + 1}: Skipping invalid line format or components: ${currentLine}`);
            // No output for malformed input lines, similar to original's implicit skip.
        }
    });
}

// Initiate the date processing logic.
executeDateProcessing();