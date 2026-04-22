/**
 * @file This script processes an array of numbers to find the maximum product of K elements.
 *       It includes custom modulo arithmetic and array manipulation functions.
 * @author Code Clone Expert
 * @version 1.0.0
 */

// The primary entry point for the program execution.
function Main(input) {
  // Define a large prime number for modulo operations.
  var C = 1e+9 + 7;   /*  Constant for modulo arithmetic.  */

  // Define another constant, likely used for splitting numbers in `kakeruR`.
  var C2 = 1e+5;      /*  A divisor constant.  */

  // Process the input string: trim whitespace, split by newlines,
  // then split each line by spaces.
  input = input . trim ( ) . split ( "\n" ) . map (
      function ( x ) {
        return x . split ( " " )
      }
  ) ;

  // Parse N, the total number of elements, from the first line of input.
  var N = parseInt(input[0][0], 10); /* Total elements count */
  // Parse K, the number of elements to select for the product, from the first line.
  var K = parseInt(input[0][1], 10); /* Elements to choose */

  // Convert the second line of input into an array of integers.
  var vec_A = input[1] . map ( e => parseInt ( e, 10 ) ) ; /* Array of numbers */

  // Sort the array `vec_A` based on the absolute values of its elements in descending order.
  // This prioritizes larger magnitude numbers for the product.
  vec_A . sort ( (a, b) => Math . abs ( b ) - Math . abs ( a ) ) ;

  // Calculate the answer using the `calc` function.
  var ans = calc ( vec_A, N, K, C, C2 ) ;

  // Print the final answer, ensuring it's within the modulo C.
  console . log ( mod ( ans, C ) ) ;
}


/**
 * Calculates the maximum product of K elements from vec_A, considering modulo C.
 * Handles cases where the product of the K largest absolute values might be negative.
 * @param {Array<number>} vec_A - The array of numbers.
 * @param {number} N - The total number of elements in vec_A.
 * @param {number} K - The number of elements to choose for the product.
 * @param {number} C - The modulo constant.
 * @param {number} C2 - A constant used in `kakeruR` for splitting numbers.
 * @returns {number} The maximum product modulo C.
 */
function calc ( vec_A, N, K, C, C2 ) {
    var ans = 1 ;            // Initialize product accumulator
    var minusCount = 0 ;     // Counter for negative numbers chosen
    var minPlus ;            // Index of the smallest positive number among the top K
    var minMinus ;           // Index of the smallest negative number among the top K

    // Iterate through the first K elements (largest absolute values)
    for ( var i = 0 ; i < K ; i ++ ) {
        // Multiply current answer by the element, applying modulo.
        ans = kakeruR ( ans, vec_A [ i ], C, C2 ) ;

        // If at any point the product becomes zero, the final answer is zero.
        if ( ans === 0 ) return 0 ;

        // Track the index of the smallest positive number chosen so far.
        if ( vec_A [ i ] > 0 ) minPlus = i ;
        // Track the index of the smallest negative number chosen so far and increment count.
        if ( vec_A [ i ] < 0 ) {
            minMinus = i ;
            minusCount ++ ;
        }
    }

    // If all elements are chosen, the current product is final.
    if ( K === N ) return ans ;

    // If the count of negative numbers is even, the product is positive, so it's the answer.
    if ( minusCount % 2 === 0 ) return ans ;

    // If the product is negative (odd number of negatives) and we can potentially improve it
    // by swapping a negative with a positive, or vice-versa.
    if ( minusCount < K ) {
        // This block handles the case where the current K product is negative,
        // and we try to make it positive by swapping elements.

        // Initialize temporary arrays to hold potential swap candidates.
        // [candidate_value, value_to_replace, index_of_candidate]
        var tmp01 = [ 0, -1 ] ; // For swapping a negative from top K with a positive from remaining
        var tmp02 = [ 0, -1 ] ; // For swapping a positive from top K with a negative from remaining

        // Find the first negative number in the remaining elements (K to N-1).
        // This would be a candidate to swap with `vec_A[minPlus]` (smallest positive in top K).
        for ( var i = K ; i < N ; i ++ ) {
            if ( vec_A [ i ] < 0 ) {
                tmp01 = [ vec_A [ i ], vec_A [ minPlus ], i ] ;
                break ; // Found the first negative, no need to search further.
            }
        }

        // Find the first positive number in the remaining elements (K to N-1).
        // This would be a candidate to swap with `vec_A[minMinus]` (smallest negative in top K).
        for ( var i = K ; i < N ; i ++ ) {
            if ( vec_A [ i ] > 0 ) {
                tmp02 = [ vec_A [ i ], vec_A [ minMinus ], i ] ;
                break ; // Found the first positive, no need to search further.
            }
        }

        // Compare potential swaps:
        // Option 1: Swap smallest positive from top K (`tmp01[1]`) with largest negative from remaining (`tmp01[0]`).
        // Option 2: Swap smallest negative from top K (`tmp02[1]`) with largest positive from remaining (`tmp02[0]`).
        // The condition checks which swap results in a larger product.
        // It compares (new_negative * old_negative) vs (new_positive * old_positive) in magnitude.
        if ( tmp01 [ 0 ] * tmp02 [ 1 ] >= tmp02 [ 0 ] * tmp01 [ 1 ] ) {
            // Perform swap for Option 1: Replace smallest positive in top K with a negative from remaining.
            vec_A . splice ( K, tmp01 [ 2 ] - K ) ; // Remove elements between K and tmp01[2] (inclusive)
            vec_A . splice ( minPlus, 1 ) ;          // Remove the smallest positive from top K
        } else {
            // Perform swap for Option 2: Replace smallest negative in top K with a positive from remaining.
            vec_A . splice ( K, tmp02 [ 2 ] - K ) ; // Remove elements between K and tmp02[2] (inclusive)
            vec_A . splice ( minMinus, 1 ) ;         // Remove the smallest negative from top K
        }

        // Re-calculate the product with the modified `vec_A` (which now has the K elements chosen).
        ans = 1 ;
        for ( var i = 0 ; i < K ; i ++ ) {
            ans = kakeruR ( ans, vec_A [ i ], C, C2 ) ;
            if ( ans === 0 ) return 0 ;
        }
        return ans ; // Return the new product.

    } else {
        // This block handles the case where all K chosen elements are negative,
        // and the product is negative. We must make it positive if possible.

        // Search for a positive number in the remaining elements.
        for ( var i = K ; i < N ; i ++ ) {
            if ( vec_A [ i ] >= 0 ) {
                // If a positive number is found, swap the smallest negative from top K with this positive.
                vec_A . splice ( K, i - K ) ;       // Remove elements between K and i (inclusive)
                vec_A . splice ( minMinus, 1 ) ;    // Remove the smallest negative from top K

                // Recalculate product with the new set of K elements.
                ans = 1 ;
                for ( var i = 0 ; i < K ; i ++ ) {
                    ans = kakeruR ( ans, vec_A [ i ], C, C2 ) ;
                    if ( ans === 0 ) return 0 ;
                }
                return ans ; // Return the new (now positive) product.
            }
        }

        // If no positive number was found in the remaining elements (meaning all remaining are negative or zero),
        // then all N elements are negative or zero.
        // In this scenario, to get the maximum product for K numbers,
        // we must choose the K numbers with the smallest absolute values (largest in magnitude, but closest to zero).
        // This will result in the "least negative" product if K is odd, or "most positive" if K is even.
        ans = 1 ;
        for ( var i = N - 1 ; i >= ( N - K ) ; i -- ) { // Iterate from the end of the sorted array.
            ans = kakeruR ( ans, vec_A [ i ], C, C2 ) ;
        }
        return ans ; // Return the product of the K smallest absolute value numbers.
    }
}


/**
 * Performs modular multiplication (a * b) % C efficiently,
 * especially useful for large numbers by splitting 'b'.
 * @param {number} a - The first operand.
 * @param {number} b - The second operand.
 * @param {number} C - The modulo constant.
 * @param {number} C2 - A constant used to split 'b'.
 * @returns {number} The result of (a * b) % C.
 */
function kakeruR ( a, b, C, C2 ) {
    var tmpQ, tmpR, ans ; // Declare temporary variables

    // Split 'b' into quotient (tmpQ) and remainder (tmpR) using C2.
    // This helps prevent overflow during intermediate calculations for large 'b'.
    tmpQ = ( b / C2 | 0 ) ;          // Integer division for quotient.
    tmpR = b - ( tmpQ * C2 ) ;       // Remainder.

    // Calculate (a * b) % C using the split 'b'.
    // (a * (tmpQ * C2 + tmpR)) % C
    // = ((a * tmpQ * C2) % C + (a * tmpR) % C) % C
    ans = ( ( a * tmpQ % C ) * C2 % C ) + ( a * tmpR ) ;

    // Ensure the final result is within the modulo C.
    ans %= C ;
    return ans ;
}


/**
 * Computes the modulo of i with j, ensuring a positive result.
 * Standard JavaScript '%' operator can return negative results for negative i.
 * @param {number} i - The dividend.
 * @param {number} j - The divisor.
 * @returns {number} The positive modulo result.
 */
function mod ( i, j ) {
    // If (i % j) is negative, add j (or -j if j is negative) to make it positive.
    return ( i % j ) < 0 ? ( i % j ) + 0 + ( j < 0 ? -j : j ) : ( i % j + 0 ) ;
}


// Read input from standard input and pass it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin", "utf8" ) ) ;