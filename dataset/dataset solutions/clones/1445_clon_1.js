var   input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ;
// This line initiates the process by reading all available data from the standard input stream.
// It uses Node.js's 'fs' module for file system operations, specifically 'readFileSync' to get the content.
// The content is assumed to be encoded in 'utf8'.

var   arr   =   input . trim ( ) . split ( "\n" ) ;
/*
 * The raw input string is first processed:
 * 1. '.trim()' removes any leading or trailing whitespace characters.
 * 2. '.split("\n")' then breaks the string into an array of substrings,
 *    where each substring represents a line from the original input.
 *    This array 'arr' will be used to extract data for each test case.
 */


while   (   true   )
{
   // This is the main loop that continuously processes test cases until a specific condition is met.

   var   n   =   arr . shift ( )   -   0   ;
   // In each iteration, 'arr.shift()' removes and returns the first element (line) from the 'arr' array.
   // This element is expected to be a number, which represents 'n' for the current test case.
   // The '- 0' arithmetic operation is a common JavaScript idiom to explicitly convert the string to a number.

   if   (   n   ==   0   )   {
      // This conditional statement checks if the extracted 'n' is equal to 0.
      // A value of 0 typically acts as a sentinel, signaling that there are no more test cases to process.
      break   ; // If 'n' is 0, the 'break' statement terminates the 'while' loop.
   }

   var   ary   =   (   arr . shift ( )   ) . split ( " " ) . map ( Number ) ;
   // If 'n' was not 0, the next line in 'arr' is expected to contain a sequence of numbers.
   // 'arr.shift()' extracts this line.
   // '.split(" ")' then divides this string into an array of substrings, using a space as the delimiter.
   // '.map(Number)' subsequently converts each of these substrings into an actual numerical value,
   // resulting in an array of numbers called 'ary'.

   var   sum   =   ary . reduce (   function   (   a ,   b   )   {   return   a   +   b   ;   }   ) ;
   // The 'reduce' method is employed here to calculate the sum of all elements in the 'ary' array.
   // The anonymous function 'function(a, b){ return a + b; }' defines the accumulation logic:
   // 'a' is the accumulator (running total), and 'b' is the current element.

   var   m   =   sum   /   n   ;
   // 'm' is computed as the arithmetic mean (average) of the numbers in 'ary'.
   // This is done by dividing the 'sum' by 'n', which is the count of numbers for this test case.

   var   s   =   0   ;
   // A variable 's' is initialized to 0. This variable will be used to accumulate the sum of
   // squared differences between each number and the mean.

   ary . forEach (   function   (   v   )   {
      // The 'forEach' method iterates over each element 'v' in the 'ary' array.
      s   +=   Math . pow (   v   -   m   ,   2   )   ;
      // Inside the loop, for each value 'v', the difference between 'v' and the mean 'm' is calculated.
      // 'Math.pow(..., 2)' then squares this difference.
      // This squared difference is added to the running total 's'.
   }   )   ;

   var   ans   =   Math . sqrt (   s   /   n   ) ;
   // 'ans' is calculated as the standard deviation of the numbers in 'ary'.
   // The formula used is the square root of the variance (s / n).
   // 'Math.sqrt()' computes the square root of its argument.

   console . log (   ans . toFixed ( 8 )   ) ;
   // The calculated standard deviation ('ans') is printed to the console.
   // '.toFixed(8)' ensures that the number is formatted as a string with exactly 8 digits after the decimal point.
}
// The 'while' loop concludes here, meaning all test cases have been processed or the sentinel value was encountered.