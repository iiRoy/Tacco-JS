/*
 * This is a Type I clone of an original JavaScript function.
 * The purpose is to demonstrate extensive whitespace and comment variations.
 * All identifiers, operators, and expressions remain strictly identical.
 */


  function   Main  (  s  )   {
      // --- Function entry point ---


    const   n    =    s  .  length ;   // Get the length of the input string 's'


    var   ans   =   0  ;    /* Initialize the answer counter.
                                   This will store the number of changes needed. */


    var   a    =    s  [  0  ] ;    // Store the first character of the string


    // --- Loop through the string starting from the second character ---
    for ( var   i   =   1  ;   i   <   n  ;   i  ++ )
    {


        /* Check if the current character is different from the previously stored character.
           This is the core logic for counting character changes. */
        if  (  s  [  i  ]    !==    a  )
        {


          ans  ++ ;  // Increment the answer counter if a change is detected


          a   =   s  [  i  ] ;    // Update 'a' to the current character for the next comparison
        }
      // End of if block
    }  // End of for loop


    console  .  log  (  ans  ) ;   // Print the final calculated answer to the console

  }  /* End of Main function definition */


// --- Call the Main function with input from stdin ---

/*
 * The following line reads input from standard input,
 * decodes it as UTF-8, removes leading/trailing whitespace,
 * and passes it as the argument 's' to the Main function.
 */
Main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )  .  trim  (  )  ) ;


// End of script