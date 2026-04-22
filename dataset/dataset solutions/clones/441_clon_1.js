function prime ( max )
{
   // This function implements the Sieve of Eratosthenes algorithm
   // to find all prime numbers up to 'max'.
   // It returns an object where keys are prime numbers and values are 'true'.

   var arr = [ ] ; // Array to store numbers and mark primality.

   // Initialize the array with numbers from 0 to max.
   // Initially, every number is considered potentially prime.
   for ( var i = 0 ; i <= max ; i ++ )
   {
       arr [ i ] = i ;
   }


   // 0 and 1 are not prime numbers by definition.
   arr [ 0 ] = false ;
   arr [ 1 ] = false ;


   // Calculate the integer part of the square root of 'max'.
   // We only need to check for prime factors up to this limit.
   var sqrt = Math . floor ( Math . sqrt ( max ) ) ;

   // Main loop of the Sieve algorithm.
   // Iterate from 2 up to the square root of 'max'.
   for ( var i = 2 ; i <= sqrt ; i ++ )
   {
      // If arr[i] is false, it means 'i' has already been marked as not prime.
      // So, we can skip it and move to the next number.
      if ( arr [ i ] == false )
      {
          continue ;
      }

      // If arr[i] is not false, then 'i' is a prime number.
      // Mark all multiples of 'i' (starting from i*i or i+i if you consider the first multiple after i itself)
      // as not prime.
      for ( var j = i + i ; j <= max ; j += i )
      {
         arr [ j ] = false ; // Mark as composite (not prime).
      }
   }

   // After the sieving process, collect all numbers that are still marked
   // as their original value (not 'false') into an object.
   var obj = { } ; // Object to store the prime numbers.

   for ( var i = 0 ; i <= max ; i ++ )
   {
      // If arr[i] is not false, then 'i' is a prime number.
      if ( arr [ i ] !== false )
      {
          obj [ arr [ i ] ] = true ; // Add the prime number to the object.
      }
   }

   return obj ; // Return the object containing all primes up to 'max'.
}


// Pre-compute prime numbers up to 1,000,000 using the 'prime' function.
// This object 'p' will be used later for quick prime checks.
var p = prime ( 1000000 ) ;

// Read all input from standard input ('/dev/stdin').
// This is a common pattern in competitive programming.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Process the input string:
// 1. Trim leading/trailing whitespace.
// 2. Split the string into an array of lines based on newline characters.
var Arr = ( input . trim ( ) ) . split ( "\n" ) ;


// Main loop to handle multiple test cases from the input.
// It continues indefinitely until a specific termination condition is met.
while ( true )
{
   // Read the first line of the current test case.
   // - `Arr.shift()` removes and returns the first line.
   // - `.split(" ")` splits the line by spaces into an array of strings.
   // - `.map(Number)` converts each string in the array to a number.
   var nx = Arr . shift ( ) . split ( " " ) . map ( Number ) ;

   // Extract the two numbers 'n' and 'x' from the processed line.
   var n = nx [ 0 ] ;
   var x = nx [ 1 ] ;

   // Check for the termination condition: if both 'n' and 'x' are 0.
   if ( n == 0 && x == 0 )
   {
       break ; // Exit the loop if the termination condition is met.
   }


   // Initialize a dynamic programming array 'dp'.
   // 'dp[k]' will be true if the sum 'k' can be formed, false otherwise.
   var dp = [ ] ;
   for ( var i = 0 ; i <= 1000000 ; i ++ )
   {
       dp [ i ] = false ; // Initialize all possible sums as unachievable.
   }


   // Initialize an array 'arr' to store the 'n' numbers for the current test case.
   var arr = [ ] ;

   // Read 'n' additional lines (numbers) for the current test case.
   for ( var i = 0 ; i < n ; i ++ )
   {
      // Read a number, convert it from string to number (using '- 0').
      var v = Arr . shift ( ) - 0 ;
      arr . push ( v ) ; // Add the number to the 'arr' for this test case.
      dp [ v ] = true ;  // Mark the individual number 'v' itself as an achievable sum.
   }

   // Base case for DP: A sum of 0 is always achievable (by choosing no numbers).
   dp [ 0 ] = true ;

   // Dynamic programming approach to find all achievable sums up to 'x'.
   // Iterate through all possible sums 'i' from 0 up to 'x'.
   for ( var i = 0 ; i <= x ; i ++ )
   {
      // For each possible sum 'i', iterate through all numbers 'arr[j]' available.
      for ( var j = 0 ; j < arr . length ; j ++ )
      {
         // If sum 'i' is achievable (dp[i] is true),
         // then 'i + arr[j]' is also an achievable sum.
         if ( dp [ i ] )
         {
             dp [ i + arr [ j ] ] = true ;
         }
      }
   }


   // Now, find the largest achievable sum 'i' (starting from 'x' downwards)
   // that is also a prime number.
   for ( var i = x ; i > 0 ; i -- )
   {
      // Check two conditions:
      // 1. `dp[i]` is true: meaning 'i' is an achievable sum.
      // 2. `p.hasOwnProperty(i)`: meaning 'i' is a prime number (checked against our pre-computed primes).
      if ( dp [ i ] && p . hasOwnProperty ( i ) )
      {
          break ; // Found the largest such prime sum, exit the loop.
      }
   }

   // Output the result based on the value of 'i' after the loop.
   // If 'i' is 0, it means no prime sum was found among the achievable sums.
   // Otherwise, 'i' holds the largest prime sum found.
   console . log ( ( i == 0 ) ? "NA" : i ) ;
}