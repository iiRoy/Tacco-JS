'use strict';

  const dataSource = require( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' )
    . trim ( ) . split ( '\n' )
;

let targetString = dataSource[ 0 ];

    let finalVerdict = "Yes" ; // Initialize the outcome

  for ( let charIndex = 0 ; charIndex < targetString.length ; charIndex ++ )
    {
      // Check for conditions at odd positions (1-indexed based on problem context)
      if ( charIndex % 2 )
      {
          if ( targetString[ charIndex ] === "R" )
          {
            finalVerdict = "No"; // Found an 'R' at an odd index
            break; // Terminate early
          }
      }
      else
      {
        // Check for conditions at even positions (0-indexed)
        if ( targetString[ charIndex ] === "L" )
        {
          finalVerdict = "No"; // Found an 'L' at an even index
          break; // Terminate early
        }
      }
    }

console.log( finalVerdict );