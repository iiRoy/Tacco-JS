/*
 * This program analyzes a given input string.
 * Its primary purpose is to determine the presence of specific characters.
 *
 * Author: Code Clone Generator
 * Date: [Current Date]
 */

function Main( input )
{
  // The 'Main' function is the entry point for processing the input data.
  // The 'input' parameter holds the entire string that needs to be analyzed.
  // We are specifically looking for the characters 'a', 'b', and 'c'.

  if (
          input . indexOf ( 'a' ) >= 0
      &&  input . indexOf ( 'b' ) >= 0
      &&  input . indexOf ( 'c' ) >= 0
  )
  {
    // All required characters ('a', 'b', 'c') were found within the input string.
    console . log ( "Yes" ) ;
  }
  else
  {
    // One or more of the required characters ('a', 'b', 'c') were NOT found.
    console . log ( "No" ) ;
  }

} // End of Main function definition.


/*
 *  -- Standard Input/Output Handling --
 *  The following section is responsible for reading the input from standard
 *  input and passing it to the 'Main' function.
 *  It should generally not be modified.
 */
Main (
    require ( "fs" )
        . readFileSync (
            "/dev/stdin" ,
            "utf8"
        )
) ; // Call the Main function with the read data.