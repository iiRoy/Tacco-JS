// This is a simple utility function named 'toInt'.
// Its primary purpose is to convert any given value 'd' into an integer.
function    toInt (  d  )
{
    // The parseInt function is a standard JavaScript function.
    // It parses a string argument and returns an integer of the specified radix (base).
    // In this case, no radix is specified, so it defaults to base 10 for strings starting with digits.
    return   parseInt(  d  )  ;
} // End of the toInt function definition.


/*
 * Function Name: getDiff
 *
 * Description:
 *   This function calculates the sum of absolute differences between
 *   consecutive elements in a numeric array.
 *
 * Parameters:
 *   d - An array of numbers. It is expected to contain at least two elements
 *       for the difference calculation to be meaningful.
 *
 * Returns:
 *   A number representing the total sum of absolute differences between
 *   adjacent elements in the input array 'd'.
 */
function getDiff(d)
{
    // Initialize a variable 'result' to 0. This variable will accumulate
    // the sum of absolute differences.
    var    result   =   0  ;

    // A for loop iterates through the array 'd'.
    // The loop condition 'i < d.length - 1' ensures that 'd[i + 1]'
    // is always a valid index, preventing out-of-bounds errors.
    for   (  var   i   =   0  ;   i   <   d.length   -   1  ;   i++  )
    {
        // Calculate the absolute difference between the current element (d[i])
        // and the next element (d[i + 1]).
        // Math.abs() ensures the difference is always non-negative.
        // This difference is then added to the 'result' accumulator.
        result   +=   Math.abs(  d[i]   -   d[i   +   1]  )  ;
    } // The loop concludes here, having processed all adjacent pairs.

    // Finally, the accumulated total difference is returned.
    return   result  ;
} // End of the getDiff function.


// This function is responsible for constructing a 'bucket' (an array)
// based on a specified strategy ('turn' which can be 'min' or 'max').
// It takes elements from an initial 'bucket' array until the 'resultBucket'
// reaches a desired size 'N'.
function makeBucket(  turn  ,  bucket  ,  N  )
{
    // Initialize an empty array that will store the elements of the constructed bucket.
    var   resultBucket   =   [  ]  ;

    // The main logic resides within this while loop.
    // It continues to execute as long as the 'resultBucket' has fewer than 'N' elements.
    while   (  resultBucket.length   <   N  )
    {
        // Check the current strategy 'turn'.
        if   (  turn   ===   'min'  ) // If the strategy is 'min'
        {
            // If the 'resultBucket' is empty, simply take the first element from the source 'bucket'.
            if   (  resultBucket.length   ===   0  )
            {
                resultBucket.push(  bucket[0]  )  ; // Add the element to the end of resultBucket.
                bucket.shift()  ; // Remove the element from the beginning of the source bucket.
            }
            else // If 'resultBucket' already contains elements, a more complex decision is made.
            {
                // Compare the absolute differences if the next element from the source bucket (bucket[0])
                // were added to the front or to the back of the 'resultBucket'.
                if   (  Math.abs(  resultBucket[0]   -   bucket[0]  )   >   Math.abs(  resultBucket[resultBucket.length   -   1]   -   bucket[0]  )  )
                {
                    resultBucket.unshift(  bucket.shift()  )  ; // Add to the front (unshift), remove from source (shift).

                    // After adding one element, check if the 'resultBucket' is still not full.
                    if   (  resultBucket.length   !==   N  )
                    {
                        resultBucket.push(  bucket.shift()  )  ; // Add another element to the back, remove from source.
                    }
                }
                else // If adding to the back yields a smaller or equal difference.
                {
                    resultBucket.push(  bucket.shift()  )  ; // Add to the back (push), remove from source (shift).

                    // Check again if the 'resultBucket' is not yet full.
                    if   (  resultBucket.length   !==   N  )
                    {
                        resultBucket.unshift(  bucket.shift()  )  ; // Add another element to the front, remove from source.
                    }
                }
            }
            // After completing the 'min' turn operations, switch the strategy to 'max' for the next iteration.
            turn   =   'max'  ;
        }
        else // This block executes if the current strategy 'turn' is 'max'.
        {
            // If the 'resultBucket' is empty, take the last element from the source 'bucket'.
            if   (  resultBucket.length   ===   0  )
            {
                resultBucket.push(  bucket.pop()  )  ; // Add the element to the end of resultBucket, remove from end of source.
            }
            else // If 'resultBucket' already contains elements.
            {
                // Compare the absolute differences if the next element (from the end of source bucket)
                // were added to the front or to the back of the 'resultBucket'.
                if   (  Math.abs(  resultBucket[0]   -   bucket[bucket.length   -   1]  )   >   Math.abs(  resultBucket[resultBucket.length   -   1]   -   bucket[bucket.length   -   1]  )  )
                {
                    resultBucket.unshift(  bucket.pop()  )  ; // Add to the front, remove from end of source.

                    // Check if 'resultBucket' is still not full.
                    if   (  resultBucket.length   !==   N  )
                    {
                        resultBucket.push(  bucket.pop()  )  ; // Add another element to the back, remove from end of source.
                    }
                }
                else // If adding to the back yields a smaller or equal difference.
                {
                    resultBucket.push(  bucket.pop()  )  ; // Add to the back, remove from end of source.

                    // Check if 'resultBucket' is still not full.
                    if   (  resultBucket.length   !==   N  )
                    {
                        resultBucket.unshift(  bucket.pop()  )  ; // Add another element to the front, remove from end of source.
                    }
                }
            }
            // After completing the 'max' turn operations, switch the strategy to 'min' for the next iteration.
            turn   =   'min'  ;
        }
    } // End of the while loop which fills the resultBucket.

    // Return the final constructed 'resultBucket' array.
    return   resultBucket  ;
} // End of the makeBucket function.


// This is the main function of the program.
// It orchestrates the reading of input, processing, and outputting the final result.
function   Main   (  input  )
{
    // First, the input string is split by newline characters ("\n").
    // Then, the .map(toInt) function is applied to each resulting string,
    // converting every part into an integer.
    const   data   =   input.split(  "\n"  ).map(  toInt  )  ;

    // The first element of the 'data' array is assigned to the constant 'N'.
    // 'N' typically represents the number of elements or the size of a structure.
    const   N   = data[0]  ;

    // An empty array named 'bucket' is initialized. This will be used to store
    // the numerical data extracted from the input, excluding the 'N' value.
    const   bucket   =   [  ]  ;

    // A for loop iterates 'N' times to populate the 'bucket' array.
    // It takes elements from 'data' starting from the second element (index 1).
    for   (  var   i   =   0  ;   i   <   N  ;   i++  )
    {
        bucket.push(  data[i   +   1]  )  ; // Adds data elements to the 'bucket'.
    }
    // The 'bucket' array is then sorted in ascending order.
    // This is crucial for the 'makeBucket' function's logic.
    bucket.sort()  ;


    // Calculate 'v1' using the 'min' strategy.
    // A new array is created using [].concat(bucket) to ensure 'makeBucket'
    // operates on a copy, preserving the original 'bucket' for 'v2' calculation.
    var   v1   =   getDiff(  makeBucket(  'min'  ,   [  ].concat(bucket)  ,   N  )  )  ;


    // Calculate 'v2' using the 'max' strategy.
    // Again, a fresh copy of the sorted 'bucket' is passed to 'makeBucket'.
    var   v2   =   getDiff(  makeBucket(  'max'  ,   [  ].concat(bucket)  ,   N  )  )  ;


    // Compare the two calculated values, 'v1' and 'v2'.
    // The larger of the two values is then printed to the console.
    if   (  v1   >   v2  )
    {
        console.log(  v1  )  ; // Output v1 if it's strictly greater than v2.
    }
    else
    {
        console.log(  v2  )  ; // Otherwise (if v2 is greater than or equal to v1), output v2.
    }
} // End of the Main function.


/*
 * This line serves as the entry point for the JavaScript program execution.
 * It uses Node.js's 'fs' module to read data from standard input ("/dev/stdin").
 * The 'readFileSync' method reads the entire file synchronously.
 * The input is assumed to be encoded in "utf8".
 * The read content is then passed as an argument to the 'Main' function to begin processing.
 */
Main(  require(  "fs"  ).readFileSync(  "/dev/stdin"  ,   "utf8"  )  )  ;