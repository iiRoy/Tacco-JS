/**
 *  -------------------------------------------------------------
 *  This section provides a brief overview of the utility functions
 *  available within this script.
 *  -------------------------------------------------------------
 *
 *  - arr1dto2d(Array): Converts a one-dimensional array to a two-dimensional array.
 *  - pf(N): Returns an object representing the prime factorization of N.
 *  - gcd(a, b): Computes the greatest common divisor of a and b.
 *  - lcm(a, b): Computes the least common multiple of a and b.
 *  - num(a, b): Returns a - b; primarily used for sorting operations.
 *  - isPrime(n): Checks if a number n is prime, returning a boolean.
 *  - isNumber(n): Determines if n is a valid number string.
 *  - arrsum(arr): Calculates the sum of elements in an array.
 *  - nibu(arr, n): Returns the index of the largest number less than or equal to n (inclusive).
 *  - br(input): Splits the input string by newline characters.
 *
 *  Additional functions are also present, such as `pow`, `zisyozyunn`,
 *  `debug`, `arrMaxPoint`, `arrMinPoint`, `factorialize`, `rotate`,
 *  `part_in`, `part_reverse`, `zeroPadding`, `is_sortred`, and `primeFactorization`.
 *  -------------------------------------------------------------
 */

// --- Global Configuration Settings --- //
const debugMode  =  false ;  // Flag to control debug output. Set to true to enable logging.

const inf        =  Number.MAX_SAFE_INTEGER ;  // Represents positive infinity for safe integer operations.

const mod        =  1000000007 ;  // A common modulus used in arithmetic operations, especially for large numbers.


/**
 *  The main entry point function for processing input.
 *  It reads space-separated BigInts and performs a calculation.
 *
 *  @param {string} input - The raw input string provided to the program.
 */
function  Main  (  input  )
{
    // Process the input string: split by space, then map to BigInt.
    input  =  input . split ( " " ) . map (  BigInt  ) ;


    var  n  =  input [ 0 ] ;  // First element: n
    var  a  =  input [ 1 ] ;  // Second element: a
    var  b  =  input [ 2 ] ;  // Third element: b


    // Conditional logic based on the values of a, b, and n.
    if  (  a  ==  b  )
    {
        console . log (  1  ) ;  // If a equals b, output 1.
    }
    else  if  (  a  >  b  ||  n  ==  1n  )
    {
        console . log (  0  ) ;  // If a is greater than b, or n is 1n, output 0.
    }
    else
    {
        // Otherwise, perform a complex BigInt calculation and output the result as a string.
        console . log (  (  (  (  n  -  1n  )  *  b  +  a  )  -  (  (  n  -  1n  )  *  a  +  b  )  +  1n  ) . toString (  )  ) ;
    }

} // End of Main function.


// Invoke the Main function with input read from standard input.
// This line ensures the program starts execution by calling Main.
Main (  require ( "fs" ) . readFileSync ( "/dev/stdin" ,  "utf8" ) . trim (  )  ) ;


/*
 *  Calculates the power of a number.
 *  Note: This implementation appears to have a bug as it always returns 'a'.
 *  It should ideally return 'ans'. However, for Type I clone, we must preserve the original logic.
 *
 *  @param {number|BigInt} a - The base number.
 *  @param {BigInt} b - The exponent.
 *  @returns {number|BigInt} The base 'a' (due to original logic).
 */
function  pow  (  a ,  b  )
{
    var  ans  =  0 ;  // Initialize accumulator for the result.

    // Loop 'b' times to perform multiplication.
    for  (  var  i  =  0n ;  i  <  b ;  i  +=  1n  )
    {
        if  (  ans  ==  0  )  // Special handling for the first iteration.
        {
            ans  =  a ;
        }
        else
        {
            ans  *=  a ;  // Multiply 'ans' by 'a'.
        }
    }

    // IMPORTANT: The original code returns 'a' instead of 'ans'. This is preserved.
    return  a ;
}


// Another utility function. Its purpose appears to be related to lexicographical permutations or similar.
function  zisyozyunn  (  a  )
{
    var  arr  =  [  ] ;  // Initialize an empty array.

    // Populate 'arr' with numbers from 1 up to 'input[0]'.
    // NOTE: 'input' here refers to a global or implicitly available variable,
    // potentially from the Main function's scope if this function is called there.
    for  (  var  i  =  0 ;  i  <  input [ 0 ] ;  i ++  )
    {
        arr . push (  i  +  1  ) ;
    }


    var  sum  =  0 ;  // Initialize sum.

    // Iterate through the input array 'a'.
    for  (  var  i  =  0 ;  i  <  a . length ;  i ++  )
    {
        // Find the index of the current element 'a[i]' in 'arr'.
        var  f  =  arr . findIndex (  val  =>  val  ==  a [ i ]  ) ;

        // Accumulate sum using factorials.
        sum  +=  factorialize (  a . length  -  1  -  i  )  *  f ;

        // Remove the found element from 'arr'.
        arr . splice (  f ,  1  ) ;
    }

    return  sum ;  // Return the calculated sum.
}


/**
 *  Calculates the sum of all numeric elements within an array.
 *  This version explicitly converts each element to a number using `-0`.
 *
 *  @param {Array<number>} arr - The array of numbers to sum.
 *  @returns {number} The total sum of the array elements.
 */
function  arrsum  (  arr  )
{
    var  sum  =  0 ;  // Initialize the sum to zero.

    // Loop through the array from the first element to the last.
    for  (  var  i  =  0 ,  len  =  arr . length ;  i  <  len ;  ++ i  )
    {
        sum  +=  arr [ i ]  -  0 ;  // Add the current element to the sum, ensuring it's treated as a number.
    } ;  // Note: Semicolon after loop is maintained from original.

    return  sum ;  // Return the final calculated sum.
}


// A simple debug logging function. Output is only displayed if 'debugMode' is true.
function  debug  (  val  )
{
    // Check if the global debugMode flag is enabled.
    if  (  debugMode  ==  true  )
    {
        console . log (  val  ) ;  // Log the value to the console if debugging is active.
    }
}


/*
 *  Finds the index (point) of the maximum value in a given array.
 *  If multiple elements have the same maximum value, the index of the first occurrence is returned.
 *
 *  @param {Array<number>} arr - The array to search for the maximum element.
 *  @returns {number} The index of the maximum value, or -1 if the array is empty or no maximum is found.
 */
function  arrMaxPoint  (  arr  )
{
    var  max    =  Number . MIN_SAFE_INTEGER ;  // Initialize 'max' with the smallest possible safe integer.
    var  point  =  -1 ;  // Initialize 'point' (index) to -1, indicating no element found yet.

    // Iterate through each element of the array.
    for  (  var  i  =  0 ;  i  <  arr . length ;  i ++  )
    {
        // If the current element is greater than the current 'max'.
        if  (  max  <  arr [ i ]  )
        {
            max    =  arr [ i ] ;  // Update 'max' to the new maximum value.
            point  =  i ;  // Update 'point' to the current index.
        }
    }

    return  point ;  // Return the index of the maximum element.
}


/**
 *  Identifies the index of the minimum value within an array.
 *  Similar to arrMaxPoint, it returns the index of the first minimum if duplicates exist.
 *
 *  @param {Array<number>} arr - The array to scan for the minimum value.
 *  @returns {number} The index of the minimum value, or -1 if the array is empty.
 */
function  arrMinPoint  (  arr  )
{
    var  min    =  Number . MAX_SAFE_INTEGER ;  // Initialize 'min' with the largest possible safe integer.
    var  point  =  -1 ;  // Initialize 'point' (index) to -1.

    // Loop through all elements in the array.
    for  (  var  i  =  0 ;  i  <  arr . length ;  i ++  )
    {
        // If the current element is smaller than the current 'min'.
        if  (  min  >  arr [ i ]  )
        {
            min    =  arr [ i ] ;  // Update 'min' to the new minimum.
            point  =  i ;  // Update 'point' to the current index.
        }
    }

    return  point ;  // Return the index of the minimum element found.
}


/*
 *  Determines if a given number 'n' is a prime number.
 *  It implements a basic primality test algorithm.
 *
 *  @param {number} n - The number to check for primality.
 *  @returns {boolean} True if 'n' is prime, false otherwise.
 */
function  isPrime  (  n  )
{
    // First, check if 'n' is an integer. If not, it cannot be prime.
    if  (  false  ===  Number . isInteger (  n  )  )
    {
        return  false ;
    }

    // Numbers less than or equal to 1 are not prime by definition.
    if  (  n  <=  1  )
    {
        return  false ;
    }

    // The number 2 is the only even prime number.
    if  (  2  ===  n  )
    {
        return  true ;
    }

    // Any even number greater than 2 is not prime.
    if  (  0  ===  n  %  2  )
    {
        return  false ;
    }

    // Calculate the integer part of the square root of 'n'.
    // We only need to check for divisors up to this value.
    var  square_root  =  Math . floor (  Math . sqrt (  n  )  ) ;

    // Iterate from 3 up to the square root, incrementing by 2 (only checking odd numbers).
    for  (  var  i  =  3 ;  i  <=  square_root ;  i  +=  2  )
    {
        // If 'n' is divisible by 'i', then 'n' is not prime.
        if  (  0  ===  n  %  i  )
        {
            return  false ;
        }
    }

    // If no divisors were found, the number is prime.
    return  true ;
}


// Checks if a given value string represents a non-negative integer.
// It uses a regular expression for validation.
function  isNumber  (  val  )
{
    // Regular expression to match non-negative integers (0 or positive integers without leading zeros).
    const  pat  =  /^([1-9]\d*|0)$/ ;

    // Test the input value against the pattern.
    return  pat . test (  val  ) ;
}


/**
 *  Computes the factorial of a non-negative integer using recursion.
 *  The factorial of 0 is 1.
 *
 *  @param {number} num - The number for which to calculate the factorial.
 *  @returns {number} The factorial of 'num'.
 */
function  factorialize  (  num  )
{
    // Base case: Factorial of 0 is 1.
    if  (  num  ===  0  )
    {
        return  1 ;
    }

    // Recursive step: n! = n * (n-1)!
    return  num  *  factorialize (  num  -  1  ) ;
}


// Transforms a 1D array of strings into a 2D array of numbers.
// Each string element is expected to contain space-separated numbers.
function  arr1dto2d  (  arr  )
{
    // Iterate over each element in the input array.
    for  (  var  i  =  0 ;  i  <  arr . length ;  i ++  )
    {
        // For each string element, split it by space, then map to Number,
        // effectively converting a row string into an array of numbers.
        arr [ i ]  =  arr [ i ] . split ( " " ) . map (  Number  ) ;
    }

    return  arr ;  // Return the modified 2D array.
}


/**
 *  Rotates a 2D array (matrix) 90 degrees clockwise.
 *  It assumes a rectangular array structure.
 *
 *  @param {Array<Array<any>>} array - The original 2D array to be rotated.
 *  @returns {Array<Array<any>>} A new 2D array representing the rotated matrix.
 */
function  rotate  (  array  )
{
    const  ROW  =  array . length ;  // Get the number of rows in the original array.
    const  COL  =  array [ 0 ] . length ;  // Get the number of columns (assuming uniform column count).

    const  row  =  ROW  -  1 ;  // Pre-calculate (ROW - 1) for indexing.

    var  a  =  new  Array (  COL  ) ;  // Create a new array to hold the rotated matrix.
                                     // Its dimensions will be COL x ROW.

    // Loop through each new column (which corresponds to an old row).
    for  (  var  c  =  0 ;  c  <  COL ;  c ++  )
    {
        a [ c ]  =  new  Array (  ROW  ) ;  // Initialize the current new column as an array of length ROW.

        // Loop through each new row (which corresponds to an old column).
        for  (  var  r  =  0 ;  r  <  ROW ;  r ++  )
        {
            // The rotation logic: new_matrix[c][r] = old_matrix[ROW - 1 - r][c]
            a [ c ] [ r ]  =  array [ row  -  r ] [ c ] ;
        }
    }

    return  a ;  // Return the newly created rotated array.
}


// Inserts elements from one array ('push') into another ('base') starting at a specific index ('st').
// This modifies the 'base' array in place.
function  part_in  (  base ,  push ,  st  )
{
    // Iterate from the starting index 'st' in 'base' and from the beginning of 'push'.
    for  (  var  i  =  st ,  p  =  0 ;  p  <  push . length ;  i ++ ,  p ++  )
    {
        base [ i ]  =  push [ p ] ;  // Assign elements from 'push' to 'base'.
    }

    return  base ;  // Return the modified base array.
}


/**
 *  Reverses a specific segment of an array in place.
 *  The segment is defined by start index 's' and end index 'g' (1-based).
 *
 *  @param {Array<any>} arr - The array to modify.
 *  @param {number} s - The 1-based starting index of the segment to reverse.
 *  @param {number} g - The 1-based ending index of the segment to reverse.
 *  @returns {Array<any>} The array with the specified segment reversed.
 */
function  part_reverse  (  arr ,  s ,  g  )
{
    // Extract the segment to be reversed (slice takes 0-based indices).
    var  push  =  arr . slice (  s  -  1 ,  g  ) ;

    push . reverse (  ) ;  // Reverse the extracted segment.

    // Insert the reversed segment back into the original array at the correct position.
    arr  =  part_in (  arr ,  push ,  s  -  1  ) ;

    return  arr ;  // Return the array with the segment reversed.
}


// Pads a number with leading zeros to reach a specified total length.
// This implementation uses a string concatenation and slicing trick.
function  zeroPadding  (  num ,  length  )
{
    // Concatenate the number with a very long string of zeros,
    // then slice it to the desired 'length'.
    // This effectively adds leading zeros if 'num' is shorter than 'length'.
    return  (  num  +  '000000000000000000000000000000000'  ) . slice (  0 ,  length  ) ;
}


/**
 *  --- DUPLICATE FUNCTION DEFINITION ---
 *  This function is an exact copy of another 'arrsum' defined earlier in the file.
 *  It calculates the sum of numeric elements in an array.
 *  This duplication is intentional for Type I clone generation.
 *
 *  @param {Array<number>} arr - The array whose elements are to be summed.
 *  @returns {number} The sum of all elements in 'arr'.
 */
function  arrsum  (  arr  )
{
    var  sum  =  0 ;  // Initialize the sum variable.

    // Loop through the array, accessing elements by index.
    for  (  var  i  =  0 ,  len  =  arr . length ;  i  <  len ;  ++ i  )
    {
        sum  +=  arr [ i ]  -  0 ;  // Add the current element to sum, ensuring numeric conversion.
    } ;  // Semicolon after loop body, as in original.

    return  sum ;  // Return the total sum.
}


/**
 *  Performs prime factorization of a given number 'n' and returns the factors
 *  and their counts in an object.
 *  This algorithm seems less efficient than standard prime factorization methods
 *  due to the inner loop's `i < Number.MAX_SAFE_INTEGER` condition, but it must be preserved.
 *
 *  @param {number} n - The number to factorize.
 *  @returns {Object<string, number>} An object where keys are prime factors and values are their exponents.
 */
function  pf  (  n  )
{
    var  result  =  {  } ;  // Initialize an empty object to store prime factors and their counts.

    // Special case: if n is 1, return an object indicating '1' as a factor with count 1.
    if  (  n  ===  1  )
    {
        return  {  "1" : 1  } ;
    }


    var  init  =  2 ;  // Starting point for potential prime factors.

    // Continue factorization until 'n' becomes 1.
    while  (  n  !==  1  )
    {
        var  i  =  init ;  // Current divisor candidate, starting from 'init'.

        // Inner loop to find the next prime factor.
        // NOTE: The condition `i < Number.MAX_SAFE_INTEGER` is unusual for primality testing
        // and makes it potentially very slow for large numbers.
        while  (  i  <  Number . MAX_SAFE_INTEGER  )
        {
            // Check if 'i' is a divisor of 'n'.
            if  (  n  %  i  ===  0  )
            {
                n  /=  i ;  // Divide 'n' by the factor 'i'.

                // Initialize the count for factor 'i' if it's not already present.
                if  (  ! (  result [ i ]  >  0  )  )
                {
                    result [ i ]  =  0 ;
                }

                result [ i ] ++ ;  // Increment the count for factor 'i'.
                break ;  // Break the inner loop to find the next factor for the (now smaller) 'n'.
            }
            i ++ ;  // Increment 'i' to check the next potential divisor.
        }
        init  =  i ;  // Update 'init' to the last found factor 'i' to optimize subsequent searches.
    }
    return  result ;  // Return the object containing the prime factorization.
}


/**
 *  Computes the Greatest Common Divisor (GCD) of two numbers using the Euclidean algorithm.
 *  This is a recursive implementation.
 *
 *  @param {number} a - The first number.
 *  @param {number} b - The second number.
 *  @returns {number} The GCD of 'a' and 'b'.
 */
function  gcd  (  a ,  b  )
{
    // Base case: if 'b' is 0, then 'a' is the GCD.
    if  (  b  ===  0  )
    {
        return  a ;
    }
    // Recursive step: GCD(a, b) = GCD(b, a % b).
    return  gcd (  b ,  a  %  b  ) ;
}


/**
 *  Calculates the Least Common Multiple (LCM) of two numbers.
 *  It leverages the relationship: LCM(a, b) = |a * b| / GCD(a, b).
 *  Uses an inner arrow function 'g' for GCD calculation.
 *
 *  @param {number} a - The first number.
 *  @param {number} b - The second number.
 *  @returns {number} The LCM of 'a' and 'b'.
 */
function  lcm  (  a ,  b  )
{
    // Define an arrow function 'g' to compute GCD.
    // This is a concise recursive GCD implementation.
    var  g  =  (  n ,  m  )  =>  m  ?  g (  m ,  n  %  m  )  :  n ;

    // Calculate LCM using the formula: (a * b) / GCD(a, b).
    // Note: This does not handle absolute values, assuming positive inputs.
    return  a  *  b  /  g (  a ,  b  ) ;
}


// A simple utility function that returns the difference between two numbers.
// Often used as a comparison function for sorting in ascending order.
function  num  (  a ,  b  )
{
    return  a  -  b ;  // Returns the difference.
}


/**
 *  Performs a binary search on a sorted array 'a' to find the index of 'searchValue'.
 *  If 'searchValue' is found, its index is returned.
 *  If not found, it returns the index where 'searchValue' *would* be inserted to maintain order,
 *  or the smallest index greater than 'searchValue' if all elements are smaller.
 *  The original comments are Japanese and are preserved/translated.
 *
 *  @param {Array<number>} a - The sorted array to search within.
 *  @param {number} searchValue - The value to search for.
 *  @returns {number} The index of 'searchValue' if found, otherwise the insertion point.
 */
function  nibu  (  a ,  searchValue  )
{
    var  index  =  -1 ;  // Initialize 'index' to -1, indicating not found.

    // 調べる左端を表す添字(index) - Index representing the left end to check.
    var  left  =  0 ;

    // 調べる右端を表す添字(index) - Index representing the right end to check.
    var  right  =  a . length  -  1 ;

    // 左端と右端にデータがある間は処理を繰り返す - Repeat the process while data exists between left and right ends.
    while  (  left  <=  right  )
    {
        // 左右の真ん中を表す添字(index) - Index representing the middle of left and right.
        middle  =  Math . floor (  (  left  +  right  )  /  2  ) ;

        // 真ん中の値と探す値を比較する - Compare the middle value with the search value.
        if  (  a [ middle ]  ==  searchValue  )
        {
            // 一致した場合、変数に入れて処理終了 - If matched, store in variable and end process.
            index  =  middle ;
            break ;
        }
        else  if  (  a [ middle ]  <  searchValue  )
        {
            // 探す値より小さい場合、左側にはもっと小さい値しかないので左端の値を真ん中の値の右に移動する
            // If smaller than search value, only smaller values exist to the left, so move left end to the right of middle.
            left  =  middle  +  1 ;
        }
        else
        {
            // 探す値より大きい場合、右側にはもっと大きい値しかないので右端の値を真ん中の値の左に移動する
            // If larger than search value, only larger values exist to the right, so move right end to the left of middle.
            right  =  middle  -  1 ;
        }
    }
    if  (  index  !=  -1  )  return  index ;
    else  return  left ;  // If not found, 'left' indicates the insertion point.
}


// A utility function to split a string by newline characters.
// This is often used to parse multi-line input.
function  br  (  input  )
{
    return  input . split ( "\n" ) ;  // Splits the input string into an array of strings.
}


/**
 *  Checks if an array is sorted in non-decreasing order.
 *
 *  @param {Array<number>} arr - The array to check.
 *  @returns {boolean} True if the array is sorted, false otherwise.
 */
function  is_sortred  (  arr  )
{
    var  flag  =  true ;  // Assume the array is sorted initially.

    // Iterate from the second element to compare with its predecessor.
    for  (  var  i  =  1 ;  i  <  arr . length ;  i ++  )
    {
        // If an element is less than its predecessor, the array is not sorted.
        if  (  arr [ i  -  1 ]  >  arr [ i ]  )
        {
            flag  =  false ;  // Set flag to false.
            break ;  // No need to check further, break the loop.
        }
    }

    return  flag ;  // Return the final flag value.
}


/**
 *  Performs prime factorization using a more conventional approach
 *  compared to the 'pf' function. It iterates up to the square root of 'n'.
 *  Original Japanese comments are preserved and translated for clarity.
 *
 *  @param {number} n - The number to factorize.
 *  @returns {Object<string, number>} An object mapping prime factors to their exponents.
 */
function  primeFactorization  (  n  )
{
    // 平方根を保存 - Store the square root.
    var  s  =  Math . floor (  Math . sqrt (  n  )  ) ;


    var  r  =  0 ;  // Initialize 'r' as the exponent counter for a prime factor.


    var  result  =  {  } ;  // Initialize an empty object to store the factorization result.


    // 2から平方根までの素因数を求める - Find prime factors from 2 up to the square root.
    for  (  var  i  =  2 ;  i  <=  s ;  i ++  )
    {
        // Check if 'i' is a factor of 'n'.
        if  (  (  n  %  i  )  ==  0  )
        {
            r  =  0 ;  // 指数カウンタクリア - Clear exponent counter.

            do
            {
                r ++ ;  // 指数カウンタプラス - Increment exponent counter.

                n  =  n  /  i ;  // Divide 'n' by the factor 'i'.

            }  while  (  (  n  %  i  )  ==  0  ) ;  // Continue while 'i' is still a factor.

            // 素因数iを指数とともに保存 - Store prime factor 'i' along with its exponent.
            result [ i ]  =  r ;
        }
    }


    // 残った素数を追加 - Add any remaining prime numbers.
    // If 'n' is still greater than 's' after the loop, it means the remaining 'n' itself is a prime factor.
    if  (  n  >  s  )
    {
        result [ n ]  =  1 ;
    }

    return  result ;  // Return the complete prime factorization.

} // End of primeFactorization function.