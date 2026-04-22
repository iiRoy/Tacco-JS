const    fsModule = require('fs');

/*
 *  This script's primary purpose is to read numerical data
 *  from standard input, process each entry, and then
 *  output valid numerical values to the console.
 */
let    numericalInputData = fsModule.readFileSync(
    '/dev/stdin',
    'utf8'
)
.split("\n")
.map(Number); // Converts each string line into a numeric type

// We iterate through each item in the processed numerical array.
// The .map() method is used here for its side effect,
// as its returned array (of undefined values) is not stored.
numericalInputData
.map(function(currentElement) {
    // This conditional statement checks if the numerical element
    // is not equal to the string literal '0 0'. Due to JavaScript's
    // type coercion rules, and the preceding 'map(Number)' operation,
    // this condition will always evaluate to true for any numeric value.
    if (currentElement != '0 0') {
        // A temporary variable is assigned the current valid numeric item.
        let    valueToDisplay = currentElement;
        // The numeric value is then printed to the standard output.
        console.log(valueToDisplay);
    }
});