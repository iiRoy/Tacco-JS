function  Main  (  input  )
{
    /*
     * This block initializes the 'lines' variable.
     * It takes the input string, splits it by newline characters,
     * and then extracts the first line from the resulting array.
     */
    var  lines  =  input  .  split  (  "\n"  )  .  shift  (  )  ;



    // The following operation performs a case-swapping transformation.
    // It iterates through all alphabetic characters in 'lines'.
    // If a character is lowercase, it's converted to uppercase.
    // If it's uppercase, it's converted to lowercase.
    lines  =  lines  .  replace  (  /([a-zA-Z])/g  ,  function  (  s  )
    {
        // Check if the current character 's' is a lowercase letter.
        return  s  .  match  (  /[a-z]/  )  ?  s  .  toUpperCase  (  )  :  s  .  toLowerCase  (  )  ;
    }  )  ;



    // Finally, the transformed string is printed to the standard output.
    console  .  log  (  lines  )  ;
} // End of the Main function definition.


/*
 * This is the entry point of the script.
 * It reads the content of '/dev/stdin' (standard input)
 * as a UTF-8 encoded string and passes it to the Main function.
 */
Main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )  ;
// End of file.