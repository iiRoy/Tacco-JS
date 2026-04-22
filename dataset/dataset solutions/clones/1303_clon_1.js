/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * are preserved exactly as they were in the source.
 *
 * Extensive modifications have been made to whitespace (indentation,
 * spacing, and blank lines) and comments to visually differentiate
 * this version while maintaining functional equivalence.
 */

// Initialize readline interface for input/output operations
const rl = require('readline').createInterface(
  {
    input: process.stdin,  // Standard input stream
    output: process.stdout // Standard output stream
  }
);


// Declare and initialize global variables for state management and data storage
var stepnml = 0,   // State variable for decoding N, M, L
    stepa   = 0,   // State variable for decoding matrix A rows
    stepb   = 0,   // State variable for decoding matrix B columns
    n,             // Dimension N (number of rows for matrix A)
    m,             // Dimension M (number of columns for matrix A, and rows for matrix B)
    l,             // Dimension L (number of columns for matrix B)
    a = [],        // Array to store matrix A (n x m)
    b = [],        // Array to store matrix B (l x m, note original problem often has B as m x l)
    decode = decodeNML; // This variable is not actually used in the provided code,
                        // but it's kept for Type I cloning fidelity.


// Set the encoding for standard input to 'ascii'
process.stdin.setEncoding('ascii');


// Register a callback function for each 'line' event from the readline interface
rl.on('line', function (line)
{
  // Check the current decoding step to determine which function to call
  if ( stepnml === 0 )
  {
    // First line contains N, M, L dimensions
    decodeNML(line);
  }
  else if ( stepa < n )
  {
    // Subsequent lines decode rows of matrix A until all 'n' rows are processed
    decodeA(line);
  }
  else if ( stepb < m )
  {
    // After matrix A, decode columns of matrix B until all 'm' columns are processed
    decodeB(line);
  }
  else
  {
    // All input has been processed; close the readline interface
    rl.close();
  }
});


// Function to decode the initial N, M, L dimensions from the first line of input
function decodeNML(line)
{
  // Split the line by spaces and convert parts to numbers
  var ary = line.split(' ').map(Number);

  // Assign the parsed values to global dimension variables
  n = ary[0]; // Number of rows for matrix A
  m = ary[1]; // Number of columns for matrix A, and rows for matrix B
  l = ary[2]; // Number of columns for matrix B

  var i; // Loop counter declaration

  // Initialize matrix A with 'n' rows, each an Int16Array of size 'm'
  for ( i = n; i > 0; i-- )
  {
    a.push( new Int16Array(m) );
  }

  // Initialize matrix B with 'l' rows, each an Int16Array of size 'm'
  // Note: This initialization implies B is l x m, which is consistent with the subsequent decodeB function.
  for ( i = l; i > 0; i-- )
  {
    b.push( new Int16Array(m) );
  }

  // Increment the state variable to indicate NML has been decoded
  stepnml++;
}


// Function to decode a row of matrix A
function decodeA(line)
{
  // Split the line by spaces and convert parts to numbers
  var ary = line.split(' ').map(Number);

  // Populate the current row of matrix A
  for ( var i in ary )
  {
    a[stepa][i] = ary[i];
  }

  // Increment the row counter for matrix A
  stepa++;
}


// Function to decode a column of matrix B
// Note: This function assumes the input lines for B represent columns,
// and it populates `b[k][stepb]` which means `b` is indexed as `b[row][col]`.
// The `decodeNML` initializes `b` with `l` rows, each of size `m`.
// So `b[k]` is a row, and `stepb` is the column index.
function decodeB(line)
{
  // Split the line by spaces (elements are not converted to Number here, done implicitly later)
  var ary = line.split(' ');

  // Populate the current column of matrix B across its rows
  for ( var k in ary )
  {
    b[k][stepb] = ary[k]; // `ary[k]` is a string, will be coerced to number
  }

  // Increment the column counter for matrix B
  stepb++;
}


// Register a callback function for the 'close' event of the readline interface
// This block executes once all input lines have been processed and rl.close() is called.
rl.on('close', function ()
{
  // Iterate through each row of matrix A
  for ( var i in a )
  {
    var line = ""; // Initialize an empty string to build the output line

    // Iterate through each "row" of matrix B (which effectively represents a column for inner product)
    for ( var j in b )
    {
      // Calculate the inner product of current row 'a[i]' and current "column" 'b[j]'
      // and append it to the output line, followed by a space
      line = line + inner_product(a[i], b[j]) + " ";
    }

    // Print the constructed line, removing any trailing whitespace
    console.log(line.trim());
  }
});


// Function to calculate the inner product (dot product) of two vectors (arrays)
function inner_product(a, b)
{
  var res = 0; // Initialize result accumulator

  // Iterate from m-1 down to 0 to sum the products of corresponding elements
  for ( var i = m - 1; i >= 0; i-- )
  {
    res += a[i] * b[i]; // Accumulate the product
  }

  return res; // Return the final inner product result
}


// Function to print a 2D array (for debugging purposes, not used in main logic)
function print2d(aryary)
{
  var res = "[ "; // Start array string representation

  // Iterate through each sub-array and format it using sprint16
  for ( i in aryary )
  {
    res = res + sprint16(aryary[i]) + " ";
  }

  // Log the complete 2D array string to console
  console.log(res + "]");
}


// Function to format a 1D array as a string (for debugging purposes, not used in main logic)
function sprint16(ary)
{
  var res = "[ "; // Start array string representation

  // Iterate through each element and convert it to string
  for ( var i = 0; i < ary.length; i++ )
  {
    res = res + ary[i].toString() + " ";
  }

  // Return the complete 1D array string
  return res + "]";
}