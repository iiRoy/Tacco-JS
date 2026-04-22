/*
 * This is an Immediately Invoked Function Expression (IIFE).
 * It processes an input string, converting its case.
 */
(  function  (   input   )   {
  // Declare a variable 'str' and initialize it with the input.
  var   str   =   input   ;

  /*
   * The core logic: replace each alphabetic character.
   * If it's lowercase, convert to uppercase.
   * If it's uppercase, convert to lowercase.
   */
  str   =   str   .   replace   (   / (?:([a-z])|([A-Z])) / g   ,   function  (   match   ,   p1   ,   p2   ,   offset   ,   string   )   {

    // Check if the first capturing group (lowercase letter) matched.
    if   (   p1   )   {
      // If p1 exists, it means a lowercase letter was found.
      return   p1   .   toUpperCase   (   )   ;
    }

    // Otherwise, p2 (uppercase letter) must have matched.
    return   p2   .   toLowerCase   (   )   ;
  }   )   ;


  // Output the modified string to the standard console.
  console   .   log   (   str   )   ;
}   )   (
  // This part provides the input to the IIFE.
  // It reads the entire content of '/dev/stdin' as a UTF-8 string.
  require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )
)   ; // End of the IIFE execution block.