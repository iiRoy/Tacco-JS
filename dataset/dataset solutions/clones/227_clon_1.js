function     main   (  )   {
    // This is the core function of the program, responsible for processing
    // each line of input and determining the count of specific prime pairs.
    var
        i   ,   j   ,   n   ,   m   ,   x   ,
        len   =   input.length   ; // Total number of input lines to process.

    // Loop through each line of the input array.
    for   (  i   =   0  ;   i   <   len  ;   i++   )   {

        // Parse the current input line into an integer, base 10.
        n   =   parseInt   (  input  [  i  ]  ,   10   )  ;

        // If 'n' is 0, it signals the end of valid input, so break the loop.
        if   (  n   ===   0   )
            break   ;

        // Calculate 'm' as the floor division of 'n' by 2, using bitwise NOT operator.
        m   =   ~~   (  n   /   2   )  ;

        // Initialize counter 'x' for prime pairs and iterator 'j' for the primes array.
        // Iterate through the pre-computed 'primes' array.
        for   (  x   =   0  ,   j   =   0  ;   primes  [  j  ]   <=   m  ;   j++   )   {
            // Check if (n - current_prime) is also a prime number
            // by looking it up in the 'primesTable' hash map.
            if   (  primesTable  [  n   -   primes  [  j  ]  ]   )
                x++   ; // Increment 'x' if a valid prime pair is found.
        }
        // Output the final count 'x' for the current input 'n'.
        console.log   (  x   )  ;
    }
}


// Declare global variables for prime numbers and their lookup table.
var
    primes   =   (   function   (   n   )   {
        // This is an Immediately-Invoked Function Expression (IIFE)
        // dedicated to generating a list of prime numbers up to 'n'.
        var
            i   ,   j   ,   flag   ,
            primes   =   [   2   ]   ; // Start the list with the first prime, 2.

        // Handle edge case: if the limit 'n' is less than 2, return an empty array.
        if   (   n   <   2   )
            return   [   ]   ;

        // Loop through odd numbers starting from 3 up to the given limit 'n'.
        for   (   i   =   3   ;   i   <=   n   ;   i   +=   2   )   {
            flag   =   true   ; // Assume the current number 'i' is prime initially.

            // Check for divisibility by existing prime numbers in the 'primes' list.
            // The condition `primes[j] < i*i` is retained from the original code.
            for   (   j   =   0   ;   primes  [  j  ]   <   i   *   i   ;   j++   )   {
                // If 'i' is perfectly divisible by any prime, it's not a prime number.
                if   (   i   %   primes   [   j   ]   ==   0   )   { // Original uses '==', keeping it.
                    flag   =   false   ; // Mark 'i' as not prime.
                    break   ; // No need to check further divisors.
                }
            }
            // If 'flag' is still true after checking all relevant divisors, 'i' is prime.
            if   (   flag   )   {
                primes.push   (   i   )   ; // Add the newly found prime to the list.
            }
        }
        return   primes   ; // Return the complete array of prime numbers.
    }   )   (   50000   )   , // Execute the IIFE with 50000 as the upper limit for prime generation.

    primesTable   =   primes.reduce   (   function   (   m   ,   a   )   {
        // This reducer function transforms the 'primes' array into a hash map (object).
        // The keys of the object are the prime numbers, and their values are set to 'true'.
        // This allows for very fast (O(1) average time) lookups to check if a number is prime.
        m   [   a   ]   =   true   ; // Set the prime number 'a' as a key with value 'true'.
        return   m   ; // Return the accumulator object for the next iteration.
    }   ,   {   }   )   ; // Initialize the accumulator as an empty object.


// Declare a global variable to accumulate input from standard input.
var
    input   =   ''   ;


// Configure the standard input stream for data reception in a Node.js environment.

process.stdin.resume   (   )   ; // Explicitly resume the stdin stream to start listening for input.

process.stdin.setEncoding   (   'utf8'   )   ; // Set the character encoding for the incoming data to UTF-8.

// Register an event listener for the 'data' event on stdin.
// This callback function is executed whenever a chunk of data is received.
process.stdin.on   (   'data'   ,   function   (   chunk   )   {
    input   +=   chunk   ; // Append the received 'chunk' of data to the 'input' string.
}   )   ;

// Register an event listener for the 'end' event on stdin.
// This callback is executed once the input stream has completely ended.
process.stdin.on   (   'end'   ,   function   (   )   {
    // After all input is received, split the accumulated 'input' string by newline characters.
    // This converts the raw input into an array where each element is a line from the input.
    input   =   input.split   (   '\n'   )   ;

    main   (   )   ; // Invoke the main processing function to start the core logic.
}   )   ;