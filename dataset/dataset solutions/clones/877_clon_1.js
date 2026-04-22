/*
 * This JavaScript code reads input from stdin, processes it, and prints results to stdout.
 * It's designed to solve a specific problem involving time calculations.
 */

var    input    = require('fs').readFileSync('/dev/stdin'   ,  'utf8') ;

// The input string is trimmed and then split into an array of lines.
var Arr = (  input.trim ( )  )  .  split (  "\n"  )  ;

/**
 * The main processing loop continues as long as there are lines in the Arr array.
 * Each iteration processes a set of data related to a single test case or scenario.
 */
while (  Arr.length  !=  0  )  {

        // Initialize an empty array to store results for the current test case.
        var    result    =    [  ]  ;

        /*
         * The first line of each block contains N and T.
         * N is the number of subsequent data entries, T is a time threshold.
         * The line is shifted from Arr, split by space, and mapped to numbers.
         */
        var    NT    =    (  Arr.shift (  )  )  .  split (  " "  )  .  map (  Number  )  ;

        // Loop N times, processing each data entry.
        for (  var  i  =  0  ;  i  <  NT [  0  ]  ;  i  ++  )  {

                // Get the current data line, split by space.
                var    arr    =    (  Arr.shift (  )  )  .  split (  " "  )  ;

                /*
                 * Parse the first time string (arr[0]) into an array of integers [hours, minutes].
                 * The map function uses parseInt with radix 10 for safety.
                 */
                var    a    =    arr [  0  ]  .  split (  ":"  )  .  map (  function (  v  )  {  return  parseInt (  v  ,  10  )  ;  }  )  ;

                // This condition ensures that 'b' and 'c' from the previous iteration are available.
                if (  i  >  0  )  {

                        // Convert time 'a' to total minutes from midnight.
                        var    A    =    a [  0  ]  *  60  +  a [  1  ]  ;

                        // Convert time 'b' (from previous iteration) to total minutes from midnight.
                        var    B    =    b [  0  ]  *  60  +  b [  1  ]  ;

                        // Check if the time difference is greater than or equal to the threshold NT[1].
                        if (  A  -  B  >=  NT [  1  ]  )  {
                                // If true, add the previous 'c' and the time difference to the results.
                                result.push (  c  +  " "  +  (  A  -  B  )  )  ;
                        }
                }

                // Parse the third time string (arr[2]) into an array of integers [hours, minutes].
                var    b    =    arr [  2  ]  .  split (  ":"  )  .  map (  function (  v  )  {  return  parseInt (  v  ,  10  )  ;  }  )  ;

                // Store the fourth element (arr[3]) as 'c'.
                var    c    =    arr [  3  ]  ;
        }

        // After processing all entries for the current test case, check the results.
        if (  result.length  ==  0  )  {
                // If no results were found, print 0.
                console.log (  0  )  ;
        }  else  {
                // Otherwise, print the count of results, then each result on a new line.
                console.log (  result.length  )  ;
                result.forEach (  function (  v  )  {
                        console.log (  v  )  ;
                }  )  ;
        }
}
// End of file.