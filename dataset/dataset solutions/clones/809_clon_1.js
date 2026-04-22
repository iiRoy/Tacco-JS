var log = console.log; // Assign console.log to a local variable for convenience.

// Check if running in a Node.js-like environment to handle standard input.
if  (  typeof process !=   "undefined"  )
{
  var input = ""; // Initialize an empty string to accumulate input data.

  // Resume the standard input stream.
  process.stdin.resume( );

  // Set the encoding for standard input to UTF-8.
  process.stdin.setEncoding('utf8');

  // Event listener for incoming data chunks.
  process.stdin.on (  'data'  ,   function  (  chunk  )
  {
    // Append each received chunk to the input string.
    input  +=  chunk;
  }  );

  // Event listener for the end of the input stream.
  process.stdin.on('end',    function  (  )
  {
    // Once input is complete, call the 'before' function to process it.
    before (  input  )  ;
  }  );
}

/**
 * Pre-processes the raw input string before passing it to the main logic.
 * @param {string} input - The raw input string from stdin.
 */
function before (  input  )
{
  // Split the input string into an array of lines.
  var lines = input.split (  "\n"  )  ;

  // Remove the first line (often a header or count, not needed here).
  lines.shift (  )  ;

  // Remove the last line (often an empty line or trailing newline).
  lines.pop (  )  ;

  // Call the main processing function with the cleaned lines.
  main (  lines  )  ;
}

/*
 * This section defines the core logic of the program.
 * It processes a series of datasets from the input lines.
 */

function main (  lines  )
{
    // Remove the first line of the 'lines' array again (likely another header/count).
    lines.shift (  )  ;

    // Map each line to an array of numbers.
    lines  =  lines.map (  function  (  e  )
    {
        // Split the current line by spaces to get string numbers.
        var f  =  e.split (  " "  )  ;

        // Convert each string number to an actual Number type.
        var ret = f.map (  function  (  g  )
        {
            return  Number (  g  )  ;
        }  )  ;

        return ret; // Return the array of numbers for the current line.
    }  )  ;

    // Initialize an array to hold structured datasets.
    var datasets = [];

    // Loop while there are still lines to process (each dataset takes 2 lines).
    while  (  lines.length  >  1  )
    {
        // The original comment mentioned "2????????£??????", which seems to imply "two lines per dataset".
        var arr = []; // Create a temporary array for the current dataset.

        // Push the first line of the dataset (e.g., configuration)
        arr.push (  lines.shift (  )  )  ;

        // Push the second line of the dataset (e.g., data points)
        arr.push (  lines.shift (  )  )  ;

        // Add the completed dataset to the main datasets array.
        datasets.push (  arr  )  ;
    }

    // Iterate over each collected dataset.
    datasets.forEach (  function  (  e  )
    {
        // Extract a specific value from the first part of the dataset.
        // ppow likely represents some power or count related to processing.
        var ppow  =  e[0][1];

        // Initialize an array to store differences between consecutive elements.
        var diff = [];

        // Iterate through the second part of the dataset (the data points).
        e[1].forEach (  function  (  f,  i,  a  )
        {
            // Skip the first element as there's no preceding element to compare.
            if  (  i  ==  0  )
            {
                return;
            }
            else
            {
                // Calculate the difference between the current and previous element.
                diff.push (  a[i]  -  a[i  -  1]  )  ;
            }
        }  )  ;

        // Sort the calculated differences in descending order.
        diff.sort (  function  (  a,  b  )
        {
            return  b  -  a  ;
        }  )  ;

        // Slice the 'diff' array, keeping only elements from 'ppow - 1' onwards.
        // This effectively removes the 'ppow - 1' largest differences.
        diff = diff.slice (  ppow  -  1  )  ;

        // Check if there are any differences remaining after slicing.
        if  (  diff.length  >  0  )
        {
            // If so, calculate the sum of the remaining differences using reduce.
            var sum = diff.reduce (  function  (  p,  c  )
            {
                // Ensure 'c' is not undefined before adding to the sum.
                if  (  c  !=  undefined  )
                {
                    return  p  +  c  ;
                }
                else // Handle case where 'c' might be undefined (though unlikely with numbers).
                {
                    // If 'p' is also undefined (first iteration), start with 0, otherwise return 'p'.
                    return  p  ==  undefined  ?  0  :  p  ;
                }
            }  )  ;

            // Log the calculated sum.
            log (  sum  )  ;
        }
        else // If the 'diff' array is empty after slicing.
        {
            // Log 0, as there are no differences to sum.
            log (  0  )  ;
        }
    }  )  ;
}