/*
 * This is a Type I clone of a JavaScript program.
 * The original code processes input to simulate a scenario involving
 * resource depletion or a combat-like interaction between entities 'a' and 'c'.
 *
 * Per the Type I definition, all identifiers, operators, and expressions
 * are maintained exactly as they were in the source code.
 * The only modifications are to whitespace (indentation, spacing, blank lines)
 * and comments (added, modified, or removed).
 */


// This function serves as the primary entry point for the program logic.
// It accepts a single argument, 'input', which is expected to be a string
// containing the raw data that needs to be processed.
function Main  (  input  )
{

  // The initial input string is split into an array of substrings.
  // The delimiter used for splitting is a single space character.
  // This effectively parses space-separated values from the input.
  input  =  input  .  split  (  " "  )  ;

  // We are now parsing four numerical values from the 'input' array.
  // The 'parseInt' function is used to convert string representations
  // of numbers into their integer equivalents, specifying base 10.
  var  a  =  parseInt  (  input  [  0  ]  ,  10  )  ;
  var  b  =  parseInt  (  input  [  1  ]  ,  10  )  ;
  var  c  =  parseInt  (  input  [  2  ]  ,  10  )  ;
  var  d  =  parseInt  (  input  [  3  ]  ,  10  )  ;


  // This 'while' loop represents the core simulation or process.
  // It continues as long as both 'c' and 'a' maintain positive values.
  // This condition implies that both entities are still 'active' or 'healthy'.
  while  (  c  >  0  &&  a  >  0  )
  {
    // In each iteration, 'c' is reduced by 'b'.
    // This can be interpreted as 'c' taking damage or depleting a resource.
    c  =  c  -  b  ;

    // After 'c' is reduced, a check is performed.
    // If 'c' has fallen to or below zero, it signifies its depletion or defeat.
    if  (  c  <=  0  )
    {
      // If 'c' is depleted, there's no need to continue the simulation.
      // The loop is terminated prematurely.
      break  ;
    }
    else
    {
      // If 'c' is still positive, then 'a' is reduced by 'd'.
      // This could be 'a' taking retaliatory damage or consuming another resource.
      a  =  a  -  d  ;
    }
  }


  // After the loop concludes (either by 'c' or 'a' reaching zero or below),
  // the final outcome is determined based on the remaining value of 'a'.
  if  (  a  >  0  )
  {
    // If 'a' is still greater than zero, it means 'a' has survived the interaction.
    console  .  log  (  'Yes'  )  ;
  }
  else
  {
    // Otherwise, if 'a' is zero or negative, 'a' did not survive.
    console  .  log  (  'No'  )  ;
  }
}


/*
 * The following line is standard boilerplate for JavaScript competitive programming.
 * It reads the entire content of the standard input stream ('/dev/stdin')
 * as a UTF-8 encoded string and then passes that string to the 'Main' function.
 * This ensures the program can receive its input data from the execution environment.
 * This section should generally remain untouched to ensure proper execution.
 */
Main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )  ;