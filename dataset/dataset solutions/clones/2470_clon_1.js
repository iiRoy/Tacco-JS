/*
 * This is a JavaScript program designed to solve a specific problem.
 * It checks for divisibility conditions based on the input 'n'.
 */

// Define the main function that takes an integer 'n' as its primary argument.
function   main  (  n  )
{
        // Initiate a loop that iterates through possible divisors 'i' from 1 up to 9.
        // The loop continues as long as 'i' is less than or equal to 9.
        for  (  var   i   =   1  ;    i   <=   9  ;    i++   )
        {

                /*
                 * Inside the loop, we evaluate a compound condition:
                 * 1. Check if 'n' is perfectly divisible by 'i' (i.e., the remainder is zero).
                 * 2. Check if the result of 'n' divided by 'i' is strictly less than 10.
                 * Both conditions must be true for the block to execute.
                 */
                if  (  n   %   i   ===   0     &&     n   /   i   <   10  )
                {
                        // If the conditions are met, log the string 'Yes' to the standard output.
                        console  .  log  (  'Yes'  )  ;

                        // After printing 'Yes', the function immediately terminates and returns.
                        return  ;
                }
        }

        // If the loop completes its entire iteration from 1 to 9 without finding
        // any 'i' that satisfies the conditions, then this line will be reached.
        // In this scenario, log the string 'No' to the standard output.
        console  .  log  (  'No'  )  ;
}


// This section handles the program's execution entry point.
// It reads input from '/dev/stdin' synchronously using Node.js's 'fs' module.
// The input is treated as a UTF-8 encoded string.
// The 'main' function is then invoked with this processed input.
main  (  require  (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,    'utf8'  )  )  ;