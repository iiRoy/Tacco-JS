/*
 * This is the primary function that orchestrates the processing of the input string.
 * It's designed to calculate a specific minimum difference arising from array partitions.
 */
function   Main(   s   )
{
  // First, we split the incoming string 's' into an array of lines.
  s   =   s   .   split(   "\n"   )   ;

  // We extract the first element, convert it to a number, and subtract one to get 'n'.
  var   n   =   +s[0]   -   1   ;

  // The second line is split by spaces, and each resulting part is converted into a number.
  var   a   =   s[1]   .   split(   " "   )   .   map(   a   =>   +a   )   ;

  // An empty array 'b' is initialized; this array will store prefix sums.
  var   b   =   []   ;


  /*
   * The 'b' array is populated using a reduce operation on array 'a'.
   * 'b[n]' will ultimately hold the total sum of elements in 'a'.
   * During the process, 'b[i-1]' stores the cumulative sum up to the (i-1)-th element.
   */
  b[n]   =   a   .   reduce(   (   a,   z,   i   )   =>   {
    b[i   -   1]   =   a   ;     // Store the current cumulative sum before adding the next element.
    return   a   +   z   ;       // Return the updated cumulative sum for the next iteration.
  }   )   ;

  // 'ans' is initialized with a very large number (9 * 10^15) to ensure any valid difference will be smaller.
  var   ans   =   9e15   ;


  // We iterate through possible split points for the array 'b', starting from the second element.
  for   (   var   i   =   1   ;   i   <   n   -   1   ;   i++   )
  {
    // Calculate target sums for the left (sl) and right (sr) partitions based on b[i] and b[n].
    var   sl   =   b[i]   /   2   ,   sr   =   (   b[n]   +   b[i]   )   /   2   ;

    // Use the 'lower_bound' helper function to find appropriate indices 'l' and 'r' in 'b'.
    var   l   =   lower_bound(   b,   0,   i   -   1,   sl   )   ;
    var   r   =   lower_bound(   b,   i   +   1,   n   -   1,   sr   )   ;

    // Calculate four partition sums based on 'l', 'i', and 'r', then sort them.
    var   m   =   [
      b[l],
      b[i]   -   b[l],
      b[r]   -   b[i],
      b[n]   -   b[r]
    ]   .   sort(   (   a,   b   )   =>   a   -   b   )   ;

    // Update the minimum answer 'ans' with the difference between the largest and smallest partition sums.
    ans   =   Math   .   min(   ans,   m[3]   -   m[0]   )   ;

    // Check for an alternative partition if 'l' is not at the very beginning of its range.
    if   (   l   )
    {
      // Recalculate partition sums using 'l-1' instead of 'l' and sort them.
      m   =   [
        b[l   -   1],
        b[i]   -   b[l   -   1],
        b[r]   -   b[i],
        b[n]   -   b[r]
      ]   .   sort(   (   a,   b   )   =>   a   -   b   )   ;

      // Update 'ans' again with this new set of partition sums.
      ans   =   Math   .   min(   ans,   m[3]   -   m[0]   )   ;

      // Further check an alternative if 'r' is not immediately adjacent to 'i'.
      if   (   r   -   i   >   1   )
      {
        // Recalculate sums using 'l-1' and 'r-1' and sort.
        m   =   [
          b[l   -   1],
          b[i]   -   b[l   -   1],
          b[r   -   1]   -   b[i],
          b[n]   -   b[r   -   1]
        ]   .   sort(   (   a,   b   )   =>   a   -   b   )   ;

        // Update 'ans' one more time.
        ans   =   Math   .   min(   ans,   m[3]   -   m[0]   )   ;
      }
    }

    // Separately, check an alternative partition for 'r' if it's not adjacent to 'i'.
    if   (   r   -   i   >   1   )
    {
      // Recalculate partition sums using 'r-1' and sort.
      m   =   [
        b[l],
        b[i]   -   b[l],
        b[r   -   1]   -   b[i],
        b[n]   -   b[r   -   1]
      ]   .   sort(   (   a,   b   )   =>   a   -   b   )   ;

      // Final update of 'ans' for the current 'i'.
      ans   =   Math   .   min(   ans,   m[3]   -   m[0]   )   ;
    }
  }

  // After all iterations, the final minimum difference is logged to the console.
  console   .   log(   ans   )   ;
}


/*
 * This helper function performs a binary search to find the lower bound.
 * It searches in array 'd' within the range [a, b] for the first element
 * that is not less than 'e'.
 */
function   lower_bound(   d,   a,   b,   e   )
{
  for   (   var   c   ;   1   <   b   -   a   ;   )
  {
    c   =   0   |   (   a   +   b   )   /   2   ; // Calculate the middle index using integer division.
    if   (   d[c]   <   e   )
    {
      a   =   c   ;   // If the middle element is less than 'e', search in the right half.
    }
    else
    {
      b   =   c   ;   // Otherwise, search in the left half (including the middle element).
    }
  }
  // After the loop, 'a' and 'b' will be adjacent. We return 'b' if d[a] is less than 'e', otherwise 'a'.
  return   d[a]   <   e   ?   b   :   a   ;
}

// This is the main entry point for the script.
// It reads the entire content of standard input as a UTF-8 string and passes it to the 'Main' function.
Main(   require(   "fs"   )   .   readFileSync(   "/dev/stdin",   "utf8"   )   )   ;