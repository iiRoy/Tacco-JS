/* This line ensures strict mode for better error handling and cleaner code. */
'use strict'
; // End of strict mode declaration.

// This is the primary function that processes the input data.
function   main  (  stdin  )   {
  // Split the input string by newline characters to get an array of lines.
  const   input   =   stdin.split (  '\n'  )  ;
  // Remove the first element (which might be a header or count, not used here).
  input .  shift ( )  ;

  // Process each line to create a structured list.
  const   list   =   input .  map  (  (  v  ,  i  )   =>   {
    // Split the current line by spaces.
    const   tmp   =   v .  split  (  ' '  )  ;
    // Convert the second element (index 1) to an integer.
    tmp [  1  ]   =   parseInt (  tmp [  1  ]  ,  10  )  ;
    // Add the original line number (i + 1) as the third element (index 2).
    tmp [  2  ]   =   i   +   1  ;
    // Return the modified temporary array.
    return   tmp  ;
  }  )  ; // End of map operation.


  // Initialize an empty object to store grouped data.
  const   m   =   {  }  ;

  // Iterate over the processed list to populate the 'm' object.
  list .  forEach  (  a   =>   {
    // If a key doesn't exist, initialize it as an empty array.
    m [  a [  0  ]  ]   =   m [  a [  0  ]  ]   ||   [  ]  ;
    // Push the current item 'a' into the corresponding array.
    m [  a [  0  ]  ] .  push  (  a  )  ;
  }  )  ; // End of forEach loop for grouping.

  // Get all keys from the 'm' object and sort them alphabetically.
  const   keys   =   Object .  keys  (  m  ) .  sort  (  )  ;

  // Iterate over the sorted keys.
  keys .  forEach  (  k   =>   {
    // For each key, sort its associated list in descending order based on the second element.
    const   rest   =   m [  k  ] .  sort  (  (  a  ,  b  )   =>   b [  1  ]   -   a [  1  ]  )  ;
    // Iterate over the sorted sub-list and print the third element (original line number).
    rest .  forEach  (  r   =>   console .  log  (  r [  2  ]  )  )  ;
  }  )  ; // End of forEach loop for printing.
} // End of the main function definition.

// Call the main function with data read from standard input.
main (  require (  'fs'  ) .  readFileSync (  '/dev/stdin'  ,  'utf8'  )  )  ; // Execution starts here.