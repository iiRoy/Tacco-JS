// This script is designed to process Roman numerals provided as input.
// It reads each Roman numeral string, converts it to its corresponding
// integer value, and then prints the result to the console.

// Utilizing Node.js 'fs' module to read synchronous input from standard input.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// The input is expected to be multiple Roman numerals, each on a new line.
// Trim any leading/trailing whitespace from the entire input, then split it
// into an array of strings, where each string is a Roman numeral.
var Arr = ( input . trim ( ) ) . split ( "\n" ) ;

// An array containing the Roman numeral characters in ascending order of value.
var n = "I,V,X,L,C,D,M" . split ( "," ) ;

// An array containing the integer values corresponding to the Roman numeral characters in 'n'.
var m = [ 1 , 5 , 10 , 50 , 100 , 500 , 1000 ] ;

// An empty object that will be populated to map Roman characters to their integer values.
var obj = { } ;

// Populate the 'obj' mapping Roman characters to their integer values.
// For each character 'v' at index 'i' in array 'n', assign its corresponding
// integer value 'm[i]' to 'obj[v]'.
n . forEach ( function ( v , i ) {
  obj [ v ] = m [ i ] ; // Example: obj['I'] = 1, obj['V'] = 5, etc.
} ) ;


// Iterate over each Roman numeral string present in the 'Arr' array.
Arr . forEach ( function ( val ) {

   // Convert the current Roman numeral string into an array of individual characters.
   var arr = val . split ( "" ) ;

   // Initialize 'sum' to zero for the current Roman numeral. This will store its total integer value.
   var sum = 0 ;

   // 'before' stores the integer value of the *previous* Roman character processed.
   // It's initialized to a large value (1000, effectively 'M') to correctly handle
   // the first character of any Roman numeral string, ensuring it's always added.
   var before = 1000 ;

   // Iterate through each character of the current Roman numeral array.
   arr . forEach ( function ( v ) {

      // Retrieve the integer value of the current Roman character 'v' from our 'obj' mapping.
      var num = obj [ v ] ;

      // Check for the subtractive rule in Roman numerals (e.g., IV = 4, IX = 9, XL = 40).
      // If the value of the previous character ('before') is less than the current character's value ('num'),
      // it implies a subtractive notation.
      if ( before < num ) {
         // To handle subtractive notation, we effectively added 'before' in the previous step.
         // Now, we need to subtract 'before' twice (once to undo the previous addition, and once more
         // to correctly reflect the subtraction from 'num').
         sum += num - ( 2 * before ) ;
         // After a subtractive operation, the 'before' value is effectively consumed and reset
         // to a large value, as the rule applies only to adjacent characters.
         before = 1000 ;
      } else {
         // If no subtractive notation, simply add the current character's value to the sum.
         sum += num ;
         // Update 'before' to the current character's value for the next iteration.
         before = num ;
      }

   } ) ;

   // After processing all characters of the current Roman numeral, print its total integer sum.
   console . log ( sum ) ;
} ) ;

// End of Roman numeral conversion script.