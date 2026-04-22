/*
 * This module processes raw text data to determine a specific count based on numerical comparisons.
 * It's designed to handle a line of space-separated numbers provided as input.
 */
function  ProcessInput ( rawData )
{
  // Trim any leading or trailing whitespace from the initial string.
  rawData = rawData .  trim();


  // Convert the string into an array of numbers.
  // First, split the string by spaces, then map each part to its numerical representation.
  let     numericValues    =    rawData . split ( " " ) . map ( Number ) ;


  // Initialize a counter. This value will be decremented based on specific conditions.
  let     currentCount     =       3;

  // Sort the array of numbers in descending order.
  // The comparison function (valB - valA) ensures a descending sort.
  numericValues  =  numericValues . sort ( ( valB, valA )  =>  valB  -  valA  );


  // Iterate through the first two elements of the sorted array.
  // The loop runs for indices 0 and 1, checking pairs (0,1) and (1,2).
  for  (  let   idx  =  0;   idx  <  2;   idx++  )
  {
    // Check if the current element is strictly equal to the next element in the array.
    if  (  numericValues[idx]  ===  numericValues[idx + 1]  )
    {
      // If they are equal, decrement the counter.
      currentCount--;
    }
  }


  // Output the final calculated count to the console.
  console . log ( currentCount ) ;
}

// Entry point: Read data from standard input and pass it to the processing function.
const    fileSystemModule    =    require ( "fs" ) ;

// Synchronously read the entire content of /dev/stdin as UTF-8 encoded text.
const    standardInputContent    =    fileSystemModule . readFileSync ( "/dev/stdin", "utf8" ) ;

// Invoke the main processing function with the obtained input.
ProcessInput ( standardInputContent ) ;