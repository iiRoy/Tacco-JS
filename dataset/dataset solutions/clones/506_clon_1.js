// This script reads numerical input from standard input,
// calculates the sum of the first 10 numbers, and then
// prints the total sum to the console.

// Import the 'fs' (file system) module to interact with the file system.
var        input        =        require        (        'fs'        )        .        readFileSync        (        '/dev/stdin'        ,        'utf8'        )        ;

// Process the input:
// 1. Trim any leading/trailing whitespace from the input string.
// 2. Split the string into an array of strings using the newline character as a delimiter.
// 3. Map each string element to its numerical representation.
var        Arr        =        (        input        .        trim        (        )        )        .        split        (        "\n"        )        .        map        (        Number        )        ;

// Initialize a variable to accumulate the sum.
var        sum        =        0        ;


// Iterate through the first 10 elements of the 'Arr' array.
for        (        var        i        =        0        ;        i        <        10        ;        i++        )
{
    // Add the current array element to the 'sum' variable.
    sum        +=        Arr        [        i        ]        ;
}

// Output the final calculated sum to the standard output.
console        .        log        (        sum        )        ;