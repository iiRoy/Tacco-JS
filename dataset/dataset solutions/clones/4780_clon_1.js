/*
 * This JavaScript code defines a function 'm' that calculates a specific count.
 * It then calls this function with input read from standard input.
 *
 * Author: Expert Clone Generator
 * Date: 2023-10-27
 */

function   m  (  input  )
{
  // Declare a variable 'a' to store the split input string.
  var   a    =    input  .  split  (  ' '  )  ;

  // Parse the first part of the input as an integer for variable K.
  var   K    =    parseInt  (  a  [0]  )  ;

  // Parse the second part of the input as an integer for variable S.
  var   S    =    parseInt  (  a  [1]  )  ;


  // Initialize a counter variable 's' to zero. This will store the final count.
  var   s    =    0  ;

  // Outer loop: iterates from 0 up to and including K.
  for  (  let   i  =  0  ;  i  <=  K  ;  i  ++  )
  {
        // Inner loop: iterates from 0 up to and including K.
        for  (  let   j  =  0  ;  j  <=  K  ;  j  ++  )
        {
                // Calculate 'v' based on S, i, and j.
                // This represents the third number in a potential triplet (i, j, v)
                // such that i + j + v = S.
                var   v    =    S  -  (  i  +  j  )  ;

                // Check if 'v' is within the valid range [0, K].
                if  (  v    >=    0    &&    v    <=    K  )
                {
                        // If 'v' is valid, increment the counter 's'.
                        s  ++  ;
                }
        }
  }

  // Output the final count 's' to the console.
  console  .  log  (  s  )  ;
}

// Call the function 'm' with input read from '/dev/stdin'.
// The 'fs' module is used for file system operations.
// 'readFileSync' reads the file synchronously, and 'utf8' specifies the encoding.
m  (  require  (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,    'utf8'  )  )  ;

/*
 * End of generated code.
 */