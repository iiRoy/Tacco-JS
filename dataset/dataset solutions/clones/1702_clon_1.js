/*
 * This JavaScript file implements a solution for a problem that involves
 * selecting K numbers from an array N and maximizing their product modulo C.
 * The core logic handles sorting by absolute value and specific swaps
 * to ensure a positive product when necessary.
 *
 * Author: AI Code Clone Generator
 * Date: 2023-10-27
 * Version: 1.0
 */

function Main ( input )
{
  // Define constants for modular arithmetic operations.
  // C is the primary modulus value.
  var C = 1e+9 + 7 ;

  // C2 is an auxiliary constant used within the modular multiplication function (kakeruR)
  // to prevent potential intermediate overflows when multiplying large numbers.
  var C2 = 1e+5 ;


  // --- Input Processing Section ---
  // 1. input.trim(): Removes any leading or trailing whitespace from the input string.
  // 2. .split("\n"): Splits the cleaned input string into an array of strings,
  //    where each element is a line from the original input.
  // 3. .map(function(x) { return x.split(" ") }): Iterates over each line.
  //    For each line (x), it splits that line by spaces, creating an array of strings.
  //    The result is a 2D array of strings.
  input = input . trim ( ) . split ( "\n" ) . map ( function ( x ) {
    return x . split ( " " )
  } ) ;


  // Parse N (total number of elements) and K (number of elements to select)
  // from the first line of the processed input.
  var N = parseInt ( input [ 0 ] [ 0 ] , 10 ) ; // N is the first number on the first line.
  var K = parseInt ( input [ 0 ] [ 1 ] , 10 ) ; // K is the second number on the first line.


  // Parse the array vec_A from the second line of the input.
  // .map(e => parseInt(e, 10)): Converts each string element 'e' into an integer.
  var vec_A = input [ 1 ] . map ( e => parseInt ( e , 10 ) ) ;


  // Sort the array vec_A in descending order based on the absolute values of its elements.
  // This sorting strategy is fundamental to the algorithm's greedy approach.
  vec_A . sort ( ( a , b ) => Math . abs ( b ) - Math . abs ( a ) ) ;


  // Call the main calculation function 'calc' with the prepared data.
  // The result, 'ans', will be the product of K selected numbers, possibly adjusted.
  var ans = calc ( vec_A , N , K , C , C2 ) ;

  // Output the final answer to the console.
  // The 'mod' function ensures the result is always non-negative and within the [0, C-1] range.
  console . log ( mod ( ans , C ) ) ;

} // End of Main function definition


/*
 * This function determines the product of K elements from vec_A,
 * aiming for the maximum possible value modulo C. It includes
 * complex logic for handling negative numbers and ensuring a positive product
 * if an odd number of negatives are initially selected.
 *
 * @param {Array<number>} vec_A - The input array of numbers, already sorted by absolute value.
 * @param {number} N - The total number of elements in vec_A.
 * @param {number} K - The number of elements to select.
 * @param {number} C - The modulo constant.
 * @param {number} C2 - An auxiliary constant for modular multiplication.
 * @returns {number} The maximum product of K elements modulo C.
 */
function calc ( vec_A , N , K , C , C2 )
{
   var ans = 1 ;          // Initialize the product accumulator to 1.
   var minusCount = 0 ;   // Tracks the count of negative numbers among the first K elements.

   var minPlus ;          // Stores the index of the element with the smallest positive value
                          // among the first K elements (which means it has the smallest abs value among positives).
   var minMinus ;         // Stores the index of the element with the smallest negative value
                          // among the first K elements (which means it has the smallest abs value among negatives).


   // --- Initial Selection Loop ---
   // Iterate through the first K elements of the (absolute-value-sorted) array vec_A.
   // These are initially chosen as they have the largest absolute values.
   for ( var i = 0 ; i < K ; i ++ )
   {
      // Multiply the current product 'ans' by the current element vec_A[i]
      // using the modular multiplication utility function.
      ans = kakeruR ( ans , vec_A [ i ] , C , C2 ) ;

      // If the product becomes 0 at any point, the final result will be 0.
      // This is an early exit optimization.
      if ( ans === 0 )
      {
         return 0 ;
      }

      // If the current element is positive, update minPlus to its index.
      // Since we iterate from largest absolute value down, minPlus will hold the index
      // of the positive number with the smallest absolute value among the first K.
      if ( vec_A [ i ] > 0 )
      {
         minPlus = i ;
      }

      // If the current element is negative, update minMinus and increment minusCount.
      // Similar to minPlus, minMinus will hold the index of the negative number
      // with the smallest absolute value among the first K.
      if ( vec_A [ i ] < 0 )
      {
         minMinus = i ;
         minusCount ++ ;
      }
   } // End of the initial K-element selection loop.


   // --- Edge Cases and Optimization Checks ---

   // Case 1: If K is equal to N, all elements have been selected.
   // The current 'ans' is the final product.
   if ( K === N )
   {
     return ans ;
   }

   // Case 2: If the count of negative numbers among the first K is even,
   // the product 'ans' is already positive (or zero). This is the optimal result.
   if ( minusCount % 2 === 0 )
   {
     return ans ;
   }


   // --- Handling Odd Number of Negatives ---
   // If we reach here, it means 'minusCount' is odd, making the current 'ans' negative.
   // We need to perform a swap to make the product positive and maximize its value.

   // Sub-case 1: There are some positive numbers within the first K elements (minusCount < K).
   // This means we have a mix of positive and negative numbers in our initial K selection.
   // We can try to swap a negative from the K selected with a positive from outside K,
   // OR swap a positive from the K selected with a negative from outside K.
   if ( minusCount < K )
   {
      // tmp01: [external_negative_candidate, internal_positive_to_swap, external_negative_index]
      // tmp02: [external_positive_candidate, internal_negative_to_swap, external_positive_index]
      var tmp01 = [ 0 , 0 , -1 ] ;
      var tmp02 = [ 0 , 0 , -1 ] ;

      // Search for the first negative number outside the initial K elements.
      // This will be the negative number with the smallest absolute value among the unselected.
      for ( var i = K ; i < N ; i ++ )
      {
         if ( vec_A [ i ] < 0 )
         {
            tmp01 = [ vec_A [ i ] , vec_A [ minPlus ] , i ] ;
            break ; // Found it, no need to search further.
         }
      }

      // Search for the first positive number outside the initial K elements.
      // This will be the positive number with the smallest absolute value among the unselected.
      for ( var i = K ; i < N ; i ++ )
      {
         if ( vec_A [ i ] > 0 )
         {
            tmp02 = [ vec_A [ i ] , vec_A [ minMinus ] , i ] ;
            break ; // Found it.
         }
      }

      // Decision logic: Determine which swap (if any) yields the maximum positive product.
      // Comparison is done using BigInt to prevent potential overflow during intermediate product calculation.
      if ( tmp02 [ 2 ] === -1 )
      {
         // Scenario: No positive number found outside the K selected elements.
         // Only option is to swap an internal positive with an external negative.
         // Remove the elements from K up to tmp01[2] (the external negative)
         // and then remove the internal positive element at minPlus.
         vec_A . splice ( K , tmp01 [ 2 ] - K ) ;
         vec_A . splice ( minPlus , 1 ) ;
      }
      else if ( tmp01 [ 2 ] === -1 )
      {
         // Scenario: No negative number found outside the K selected elements.
         // Only option is to swap an internal negative with an external positive.
         // Remove elements from K up to tmp02[2] (the external positive)
         // and then remove the internal negative element at minMinus.
         vec_A . splice ( K , tmp02 [ 2 ] - K ) ;
         vec_A . splice ( minMinus , 1 ) ;
      }
      // Scenario: Both types of swaps are possible. Compare their potential product impact.
      // We want to maximize the product. (external_negative * internal_negative) vs (external_positive * internal_positive)
      // Since we want to make the product positive, we're effectively comparing:
      // (vec_A[i_neg_outside] * vec_A[i_pos_inside]) vs (vec_A[i_pos_outside] * vec_A[i_neg_inside])
      else if ( BigInt ( tmp01 [ 0 ] ) * BigInt ( tmp02 [ 1 ] ) >= BigInt ( tmp02 [ 0 ] ) * BigInt ( tmp01 [ 1 ] ) )
      {
         // If swapping an internal positive for an external negative yields a better or equal result.
         vec_A . splice ( K , tmp01 [ 2 ] - K ) ;
         vec_A . splice ( minPlus , 1 ) ;
      }
      else
      {
         // Otherwise, swapping an internal negative for an external positive is better.
         vec_A . splice ( K , tmp02 [ 2 ] - K ) ;
         vec_A . splice ( minMinus , 1 ) ;
      }

      // After performing the optimal swap, recalculate the product of the first K elements.
      ans = 1 ;
      for ( var i = 0 ; i < K ; i ++ )
      {
         ans = kakeruR ( ans , vec_A [ i ] , C , C2 ) ;
         if ( ans === 0 )
         {
           return 0 ;
         }
      }
      return ans ; // Return the newly calculated (and now positive) product.

   } // End of 'if (minusCount < K)' block.

   // Sub-case 2: All K selected numbers are negative (minusCount == K).
   // The product is currently negative. We must replace one of the K negatives
   // with a non-negative number from outside K to make the product positive.
   else
   {
      // Search for the first non-negative number (positive or zero) outside the initial K elements.
      for ( var i = K ; i < N ; i ++ )
      {
         if ( vec_A [ i ] >= 0 )
         {
            // Found a non-negative number.
            // Remove elements from K up to the found non-negative number (vec_A[i]).
            // Then remove the negative number with the smallest absolute value from the initial K.
            vec_A . splice ( K , i - K ) ;
            vec_A . splice ( minMinus , 1 ) ;

            // Recalculate the product of the modified first K elements.
            ans = 1 ;
            for ( var i = 0 ; i < K ; i ++ )
            {
               ans = kakeruR ( ans , vec_A [ i ] , C , C2 ) ;
               if ( ans === 0 )
               {
                 return 0 ;
               }
            }
            return ans ; // Return the new positive product.
         }
      }

      // If no non-negative numbers are found outside the first K (meaning all remaining numbers are negative),
      // then to get the largest possible product (which will still be negative),
      // we must select the K numbers with the smallest absolute values from the entire array.
      // These are located at the end of the absolute-value-sorted array.
      ans = 1 ;
      for ( var i = N - 1 ; i >= ( N - K ) ; i -- )
      {
         ans = kakeruR ( ans , vec_A [ i ] , C , C2 ) ;
      }
      return ans ; // Return the product of the K smallest absolute values (all negative).
   }

} // End of calc function definition


/**
 * Performs modular multiplication (a * b) % C,
 * designed to handle potentially large values of 'b' by splitting it.
 * This helps prevent intermediate integer overflows before the modulo operation.
 *
 * @param {number} a - The first operand.
 * @param {number} b - The second operand.
 * @param {number} C - The modulo value (e.g., 1e9 + 7).
 * @param {number} C2 - A constant (e.g., 1e5) used to split 'b' into parts.
 * @returns {number} The result of (a * b) % C.
 */
function kakeruR ( a , b , C , C2 )
{
    var tmpQ , tmpR , ans ; // Declare variables: quotient, remainder, and final answer.

    // Calculate the quotient (tmpQ) of b divided by C2.
    // The bitwise OR 0 ( | 0 ) truncates the result to an integer,
    // effectively acting as Math.floor() for positive numbers.
    tmpQ = ( b / C2 | 0 ) ;

    // Calculate the remainder (tmpR) of b divided by C2.
    tmpR = b - ( tmpQ * C2 ) ;


    // Compute the modular product using the split 'b' (tmpQ * C2 + tmpR).
    // This breaks down (a * b) % C into:
    // ( (a * tmpQ % C) * C2 % C + (a * tmpR) % C ) % C
    // This approach keeps intermediate products smaller, reducing overflow risk.
    ans = ( a * tmpQ % C ) * C2 % C + ( a * tmpR ) ;

    // Apply the modulo operation one final time to ensure the result is within [0, C-1].
    ans %= C ;

    return ans ; // Return the computed modular product.
}


/*
 * This utility function calculates the true mathematical modulo,
 * ensuring a non-negative result even if the dividend 'i' is negative.
 * JavaScript's '%' operator can return a negative value if the dividend is negative.
 *
 * @param {number} i - The dividend.
 * @param {number} j - The divisor.
 * @returns {number} The result of i modulo j, always non-negative.
 */
function mod ( i , j )
{
 // If (i % j) is negative, add j (or -j if j is negative) to make it positive.
 // The '+ 0' is a no-op but maintains the exact expression from the original code.
 return ( i % j ) < 0 ? ( i % j ) + 0 + ( j < 0 ? -j : j ) : ( i % j + 0 ) ;
}


// --- Program Entry Point ---
// This line executes the Main function by reading input from standard input.
// require("fs").readFileSync("/dev/stdin", "utf8")
//   - "fs" is the Node.js file system module.
//   - .readFileSync() reads a file synchronously.
//   - "/dev/stdin" is a common path for standard input in Unix-like systems.
//   - "utf8" specifies the character encoding for the input.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;