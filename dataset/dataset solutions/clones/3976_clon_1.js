/*
 * This is a Type I clone generated from the original source code.
 * All identifiers, variable names, function names, operators, and expressions
 * remain exactly the same as in the original.
 * Only whitespace and comments have been altered to create visual distinction.
 */

var   GET   =   (   function   (     )     {

  // The main public function for the GET module.
  function   f   (   s   )     {
    return     new   g   (   s   )   ;
  }


  /*
   * Private constructor 'g' to manage input parsing.
   * It stores lines and a current line index.
   */
  function   g   (   s   )     {
    this  .  _s   =   s  .  trim  (  )  .  split  (  "\n"  )   ;
    this  .  _y   =   0   ;
  }


  // Method 'a': Reads a single item from the current line.
  g  .  prototype  .  a   =   function   (   f   )     {
    var   s   =   this  .  _s  ,
          y   =   this  .  _y  ,
          r   ;

    // If the line is still a string, process it.
    if   (   typeof   s  [  y  ]   ===   "string"   )
      s  [  y  ]   =   s  [  y  ]  .  split  (  " "  )  .  reverse  (  )   ;

    r   =   s  [  y  ]  .  pop  (  )   ;

    // Move to the next line if the current one is empty.
    if   (   !   s  [  y  ]  .  length   )
      this  .  _y  ++   ;

    // Return the item, optionally converting to number.
    return   f   ?   r   :   +  r   ;
  }   ;


  // Method 'l': Reads an entire line as an array of items.
  g  .  prototype  .  l   =   function   (   f   )     {
    var   s   =   this  .  _s  [  this  .  _y  ++  ]  .  split  (  " "  )   ;

    // Return the array, optionally mapping to numbers.
    return   f   ?   s   :   s  .  map  (  a  =>  +  a  )   ;
  }   ;


  // Method 'm': Reads 'n' lines as a 2D array (matrix).
  g  .  prototype  .  m   =   function   (   n  ,  f   )     {
    var   r   =   this  .  _s  .  slice  (  this  .  _y  ,  this  .  _y  +=  n  )  .  map  (  a  =>  a  .  split  (  " "  )  )   ;

    // Return the matrix, optionally converting all elements to numbers.
    return   f   ?   r   :   r  .  map  (  a  =>  a  .  map  (  a  =>  +  a  )  )   ;
  }   ;


  // Method 'r': Reads 'n' raw lines as a 1D array.
  g  .  prototype  .  r   =   function   (   n  ,  f   )     {
    var   r   =   this  .  _s  .  slice  (  this  .  _y  ,  this  .  _y  +=  n  )   ;

    // Return the array, optionally converting elements to numbers.
    return   f   ?   r   :   r  .  map  (  a  =>  +  a  )   ;
  }   ;


  // The IIFE returns the public function 'f'.
  return   f   ;

}   )   (     )   ;


// Initialize the input reader 'o' by reading from standard input asynchronously.
var   o   =   GET   (   require   (   "fs"   )  .  readFileSync   (   "/dev/stdin"  ,  "utf8"   )   )   ;


// Call the main function and log its result to the console.
console  .  log   (   main   (   )   )   ;


/*
 * The main function contains the core logic for the problem.
 * It processes input arrays 'a' and 'b' through a bitwise algorithm.
 */
function   main   (     )     {

  var   n   =   o  .  a  (  )   ; // Read integer 'n'.
  var   a   =   o  .  l  (  )   ; // Read array 'a'.
  var   b   =   o  .  l  (  )   ; // Read array 'b'.
  var   ans   =   0   ;       // Initialize answer.

  // Loop through bit positions from 28 down to 0.
  for   (   var   i   =   28  ;   i   >=   0  ;   i  --   )     {

    if   (   i   <   17   )
    {
      b   =   f   (   b  ,  i   )   ;
      a   =   f   (   a  ,  i   )  .  reverse   (   )   ;
    }
    else
    {
      b  .  sort   (   (   a  ,  b   )   =>   a   -   b   )   ; // Sort 'b' ascending.
      a  .  sort   (   (   a  ,  b   )   =>   b   -   a   )   ; // Sort 'a' descending.
    }

    var   t   =   1   <<   i  ,          // Current bit value (2^i).
          t2   =   t   <<   1  ,         // 2 * t.
          t3   =   t  *  3  ,           // 3 * t.
          x   =   n  ,
          x1  ,
          x2  ,
          x3  ;

    x1   =   x2   =   x3   =   0   ; // Initialize index counters.

    // Iterate through array 'a' to count specific pairs with 'b'.
    for   (   var   j   =   0  ;   j   <   a  .  length  ;   j  ++   )     {
      while   (   x1   <   b  .  length   &&   t   -   a  [  j  ]   >   b  [  x1  ]   )
        x1  ++   ;
      while   (   x2   <   b  .  length   &&   t2   -   a  [  j  ]   >   b  [  x2  ]   )
        x2  ++   ;
      while   (   x3   <   b  .  length   &&   t3   -   a  [  j  ]   >   b  [  x3  ]   )
        x3  ++   ;

      x   +=   -  x3   +   x2   -   x1   ;
    }

    // If 'x' is odd, add 't' to the answer.
    if   (   x   %   2   )
      ans   +=   t   ;

    t  --   ; // Decrement 't' (specific to the algorithm).

    // Apply bitwise AND with the decremented 't' to both arrays.
    b   =   b  .  map  (  a  =>  a  &  t  )   ;
    a   =   a  .  map  (  a  =>  a  &  t  )   ;
  }

  return   ans   ; // Return the final calculated answer.


  /*
   * Helper function 'f' (local to main):
   * Counts elements in 'b' and returns values with an odd count
   * after considering a bit position 'n'.
   */
  function   f   (   b  ,  n   )     {
    var   a   =   Array   (   1   <<   n   +   1   )  .  fill   (   0   )  ,
          r   =   [  ]   ;

    // Count occurrences of each element in 'b'.
    for   (   var   i   =   0  ;   i   <   b  .  length  ;   i  ++   )     {
      a  [  b  [  i  ]  ]  ++   ;
    }

    // Collect elements with an odd count.
    for   (   i   =   0  ;   i   <   a  .  length  ;   i  ++   )
      if   (   a  [  i  ]   &   1   )
        r  .  push   (   i   )   ;

    return   r   ;
  }
}