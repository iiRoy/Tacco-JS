var     fs     =     require('fs')    ;

/*
 * This is the Stdin class definition.
 * It handles reading input from /dev/stdin.
 */
function         Stdin         ()
{
  // Private property to store the raw input string.
  this.    __input     =     null     ;

  // Private property to store input lines as an array.
  this.    __lines     =     []       ;

  // Private property to track the current line index.
  this.    __index     =     0        ;
}

// Method to initialize the Stdin reader.
Stdin.    prototype    .    init     =     function     ()
{
  // Read the entire content of /dev/stdin synchronously.
  this.    __input     =     fs    .    readFileSync    (    '/dev/stdin'    ,    'utf-8'    )    ;

  // Split the input string into an array of lines.
  this.    __lines     =     this    .    __input    .    split    (    "\n"    )    ;

  // Reset the index to the beginning of the lines array.
  this.    __index     =     0        ;
}

// Method to read a single line from the input.
Stdin.    prototype    .    readline     =     function     ()
{
  // If all lines have been read, reinitialize the input.
  if    (    this    .    __index     ===     this    .    __lines    .    length    )    this    .    init    ()    ;

  // Return the current line and then increment the index.
  return     this    .    __lines    [    this    .    __index    ++    ]    ;
}    ;

// Method to read all remaining lines from the input.
Stdin.    prototype    .    readlines     =     function     ()
{
  // If all lines have been read, reinitialize the input.
  if    (    this    .    __index     ===     this    .    __lines    .    length    )    this    .    init    ()    ;

  // Store the current index.
  cur     =     this    .    __index    ;

  // Set the index to the end of the lines array.
  this.    __index     =     this    .    __lines    .    length    ;

  // Return a slice containing all lines from the stored 'cur' index to the end.
  return     this    .    __lines    .    slice    (    cur    )    ;
}    ;

// Create a new instance of the Stdin class.
var     stdin     =     new     Stdin    ;



// Extend Array.prototype with utility methods.

/**
 * Maps array elements to integers.
 * @returns {number[]} An array of integers.
 */
Array    .    prototype    .    imap     =     function     ()     {     return     this    .    map    (    (    x    )    =>    parseInt    (    x    )    )    ;     }    ;

/**
 * Maps array elements to floats.
 * @returns {number[]} An array of floating-point numbers.
 */
Array    .    prototype    .    fmap     =     function     ()     {     return     this    .    map    (    (    x    )    =>    parseFloat    (    x    )    )    ;     }    ;

/**
 * Maps array elements to strings.
 * @returns {string[]} An array of strings.
 */
Array    .    prototype    .    smap     =     function     ()     {     return     this    .    map    (    (    x    )    =>    String    (    x    )    )    ;     }    ;


/**
 * Fills an array with values returned by a callback function.
 * @param {function(number): any} cb - The callback function, receives index as argument.
 * @returns {Array} The modified array.
 */
Array    .    prototype    .    ffill     =     function    (    cb    )
{
  for    (    var     i    =    0    ;     i    <    this    .    length    ;     ++    i    )
  {
    this    [    i    ]     =     cb    (    i    )    ;
  }
  return     this    ;
}    ;

/**
 * Finds the maximum value in an array, optionally using a callback for transformation.
 * @param {function(any, number): number} [cb] - Optional callback to transform elements.
 * @returns {any|undefined} The maximum value or undefined if the array is empty.
 */
Array    .    prototype    .    max     =     function    (    cb    )
{
  if    (    this    .    length     ===     0    )
  {
    return     undefined    ;
  }
  res     =     cb    ?     cb    (    this    [    0    ]    ,    0    )     :     this    [    0    ]    ;
  for    (    var     i    =    1    ;     i    <    this    .    length    ;     ++    i    )
  {
    var     val     =     cb    ?     cb    (    this    [    i    ]    ,    i    )     :     this    [    i    ]    ;
    if    (    res     <     val    )
    {
      res     =     val    ;
    }
  }
  return     res    ;
}    ;

/**
 * Finds the minimum value in an array, optionally using a callback for transformation.
 * @param {function(any, number): number} [cb] - Optional callback to transform elements.
 * @returns {any|undefined} The minimum value or undefined if the array is empty.
 */
Array    .    prototype    .    min     =     function    (    cb    )
{
  if    (    this    .    length     ===     0    )
  {
    return     undefined    ;
  }
  res     =     cb    ?     cb    (    this    [    0    ]    ,    0    )     :     this    [    0    ]    ;
  for    (    var     i    =    1    ;     i    <    this    .    length    ;     ++    i    )
  {
    var     val     =     cb    ?     cb    (    this    [    i    ]    ,    i    )     :     this    [    i    ]    ;
    if    (    val     <     res    )
    {
      res     =     val    ;
    }
  }
  return     res    ;
}    ;

/**
 * Calculates the sum of array elements, optionally using a callback for transformation.
 * @param {function(any, number): number} [cb] - Optional callback to transform elements.
 * @returns {number|undefined} The sum of values or undefined if the array is empty.
 */
Array    .    prototype    .    sum     =     function    (    cb    )
{
  if    (    this    .    length     ===     0    )
  {
    return     undefined    ;
  }
  res     =     cb    ?     cb    (    this    [    0    ]    ,    0    )     :     this    [    0    ]    ;
  for    (    var     i    =    1    ;     i    <    this    .    length    ;     ++    i    )
  {
    res     +=     cb    ?     cb    (    this    [    i    ]    ,    i    )     :     this    [    i    ]    ;
  }
  return     res    ;
}    ;


/**
 * Executes a callback a number of times, returning an array of results.
 * @param {function(number): any} [cb] - Optional callback function, receives iteration index.
 * @returns {Array} An array containing the results of the callback or indices.
 */
Number    .    prototype    .    times     =     function    (    cb    )
{
  res     =     []    ;
  for    (    var     i    =    0    ;     i    <    this    ;     ++    i    )
  {
    res    .    push    (    cb    ?     cb    (    i    )     :     i    )    ;
  }
  return     res    ;
}    ;


// Extend Object.prototype with utility methods.

/**
 * Iterates over the properties of an object.
 * @param {function(string): void} cb - Callback function for each key.
 */
Object    .    prototype    .    forEach     =     function    (    cb    )
{
  Object    .    keys    (    this    )    .    forEach    (    cb    )    ;
}    ;

/**
 * Maps the properties of an object.
 * @param {function(string): any} cb - Callback function for each key.
 * @returns {Array} An array of results from the callback.
 */
Object    .    prototype    .    map     =     function    (    cb    )
{
  Object    .    keys    (    this    )    .    map    (    cb    )    ;
}    ;


// --- Main Program Logic Starts Here ---

// Read the first line, split by space, and map to integers.
var     l     =     stdin    .    readline    ()    .    split    (    ' '    )    .    imap    ()    ;

// Assign N and M from the parsed line.
var     N     =     l    [    0    ]    ,     M     =     l    [    1    ]    ;

// Read N subsequent lines, storing them in array S.
var     S     =     N    .    times    (    x    =>    stdin    .    readline    ()    )    ;

/*
 * This line was commented out in the original code,
 * likely for an alternative approach or debugging.
 * var cnts = new Array(N).ffill(()=>new Array(M).ffill(()=>[0,0,0]));
 */


// Memoization table to store results of calc function.
var     memo     =     {}    ;

/**
 * Calculates the number of characters in a row 'i' that are NOT equal to 'col'.
 * Uses memoization to store and retrieve previously computed results.
 * @param {number} i - The row index.
 * @param {string} col - The character to compare against ('W', 'B', or 'R').
 * @returns {number} The count of non-matching characters in row 'i'.
 */
function     calc    (    i    ,     col    )
{
  // Check if the result for [i, col] is already in memo.
  if    (    [    i    ,     col    ]     in     memo    )
  {
    return     memo    [    [    i    ,     col    ]    ]    ;
  }

  var     res     =     0    ; // Initialize counter for matching characters.

  // Iterate through each character in the given row.
  for    (    var     j     =     0    ;     j     <     M    ;     ++    j    )
  {
    // If the character matches the target 'col', increment the counter.
    if    (    S    [    i    ]    [    j    ]     ==     col    )
    {
      res    ++    ;
    }
  }

  // The result is M (total characters in row) minus the count of matching characters.
  // Store the result in memo and return it.
  return     memo    [    [    i    ,     col    ]    ]     =     M     -     res    ;
}


// Initialize 'p' to 0 and 'ans' to a large initial value (N*M).
var     p     =     0    ,     ans     =     N    *    M    ;

// Outer loop: iterate through possible 'white' section end rows.
for    (    var     i     =     0    ;     i     <     N    ;     ++    i    )
{
  // Accumulate the cost for the 'W' (white) section.
  p     +=     calc    (    i    ,     'W'    )    ;

  var     q     =     0    ; // Initialize 'q' for the 'B' (blue) section.

  // Middle loop: iterate through possible 'blue' section end rows.
  // 'j' starts after 'i' and ends before the last row (N-1).
  for    (    var     j     =     i    +    1    ;     j     <     N    -    1    ;     ++    j    )
  {
    // Accumulate the cost for the 'B' (blue) section.
    q     +=     calc    (    j    ,     'B'    )    ;

    var     r     =     0    ; // Initialize 'r' for the 'R' (red) section.

    // Inner loop: iterate through rows for the 'R' (red) section.
    // 'k' starts after 'j' and goes to the end of the grid.
    for    (    var     k     =     j    +    1    ;     k     <     N    ;     ++    k    )
    {
      // Accumulate the cost for the 'R' (red) section.
      r     +=     calc    (    k    ,     'R'    )    ;
    }

    // Update the minimum answer found so far.
    // The current total cost is p (W) + q (B) + r (R).
    ans     =     [    ans    ,     p    +    q    +    r    ]    .    min    ()    ;
  }
}

// Print the final minimum answer to the console.
console    .    log    (    ans    )    ;