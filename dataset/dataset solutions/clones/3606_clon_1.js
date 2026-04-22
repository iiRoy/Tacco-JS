'use strict'  ;

    // Defines a function to count the number of divisors for a given integer N.
    // The iteration includes 0, which for N % 0 results in NaN, and NaN === 0 is false.
    // This effectively means 0 is not counted as a divisor.
    const   yakusuu  =  ( N )  =>   {
        let count  =  0 ; // Initialize the divisor counter.

        // Loop through numbers from 0 up to N, inclusive.
        for  ( let i  =  0 ;  i  <=  N ;  i++ )   {
            // Check if 'i' perfectly divides 'N'.
            if  ( N  %  i   ===  0 )   {
                count++ ; // If it's a divisor, increment the count.
            }
        }

        return count ; // Return the total number of divisors found.
    } ;


    // The main processing function that reads input and performs the core logic.
    // It identifies odd numbers up to N that have exactly 8 divisors.
    const   Main  =  ( input )  =>   {
        const   N  =  Number ( input ) ; // Convert the input string to a numerical value.
        let count  =  0 ; // Initialize a counter for numbers meeting the criteria.

        // Iterate through numbers from 0 to N.
        for  ( let i  =  0 ;  i  <=  N ;  i++ )   {
            // Skip even numbers, as the problem specifies checking only odd numbers.
            if  ( i  %  2   ===  0 )   {
                continue ; // Proceed to the next iteration of the loop.
            }

            // For odd numbers, check if they have exactly 8 divisors using the yakusuu function.
            if  ( yakusuu ( i )   ===  8 )   {
                count++ ; // If an odd number has 8 divisors, increment the main counter.
            }
        }

        console.log ( count ) ; // Output the final tally of numbers that fit the criteria.
    } ;


// This following section handles the standard input/output operations.
// The structure and logic of this part should not be altered, only whitespace and comments may vary.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,  "utf8" ) ) ;