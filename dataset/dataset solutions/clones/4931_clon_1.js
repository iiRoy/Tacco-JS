/* This function serves as the main entry point for the program.
 * It takes a single argument, 'input', which is expected to be a string. */
function Main (  input  )

{

  // The first step is to remove any leading or trailing whitespace from the input string.
  input    =    input  .  trim  (  )  ;


  /* Initialize a variable 'output' to store the count of differences.
   * It is set to 0 initially, as no differences have been found yet. */
  var    output    =    0    ;


  // Define the reference string that the input will be compared against.
  var    seijou    =    "CODEFESTIVAL2016"    ;


  /* Begin a loop that iterates through each character of the input string.
   * The loop counter 'i' starts at 0 and goes up to (but not including)
   * the length of the input string. */
  for  (  var    i    =    0    ;    i    <    input  .  length    ;    i++  )
  {

    // Extract the character at the current index 'i' from the input string.
    var    tmp1    =    input  .  slice  (  i  ,  i  +  1  )  ;

    // Extract the character at the current index 'i' from the reference string 'seijou'.
    var    tmp2    =    seijou  .  slice  (  i  ,  i  +  1  )  ;


    /* Compare the two extracted characters.
     * If they are not identical, it means a difference has been found. */
    if  (  tmp1    !=    tmp2  )
    {

      // Increment the 'output' counter to record this difference.
      output++  ;

    }

  }


  // After the loop completes, print the final count of differences to the console.
  console  .  log  (  output  )  ;

}


/* This part of the code handles reading the input from the standard input stream.
 * It uses the 'fs' module to read the file specified by "/dev/stdin"
 * and decodes it as a 'utf8' string.
 * The resulting string is then passed to the 'Main' function for processing. */
Main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )  ;