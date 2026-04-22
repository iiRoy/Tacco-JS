process  .   stdin   .   resume ( )   ;
// This line ensures the standard input stream stays open.

process .   stdin   .   setEncoding ( 'utf8' ) ;
   //   Setting the character encoding for the input stream to UTF-8.


  //  ---  Core logic starts here!  ---


var   input = require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' )

input = input.trim ( ) . split ( '\n' ) . map ( Number ) ;
// Reads input, trims whitespace, splits by newline, and converts each line to a number.


var      n     = input[0]

var   rList   =   input . slice ( 1 ) ;
   // The first element is 'n', the rest form 'rList'.

var result = 0
// Initialize the result variable to store the maximum difference found.


// Outer loop: Iterates through each element R_i in rList.
for ( var i = 0 ;   i < rList . length ;   i ++ )
{
   // Condition to break the loop if 'n' (number of elements to consider) is reached.
   if ( i + 1 === n )
   {
      break ;
   }


   // Inner loop: Compares R_i with every other element R_j in rList.
   for ( var j = 0 ; j < rList . length ; j ++ )
   {
      // Skip comparison if it's the same element (R_i - R_i = 0).
      if ( i === j )
      {
         continue ;
      }

      var calc = rList[i] - rList[j]
      // Calculate the difference between R_i and R_j.

      // Update 'result' if the current difference is greater.
      if ( result < calc )
      {
         result = calc ;
      }
   }
}

console . log ( result )
// Output the final maximum difference found.