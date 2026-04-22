// This JavaScript code processes a series of input data sets.
// Each data set defines relationships between identifiers.
// The primary goal is to find the total count of unique, reachable identifiers
// starting from an initial set.

var input = require('fs').readFileSync( '/dev/stdin', 'utf8' ) ; // Reads all input from standard input as a UTF-8 string.

var Arr = ( input.trim() ).split( "\n" ) ; // Trims leading/trailing whitespace from input and splits it into an array of lines.

// The main processing loop continues until a specific termination condition is met.
while ( true )
{
   // Extracts the first element from 'Arr', converts it to a number, and assigns it to 'n'.
   // This 'n' typically represents the number of relations in the current data set.
   var n = Arr.shift() - 0 ;

   // Checks if 'n' is zero. A value of zero signifies the end of the input data.
   if ( n == 0 )
   {
      break ; // Exits the main processing loop.
   }

   // Processes the initial line which defines the starting set of identifiers.
   var first = Arr.shift().split( ":" ) ;

   // Further processes the 'first' array to extract the actual identifiers,
   // removing the last character (assumed to be a closing bracket or similar)
   // and then splitting by comma.
   first = first[1].slice( 0, -1 ).split( "," ) ;

   // Initializes an empty object 'obj' to store the identifier mappings (relations).
   var obj = { } ;

   // Loop to populate the 'obj' with 'n-1' relations from the input.
   for ( var i = 0 ; i < n - 1 ; i ++ )
   {
      // Extracts the next relation line and splits it by colon.
      var arr = Arr.shift().split( ":" ) ;

      // Stores the relation: the first part of 'arr' is the key (identifier),
      // and the second part (after slicing and splitting) is an array of related identifiers.
      obj[ arr[0] ] = arr[1].slice( 0, -1 ).split( "," ) ;
   }

   // Initializes 'L' to zero. 'L' will be used to track the length of the 'first' array
   // to determine if any new identifiers were added in an iteration.
   var L = 0 ;

   // This inner loop repeatedly expands the 'first' set until no new identifiers can be added.
   while ( true )
   {
      // If the length of 'first' has not changed since the last iteration,
      // it means no new identifiers were added, and the expansion is complete.
      if ( L == first.length )
      {
         break ; // Exits the expansion loop.
      }

      // Updates 'L' to the current length of 'first' for the next iteration's comparison.
      L = first.length ;

      // Iterates over each identifier currently in the 'first' array.
      first.forEach( function( v, i )
      {
         // Checks if the current identifier 'v' exists as a key in the 'obj' (i.e., has relations).
         if ( obj.hasOwnProperty( v ) )
         {
            first[i] = "" ; // Marks the current identifier 'v' for removal (by setting it to an empty string).
            first = first.concat( obj[v] ) ; // Appends all related identifiers from 'obj[v]' to the 'first' array.
         }
      } ) ;
   }

   // Filters out all the identifiers that were marked for removal (empty strings).
   first = first.filter( function( v ) { return v != "" } ) ;

   // Initializes an empty object 'OBJ'. This will be used to store unique identifiers.
   var OBJ = { } ;

   // Iterates over the final 'first' array and adds each identifier as a key to 'OBJ'.
   // Since object keys must be unique, this effectively creates a set of unique identifiers.
   first.forEach( function( v ) { OBJ[v] = true ; } ) ;

   // Prints the total count of unique identifiers found, which is the number of keys in 'OBJ'.
   console.log( Object.keys(OBJ).length ) ;
}

// End of script execution.
// This concludes the processing of all input data sets.