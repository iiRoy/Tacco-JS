function    Main  (  input  )  {
    // This is the main function that processes the input string.
    /*
     * The input string contains multiple lines.
     * The first line has two space-separated integers: N and T.
     * The second line contains N space-separated integers.
     */


    var /* declare */ N  =  input.split  (  "\n"  )  [  0  ]  .  split  (  " "  )  [  0  ]  ;
    // Extract the first number from the first line.

    var /* declare */ T  =  input.split  (  "\n"  )  [  0  ]  .  split  (  " "  )  [  1  ]  ;
    // Extract the second number from the first line.

    N  =  parseInt  (  N  ,  10  )  ;  // Convert N to an integer (base 10).
    T  =  parseInt  (  T  ,  10  )  ;  // Convert T to an integer (base 10).

    var /* declare */ t  =  input.split  (  "\n"  )  [  1  ]  .  split  (  " "  )  ;
    // Split the second line of input into an array of strings.


    var   jud  ;  // Declare a variable 'jud' to store a boolean judgment.

    var   count  =  0  ;  // Initialize a counter variable to zero.


    // Loop N times, iterating through the array 't'.
    for  (  i  =  0  ;  i  <  N  ;  i  ++  )  {
        // Convert the current element of 't' from string to integer.
        t  [  i  ]  =  parseInt  (  t  [  i  ]  ,  10  )  ;

        // Check if it's the first iteration of the loop.
        if  (  i  ===  0  )  {
            // For the very first element, 'jud' is true if t[0] is greater than or equal to T.
            jud  =  t  [  i  ]  >=  T  ;
        }  else  {
            // For subsequent elements, 'jud' is true if the difference between current and previous is >= T.
            jud  =  (  t  [  i  ]  -  t  [  i  -  1  ]  )  >=  T  ;
        }

        // If 'jud' is true (meaning the condition was met).
        if  (  jud  ===  true  )  {
            // Add T to the total count.
            count  +=  T  ;
        }  else  {
            // If 'jud' is false.
            if  (  i  ===  0  )  {
                // If it's the first element and 'jud' is false, add t[0] to count.
                count  +=  t  [  i  ]  ;
            }  else  {
                // If it's not the first element and 'jud' is false, add the difference to count.
                count  +=  (  t  [  i  ]  -  t  [  i  -  1  ]  )  ;
            }
        }
    }

    // After the loop, add T one more time to the count.
    count  +=  T  ;

    // Output the final calculated count to the console.
    console.log  (  count  )  ;
}

// Call the Main function with input read from standard input.
// This part reads the entire content of /dev/stdin as a UTF-8 string.
Main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )  ;