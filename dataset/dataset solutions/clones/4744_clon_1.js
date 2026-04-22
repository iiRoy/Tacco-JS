/*
 * This is a JavaScript program designed to process some input data.
 * It identifies unique elements and performs a calculation based on their count.
 */
function   Main  (  input  )   {
  // Declare a variable 'len' to store the first part of the input.
  var    len     =     input .  split (  "\n"  )  [  0  ]   ;


  // Declare a variable 'list' to store the second part of the input, split by spaces.
  var    list     =     input .  split (  "\n"  )  [  1  ] .  split (  " "  )   ;



  // Filter the 'list' to get only unique elements.
  // The 'filter' method creates a new array with all elements that pass the test implemented by the provided function.
  // The test here checks if the current element's first occurrence index is equal to its current index,
  // effectively removing duplicates.
  var    b     =     list .  filter (  function   (  x  ,  i  ,  self  )   {
            // This anonymous function is the predicate for the filter.
            // 'x' is the current element, 'i' is its index, 'self' is the array itself.
            return     self .  indexOf (  x  )     ===     i   ;
        }  )   ;

  // Now, check the length of the array 'b' (unique elements).
  if  (  b .  length     %     2     ==     1  )   {
     // If the length is odd, log the length itself.
     console .  log (  b .  length  )   ;
     }  else   {
     // If the length is even, log the length minus one.
     console .  log (  b .  length     -     1  )   ;
     }

} // End of the Main function.

// Call the Main function with input read from standard input.
// This line reads the entire content of /dev/stdin as a UTF-8 string.
Main  (  require (  "fs"  ) .  readFileSync (  "/dev/stdin"  ,  "utf8"  )  )   ;