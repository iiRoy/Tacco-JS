/*
 * This JavaScript file processes date inputs to determine the Japanese era
 * and adjust the year accordingly based on the era's starting point.
 * It reads input from standard input, parses each line, and then
 * outputs the era, adjusted year, month, and day.
 */

// Import the 'fs' (file system) module to handle file operations.
var input = require('fs') // Get the file system module.
    .readFileSync(
        '/dev/stdin', // Path to standard input.
        'utf8' // Encoding for reading the file.
    )
    .trim(); // Remove leading/trailing whitespace from the input string.


// Split the entire input string into an array of lines based on the newline character.
var lines = input.split('\n');


// Declare a variable to hold each line as it's processed.
var line;

// Loop through each line of the input until no more lines are available.
// The 'shift()' method removes the first element from the array and returns it.
while (line = lines.shift()) {

    // Parse the current line:
    // 1. Split the line by spaces to get date components as strings.
    // 2. Use 'map' to convert each string component to a number.
    //    The unary plus operator `+n` is a concise way to convert to a number.
    var arr = line.split(' ').map(function(n) {
        return +n;
    });


    // Assign array elements to descriptive variable names for clarity.
    var year = arr[0]; // The year component.
    var month = arr[1]; // The month component.
    var day = arr[2]; // The day component.


    // Initialize the 'era' variable as an empty string.
    var era = '';


    // Create a Date object from the parsed components.
    // Note: Month in Date constructor is 0-indexed (0 for Jan, 11 for Dec),
    // so we subtract 1 from the input month.
    var today = new Date(year, month - 1, day);


    // Determine the Japanese era based on the 'today' date.
    // Each 'if' condition checks if 'today' falls before a specific era's start date.
    if (today < new Date(1868, 8, 8)) { // Era pre-Meiji (before Meiji 1, Jan 1, 1868 - actually Meiji started Sep 8, 1868 in lunar calendar, but Gregorian calendar conversion often uses this date or similar for boundary)
        era = 'pre-meiji'; // Assign 'pre-meiji' if the date is before September 8, 1868.
    } else if (today < new Date(1912, 6, 30)) { // Meiji era (until July 30, 1912)
        era = 'meiji'; // Assign 'meiji'.
        year -= 1867; // Adjust year: Meiji 1 corresponds to 1868.
    } else if (today < new Date(1926, 11, 25)) { // Taisho era (until December 25, 1926)
        era = 'taisho'; // Assign 'taisho'.
        year -= 1911; // Adjust year: Taisho 1 corresponds to 1912.
    } else if (today < new Date(1989, 0, 7)) { // Showa era (until January 7, 1989)
        era = 'showa'; // Assign 'showa'.
        year -= 1925; // Adjust year: Showa 1 corresponds to 1926.
    } else { // Heisei era (from January 8, 1989 onwards)
        era = 'heisei'; // Assign 'heisei'.
        year -= 1988; // Adjust year: Heisei 1 corresponds to 1989.
    }


    // Check if the determined era is 'pre-meiji'.
    if (era == 'pre-meiji') {
        // If it's 'pre-meiji', print only the era name.
        console.log('pre-meiji');
        // Skip the rest of the loop for this line and move to the next.
        continue;
    }

    // For all other eras, print the era name, the adjusted year, month, and day.
    console.log(era, year, month, day);
}
/* End of file processing */