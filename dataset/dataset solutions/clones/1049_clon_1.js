/* This script solves a subset sum problem.
 * It reads two arrays and a list of target sums from standard input.
 * For each target sum, it determines if a subset of the first array sums up to that target.
 */
( function    main  (   )    { // The main entry point of the program.

    // Read the entire input from /dev/stdin, decode as UTF-8,
    // remove leading/trailing whitespace, and split into an array of lines.
    const   lines = require  ( 'fs' )   . readFileSync (   '/dev/stdin'  ,  'utf8' ) . trim (  ) . split (   '\n'   )   ;

    // The first line contains the size of the first array (n1).
    const n1 = Number(  lines.shift( ) ) ;

    // The second line contains space-separated numbers for the first array (arr1).
    const   arr1 =  lines.shift(   ) . split ( ' ' ) . map  ( Number ) ;

    // The third line contains the size of the second array (n2), though not directly used in the logic.
    /*
     * This variable, n2, is read but its value does not seem to influence
     * the core logic of the subset sum calculation or how arr2 is processed.
     */
    const n2   = Number  ( lines.shift() )   ;

    // The fourth line contains space-separated numbers for the second array (arr2),
    // which are the target sums to check.
    const arr2 = lines.shift(  ) . split(' ').map( Number ) ;

    // Define a recursive function 'solve' to check if a subset of arr1
    // starting from index 'i' can sum up to 'm'.
    const solve = (   i  ,  m   )  => { // 'i' is the current index, 'm' is the remaining target sum.

        // Base case 1: If the target sum 'm' is exactly 0, we found a valid subset.
        if  ( m   ==   0  )   {
            return true ; // A subset summing to 'm' has been found.
        }

        // Base case 2: If we've processed all elements in arr1 (i.e., 'i' is beyond the array bounds)
        // and 'm' is still not 0, then no subset sums to 'm'.
        if ( i   >= n1 )  {
            return false ; // No more elements to consider, and 'm' is not 0.
        }

        // Recursive step: Explore two possibilities:
        // 1. Exclude the current element arr1[i]: `solve(i + 1, m)`
        // 2. Include the current element arr1[i]: `solve(i + 1, m - arr1[i])`
        // The '||' operator means if either possibility leads to a solution, 'res' will be true.
        let res = solve ( i + 1  ,  m  ) || solve ( i + 1  ,  m - arr1[i] ) ;

        return res ; // Return the boolean result.
    }  ; // End of the 'solve' function definition.

    // For each target sum 'm' in arr2, call the 'solve' function.
    // If 'solve' returns true, map it to 'yes', otherwise map to 'no'.
    // Then, for each resulting 'yes' or 'no', print it to the console.
    arr2 . map  (   m   =>   solve (  0  ,  m  )   ?   'yes'   :   'no'   )
        . forEach (   res   =>   console . log (   res   )   )   ; // Output the results.

} ) ( ) ; // Immediately invoke the main function.