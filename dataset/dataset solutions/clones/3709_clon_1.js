"use strict" ; // Enforces strict mode for the entire script.

/*
 * Main function: Processes input and calculates the result.
 *
 * @param {string} input - The raw input string from stdin.
 */
function Main(input)
{
  // Initialize an Inputer instance to parse the input string.
  let cin = new Inputer(input);

  // Read the number of elements, N.
  let N = cin.getInt();

  // Read N integers into array A.
  let A = cin.getIntArray(N);

  // Transform array A into array B: B[i] = A[i] - i - 1.
  let B = A.map((v, i) => v - i - 1);

  // Sort array B in ascending order. This is crucial for finding the median.
  B.sort((a,b) => a- b);

  // Calculate the median index 'c'. For even N, this will be N/2 - 1 (0-indexed).
  // For odd N, it will be (N-1)/2 (0-indexed).
  let c = Math.floor(N / 2);

  // Get the median value 'b' from the sorted array B.
  let b = B[c];

  // Calculate the final answer: Sum of absolute differences.
  // The expression is |A[i] - (b + i + 1)|.
  let ans = A.reduce((ac, v, i) => ac + Math.abs(v - (b + i + 1)), 0);

  // Output the calculated answer to the console.
  console.log(ans);
}

/*
 * Inputer Class: A utility to parse various types of input from a string.
 * It handles integers, strings, and arrays of both.
 */
class Inputer
{
  // Constructor: Initializes the Inputer with the raw input string.
  constructor(t)
  {
    // Ensure that an input string is provided.
    if (typeof t=='undefined')
    {
      throw new Error('引数（stdin）を省略できません！'); // Error message: "stdin argument cannot be omitted!"
    }

    this.cnt = 0; // Counter to keep track of the current item being read.
    // Split the input string into an array of items using newlines or spaces as delimiters.
    this.items = t.split(/\n|\s/);
  }

  // Method to get the next integer from the input stream.
  getInt()
  {
    // Retrieve the item, increment the counter, and convert it to a number.
    return this.items[this.cnt++]-0;
  }

  // Method to get an array of integers of a specified length.
  getIntArray(t)
  {
    // Validate the length argument.
    if (typeof t=='undefined')
    {
      throw new Error('引数（1以上）を省略できません！'); // Error message: "argument (1 or more) cannot be omitted!"
    }
    if (t<1)
    {
      throw new Error('引数は1以上であること！'); // Error message: "argument must be 1 or more!"
    }

    let r = new Array(t); // Create a new array to store the integers.
    // Populate the array by repeatedly calling getInt().
    for (let e = 0; e < t; e++)
    {
      r[e] = this.getInt();
    }
    return r; // Return the array of integers.
  }

  // Method to get the next string from the input stream.
  getStr()
  {
    // Retrieve the item and increment the counter.
    return this.items[this.cnt++];
  }

  // Method to get an array of strings of a specified length.
  getStrArray(t)
  {
    // Validate the length argument, similar to getIntArray.
    if (typeof t=='undefined')
    {
      throw new Error('引数（1以上）を省略できません！');
    }
    if (t<1)
    {
      throw new Error('引数は1以上であること！');
    }

    let r = new Array(t); // Create a new array for strings.
    // Populate the array by repeatedly calling getStr().
    for (let e = 0; e < t; e++)
    {
      r[e] = this.getStr();
    }
    return r; // Return the array of strings.
  }
} // End of Inputer class definition.


// Conditional execution: If running in a Node.js-like environment (not a browser).
if (typeof window == "undefined")
{
  // Read input from standard input (e.g., /dev/stdin) using Node's 'fs' module.
  // Then, pass the read content to the Main function for processing.
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));
}