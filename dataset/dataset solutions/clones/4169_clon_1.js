/* This is a strict mode declaration */ "use strict"

// Definition of the main function that processes input
function    Main  (  input  )
{

    /*
     * Split the input string by newline characters.
     * The result will be an array of strings.
     */
    const   splited   =   input.split  (  '\n'  )  ;


    // Get the first element of the splited array, which is 'n'.
    const   n   =   splited[0]  ;


    /*
     * Get the second element of the splited array,
     * then split it by space characters to get array 'a'.
     */
    const   a   =   splited[1].split  (  ' '  )  ;


    // Initialize a boolean flag to track if an odd number is found.
    let   oddFlag   =   false  ;


    // Initialize a counter for the number of divisions.
    let   count   =   0  ;



    // Loop indefinitely until a break condition is met.
    while  (  true  )
    {
            /*
             * Iterate through the array 'a' from index 0 to n-1.
             * This loop checks each element for divisibility by 2.
             */
            for  (  let   i   =   0  ;   i   <   n  ;   i++  )
            {
                    // Check if the current element a[i] is odd.
                    if  (  a[i]   %   2   !==   0   )
                    {
                        // If it's odd, set the flag and exit the inner loop.
                        oddFlag   =   true  ;
                        break  ;
                    }
                    /*
                     * If a[i] is even, divide it by 2.
                     * This modifies the array in place.
                     */
                    a[i]   =   a[i]   /   2  ;
            }

            // After checking all elements, if an odd number was found...
            if  (  oddFlag  )
            {
                // ...exit the outer while loop.
                break  ;
            }

            // If no odd numbers were found, increment the counter.
            count++  ;
    }


    /*
     * Print the final count to the console.
     * This represents the number of times all elements could be divided by 2.
     */
    console.log  (  count  )  ;

} // End of Main function definition

// The following section should not be edited (standard I/O handling)
// This line reads input from standard input and calls the Main function.
Main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )  ;