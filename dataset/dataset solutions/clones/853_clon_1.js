var input  =  require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ; //  Read the entire input from standard input as a UTF-8 string.
/*
 *   The 'fs' module is a built-in Node.js module that provides file system-related utilities.
 *   readFileSync is a synchronous method to read the contents of a file.
 *   '/dev/stdin' is a special file path on Unix-like systems representing the standard input stream.
 *   'utf8' specifies the character encoding to be used when reading the file.
 */


var Arr = ( input . trim ( ) ) . split ( "\n" ) ; /*  First, remove any leading or trailing whitespace from the input string.
                                                  *  Then, split the cleaned string into an array of substrings,
                                                  *  using the newline character ('\n') as the delimiter.
                                                  *  Each element in 'Arr' will be a line from the input.
                                                  */


var n = Arr . shift ( ) - 0 ; //  Extract the first element from 'Arr' (which is the first line of input).
                             //  The 'shift()' method removes the first element and returns it.
                             //  The '-0' is a common JavaScript idiom to explicitly convert a string to a number.
                             //  'n' now holds the total number of data entries to process.


var before = "" ; //  Initialize an empty string variable named 'before'.
                  //  This variable will be used to store the character from the previous iteration
                  //  to check for consecutive identical characters.


var s = [ ] ; //  Initialize an empty array named 's'.
              //  This array will accumulate the processed characters and their aggregated counts.


//  Commence the first primary processing loop.
//  This loop iterates 'n' times, once for each data entry provided in the input.
for ( var i = 0 ; i < n ; i ++ )
{

   var arr = Arr [ i ] . split ( " " ) ; //  Take the current line from 'Arr' and split it by a space character.
                                       //  This is expected to produce an array with two elements: a character and a count.

   var a = arr [ 0 ] ; //  Assign the first element (the character) from 'arr' to variable 'a'.

   var b = arr [ 1 ] - 0 ; //  Assign the second element (the count) from 'arr' to variable 'b'.
                          //  Again, '-0' converts the string count to a numeric type.


   //  Conditional check: Compare the current character 'a' with the 'before' character.
   if ( before == a )
   {
      //  If the current character 'a' is the same as the 'before' character:
      //  Add the current count 'b' to the last numeric value in the 's' array.
      //  This aggregates counts for consecutive identical characters.
      s [ s . length - 1 ] += b ;
   }
   else
   {
      //  If the current character 'a' is different from the 'before' character:
      //  Push the new character 'a' onto the 's' array.
      s . push ( a ) ;
      //  Push its corresponding count 'b' onto the 's' array.
      s . push ( b ) ;
      //  Update 'before' to the current character 'a' for the next iteration.
      before = a ;
   }

} //  End of the first processing loop.


//  Commence the second primary loop for validation.
//  This loop iterates through the 's' array in steps of 4 elements.
//  It checks if the aggregated data conforms to a specific structural pattern.
for ( var i = 0 ; i < s . length ; i += 4 )
{
   //  Validation step 1: Check if the first element of the current 4-element chunk is an opening parenthesis.
   if ( s [ i ] != "(" )
   {
      //  If it's not an opening parenthesis, the structure is invalid.
      return console . log ( "NO" ) ; //  Print "NO" to the console and immediately terminate the script.
   }

   //  Store the second element of the chunk, which is expected to be a count.
   var cnt = s [ i + 1 ] ;

   //  Validation step 2: Check if the third element of the current 4-element chunk is a closing parenthesis.
   if ( s [ i + 2 ] != ")" )
   {
      //  If it's not a closing parenthesis, the structure is invalid.
      return console . log ( "NO" ) ; //  Print "NO" and terminate.
   }

   //  Validation step 3: Check if the fourth element (which is another count) matches 'cnt'.
   //  This enforces that the opening and closing counts for a block must be identical.
   if ( s [ i + 3 ] != cnt )
   {
      //  If the counts do not match, the structure is invalid.
      return console . log ( "NO" ) ; //  Print "NO" and terminate.
   }

} //  End of the validation loop.


//  If the script reaches this point, it means all validation checks in the second loop passed successfully.
//  The input data structure is considered valid.
console . log ( "YES" ) ; //  Print "YES" to the console.

//  End of the JavaScript program.