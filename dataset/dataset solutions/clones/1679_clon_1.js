"use strict"
// Enable strict mode for cleaner code and error prevention.


// Standard input setup:
// Reads the entire content of stdin synchronously.
var input = require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) ;

// `cin` (console input) stores parsed tokens.
// `cid` (console input index) tracks the current token.
var cin = input . split( / |\n/ ) , cid = 0 ;


// Function to get the next number from `cin`.
// The unary plus operator `+` converts the string token to a number.
function next ( ) {
   return + cin [ cid ++ ] ;
}


// Function to get the next string token from `cin`.
function nextstr ( ) {
   return cin [ cid ++ ] ;
}


// Function to get the next BigInt from `cin`.
function nextbig ( ) {
   return BigInt ( cin [ cid ++ ] ) ;
}


// Function to get 'n' subsequent tokens.
// If 'a' is true, tokens are returned as strings.
// Otherwise, they are converted to numbers.
function nexts ( n , a ) {
   return a
      ? cin . slice ( cid , cid += n )
      : cin . slice ( cid , cid += n ) . map ( a => + a ) ;
}


// Function to get a 2D matrix (h rows, w columns) of tokens.
// If 'a' is true, elements are strings.
// Otherwise, they are numbers.
function nextm ( h , w , a ) {

   var r = [ ] , i = 0 ;

   if ( a ) {
      // If 'a' is true, store as strings.
      for ( ; i < h ; i ++ ) {
         r . push ( cin . slice ( cid , cid += w ) ) ;
      }
   } else {
      // Otherwise, convert to numbers.
      for ( ; i < h ; i ++ ) {
         r . push ( cin . slice ( cid , cid += w ) . map ( a => + a ) ) ;
      }
   }

   return r ;
}


// Function to create a multi-dimensional array initialized with a value.
// It uses `eval` for dynamic array creation based on arguments.
function xArray ( v ) {

   var a = arguments ,
       l = a . length ,
       r = "Array(a[" + -- l + "]).fill().map(x=>{return " + v + ";})" ;

   while ( -- l ) {
      r = "Array(a[" + l + "]).fill().map(x=>" + r + ")" ;
   }

   return eval ( r ) ;
}


// Call the main function and store its result.
var myOut = main ( ) ;

// If the main function returned a value, print it to console.
if ( myOut !== undefined ) {
   console . log ( String ( myOut ) ) ;
}




/**
 * Main function where the core logic resides.
 * It solves a problem related to binary strings and bit counts.
 */
function main ( ) {

   // Read the length of the binary string.
   var n = next ( ) ;
   // Read the binary string itself.
   var x = nextstr ( ) ;

   // Initialize 'bc' (bit count) to 1.
   // This will store the count of '1's in 'x' plus one.
   var bc = 1 ;

   // Count the number of '1's in the string 'x'.
   // Increment 'bc' for each '1' found.
   for ( var i = 0 ; i < n ; i ++ ) {
      if ( x [ i ] === "1" ) {
         bc ++ ;
      }
   }


   // Initialize an array 'ans' of size 'n' with zeros.
   // This array will store the final results.
   var ans = xArray ( 0 , n ) ;


   // Calculate the initial modulo for operations where a '0' is flipped to '1'.
   // This 'm1' is the integer value of 'x' modulo 'bc'.
   var m1 = 0 ;

   for ( var i = 0 ; i < n ; i ++ ) {
      m1 *= 2 ;          // Shift left (multiply by 2).
      m1 += + x [ i ] ;  // Add the current bit (converted to number).
      m1 %= bc ;         // Take modulo 'bc'.
   }


   // 'c' is a power of 2 modulo 'bc', used for calculating contributions of each bit.
   var c = 1 ;


   // First pass: Iterate from right to left (n-1 down to 0).
   // This loop handles cases where a '0' at index 'i' is flipped to '1'.
   for ( var i = n ; i -- ; ) {

      // If the current bit is '0'.
      if ( x [ i ] === "0" ) {

         // Initialize the answer for this position to 1.
         ans [ i ] = 1 ;

         // 't' represents the new number's value modulo 'bc'.
         // It's the original 'm1' plus the contribution of flipping the '0' at 'i' to '1'.
         // The contribution is 'c' (which is 2^(n-1-i) % bc).
         var t = m1 + c ;
         t %= bc ;

         // Perform operations until 't' becomes zero.
         // This calculates the number of steps required.
         while ( t ) {
            t %= bitcount ( t ) ; // New 't' is 't' modulo its bit count.
            ans [ i ] ++ ;       // Increment the step count.
         }
      }

      // Update 'c' for the next iteration (next position to the left).
      // 'c' becomes 2 * c % bc.
      c = c * 2 % bc ;
   }


   // Adjust 'bc' for the second pass.
   // The 'bc' for the second pass is the original count of '1's minus one.
   bc -= 2 ;

   // If 'bc' becomes less than 1, it means there was only one '1' in the original string (or zero '1's if bc started at 1).
   // In this specific edge case, the modulo operation would be by 0, which is undefined.
   // The problem statement implies this means the answer is simply what we've calculated so far.
   if ( bc < 1 ) {
      return ans . join ( "\n" ) ;
   }


   // Recalculate 'm1' for the second pass.
   // This 'm1' is the integer value of 'x' modulo the new 'bc'.
   m1 = 0 ;

   for ( var i = 0 ; i < n ; i ++ ) {
      m1 *= 2 ;
      m1 += + x [ i ] ;
      m1 %= bc ;
   }


   // 'c' is reset, but now it starts from (bc - 1) for the second pass's modulo logic.
   // This 'c' represents -2^(n-1-i) % bc, or (bc - (2^(n-1-i) % bc)) % bc
   c = bc - 1 ;


   // Second pass: Iterate from right to left again.
   // This loop handles cases where a '1' at index 'i' is flipped to '0'.
   for ( var i = n ; i -- ; ) {

      // If the current bit is '1'.
      if ( x [ i ] === "1" ) {

         // Initialize the answer for this position to 1.
         ans [ i ] = 1 ;

         // 't' represents the new number's value modulo 'bc'.
         // It's the original 'm1' minus the contribution of flipping the '1' at 'i' to '0'.
         // Subtracting is equivalent to adding (bc - contribution) % bc.
         var t = m1 + c ;
         t %= bc ;

         // Perform operations until 't' becomes zero.
         while ( t ) {
            t %= bitcount ( t ) ;
            ans [ i ] ++ ;
         }
      }

      // Update 'c' for the next iteration.
      // 'c' becomes (c * 2) % bc, but due to its initial value (bc-1), it correctly represents -2^(n-1-i) % bc.
      c = c * 2 % bc ;
   }


   // Join the elements of the 'ans' array with newlines and return the final string.
   return ans . join ( "\n" ) ;
}


/**
 * Computes the population count (number of set bits) of an integer.
 * This function uses a series of bit manipulation tricks (SWAR algorithm)
 * to efficiently count the set bits.
 *
 * @param {number} bits - The integer whose set bits are to be counted.
 * @returns {number} The number of set bits in the input integer.
 */
function bitcount ( bits ) {

   // Step 1: Sum 2-bit pairs.
   // bits = (bits & 01010101_2) + ((bits >> 1) & 01010101_2)
   bits = ( bits & 0x55555555 ) + ( bits >> 1 & 0x55555555 ) ;

   // Step 2: Sum 4-bit nibbles.
   // bits = (bits & 00110011_2) + ((bits >> 2) & 00110011_2)
   bits = ( bits & 0x33333333 ) + ( bits >> 2 & 0x33333333 ) ;

   // Step 3: Sum 8-bit bytes.
   // bits = (bits & 00001111_2) + ((bits >> 4) & 00001111_2)
   bits = ( bits & 0x0f0f0f0f ) + ( bits >> 4 & 0x0f0f0f0f ) ;

   // Step 4: Sum 16-bit half-words.
   // bits = (bits & 0000000011111111_2) + ((bits >> 8) & 0000000011111111_2)
   bits = ( bits & 0x00ff00ff ) + ( bits >> 8 & 0x00ff00ff ) ;

   // Step 5: Sum 32-bit word.
   // The final sum is across the entire 32-bit integer.
   return ( bits & 0x0000ffff ) + ( bits >> 16 & 0x0000ffff ) ;
}