var rawData = require("fs").readFileSync("/dev/stdin", "utf8"); // Read input from standard input

// This variable will hold the input string, which represents a day of the week.
var dayString = rawData;

/*
 * Define an array containing the names of the days of the week.
 * The order is important for the subsequent logic.
 */
var dayNames = [
    'SUN', // Sunday
    'MON', // Monday
    'TUE', // Tuesday
    'WED', // Wednesday
    'THU', // Thursday
    'FRI', // Friday
    'SAT', // Saturday
];

// Calculate the result based on the input day string.
// The array is reversed, then the index of the input day is found, and 1 is added.
var outputValue = dayNames.reverse().indexOf(dayString) + 1;

// Print the final calculated value to the console.
console.log(outputValue);
