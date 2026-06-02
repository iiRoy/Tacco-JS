var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input
var dataRows = rawData.trim().split('\n'); // Split the input into an array of lines, removing leading/trailing whitespace

var currentEntry; // Declare a variable to hold the current line being processed
while (currentEntry = dataRows.shift()) { // Loop through each line in the dataRows array
    // Convert the current line (which is a string) to a number using the unary plus operator
    var weightValue = +currentEntry;

    var categoryName; // Declare a variable to store the determined boxing category

    // Determine the boxing category based on the weight value using a series of conditional checks
    if (weightValue <= 48) {
        categoryName = 'light fly'; // Assign 'light fly' if weight is 48 or less
    } else if (weightValue <= 51) {
        categoryName = 'fly'; // Assign 'fly' if weight is between 49 and 51
    } else if (weightValue <= 54) {
        categoryName = 'bantam'; // Assign 'bantam' if weight is between 52 and 54
    } else if (weightValue <= 57) {
        categoryName = 'feather'; // Assign 'feather' if weight is between 55 and 57
    } else if (weightValue <= 60) {
        categoryName = 'light'; // Assign 'light' if weight is between 58 and 60
    } else if (weightValue <= 64) {
        categoryName = 'light welter'; // Assign 'light welter' if weight is between 61 and 64
    } else if (weightValue <= 69) {
        categoryName = 'welter'; // Assign 'welter' if weight is between 65 and 69
    } else if (weightValue <= 75) {
        categoryName = 'light middle'; // Assign 'light middle' if weight is between 70 and 75
    } else if (weightValue <= 81) {
        categoryName = 'middle'; // Assign 'middle' if weight is between 76 and 81
    } else if (weightValue <= 91) {
        categoryName = 'light heavy'; // Assign 'light heavy' if weight is between 82 and 91
    } else {
        categoryName = 'heavy'; // Assign 'heavy' if weight is greater than 91
    }

    console.log(categoryName); // Output the determined category name to the console
}
