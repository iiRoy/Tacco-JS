function gets ( str )
{
  /*
   * This is the constructor for the 'gets' object.
   * It takes an input string and prepares it for line-by-line or token-by-token parsing.
   */
  this._s = str.split("\n") ; // Store the input string, split into an array of lines.
  this._y = 0 ;              // Initialize the current line index to 0.
} ; // End of gets constructor.


// Define methods for the 'gets' prototype to handle input parsing.
gets.prototype =
{
  // Method 'a': Reads a single atomic value (number or string) from the current line.
  // It effectively processes the current line from right to left (last word first).
  a : function ( f )
  {
    var s = this._s, // Reference to the lines array.
        y = this._y, // Current line index.
        r ;          // Variable to hold the result.

    // If the current line is still a single string, split it into words and reverse their order.
    // This allows 'pop()' to get words from the original start of the line.
    if ( typeof s[y] === "string" )
      s[y] = s[y].split(" ").reverse() ;

    // Extract the last element (which was the first word on the original line).
    r = s[y].pop() ;

    // If the current line array is now empty, advance to the next line for subsequent calls.
    if ( !s[y].length )
      this._y++ ;

    // Return the extracted value. If 'f' (flag) is true, return as a string; otherwise, convert to a number.
    return f ? r : +r ;
  } , // End of method 'a'.


  // Method 'l': Reads an entire line, splits it by spaces, and returns an array of values.
  // It automatically advances the line pointer after reading.
  l : function ( f )
  {
    // Get the current line, split it by spaces, and then increment the line index.
    var s = this._s[this._y++].split(" ") ;

    // Return the array. If 'f' is true, return strings; otherwise, map all elements to numbers.
    return f ? s : s.map( a => +a ) ;
  } , // End of method 'l'.


  // Method 'm': Reads multiple lines (n lines) starting from the current position.
  // Returns a 2D array where each inner array represents a line of values.
  m : function ( n , f )
  {
    var s = this._s, // Reference to the lines array.
        y = this._y, // Current line index.
        r = [],      // Array to store the result (2D array).
        i = 0 ;      // Loop counter.

    // If 'f' is true, store each line as an array of strings.
    if ( f )
      for ( ; i < n ; i++ )
        r[i] = s[y+i].split(" ") ;
    // Otherwise (if 'f' is false), store each line as an array of numbers.
    else
      for ( ; i < n ; i++ )
        r[i] = s[y+i].split(" ").map( a => +a ) ;

    // Advance the line counter by 'n' lines.
    this._y += n ;

    // Return the collected 2D array.
    return r ;
  } , // End of method 'm'.

} ; // End of gets.prototype object.


// Create an instance of the 'gets' input reader.
// It reads the entire content of "/dev/stdin" using Node.js 'fs' module and 'utf8' encoding.
var o = new gets( require("fs").readFileSync("/dev/stdin","utf8") ) ;


// Define a constructor for a Fenwick Tree (also known as a Binary Indexed Tree or BIT).
function inv ( a )
{
  // Initialize the internal array '_a' with 'a' elements, all set to 0.
  // The size 'a' typically corresponds to the maximum possible index + 1.
  this._a = Array(a).fill(0) ;
} // End of inv constructor.


// Define methods for the 'inv' (Fenwick Tree) prototype.
inv.prototype =
{
  // Method 'u': Update operation. Adds 'w' to the element at index 'x' and propagates it upwards.
  u : function ( x , w )
  {
    // Iterate through the tree, updating all relevant parent nodes.
    // 'x += x & -x' effectively moves to the next parent responsible for this index.
    for ( ; x < this._a.length ; x += x & -x )
      this._a[x] += w ; // Add 'w' to the current node.
  } , // End of method 'u'.


  // Method 'q': Query operation. Returns the prefix sum up to index 'x'.
  q : function ( x )
  {
    // Initialize the result sum.
    for ( var r = 0 ; x ; x -= x & -x )
      r += this._a[x] ; // Add the value of the current node to the sum.
    return r ;         // Return the accumulated prefix sum.
  } , // End of method 'q'.
} ; // End of inv.prototype object.


// Call the main function and log its return value to the console.
console.log( main() ) ;


// The main function encapsulates the problem-solving logic.
function main ()
{
  // Read the integer 'n' from input.
  var n = o.a() ;

  // Read an array 'a' of 'n' integers from input.
  var a = o.l() ;

  // Handle base cases for small 'n'.
  // If 'n' is 2 or less, the answer is simply the maximum element in the array.
  if ( n <= 2 )
    return Math.max( ...a ) ;

  // Calculate 'p'. This value typically represents the rank of the desired element
  // (e.g., the k-th smallest, or median) in some context, often involving subarrays or pairs.
  var p = Math.floor( n * (n+1) / 4 + 1 ) ;

  // Initialize binary search range. 'l' is the lower bound, 'r' is the upper bound (exclusive).
  // The problem likely involves finding a value within [2, 1e9+1].
  var l = 2,
      r = 1e9 + 1 ;

  // Perform binary search on the answer space.
  while ( l < r )
  {
    // Calculate the middle value 'm'. Using bitwise right shift for integer division by 2.
    var m = l + r >> 1 ;

    // Initialize variables for the current iteration.
    var b = n + 1,        // 'b' acts as an offset or balance counter.
        k = 0,            // 'k' will accumulate counts.
        z = new inv(b*2) ; // Create a new Fenwick tree instance with a size based on 'b'.

    // Initial update to the Fenwick tree.
    z.u(b,1) ;

    // Iterate through the input array 'a'.
    for ( var i = 0 ; i < n ; i++ )
    {
      // Adjust 'b' based on whether the current element a[i] is less than 'm'.
      // If a[i] < m, decrement 'b'; otherwise, increment 'b'.
      // Then, query the Fenwick tree with the *adjusted* 'b' and add it to 'k'.
      k += z.q( a[i] < m ? --b : ++b ) ;

      // Update the Fenwick tree at the new 'b' position.
      z.u(b,1) ;
    } // End of for loop over array 'a'.

    // Recalculate 'k'. This transformation suggests 'k' was counting something related to
    // inversions or pairs, and this step converts it to the count of pairs where the
    // median (or relevant value) is greater than or equal to 'm'.
    k = n * (n+1) / 2 - k ;

    // Adjust the binary search range based on the comparison of 'k' and 'p'.
    // If 'k' is less than 'p', it means 'm' is too small, so search in the upper half.
    if ( k < p )
      l = m + 1 ;
    // Otherwise, 'm' might be the answer or too large, so search in the lower half (including 'm').
    else
      r = m ;
  } // End of while loop (binary search).

  // The final answer is 'l - 1' after the binary search converges.
  return l - 1 ;
} // End of main function.