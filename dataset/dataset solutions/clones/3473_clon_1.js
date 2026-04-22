/*
 * This file contains several utility functions and a main entry point.
 * The primary goal seems to be to find the maximum difference sum
 * after shuffling a bucket of numbers multiple times.
 */

// Helper function to convert a string to an integer.
// It uses parseInt, which is a standard JavaScript function.
function toInt( d )
{
    // Return the parsed integer value.
    return parseInt(d);
}


/*
 * Calculates the sum of absolute differences between adjacent elements
 * in an array of numbers.
 *
 * @param {Array<number>} d - The input array of numbers.
 * @returns {number} The total sum of absolute differences.
 */
function getDiff ( d )
{
    // Initialize the result accumulator.
    var result = 0;

    // Loop through the array, comparing each element with its successor.
    for ( var i = 0; i < d.length - 1; i++ )
    {
        // Add the absolute difference to the total.
        result += Math.abs( d[i] - d[i + 1] );
    }

    // Return the final sum of differences.
    return result;
}


/*
 * This function appears to manipulate a bucket of numbers based on a 'turn'
 * and fill a 'resultBucket' up to a specified size 'N'.
 * The logic involves complex conditional checks to decide whether to
 * add elements to the front or back of 'resultBucket' from the 'bucket'.
 *
 * @param {string} turn - Indicates whose turn it is ('min' or 'max').
 * @param {Array<number>} bucket - The source array of numbers.
 * @param {number} N - The target size for the resultBucket.
 * @returns {Array<number>} The filled resultBucket.
 */
function makeBucket(turn, bucket, N)
{
  var resultBucket = []; // Initialize an empty array to store the results.

  // Continue filling until resultBucket reaches the desired size N.
  while ( resultBucket.length < N )
  {
    // Check whose turn it is.
    if (turn === 'min')
    {
      // If resultBucket is empty, simply take the first element from 'bucket'.
      if (resultBucket.length === 0)
      {
        resultBucket.push(bucket[0]);
        bucket.shift(); // Remove the element from the source bucket.
      }
      else
      {
        // Compare differences to decide whether to unshift or push.
        // This condition seems to compare the absolute difference of
        // the first element of resultBucket with the first element of bucket,
        // against the last element of resultBucket with the first element of bucket.
        if (Math.abs(resultBucket[0] - bucket[0]) > Math.abs(resultBucket[resultBucket.length - 1] - bucket[0]))
        {
          resultBucket.unshift(bucket.shift()); // Add to the beginning.
          // If not yet full, take another element and push it.
          if (resultBucket.length !== N)
          {
            resultBucket.push(bucket.shift());
          }
        }
        else
        {
          resultBucket.push(bucket.shift()); // Add to the end.
          // If not yet full, take another element and unshift it.
          if (resultBucket.length !== N)
          {
            resultBucket.unshift(bucket.shift());
          }
        }
      }

      turn = 'max'; // Switch turn to 'max'.
    }
    else // It's 'max' turn.
    {
      // If resultBucket is empty, take the last element from 'bucket'.
      if (resultBucket.length === 0)
      {
        resultBucket.push(bucket.pop()); // Take from the end of bucket.
      }
      else
      {
        // Similar comparison logic as above, but using the last element of 'bucket'.
        if (Math.abs(resultBucket[0] - bucket[bucket.length - 1]) > Math.abs(resultBucket[resultBucket.length - 1] - bucket[bucket.length - 1]))
        {
          resultBucket.unshift(bucket.pop()); // Add to the beginning.
          // If not yet full, take another element and push it.
          if (resultBucket.length !== N)
          {
            resultBucket.push(bucket.pop());
          }
        }
        else
        {
          resultBucket.push(bucket.pop()); // Add to the end.
          // If not yet full, take another element and unshift it.
          if (resultBucket.length !== N)
          {
            resultBucket.unshift(bucket.pop());
          }
        }
      }

      turn = 'min'; // Switch turn to 'min'.
    }
  }

  // Return the completely filled result bucket.
  return resultBucket;
}


/*
 * The main function that orchestrates the entire process.
 * It reads input, processes data, shuffles, calculates differences,
 * and finds the maximum difference.
 *
 * @param {string} input - The raw input string, typically from stdin.
 */
function Main(input)
{
  // Parse the input string into an array of integers.
  // The first element is N, subsequent elements are the bucket numbers.
  const data = input.split("\n").map(toInt);

  // Extract N, which is the first number in the input.
  const N = data[0];

  // Initialize the bucket array.
  const bucket = [];

  // Populate the bucket with numbers from the input, starting from the second element.
  for ( var i = 0; i < N; i++ )
  {
    bucket.push(data[i + 1]);
  }
  var max = 0; // Initialize 'max' to store the maximum difference found.

  // Perform a large number of shuffles and calculations.
  // This loop runs 10,000 times to try different permutations.
  for ( var j = 0; j < 10000; j++ )
  {
    // Fisher-Yates (Knuth) shuffle algorithm.
    // This shuffles the 'bucket' array in place.
    for ( var i = bucket.length - 1; i >= 0; i-- )
    {
      var rand = Math.floor(Math.random() * (i + 1)); // Generate a random index.
      var tmp = bucket[i];                           // Store current element.
      bucket[i] = bucket[rand];                      // Swap current with random.
      bucket[rand] = tmp;                            // Complete the swap.
    }
    var d = getDiff(bucket); // Calculate the difference for the current shuffled bucket.
    if ( d > max ) // Update 'max' if a larger difference is found.
    {
      max = d;
    }
  }
  // Output the maximum difference found to the console.
  console.log(max);
}

// Entry point: Read input from stdin and pass it to the Main function.
// This assumes the script is run in a Node.js environment.
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );