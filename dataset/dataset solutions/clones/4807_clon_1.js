/*
 * This file contains a collection of utility functions.
 * It's a foundational library for various JavaScript operations.
 *
 * Function List:
 * - arr1dto2d(Array): Converts a 1D array to a 2D array. (Note: Multiple definitions exist, check usage context)
 * - pf(N): Returns prime factorization as an object.
 * - gcd(a,b): Calculates the greatest common divisor.
 * - lcm(a,b): Calculates the least common multiple.
 * - num(a,b): Returns a - b; primarily for sorting.
 * - isPrime(n): Checks if a number is prime.
 * - isNumber(n): Checks if a value is a number.
 * - arrsum(arr): Calculates the sum of array elements. (Note: Multiple definitions exist, check usage context)
 * - nibu(arr,n): Finds the index of the largest number less than or equal to 'n' using binary search.
 * - br(input): Splits input string by newline characters.
 * - debug(val): Logs value to console if debug mode is active.
 * - arrMaxPoint(arr): Finds the index of the maximum value in an array.
 * - arrMinPoint(arr): Finds the index of the minimum value in an array.
 * - factorialize(num): Calculates the factorial of a number.
 * - rotate(array): Rotates a 2D array 90 degrees clockwise.
 * - part_in(base,push,st): Inserts elements from 'push' into 'base' starting at index 'st'.
 * - part_reverse(arr,s,g): Reverses a portion of an array from index 's' to 'g'.
 * - zeroPadding(num,length): Pads a number with leading zeros to a specified length.
 * - is_sortred(arr): Checks if an array is sorted in non-decreasing order.
 */

const  debugMode  =  false ; // Flag to control debug output
const  inf  =  Number . MAX_SAFE_INTEGER ; // Represents infinity for practical purposes


function  Main ( input ) {
    // Process input data
    input  =  input . split ( "\n" ) ;

    // Parse the array from the second line of input
    var  arr  =  input [ 1 ] . split ( " " ) . map ( Number ) ;

    // Calculate the initial sum of the array elements
    var  sum  =  arrsum ( arr ) ;

    // Remove the first three lines of input as they are no longer needed
    input . shift ( ) ;
    input . shift ( ) ;
    input . shift ( ) ;

    // Iterate over the remaining input lines
    input . forEach ( function ( val ) {
        // Parse each line into two numbers
        var  mem  =  val . split ( " " ) . map ( Number ) ;

        // Calculate and print the updated sum
        // sum - arr[mem[0]-1] (remove old value) + mem[1] (add new value)
        console . log ( sum - arr [ mem [ 0 ] - 1 ] + mem [ 1 ] ) ;
    } ) ;

}
// Execute the Main function with input from stdin
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ) ;


function  next ( m , now ) {
    // This function is currently empty and serves as a placeholder.
    // It might be intended for future use or part of an incomplete feature.
}


function  zisyozyunn ( a ) {
    var  arr  =  [ ] ; // Initialize an empty array
    // Populate 'arr' with numbers from 1 to input[0]
    for ( var  i = 0 ;  i < input [ 0 ] ;  i++ ) {
        arr . push ( i + 1 ) ;
    }

    var  sum  =  0 ; // Initialize sum for permutation calculation

    // Iterate through the input array 'a'
    for ( i = 0 ;  i < a . length ;  i++ ) {
        // Find the index of the current element 'a[i]' in 'arr'
        var  f  =  arr . findIndex ( val  =>  val == a [ i ] ) ;
        // Add to sum based on factorial and found index
        sum  +=  factorialize ( a . length - 1 - i ) * f ;
        // Remove the found element from 'arr' to avoid re-using it
        arr . splice ( f , 1 ) ;
    }
    return  sum ; // Return the calculated lexicographical order sum
}


function  arrsum ( arr ) {
    var  sum  =  0 ; // Initialize sum variable
    // Loop through the array elements
    for  ( var  i = 0 ,  len = arr . length ;  i < len ;  ++i ) {
        sum  +=  arr [ i ] - 0 ; // Add element to sum, ensuring numeric conversion
    } ;
    return  sum ; // Return the total sum
}


function  debug ( val ) {
    // Check if debug mode is enabled
    if  ( debugMode == true ) {
        console . log ( val ) ; // Log the value to the console if in debug mode
    }
}


function  arrMaxPoint ( arr ) {
    var  max  =  Number . MIN_SAFE_INTEGER ; // Initialize max with the smallest possible number
    var  point  =  -1 ; // Initialize point (index) to -1

    // Iterate through the array
    for ( var  i = 0 ;  i < arr . length ;  i++ ) {
        // If the current element is greater than the current max
        if ( max < arr [ i ] ) {
            max  =  arr [ i ] ; // Update max
            point  =  i ; // Update point to the current index
        }
    }
    return  point ; // Return the index of the maximum element
}


function  arrMinPoint ( arr ) {
    var  min  =  Number . MAX_SAFE_INTEGER ; // Initialize min with the largest possible number
    var  point  =  -1 ; // Initialize point (index) to -1

    // Iterate through the array
    for ( var  i = 0 ;  i < arr . length ;  i++ ) {
        // If the current element is smaller than the current min
        if ( min > arr [ i ] ) {
            min  =  arr [ i ] ; // Update min
            point  =  i ; // Update point to the current index
        }
    }
    return  point ; // Return the index of the minimum element
}


function  arr1dto2d ( arr ) {
    // This function assumes 'arr' contains strings that need to be split into characters.
    for ( var  i = 0 ;  i < arr . length ;  i++ ) {
        arr [ i ] = arr [ i ] . split ( "" ) ; // Split each string into an array of characters
    }
    return  arr ; // Return the modified 2D array
}


function  isPrime ( n ) {
    // Check if 'n' is an integer
    if ( false === Number . isInteger ( n ) ) {
        return  false ;
    }
    // Numbers less than or equal to 1 are not prime
    if ( n <= 1 ) {
        return  false ;
    }
    // 2 is the only even prime number
    if ( 2 === n ) {
        return  true ;
    }
    // Any even number greater than 2 is not prime
    if ( 0 === n % 2 ) {
        return  false ;
    }

    // Check for divisibility by odd numbers up to the square root of 'n'
    var  square_root  =  Math . floor ( Math . sqrt ( n ) ) ;
    for ( var  i = 3 ;  i <= square_root ;  i += 2 ) {
        if ( 0 === n % i ) {
            return  false ; // If divisible, it's not prime
        }
    }
    return  true ; // If no divisors found, it's prime
}


function  isNumber ( val ) {
    // Regular expression to check for positive integers or zero
    const  pat  =  /^([1-9]\d*|0)$/ ;
    return  pat . test ( val ) ; // Test the value against the pattern
}


function  arr1dto2d ( arr ) {
    // This is a duplicate definition of arr1dto2d.
    // It assumes 'arr' contains strings that need to be split into characters.
    for ( var  i = 0 ;  i < arr . length ;  i++ ) {
        arr [ i ] = arr [ i ] . split ( "" ) ; // Split each string into an array of characters
    }
    return  arr ; // Return the modified 2D array
}


function  factorialize ( num ) {
    // Base case: factorial of 0 is 1
    if ( num === 0 ) {
        return  1 ;
    }
    // Recursive step: num * factorial(num - 1)
    return  num  *  factorialize ( num - 1 ) ;
}


function  arr1dto2d ( arr ) {
    // This is another definition of arr1dto2d, specifically for splitting and mapping to Numbers.
    // It assumes 'arr' contains strings that need to be split by space and converted to numbers.
    for ( var  i = 0 ;  i < arr . length ;  i++ ) {
        arr [ i ] = arr [ i ] . split ( " " ) . map ( Number ) ; // Split by space and map to Number
    }
    return  arr ; // Return the modified 2D array
}


function  rotate ( array ) {
    const  ROW  =  array . length ; // Get the number of rows
    const  COL  =  array [ 0 ] . length ; // Get the number of columns

    const  row  =  ROW - 1 ; // Calculate the last row index for rotation logic

    var  a  =  new  Array ( COL ) ; // Create a new array with COL rows for the rotated matrix

    // Iterate through new columns (which were old rows)
    for ( var  c = 0 ;  c < COL ;  c++ ) {
        a [ c ] = new  Array ( ROW ) ; // Each new row will have ROW elements (old columns)
        // Iterate through new rows (which were old columns, reversed)
        for ( var  r = 0 ;  r < ROW ;  r++ ) {
            a [ c ] [ r ] = array [ row - r ] [ c ] ; // Perform the 90-degree clockwise rotation
        }
    }
    return  a ; // Return the rotated 2D array
}


function  part_in ( base , push , st ) {
    // Insert elements from 'push' array into 'base' array starting at index 'st'
    for ( var  i = st ,  p = 0 ;  p < push . length ;  i++ ,  p++ ) {
        base [ i ] = push [ p ] ; // Assign elements
    }
    return  base ; // Return the modified base array
}


function  part_reverse ( arr , s , g ) {
    // Extract a slice of the array to be reversed
    var  push  =  arr . slice ( s - 1 , g ) ;
    push . reverse ( ) ; // Reverse the extracted slice
    // Insert the reversed slice back into the original array
    arr  =  part_in ( arr , push , s - 1 ) ;
    return  arr ; // Return the array with the specified part reversed
}


function  zeroPadding ( num , length ) {
    // Convert number to string and pad with zeros
    return  ( num  +  '000000000000000000000000000000000' ) . slice ( 0 , length ) ;
}


function  arrsum ( arr ) {
    // This is a duplicate definition of arrsum.
    var  sum  =  0 ; // Initialize sum variable
    // Loop through the array elements
    for  ( var  i = 0 ,  len = arr . length ;  i < len ;  ++i ) {
        sum  +=  arr [ i ] - 0 ; // Add element to sum, ensuring numeric conversion
    } ;
    return  sum ; // Return the total sum
}


function  pf ( n ) {
    var  result  =  { } ; // Object to store prime factors and their counts

    // Base case: if n is 1, return {"1":1} as its prime factorization
    if ( n === 1 ) {
        return  { "1" : 1 }
    }

    var  init  =  2 ; // Start checking for prime factors from 2

    // Continue until n becomes 1
    while ( n !== 1 ) {
        var  i  =  init ; // Current divisor candidate
        // Loop to find the smallest prime factor of the current n
        while ( i < Number . MAX_SAFE_INTEGER ) {
            if ( n % i === 0 ) {
                n  /=  i ; // Divide n by the found factor
                if ( ! ( result [ i ] > 0 ) ) {
                    result [ i ] = 0 ; // Initialize count if factor is new
                }
                result [ i ]++ ; // Increment count for the factor
                break ; // Move to the next n
            }
            i++ ; // Try the next potential factor
        }
        init  =  i ; // Update init to continue searching from the current factor
    }
    return  result ; // Return the object with prime factors
}


function  gcd ( a , b ) {
    // Base case for Euclidean algorithm
    if ( b === 0 ) {
        return  a
    }
    // Recursive call
    return  gcd ( b , a % b )
}


function  lcm ( a , b ) {
    // Helper function to calculate GCD using Euclidean algorithm
    var  g  =  ( n , m )  =>  m  ?  g ( m , n % m )  :  n
    // LCM formula: (a * b) / GCD(a, b)
    return  a  *  b  /  g ( a , b )
}


function  num ( a , b ) {
    // Simple subtraction function, often used for sorting comparisons
    return  a  -  b ;
}


function  nibu ( a , searchValue ) {
    var  index  =  -1 ; // Initialize index to -1 (not found)

    // Left boundary of the search range
    var  left  =  0 ;

    // Right boundary of the search range
    var  right  =  a . length - 1 ;

    // Perform binary search while the search range is valid
    while ( left <= right ) {

        // Calculate the middle index
        middle  = Math . floor ( ( left  +  right ) / 2 ) ;

        // Compare the middle element with the search value
        if ( a [ middle ] == searchValue ) {
            // If found, store the index and exit loop
            index  =  middle ;
            break ;
        } else  if ( a [ middle ] < searchValue ) {
            // If middle is less than search value, search in the right half
            left  =  middle  + 1 ;
        } else {
            // If middle is greater than search value, search in the left half
            right  =  middle  - 1 ;
        }
    }
    // If the value was found, return its index
    if ( index != -1 )  return  index ;
    // If not found, 'left' will be the index where 'searchValue' would be inserted
    // to maintain sorted order, or the index of the first element greater than 'searchValue'.
    // For "n以下で最も大きい数の添字", this 'left' correctly points to the insertion point or beyond.
    else  return  left ;
}


function  br ( input ) {
    // Splits the input string by newline characters and returns an array of lines.
    return  input . split ( "\n" ) ;
}


function  is_sortred ( arr ) {
    var  flag  =  true ; // Assume array is sorted initially
    // Iterate through the array, comparing adjacent elements
    for ( var  i = 1 ;  i < arr . length ;  i++ ) {
        // If an element is greater than the next one, it's not sorted
        if ( arr [ i - 1 ] > arr [ i ] ) {
            flag  =  false ; // Set flag to false
            break ; // Exit loop early
        }
    }
    return  flag ; // Return whether the array is sorted
}