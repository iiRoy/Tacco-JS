let input = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )

// This comment describes the constraints for x, y, and z variables later on.
// 1 <= x <= y <= z <= 100
// These constraints are important for the nested loops in the main function.

function main ( ) {

    const [ N ] = load ( ) ; // Load the input value N.

    // Initialize an array to store results.
    // The size is N + 1 because we use 1-based indexing for n.
    let result = new Array ( N + 1 ) . fill ( 0 ) ;


    // The main logic involves three nested loops to iterate through x, y, z.
    // The outer loop iterates from n = 1 up to N.
    for ( let n = 1 ; n <= N ; n ++ ) {

        // Inner loop for x, ranging from 1 to 100.
        for ( let x = 1 ; x <= 100 ; x ++ ) {
            const xx = x * x ; // Calculate x squared once for efficiency.

            // Loop for y, starting from x to ensure y >= x.
            for ( let y = x ; y <= 100 ; y ++ ) {
                const yy = y * y ; // Calculate y squared.

                // Loop for z, starting from y to ensure z >= y.
                for ( let z = y ; z <= 100 ; z ++ ) {

                    // Calculate the value n2 based on the given formula.
                    // This formula is specific to the problem being solved.
                    const n2 = xx + yy + z * z + x * y + y * z + z * x ;

                    // Optimization: if n2 exceeds n, further increments of z will also exceed n.
                    // So, we can break from this innermost loop.
                    if ( n2 > n ) break ;


                    // If n2 matches n, we found a combination.
                    if ( n2 == n ) {
                        // Distinguish cases based on equality of x, y, z
                        // to apply the correct multiplier (1, 3, or 6).

                        if ( x == y && y == z ) {
                            // All three variables are equal.
                            result [ n ] += 1 ; // Add 1 to the count.
                        } else if ( x == y || y == z || z == x ) {
                            // Exactly two variables are equal.
                            result [ n ] += 3 ; // Add 3 to the count.
                        } else {
                            // All three variables are distinct.
                            result [ n ] += 6 ; // Add 6 to the count.
                        }

                        // After finding a match for a given (x, y), we can break
                        // from the z loop because further z values would make n2 larger.
                        // This optimization is crucial for performance.
                        break ;
                    }
                } // End of z loop
            } // End of y loop
        } // End of x loop
    } // End of n loop

    // Prepare the final output:
    // Slice the result array from index 1 (excluding index 0)
    // and join elements with newline characters.
    return result . slice ( 1 ) . join ( '\n' ) ;
}


/*
 * Helper Utility Functions:
 * This section contains various utility functions that might be used across different problems.
 *
 * - load(rows, cols, type): Reads input values from the global 'inputs' array.
 *   - @param {number} rows - Number of rows to read.
 *   - @param {number} cols - Number of columns to read.
 *   - @param {Function} type - Type conversion function (e.g., Number, String).
 *   - @returns {Array|any} - Parsed input data.
 *
 * - yesno(boolean): Returns 'Yes' or 'No' based on a boolean value.
 *   - @param {boolean} value - The boolean to check.
 *   - @returns {string} - 'Yes' if true, 'No' if false.
 *
 * - array_sum(numbers): Calculates the sum of numbers in an array.
 *   - @param {Array<number>} numbers - An array of numbers.
 *   - @returns {number} - The sum.
 *
 * - inifinite_loop_preventer(max): A safety mechanism for infinite loops.
 *   - @param {number} max - Maximum iterations before throwing an error.
 *
 * - array_max(numbers, initial_value): Finds the maximum value in an array.
 *   - @param {Array<number>} numbers - The array to search.
 *   - @param {number|null} initial_value - Optional initial value for comparison.
 *   - @returns {number} - The maximum value.
 *
 * - array_min(numbers, initial_value): Finds the minimum value in an array.
 *   - @param {Array<number>} numbers - The array to search.
 *   - @param {number|null} initial_value - Optional initial value for comparison.
 *   - @returns {number} - The minimum value.
 *
 * - log_obj(value): Logs a deep copy of an object to the console.
 *   - @param {any} value - The value to log.
 *
 * - math_prime_factors(n): Performs prime factorization of a number.
 *   - @param {number} n - The number to factorize.
 *   - @returns {Object<number, number>} - An object where keys are prime factors and values are their powers.
 *
 * - new_array_2d(x_len, y_len, init_value): Creates a 2D array.
 *   - @param {number} x_len - Number of rows.
 *   - @param {number} y_len - Number of columns.
 *   - @param {any} init_value - Initial value for elements.
 *   - @returns {Array<Array<any>>} - The 2D array.
 *
 * - gcd(a, b): Calculates the greatest common divisor of two numbers.
 *   - @param {number} a - First number.
 *   - @param {number} b - Second number.
 *   - @returns {number} - GCD.
 *
 * - lcm(a, b): Calculates the least common multiple of two numbers.
 *   - @param {number} a - First number.
 *   - @param {number} b - Second number.
 *   - @returns {number} - LCM.
 *
 * - check_if_superset(set, subset): Checks if 'subset' is a subset of 'set'.
 *   - @param {Set<any>} set - The potential superset.
 *   - @param {Set<any>} subset - The potential subset.
 *   - @returns {boolean} - True if subset is a subset, false otherwise.
 *
 * - set_union(a, b): Computes the union of two sets.
 *   - @param {Set<any>} a - First set.
 *   - @param {Set<any>} b - Second set.
 *   - @returns {Set<any>} - Union set.
 *
 * - set_intersection(a, b): Computes the intersection of two sets.
 *   - @param {Set<any>} a - First set.
 *   - @param {Set<any>} b - Second set.
 *   - @returns {Set<any>} - Intersection set.
 *
 * - set_symmetric_difference(a, b): Computes the symmetric difference of two sets.
 *   - @param {Set<any>} a - First set.
 *   - @param {Set<any>} b - Second set.
 *   - @returns {Set<any>} - Symmetric difference set.
 *
 * - set_difference(a, b): Computes the difference of two sets (elements in a but not in b).
 *   - @param {Set<any>} a - First set.
 *   - @param {Set<any>} b - Second set.
 *   - @returns {Set<any>} - Difference set.
 *
 * - set_combinations(array, count): Generates all combinations of 'count' elements from 'array'.
 *   - @param {Array<any>} array - The source array.
 *   - @param {number} count - The number of elements to pick for each combination.
 *   - @returns {Array<Array<any>>} - An array of combination arrays.
 *
 * - math_permutation(n, r): Calculates permutations P(n, r).
 *   - @param {number} n - Total number of items.
 *   - @param {number} r - Number of items to choose.
 *   - @returns {number} - P(n, r).
 *
 * - math_combination(n, r): Calculates combinations C(n, r).
 *   - @param {number} n - Total number of items.
 *   - @param {number} r - Number of items to choose.
 *   - @returns {number} - C(n, r).
 */


let inputs = input . split ( /[\s\n]/ ) ; // Split the raw input string by whitespace or newlines.
let inifinite_loop_prevent_counter = 0 ; // Initialize counter for infinite loop prevention.
let result = main ( ) ; // Execute the main function to get the solution.
console . log ( result ) ; // Output the final result to the console.

if ( result === undefined ) { // Basic error check for main function's return value.
    console . warn ( "result is undefined" ) ; // Warn if the result is unexpectedly undefined.
}
// console.timeEnd() // This line is commented out; it was likely used for performance timing.


// Function to load input values from the 'inputs' array.
function load ( rows = 1 , cols = 1 , type = Number ) {
    const length = rows * cols ; // Calculate total number of elements to read.
    let result = inputs . splice ( 0 , length ) ; // Extract elements from the global 'inputs' array.

    if ( type !== String ) { // If the desired type is not String,
        result = result . map ( type ) ; // apply the type conversion function to each element.
    }
    if ( cols > 1 ) { // If multiple columns are expected, reshape into a 2D array.
        const arrays = new Array ( cols ) ; // Create an array to hold columns.
        for ( let col = 0 ; col < cols ; col ++ ) {
            arrays [ col ] = new Array ( ) ; // Initialize each column as an empty array.
            for ( let row = 0 ; row < rows ; row ++ ) {
                arrays [ col ] . push ( result [ row * cols + col ] ) ; // Populate with values.
            }
        }
        result = arrays ; // Update result to be the 2D array.
    }

    return result ; // Return the processed input.
}

// Determines if a value is Truthy or Falsy and returns 'Yes' or 'No'.
function yesno ( value ) {
    return value ? 'Yes' : 'No' ;
}

// Calculates the sum of all numbers in an array using reduce.
function array_sum ( numbers ) {
    return numbers . reduce ( ( acc , cur ) => acc + cur , 0 ) ;
}

// Increments a global counter and throws an error if it exceeds a maximum.
// Useful for debugging potential infinite loops.
function inifinite_loop_preventer ( max = 1e5 ) {
    inifinite_loop_prevent_counter ++ ;
    if ( inifinite_loop_prevent_counter >= max ) {
        throw new Error ( "Infinite loop detected: counter exceeded " + max ) ;
    }
}

// Finds the maximum value within an array of numbers.
function array_max ( numbers , initial_value = null ) {
    let result = ( initial_value === null ) ? numbers [ 0 ] : initial_value ; // Set initial comparison value.
    for ( const n of numbers ) { // Iterate through the numbers.
        if ( n > result ) {
            result = n ; // Update result if a larger number is found.
        }
    }
    return result ;
}

// Finds the minimum value within an array of numbers.
function array_min ( numbers , initial_value = null ) {
    let result = ( initial_value === null ) ? numbers [ 0 ] : initial_value ; // Set initial comparison value.
    for ( const n of numbers ) { // Iterate through the numbers.
        if ( n < result ) {
            result = n ; // Update result if a smaller number is found.
        }
    }
    return result ;
}

// Logs a deep copy of an object to the console, preventing mutable object issues.
function log_obj ( value ) {
    console . log ( JSON . parse ( JSON . stringify ( value ) ) ) ;
}

// Computes the prime factorization of a given number n.
// Returns an object where keys are prime factors and values are their exponents.
function math_prime_factors ( n ) {
    const result = { } ; // Initialize an empty object for factors.

    // Iterate from 2 up to sqrt(n).
    for ( let i = 2 ; i * i <= n ; i ++ ) {
        if ( n % i === 0 ) { // If i is a factor.
            n /= i ; // Divide n by i.
            result [ i ] = 1 ; // Initialize count for this prime factor.

            while ( n % i === 0 ) { // While i is still a factor.
                n /= i ; // Continue dividing.
                result [ i ] ++ ; // Increment the count.
            }
        }
    }

    if ( n > 1 ) { // If n is still greater than 1, it must be a prime factor itself.
        result [ n ] = 1 ;
    }

    return result ; // Return the factorization object.
}

// Creates a new 2D array with specified dimensions and initial values.
function new_array_2d ( x_len , y_len = 0 , init_value = 0 ) {

    const array = new Array ( ) ; // Main array to hold rows.
    for ( let i = 0 ; i < x_len ; i ++ ) {
        // Create a row; if y_len is specified, fill it; otherwise, it's an empty array.
        const y = y_len ? new Array ( y_len ) . fill ( init_value ) : new Array ( ) ;
        array . push ( y ) ; // Add the row to the 2D array.
    }

    return array ; // Return the newly created 2D array.
}

// Computes the Greatest Common Divisor (GCD) using the Euclidean algorithm.
function gcd ( a , b ) {
    if ( b === 0 ) return a ; // Base case.
    return gcd ( b , a % b ) ; // Recursive step.
}

// Computes the Least Common Multiple (LCM) of two numbers.
// Uses the formula: LCM(a, b) = (a * b) / GCD(a, b).
function lcm ( a , b ) {
    const g = ( n , m ) => m ? g ( m , n % m ) : n ; // Inline GCD helper.
    return a * b / g ( a , b ) ;
}

// Checks if 'subset' is a proper subset of 'set'.
// Returns true if all elements of 'subset' are present in 'set'.
function check_if_superset ( set , subset ) {
    for ( let el of subset ) { // Iterate through elements of the potential subset.
        if ( ! set . has ( el ) ) { // If any element is not in the 'set'.
            return false ; // It's not a subset.
        }
    }
    return true ; // All elements were found, so it is a subset.
}

// Computes the union of two sets.
function set_union ( a , b ) {
    const result = new Set ( a ) ; // Start with all elements from set 'a'.
    for ( const el of b ) { // Add all elements from set 'b'.
        result . add ( el ) ;
    }
    return result ; // Return the combined set.
}

// Computes the intersection of two sets.
function set_intersection ( a , b ) {
    let result = new Set ( ) ; // Initialize an empty set for the intersection.
    for ( let el of b ) { // Iterate through elements of set 'b'.
        if ( a . has ( el ) ) { // If an element from 'b' is also in 'a'.
            result . add ( el ) ; // Add it to the intersection.
        }
    }
    return result ; // Return the intersection set.
}

// Computes the symmetric difference of two sets.
// Elements that are in either set, but not in their intersection.
function set_symmetric_difference ( a , b ) {
    let result = new Set ( a ) ; // Start with set 'a'.
    for ( let el of b ) { // For each element in set 'b'.
        if ( result . has ( el ) ) { // If it's already in 'result' (meaning it's in 'a' AND 'b').
            result . delete ( el ) ; // Remove it (it's part of the intersection, not symmetric difference).
        } else {
            result . add ( el ) ; // If not in 'result' (meaning it's only in 'b'), add it.
        }
    }
    return result ; // Return the symmetric difference set.
}

// Computes the difference of two sets (elements in 'a' that are not in 'b').
function set_difference ( a , b ) {
    let result = new Set ( a ) ; // Start with all elements from set 'a'.
    for ( let el of b ) { // For each element in set 'b'.
        result . delete ( el ) ; // Remove it from 'result' if it exists.
    }
    return result ; // Return the difference set.
}

// Generates all combinations of 'count' elements from the input 'array'.
function set_combinations ( array , count ) {

    const result = [ ] ; // Array to store all generated combinations.

    // Recursive helper function to build combinations.
    function _combi ( { pre = [ ] , rest } ) {

        // Pruning: if remaining elements + current prefix length is less than desired count,
        // no valid combination can be formed from this path.
        if ( pre . length + rest . length < count ) return ;

        if ( pre . length < count ) { // If the current combination is not yet complete.
            for ( let i = 0 ; i < rest . length ; i ++ ) {
                _combi ( { // Recursive call with updated prefix and remaining elements.
                    pre : [ ... pre , rest [ i ] ] , // Add current element to prefix.
                    rest : rest . slice ( i + 1 ) // Remaining elements are those after the current one.
                } ) ;
            }
        } else {
            result . push ( pre ) ; // If combination is complete, add it to the results.
        }
    }

    _combi ( { rest : array } ) ; // Initial call to start the combination generation.

    return result ; // Return all combinations.
}

// Calculates the number of permutations P(n, r).
// P(n, r) = n! / (n-r)! = n * (n-1) * ... * (n-r+1)
function math_permutation ( n , r ) {
    let res = 1 ; // Initialize result to 1.
    for ( let i = 0 ; i < r ; i ++ ) { // Loop 'r' times.
        res *= n - i ; // Multiply by (n), (n-1), ..., (n-r+1).
    }
    return res ; // Return the permutation count.
}

// Calculates the number of combinations C(n, r).
// C(n, r) = P(n, r) / r!
function math_combination ( n , r ) {
    // Uses the permutation function and divides by r! (which is P(r, r)).
    return math_permutation ( n , r ) / math_permutation ( r , r ) ;
}