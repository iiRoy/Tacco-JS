const fileSystemHandler = require("fs"); // Import the Node.js file system module for I/O operations.

const standardInputPath = "/dev/stdin"; // Define the path to the standard input stream.

// Synchronously read the entire content of the standard input file.
// The result is a Buffer object containing the raw binary data.
const rawDataBuffer = fileSystemHandler.readFileSync(standardInputPath);

// Convert the raw data buffer into a UTF-8 encoded string.
// The .trim() method is applied to remove any leading/trailing whitespace,
// including potential newline characters from the input stream.
const processedInputString = rawDataBuffer.toString("utf8").trim();

// This constant holds the specific weekday string extracted from the input,
// which we need to convert into its corresponding numerical rank.
const targetWeekdayLabel = processedInputString;

// An ordered collection of the official English three-letter abbreviations
// for the days of the week, starting with Sunday.
const canonicalDayNames = [
    'SUN', // First day in the standard week
    'MON',
    'TUE',
    'WED',
    'THU',
    'FRI',
    'SAT'  // Last day in the standard week
];

// Initialize a new Map object to store the mapping between day names
// and their assigned numerical ranks. This provides efficient lookup.
const dayRankingsMap = new Map();

// A mutable variable to keep track of the current rank being assigned.
// We want Sunday to be rank 7, Monday 6, and so on, down to Saturday being 1.
let currentRankAssignment = 7;

// Iterate over each day name in the canonical list to populate our ranking map.
// This loop dynamically assigns ranks based on the desired inverse order.
for (const dayEntry of canonicalDayNames) {
    dayRankingsMap.set(dayEntry, currentRankAssignment); // Map the day name to its rank
    currentRankAssignment--; // Decrement the rank for the next day
}

// A variable to store the final computed numerical rank for the target weekday.
let ultimateCalculatedValue;

// Implement a conditional check to ensure the target weekday label is valid
// and present in our predefined ranking system. This is a form of input validation.
if (dayRankingsMap.has(targetWeekdayLabel)) {
    // If the day label is recognized, retrieve its corresponding rank from the map.
    ultimateCalculatedValue = dayRankingsMap.get(targetWeekdayLabel);
} else {
    // If an unrecognized day label is provided, log an error message to the console.
    // This branch handles unexpected input gracefully, assigning a default error value.
    console.error("Error: The provided day label was not recognized: " + targetWeekdayLabel);
    ultimateCalculatedValue = 0; // Assign a neutral or error-indicating value
}

// Output the final numerical rank to the standard output.
// This represents the solution to the problem based on the input day.
console.log(ultimateCalculatedValue);