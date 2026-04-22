/*
 * This JavaScript file processes input to solve a specific problem.
 * It reads a list of numbers, counts their frequencies, sorts them
 * based on frequency, and then calculates a sum based on the Kth
 * smallest frequencies.
 */

function Main  (  input  )   {
                                // Main function definition starts here.
                                // It takes 'input' as a string parameter.

    var     N      =    parseInt  (  input.split  (  "\n"  )  [  0  ]  .split  (  " "  )  [  0  ]  )  ;

    // K represents another integer value from the input.
    var     K      =    parseInt  (  input.split  (  "\n"  )  [  0  ]  .split  (  " "  )  [  1  ]  )  ;

    /*
     * The 'list' variable will store the actual numbers (as strings)
     * provided in the second line of the input.
     */
    var     list   =    input.split  (  "\n"  )  [  1  ]  .split  (  " "  )  ;

    // 'hindo' will be an object (hash map) to store the frequency of each number.
    var     hindo  =    {  }  ;

    // 'youso' will store unique numbers found in the 'list'.
    var     youso  =    [  ]  ;


    // Loop through each item in the 'list' to calculate frequencies.
    for     (  var   i   =   0  ;     i   <   list.length  ;     i  ++  )     {

        // Check if the current number has been encountered before.
        if     (  hindo  [  list  [  i  ]  ]     ==     null  )     {

            // If not, initialize its frequency to 1.
            hindo  [  list  [  i  ]  ]     =     1  ;

            // Add the unique number to the 'youso' array.
            youso.push  (  list  [  i  ]  )  ;

        }     else     {

            // If the number exists, increment its frequency.
            hindo  [  list  [  i  ]  ]  ++  ;

        }
    }


    // Sort the 'youso' array based on the frequencies stored in 'hindo'.
    // The sort order is ascending frequency.
    youso.sort  (  function  (  a  ,  b  )     {
                                return     hindo  [  a  ]     -     hindo  [  b  ]  ;
                            }  )  ;


    // Check a special condition: if there are fewer unique elements than K.
    if     (  youso.length     <     K  )     {

        // If true, print "0" and exit the function.
        console.log  (  "0"  )  ;

        return  ;
    }


    // Initialize 'count' to track the number of elements processed.
    var     count   =   0  ;

    // Initialize 'output' which will store the final sum of frequencies.
    var     output  =   0  ;


    // This loop sums the frequencies of the (youso.length - K) least frequent elements.
    while     (  count     !=     youso.length     -     K  )     {

        // Add the frequency of the current element to 'output'.
        output     +=     hindo  [  youso  [  count  ]  ]  ;

        // Increment the counter.
        count  ++  ;
    }


    // Print the final calculated output.
    console.log  (  output  )  ;

}

/*
 * This section reads input from standard input and passes it
 * to the Main function for processing.
 * It uses Node.js 'fs' module to read the file.
 */
Main  (  require  (  "fs"  )  .readFileSync  (  "/dev/stdin"  ,     "utf8"  )  )  ;