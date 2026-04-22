/*
 * This is a Type I clone example.
 * The logic remains absolutely identical to the original.
 * Only whitespace and comments have been altered significantly.
 */
function   main  (  input  )
{
  // Initialize the input by splitting it based on spaces.
  input   = input.split  (  ' '  )   ;


  // Loop through each element in the processed input array.
  for    (    var    i    =    0    ;    i    <    input.length    ;    i++    )
  {
    // Check if the current element is exactly the string '0'.
    if    (    input[i]    ===    '0'    )
    {
      // If it is '0', log its 1-based index to the console.
      console.log    (    i    +    1    )    ; // Output the index plus one.
    }
  }

} // End of the main function.



// This section reads input from standard input and passes it to the main function.
main  (  require  (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,  'utf8'  )  )  ; // Execute the main logic.