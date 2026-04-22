var   numericData; /* Global storage for numerical elements */


function processIndexedPair(idxOne,
                            idxTwo) /* Function to modify two elements based on an index pair */
{

  // Check if the element at the first index is an odd number
  if (numericData[idxOne] % 2 === 1)
  {
    // If it's odd, decrement it by one
    -- numericData[idxOne] ;
  }

  // Divide the value at the first index by two
  numericData[idxOne] /= 2;

  // Add the (possibly modified) value from the first index to the value at the second index
  numericData[idxTwo] += numericData[idxOne];
}


function    applicationEntry(sourceString) /* Main entry point for the program logic */
{

    /*
     * Parse the initial input string:
     * 1. Split by newline to get the first line.
     * 2. Split the first line by one or more whitespace characters.
     * 3. Map each resulting string element to a number.
     *    This array populates the global 'numericData'.
     */
    numericData  = sourceString
        .split(   "\n"   )[0]
            .split(/\s+/).map(  function(itemValue) {
                                            return Number(itemValue);
                                        }
                                    );


    // Extract the third element as the maximum number of iterations
    var maxIterations = numericData[2] ;

    // Loop from 1 up to and including the maximum iterations count
    for (let loopCounter = 1; loopCounter <= maxIterations; loopCounter++)
    {
      // If the current loop counter is odd, process indices (0, 1)
      if (loopCounter % 2 === 1)
      {
          processIndexedPair(0, 1);
      }
      // Otherwise (if even), process indices (1, 0)
      else
      {
          processIndexedPair(1, 0);
      }
    }

    // Output the final values of the first two elements in 'numericData'
    console.log('Final Value A: %d, Final Value B: %d', numericData[0], numericData[1]);
}


/*
 * Initiate the program by reading input from standard input.
 * - 'require("fs")' accesses the file system module.
 * - 'readFileSync("/dev/stdin", "utf8")' reads the entire content of standard input as a UTF-8 string.
 * - This string is then passed to the 'applicationEntry' function.
 */
applicationEntry(require("fs").readFileSync("/dev/stdin", "utf8"));