function ProcessEntry( sourceData )
{

  // Convert the received data into a string format, then partition it using spaces.
  const parsedTokens = sourceData . toString ()
                                  . split ( " " );

  // Retrieve the initial element, representing a numerical factor.
  const factorA = parsedTokens[0];

  // Obtain the subsequent element, serving as a boundary value.
  const limitB = parsedTokens[1];


  // Output the gathered numeric factor and the boundary value.
  console.log( factorA, limitB );

  // Evaluate if five hundred times the factor exceeds the boundary.
  // Display 'YES' for true, otherwise 'NO'.
  console.log( ( 500 * factorA ) > limitB ? "YES" : "NO" );

}


// The following line is responsible for reading standard input and initiating the processing routine.
// Please refrain from modifying this part of the code as it handles core system interaction.
ProcessEntry( require("fs").readFileSync( "/dev/stdin", "utf8" ) );