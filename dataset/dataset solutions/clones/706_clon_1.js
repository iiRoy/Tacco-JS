/*
 * This is the main function that processes the input.
 * It reads data, performs calculations, and prints results.
 */
function Main(  input  )

{

    // Split the entire input string by newline characters
    input   =   input.split(  "\n"  )   ;

    // Initialize a counter 'k' for iterating through the input array
    var   k   =   0   ;

    /*
     * Start an infinite loop to process multiple test cases.
     * The loop will break when a specific condition is met (n=0, m=0).
     */
    while(  1  )
    {
        // Split the current line of input by spaces to get n and m values
        input[  k  ]   =   input[  k  ].split(  " "  )   ;

        // Parse the first value as 'n' (base 10 integer)
        var   n   =   parseInt(  input[  k  ][  0  ],  10  )   ;

        // Parse the second value as 'm' (base 10 integer) and then increment 'k'
        var   m   =   parseInt(  input[  k++  ][  1  ],  10  )   ;

        // Check for the termination condition: if both n and m are zero
        if(  n   ==   0   &&   m   ==   0  )
        {
            // Exit the loop if the termination condition is met
            break   ;
        }

        // Declare arrays 't' and 'h', and initialize sum variables 'tsum' and 'hsum'
        var   t   =   [  ]  ,
              h   =   [  ]  ,
              tsum   =   0  ,
              hsum   =   0   ;

        /*
         * Loop to read 'n' values into array 't'
         * and calculate their sum 'tsum'.
         */
        for(  var   i   =   0   ;   i   <   n   ;   i++  )
        {
            // Parse the next line of input as an integer for 't[i]' and increment 'k'
            t[  i  ]   =   parseInt(  input[  k++  ],  10  )   ;

            // Add the current value to 'tsum'
            tsum   +=   t[  i  ]   ;
        }

        /*
         * Loop to read 'm' values into array 'h'
         * and calculate their sum 'hsum'.
         */
        for(  var   i   =   0   ;   i   <   m   ;   i++  )
        {
            // Parse the next line of input as an integer for 'h[i]' and increment 'k'
            h[  i  ]   =   parseInt(  input[  k++  ],  10  )   ;

            // Add the current value to 'hsum'
            hsum   +=   h[  i  ]   ;
        }

        // Check if the total sum of all elements is odd
        if(  (  tsum   +   hsum  )   %   2  )
        {
            // If it's odd, it's impossible to make sums equal by swapping one element
            console.log(  "-1"  )   ;

            // Skip to the next iteration of the while loop
            continue   ;
        }

        // Initialize a flag to track if a suitable pair has been found
        var   flag   =   true   ;

        /*
         * Nested loops to iterate through all possible pairs (t[i], h[j])
         * to find if swapping one element can make the sums equal.
         */
        for(  var   i   =   0   ;   i   <   n   ;   i++  )
        {
            for(  var   j   =   0   ;   j   <   m   ;   j++  )
            {
                // Check if swapping t[i] from 't' to 'h' and h[j] from 'h' to 't'
                // results in equal sums for both arrays.
                // The condition simplifies to: tsum - t[i] + h[j] == hsum + t[i] - h[j]
                if(  tsum   -   t[  i  ]   +   h[  j  ]   ==   hsum   +   t[  i  ]   -   h[  j  ]  )
                {
                    // If a suitable pair is found, set the flag to false
                    flag   =   false   ;

                    // Print the found pair
                    console.log(  t[  i  ]   +   " "   +   h[  j  ]  )   ;

                    // Break out of the inner loop as we only need one pair
                    break   ;
                }
            }

            // If a pair was found in the inner loop, break out of the outer loop too
            if(  !flag  )
            {
                break   ;
            }
        }

        // If no suitable pair was found after checking all possibilities
        if(  flag  )
        {
            // Print -1 to indicate no solution
            console.log(  "-1"  )   ;
        }
    }
}

// Call the Main function with input read from standard input
Main(  require(  "fs"  ).readFileSync(  "/dev/stdin"  ,  "utf8"  )  )   ;