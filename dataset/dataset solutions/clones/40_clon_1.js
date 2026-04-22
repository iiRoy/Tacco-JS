/* This is a JavaScript program designed to perform some calculations,
   likely related to prime numbers or array processing based on
   standard input. It utilizes Node.js file system (fs) module
   to read input synchronously from stdin.
*/

    var   fs     =    require('fs')   ; // File system module for I/O operations.

    var   length =    fs.fstatSync(process.stdin.fd).size   ; // Determine the size of the input stream.

    var   buffer =    new   Buffer(length)   ; // Create a buffer to hold the input data.

    // Read data from standard input into the buffer.
    var   bytesRead =    fs.readSync(process.stdin.fd,   buffer,   0,   length,   0)   ;

    /*
     * Convert the buffer content to a UTF-8 string,
     * then split it by newline characters to get an array of lines.
     */
    var   input =    buffer.toString('utf8',   0,   bytesRead).split('\n')   ;

// Initiate the main execution flow of the program.
    main()   ;


function   main()   {
        // Convert the string input array into an array of 32-bit integers.
        var   intInput   =   new   Int32Array(input)   ;

        //  var readLine = 0;   // Original comment, now slightly modified for visual difference. This variable is unused.

        var   n   ; // Loop counter for iterating through input values.
        var   num   ; // Total number of elements to process.
        var   cnt   ; // Counter for results, possibly prime count.
        var   res   ; // Variable to store intermediate results, e.g., modulo operation.


        // Note: There appears to be a variable 'initInput' referenced here that is not declared.
        // Assuming it's meant to be 'input.length' or 'intInput.length' based on context,
        // but preserving the original code's identifier as per Type I cloning rules.
        num   =   initInput.length   ;

        cnt   =   0   ; // Initialize the counter.

        // Loop through each number provided in the input.
        for   (   n   =   0   ;   n   <   num   ;   ++n   )   {

                val   =   intInput[n]   ; // Get the current value from the integer input array.

                // Declare a new array named 'prime' with size 'val' in each iteration.
                // Its purpose might be to store prime numbers found up to 'val'.
                var   prime   =   new   Array(val)   ;

                // Handle special case: if value is 1.
                if   (   val   ==   1   )   {
                        cnt   =   0   ; // For 1, the count is 0.
                }

                // Handle special case: if value is 2.
                // This 'if' is separate, not an 'else if'.
                if   (   val   ==   2   )   {
                        cnt   =   1   ; // For 2, the count is 1 (2 itself is prime).
                }

                // For values greater than 2, proceed with a prime-finding algorithm.
                else   {
                        var   sq   ; // Square root of the current value.
                        var   i   ;  // Loop counter for potential prime candidates.
                        var   j   ;  // Loop counter for iterating through found primes.
                        var   base   ; // Current prime number being used as a divisor.
                        var   found   ; // Flag to indicate if a number is found to be prime.

                        sq   =   Math.sqrt(val)   ; // Calculate the square root of 'val'.

                        cnt   =   1   ; // Initialize count; 2 is already considered prime.
                        found   =   1   ; // Assume prime initially.

                        prime[0]   =   2   ; // The first prime number is 2.

                        // Iterate from 3 up to the square root of 'val' to find primes.
                        for   (   i   =   3   ;   i   <   sq   ;   ++i   )   {
                                // Reset 'base' for the inner loop.
                                // This seems to restart checking from the first prime found.
                                base   =   prime[0]   ;

                                // Inner loop: check divisibility by previously found primes.
                                for   (   j   =   0   ;   base   <=   sq   ;   ++j   )   {
                                        base   =   prime[j]   ; // Get the next prime from the 'prime' array.
                                        res   =   i   %   base   ; // Perform modulo operation.

                                        // If 'i' is divisible by 'base', it's not prime.
                                        if   (   res   ==   0   )   {
                                                found   =   0   ; // Mark as not prime.
                                                break   ; // No need to check further divisors for 'i'.
                                        }
                                }

                                // If 'i' was not divisible by any previous prime, it is a prime number.
                                if   (   found   )   {
                                        prime[cnt++]   =   i   ; // Add 'i' to the list of primes and increment count.
                                }
                        }
                } // End of else block for val > 2.


        console.log(cnt)   ; // Output the final count for the current value.
    } // End of main for loop.
} // End of main function.