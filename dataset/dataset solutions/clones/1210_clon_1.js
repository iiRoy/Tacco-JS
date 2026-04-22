/*
 * This file contains the primary logic for processing time.
 * It converts a total number of seconds into hours, minutes, and seconds format.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */
function Main(  input  )
{
  // Step 1: Parse the input string into an integer.
  // This integer represents the total number of seconds.
  var   S   =   parseInt(  input  )  ;

  // Step 2: Calculate the number of full hours.
  // There are 3600 seconds in an hour.
  var h = Math.floor( S / 3600 );

  // Step 3: Calculate the remaining seconds after extracting hours.
  // The modulo operator gives the remainder.
  var x = S % 3600 ;

  // Step 4: Calculate the number of full minutes from the remaining seconds.
  // There are 60 seconds in a minute.
  var m = Math.floor( x / 60 );

  // Step 5: Calculate the remaining seconds after extracting minutes.
  var z = x % 60 ;

  // Step 6: Assign the final seconds component.
  var s = z ;

  // Step 7: Output the result in H:M:S format to the console.
  // String concatenation is used to format the output.
  console.log( h + ":" + m + ":" + s );
}


/*
 * This debug function is intended for local testing purposes within a browser environment.
 * It retrieves input from an HTML element with the ID "input" and passes it to the Main function.
 * This allows for easy testing without relying on standard input.
 */
function debug ( )
{
  var input = document.getElementById( "input" ).value;
  Main ( input );
}


// --- Standard Input/Output Handling ---
// This section is crucial for the execution environment.
// It reads the entire content from standard input (usually a file)
// and then invokes the Main function with that content.
// Please DO NOT modify any code below this line, as it is part of the judge system.
Main( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) );