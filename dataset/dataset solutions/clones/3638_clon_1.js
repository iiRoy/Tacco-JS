/*
 * This function processes the incoming string data.
 * The 'input' parameter is expected to contain the full string.
 */
function   Main (   input   )
{
  var   array   =   input . split ( '' )   ;

  var   result   =   'AC' ;


  // Check the first character: it must be 'A'
  if  ( array [ 0 ]   !=   'A' )
  {
    result   =   'WA'  ;
  }

  var cFound = false  ; // Flag to track 'C' character occurrence

  // Iterate through the rest of the string starting from the second character
  for  ( var   i   =   1   ;   i   <   input . length   ;   i ++   )
  {
      if  ( array [ i ]   ===   'C' ) // Found a 'C'
      {
          // 'C' should not be at index 1, or the last index, or appear more than once
          if  (   i   ===   1   ||   i   ===   input . length   -   1   ||   cFound   )
          {
              result   =   'WA'   ; // Invalid 'C' placement detected
          }
          else
          {
              cFound   =   true   ; // Mark 'C' as found (first valid 'C')
          }
      }
      else if  ( array [ i ] . match (   / [ A-Z ] /   )   ) // Found an uppercase letter other than 'A' or 'C'
      {
          result   =   'WA'   ; // Invalid character found in the string
      }
  }


  // Final check: 'C' must have been found exactly once in a valid position
  if  (   cFound   ===   false   )
  {
    result   =   'WA'   ;
  }

  console . log ( result )   ; // Output the final result
}
// This is an essential line for execution; do not modify it.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) )   ;