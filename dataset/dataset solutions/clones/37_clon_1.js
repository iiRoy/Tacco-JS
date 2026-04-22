var input = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ;


// This line takes the raw input, removes any leading/trailing whitespace,
// and then splits it into an array of strings based on newline characters.
var array = ( input . trim() ) . split ( "\n" ) ;


// This is the primary loop that processes each entry in the 'array' of input values.
// Each entry typically represents an upper limit for a prime number calculation.
for   ( var   aoj   =   0 ;   aoj   <   array . length ;   aoj++ )
{
   // 'maxValue' is the current upper bound for which prime numbers need to be found.
   var   maxValue   =   array[ aoj ] ;

   // 'x' is a counter that will keep track of the total number of prime numbers found.
   var   x   =   0 ;

   // Initialize 'primearray'. This array will be used to mark numbers as prime (1) or not prime (0).
   // The size is 'maxValue + 1' to allow indexing up to 'maxValue'.
   // Note: 'newArray' is assumed to be an existing function for array creation.
   var   primearray   =   newArray( maxValue   +   1 ) ;


   // First pass: Assume all numbers from 0 to 'maxValue' are prime.
   // This initializes all elements in 'primearray' to 1.
   for   ( var   i   =   0 ;   i   <=   maxValue ;   i++ )
   {
      primearray[ i ]   =   1 ;
   }


   // Implement the Sieve of Eratosthenes to efficiently find prime numbers.
   // This outer loop iterates from the first prime (2) up to the square root of 'maxValue',
   // or more simply, up to 'maxValue / 2' as an optimization.
   for   ( var   i   =   2 ;   i   <=   maxValue   /   2 ;   i++ )
   {
      // The inner loop marks all multiples of 'i' (starting from i*2) as non-prime (0).
      // If 'i' is prime, its multiples cannot be prime.
      for   ( var   j   =   i   *   2 ;   j   <=   maxValue ;   j   +=   i )
      {
         primearray[ j ]   =   0 ;
      }
   }


   // Special case handling: Numbers 0 and 1 are not considered prime.
   // Explicitly set their corresponding entries in 'primearray' to 0.
   primearray[ 0 ]   =   0 ;
   primearray[ 1 ]   =   0 ;


   // Final pass: Iterate through the 'primearray' from 2 up to 'maxValue'.
   // Count all numbers that are still marked as 1 (indicating they are prime).
   for   ( var   i   =   2 ;   i   <=   maxValue ;   i++ )
   {
      if   ( primearray[ i ]   ==   1 )
      {
         // This line is commented out but would display each prime number if uncommented.
         //  console . log ( i )

         // Increment the total count of prime numbers.
         x++ ;
      }
   }

   // Output the final count of prime numbers found for the current 'maxValue' to the console.
   console . log ( x ) ;
}