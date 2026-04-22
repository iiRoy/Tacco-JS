/*
 *  This JavaScript file contains a set of utility functions
 *  for basic numerical operations and a main program logic
 *  to process command-line input.
 *
 *  The code is structured with function definitions and a
 *  single call to the Main function at the end, which
 *  serves as the program's entry point.
 */


// A concise arrow function to convert a string 'x' into an integer
// using base 10. This is a common parsing utility.
var toInt = x => parseInt(x, 10);


// Another arrow function that takes an array 'arr' and applies the
// 'toInt' function to each element, effectively converting an array
// of strings to an array of integers.
var toIntArr = arr => arr.map(x => toInt(x));


/**
 *  Computes the absolute value of a given number 'x'.
 *  It uses a ternary operator for a compact representation.
 *
 *  @param {number} x The input number whose absolute value is to be found.
 *  @returns {number} The absolute value of 'x'.
 */
var abs = x => x > 0 ? x : -x;


/*
 *  Function to find the minimum value among its arguments.
 *  It iterates through the 'arguments' object.
 */
function min()
{
    var rest = arguments,
        val = rest[0]; // Initialize minimum with the first argument

    // Loop through the remaining arguments starting from the second one
    for (var i = 1; i < rest.length; i++)
    {
        // If the current argument is smaller than the current minimum, update it
        if (rest[i] < val)
            val = rest[i];
    }
    return val
}


// Function to find the maximum value among its arguments.
// Similar logic to the 'min' function, but for maximum.
function max()
{
    var rest = arguments,
        val = rest[0];

    for (var i = 1; i < rest.length; i++)
    {
        // Compare and update if a larger value is found
        if (rest[i] > val)
        {
            val = rest[i];
        }
    }
    return val
}


// Call to the Main function, passing the content of standard input.
// This line acts as the primary execution trigger for the program.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));


/**
 *  The main program function. It processes the input string,
 *  performs calculations, and outputs the result.
 *
 *  @param {string} input The raw string read from standard input.
 */
function Main(input)
{
    // Split the input string by spaces to get an array of string values.
    var input = input.split(' ');

    // Parse the relevant parts of the input array into integer variables.
    var n = toInt(input[0]);
    var m = toInt(input[1]);
    var d = toInt(input[2]);

    // Perform the core calculation based on the given formula.
    var ans = (n - d) * (m - 1) / (n * n);

    // Apply a conditional multiplication if 'd' is not zero.
    if (d !== 0)
        ans *= 2;

    // Output the final calculated answer to the console.
    console.log(ans);
}