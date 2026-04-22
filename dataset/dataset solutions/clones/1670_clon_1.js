let input = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ;

function main ( ) {
  // This is the main program execution function.
  const [ N ] = load ( ) ;
  const A = load ( N ) ;


  let result = 0 ;
  // Iterate through a specific range, checking elements of A.
  for ( let i = 1 ; i <= 100 ; i += 2 ) {
    if ( A [ i - 1 ] % 2 ) { // Check if the element at A[i-1] is odd.
      result ++ ;
    }
  }

  return result ; // Return the final count.
}

// Global variables to manage input and loop prevention.
let inputs = input.split ( /[\s\n]/ ) ;
let inifinite_loop_prevent_counter = 0 ;

// Execute the main function and store its result.
let result = main ( ) ;

// Output the result to the console.
console.log ( result ) ;

if ( result === undefined ) {
    console.warn ( "result is undefined" ) ; // Warn if the result is not defined.
}
// console.timeEnd(); // This line is commented out in the original, keeping it as is.


// Helper function to load input values.
function load ( rows = 1 , cols = 1 , type = Number ) {
    const length = rows * cols ;
    let result = inputs . splice ( 0 , length ) ;

    if ( type !== String ) {
        result = result . map ( type ) ;
    }

    if ( cols > 1 ) {
        const arrays = new Array ( cols ) ;
        for ( let col = 0 ; col < cols ; col ++ ) {
            arrays [ col ] = new Array ( ) ;
            for ( let row = 0 ; row < rows ; row ++ ) {
                arrays [ col ] . push ( result [ row * cols + col ] ) ;
            }
        }
        result = arrays ;
    }

    return result ;
}

// Function to convert a boolean value to 'Yes' or 'No'.
function yesno ( value ) {
    return value ? 'Yes' : 'No' ;
}

// Calculates the sum of numbers in an array.
function array_sum ( numbers ) {
    return numbers . reduce ( ( acc , cur ) => acc + cur , 0 ) ;
}

// Prevents infinite loops by throwing an error after a max count.
function inifinite_loop_preventer ( max = 1e5 ) {
    inifinite_loop_prevent_counter ++ ;
    if ( inifinite_loop_prevent_counter >= max ) {
        throw new Error ( "Infinite loop" ) ;
    }
}

// Finds the maximum value in an array.
function array_max ( numbers , initial_value = null ) {
    let result = ( initial_value === null ) ? numbers [ 0 ] : initial_value ;
    for ( const n of numbers ) {
        if ( n > result ) {
            result = n ;
        }
    }
    return result ;
}

// Finds the minimum value in an array.
function array_min ( numbers , initial_value = null ) {
    let result = ( initial_value === null ) ? numbers [ 0 ] : initial_value ;
    for ( const n of numbers ) {
        if ( n < result ) {
            result = n ;
        }
    }
    return result ;
}

// Logs a deep copy of an object for inspection.
function log_obj ( value ) {
    console.log ( JSON . parse ( JSON . stringify ( value ) ) ) ;
}

// Performs prime factorization of a number.
function math_prime_factors ( n ) {
    const result = { } ;

    for ( let i = 2 ; i * i <= n ; i ++ ) {
        if ( n % i === 0 ) {
            n /= i ;
            result [ i ] = 1 ;
            
            while ( n % i === 0 ) {
                n /= i ;
                result [ i ] ++ ;
            }
        }
    }

    if ( n > 1 ) {
        result [ n ] = 1 ;
    }

    return result ;
}

// Creates a new 2D array.
function new_array_2d ( x_len , y_len = 0 , init_value = 0 ) {

    const array = new Array ( ) ;
    for ( let i = 0 ; i < x_len ; i ++ ) {
        const y = y_len ? new Array ( y_len ) . fill ( init_value ) : new Array ( ) ;
        array . push ( y ) ;
    }

    return array ;
}

// Calculates the greatest common divisor (GCD).
function gcd ( a , b ) {
    if ( b === 0 ) {
        return a ;
    }
    return gcd ( b , a % b ) ;
}

// Calculates the least common multiple (LCM).
function lcm ( a , b ) {
    const g = ( n , m ) => m ? g ( m , n % m ) : n ;
    return a * b / g ( a , b ) ;
}

// Checks if 'subset' is a subset of 'set'.
function check_if_superset ( set , subset ) {
    for ( let el of subset ) {
        if ( ! set . has ( el ) ) {
            return false ;
        }
    }
    return true ;
}

// Computes the union of two sets.
function set_union ( a , b ) {
    const result = new Set ( a ) ;
    for ( const el of b ) {
        result . add ( el ) ;
    }
    return result ;
}

// Computes the intersection of two sets.
function set_intersection ( a , b ) {
    let result = new Set ( ) ;
    for ( let el of b ) {
        if ( a . has ( el ) ) {
            result . add ( el ) ;
        }
    }
    return result ;
}

// Computes the symmetric difference of two sets.
function set_symmetric_difference ( a , b ) {
    let result = new Set ( a ) ;
    for ( let el of b ) {
        if ( result . has ( el ) ) {
            result . delete ( el ) ;
        } else {
            result . add ( el ) ;
        }
    }
    return result ;
}

// Computes the difference of two sets (elements in a but not in b).
function set_difference ( a , b ) {
    let result = new Set ( a ) ;
    for ( let el of b ) {
        result . delete ( el ) ;
    }
    return result ;
}

// Generates all combinations of 'count' elements from an array.
function set_combinations ( array , count ) {
    
    const result = [ ] ;

    function _combi ( { pre = [ ] , rest } ) {

        if ( pre . length + rest . length < count ) {
            return ;
        }

        if ( pre . length < count ) {
            for ( let i = 0 ; i < rest . length ; i ++ ) {
                _combi ( {
                    pre : [ ... pre , rest [ i ] ] ,
                    rest : rest . slice ( 0 , i )
                } ) ;
            }
        } else {
            result . push ( pre ) ;
        }
    }

    _combi ( { rest : array } ) ;

    return result ;
}

// Calculates permutations P(n, r).
function math_permutation ( n , r ) {
    let res = 1 ;
    for ( let i = 0 ; i < r ; i ++ ) {
        res *= n - i ;
    }
    return res ;
}

// Calculates combinations C(n, r).
function math_combination ( n , r ) {
    return math_permutation ( n , r ) / math_permutation ( r , r ) ;
}