/*
 * This JavaScript program defines a 'Main' function
 * which takes an input string, typically from standard input,
 * and performs calculations related to array partitioning.
 *
 * The core logic involves computing prefix sums and then
 * iteratively finding optimal split points for four segments
 * of an array to minimize the difference between the maximum
 * and minimum sum among these four segments.
 *
 * This is a common pattern seen in competitive programming problems
 * that require dynamic programming or careful iterative segment processing.
 */
function     Main  (   input     )
{

    // Split the entire input string by newline characters
    const NA   =   input.split(     '\n'     )   ;


    // Parse the first line of input to get the integer N
    const N  =   parseInt  (  NA  [  0  ]  )    ;

    // Process the second line: split by spaces and convert each part to an integer
    const A    =    NA[1]    .    split(' ')    .    map(  n  =>  parseInt(n)  )   ;


    // Initialize a variable to hold the running sum for prefix array calculation
    var wa  =  0 ;

    // Calculate the cumulative sum (prefix sum) array.
    // 'Aruisekiwa' means "cumulative sum" in Japanese.
    const Aruisekiwa  =  A.map(  (  n  )  =>  {
        wa += n; // Add the current element 'n' to the running sum
        return wa; // Return the updated running sum for the current position
    }  )  ;


    // Declare and initialize four empty arrays to store the sums of the four partitions
    var P   =   [ ]  ;
    var Q   =   [ ]  ;
    var R   =   [ ]  ;
    var S   =   [ ]  ;


    /*
     * This loop processes the "left" side of the array splits.
     * It iterates from the second element up to N-3, effectively
     * determining the first major split point.
     * The 'l' variable tracks the optimal internal split point
     * within the first segment (P and Q).
     */
    for  (  var i  =  1  ,  l  =  0  ;  i  <  N  -  2  ;  ++i  )
    {
        // Extract a slice of the cumulative sum array representing the current left portion
        var leftArr    =    Aruisekiwa.slice(0, i+1)   ;
        // The last element of 'leftArr' gives the total sum of this left portion
        var lwa   =   leftArr[leftArr.length-1]   ;

        // Calculate the sum of the first sub-segment (P candidate)
        var ll   =   leftArr[l]   ;
        // Calculate the sum of the second sub-segment (Q candidate)
        var lr   =   lwa  -  ll   ;
        // Calculate the sum of the first sub-segment if 'l' were incremented
        var llp   =   leftArr[l+1]   ;
        // Calculate the sum of the second sub-segment if 'l' were incremented
        var lrp   =   lwa  -  llp   ;

        // Check if incrementing 'l' leads to a more balanced split (smaller absolute difference)
        // This condition ensures 'l' is always optimally positioned
        if  (  leftArr.length  >  2  &&  Math.abs(lrp-llp)  <=  Math.abs(lr-ll)  )
            ++l   ; // If yes, increment 'l'

        // Push the final P and Q values for the current 'i' into their respective arrays
        P.push(  leftArr[l]  )   ;
        Q.push(  leftArr[leftArr.length-1]  -  leftArr[l]  )   ;
    }


    /*
     * This loop processes the "right" side of the array splits.
     * It iterates backward from N-2 down to 2, determining the
     * second major split point.
     * The 'r' variable tracks the optimal internal split point
     * within the last segment (R and S).
     */
    for  (  var i  =  N-2  ,  r  =  1  ;  i  >  1  ;  --i  ,  ++r  )
    {
        // Extract a slice of the cumulative sum array representing the current right portion
        var rightArr   =   Aruisekiwa.slice(i)   ;
        // Get the element just before the start of 'rightArr' to calculate sums correctly
        var leftEnd   =   Aruisekiwa.slice(i-1, i)[0]   ;
        // The last element of 'rightArr' gives the total sum of this right portion
        var rwa   =   Aruisekiwa[Aruisekiwa.length-1] - leftEnd; // This is the total sum from 'Aruisekiwa[i]' to the end.
        // Correction: rwa should be the sum of rightArr elements.
        // It's already `rightArr[rightArr.length-1]` if Aruisekiwa is the full array.
        // Let's stick to the original code's interpretation.
        rwa = rightArr[rightArr.length-1]; // This is correct, it's the sum from index i to N-1.

        // Calculate the sum of the third sub-segment (R candidate)
        var rr   =   rwa  -  rightArr[r-1]   ;
        // Calculate the sum of the fourth sub-segment (S candidate)
        var rl   =   rightArr[r]  -  leftEnd   ;
        // Calculate the sum of the third sub-segment if 'r' were decremented
        var rrp   =   rwa  -  rightArr[r-2]   ;
        // Calculate the sum of the fourth sub-segment if 'r' were decremented
        var rlp   =   rightArr[r-1]  -  leftEnd   ;

        // Check if decrementing 'r' leads to a more balanced split
        if  (  rightArr.length  >  2  &&  Math.abs(rrp-rlp)  <=  Math.abs(rr-rl)  )
            --r   ; // If yes, decrement 'r'

        // Push the final R and S values for the current 'i' to the *front* of their arrays
        // This is because the loop iterates backwards, so unshift maintains correct order.
        R.unshift(  rightArr[r-1]  -  leftEnd  )   ;
        S.unshift(  rwa  -  rightArr[r-1]  )   ;
    }


    // Initialize the minimum result found so far to -1 (or a very large number)
    var res   =   -1   ;

    // Iterate through all possible combinations of P, Q, R, S splits
    for  (  var i  =  0  ;  i  <  P.length  ;  ++i  )
    {
        // Calculate the difference between the maximum and minimum sum of the four current segments
        var curRes   =   Math.max(P[i], Q[i], R[i], S[i])  -  Math.min(P[i], Q[i], R[i], S[i])   ;

        // If 'res' is still -1 (first iteration) or 'curRes' is smaller, update 'res'
        if  (  res  <  0  ||  curRes  <  res  )
            res  =  curRes   ;
    }

    // Output the final minimum difference found to the console
    console.log(  res  )   ;

}

// This block handles reading input from standard input (stdin)
// and then calls the 'Main' function with the read content.
Main(  require("fs").readFileSync("/dev/stdin", "utf8")  )   ;