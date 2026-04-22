// This script is designed to read numerical input from standard input,
// process these numbers, calculate their average, and then output
// the ceiling of that average to the console. It's a fundamental
// example of input processing and basic arithmetic operations in JavaScript.

// We begin by importing the built-in 'fs' (file system) module provided by Node.js.
// This module offers functionalities for interacting with the file system.
// The 'readFileSync' method is used here to synchronously read the entire
// content of a specified file. In this particular context, '/dev/stdin'
// represents the standard input stream. The 'utf8' encoding is explicitly
// specified to ensure correct interpretation of the input characters.
const    input    =    require (   "fs"   ) . readFileSync (    "/dev/stdin"   ,   "utf8"   ) ;


// The raw input string, which is expected to contain a sequence of numbers
// separated by space characters, is then processed.
// The 'split' method is invoked on the 'input' string, using a single space
// character (' ') as the delimiter. This operation transforms the string
// into an array of substrings, where each substring is a number
// represented as a string. These stringified numbers are stored
// in the 'numbers' array.
const   numbers    =    input . split (    ' '    ) ;


// A variable named 'sum' is declared using 'let' and initialized to 0.
// This variable will serve as an accumulator to store the total sum
// of all the numbers parsed from the input. Initializing it to zero
// is crucial to ensure the correctness of the subsequent summation process.
let    sum    =    0    ;


// We now iterate over each element within the 'numbers' array.
// The 'forEach' array method is employed, which executes a provided
// callback function once for each element in the array, in ascending order.
// The callback function receives the current element as its argument,
// which we name 'number' for clarity.
numbers . forEach (    ( number )    =>    {
        // Inside the loop, for each 'number' (which is still a string at this point),
        // we first convert it into an actual numerical data type using the
        // global 'Number()' function. This step is essential because arithmetic
        // operations require numerical operands.
        // The resulting numerical value is then added to our 'sum' accumulator.
        // The '+=' operator is a shorthand for 'sum = sum + Number(number)'.
        sum    +=    Number (   number   )    ;
    }    )    ;


// After the loop has completed its execution, the 'sum' variable holds the
// total sum of all the input numbers. The next step is to calculate the average.
// This is done by dividing the 'sum' by the total count of numbers,
// which is obtained using 'numbers.length' (the number of elements in the array).
// Finally, the 'Math.ceil()' function is applied to this average.
// 'Math.ceil()' rounds the number up to the nearest greater integer.
// The final calculated and rounded value is then outputted to the standard
// output stream using 'console.log()'.
console . log (    Math . ceil (    sum    /    numbers . length    )    )    ;