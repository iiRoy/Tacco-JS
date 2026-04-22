var nodeIO = require('fs'); // Import the 'fs' (file system) module from Node.js for input operations.

// Read the entire content from standard input ('/dev/stdin'),
// interpret it as UTF-8 encoded text, and then remove any leading or trailing whitespace.
var rawDataStream = nodeIO.readFileSync('/dev/stdin', 'utf8')
    .trim();


// Divide the processed raw data into an array of individual text rows,
// using the newline character ('\n') as the delimiter.
var textRowsCollection = rawDataStream.split('\n');

// Declare a variable to temporarily hold each record (line) as it's processed.
var currentInputRecord;

// Begin a loop that continues as long as there are records available in the collection.
// The 'shift()' method extracts the first element from the array and removes it,
// which is then assigned to 'currentInputRecord'.
while (
    (currentInputRecord = textRowsCollection.shift())
)
{
    // Process the current record:
    // 1. Split the string by space characters (' ') to get an array of string segments.
    // 2. Use the 'map()' method to transform each string segment into a numerical value.
    var numericDateSegments = currentInputRecord.split(' ')
        .map(
            function (numStrValue)
            {
                // Convert the string representation of a number to an actual number.
                return Number(numStrValue);
            }
        );

    // Extract the individual date components (year, month, day) from the numeric segments array.
    var gregorianYear = numericDateSegments[0];
    var gregorianMonth = numericDateSegments[1];
    var gregorianDay = numericDateSegments[2];

    // Initialize a string variable to store the determined Japanese imperial era name.
    var imperialEraDesignation = '';

    // Create a JavaScript Date object for the target date.
    // Note: The month parameter in the Date constructor is 0-indexed (January is 0, December is 11),
    // so we subtract 1 from the Gregorian month.
    var targetDateObject = new Date(gregorianYear, gregorianMonth - 1, gregorianDay);

    // Define constant Date objects for the start dates of various Japanese eras for comparison.
    const MEIJI_START_DATE = new Date(1868, 8, 8);   // September 8, 1868 (Gregorian)
    const TAISHO_START_DATE = new Date(1912, 6, 29); // July 29, 1912 (Gregorian)
    const SHOWA_START_DATE = new Date(1926, 11, 24); // December 24, 1926 (Gregorian)
    const HEISEI_START_DATE = new Date(1989, 0, 7);  // January 7, 1989 (Gregorian)

    // Define constant integer values representing the year offsets for each era.
    const MEIJI_YEAR_OFFSET = 1867;
    const TAISHO_YEAR_OFFSET = 1911;
    const SHOWA_YEAR_OFFSET = 1925;
    const HEISEI_YEAR_OFFSET = 1988;


    // Determine the corresponding Japanese Imperial Era based on the 'targetDateObject'.
    // The comparisons are done sequentially to find the correct era boundary.
    if (targetDateObject < MEIJI_START_DATE)
    {
        imperialEraDesignation = 'pre-meiji';
    }
    else if (targetDateObject < TAISHO_START_DATE)
    {
        imperialEraDesignation = 'meiji';
        // Adjust the Gregorian year to the Meiji era year.
        gregorianYear -= MEIJI_YEAR_OFFSET;
    }
    else if (targetDateObject < SHOWA_START_DATE)
    {
        imperialEraDesignation = 'taisho';
        // Adjust the Gregorian year to the Taisho era year.
        gregorianYear -= TAISHO_YEAR_OFFSET;
    }
    else if (targetDateObject < HEISEI_START_DATE)
    {
        imperialEraDesignation = 'showa';
        // Adjust the Gregorian year to the Showa era year.
        gregorianYear -= SHOWA_YEAR_OFFSET;
    }
    else
    {
        // If none of the above conditions are met, the date falls into the Heisei era.
        imperialEraDesignation = 'heisei';
        // Adjust the Gregorian year to the Heisei era year.
        gregorianYear -= HEISEI_YEAR_OFFSET;
    }

    // Output the calculated era and adjusted date information to the console.
    // Special handling for the 'pre-meiji' period, which only prints its name.
    if (imperialEraDesignation === 'pre-meiji')
    {
        console.log('pre-meiji');
        // Skip the rest of the current loop iteration and move to the next input record.
        continue;
    }

    // For all other eras (Meiji, Taisho, Showa, Heisei), print the era name,
    // the adjusted year, and the original month and day.
    console.log(imperialEraDesignation, gregorianYear, gregorianMonth, gregorianDay);

} // End of the while loop, all records have been processed.