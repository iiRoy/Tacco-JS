/*
 * This is the bomb function.
 * It recursively navigates a grid `yx` based on coordinates (y, x) and direction `z`.
 * The grid is represented by 'yx'.
 * 'n' is assumed to be a global variable representing the grid size.
 */
function   bomb  (  y  ,  x  ,  z  ) {
    // Check if the current position `yx[y][x]` is not a '+' symbol.
    // If it's not, we simply return, as this path is invalid or already visited.
    if  (  yx  [  y  ]  [  x  ]   !=   "+"  )   return  ;


    /* Define direction vectors for movement.
     * dy: change in y-coordinate
     * dx: change in x-coordinate
     * These correspond to North, East, South, West respectively (or similar).
     */
    var   dy   =   [  -1  ,  0  ,  1  ,  0  ]  ;
    var   dx   =   [  0  ,  1  ,  0  ,  -1  ]  ;


    // Calculate the next potential coordinates (Y, X) based on current position and direction.
    var   Y   =   y   +   dy  [  z  ]  ;
    var   X   =   x   +   dx  [  z  ]  ;


    // Check for boundary conditions: If the next coordinates are outside the grid (n x n).
    if  (  Y   <   0   ||   X   <   0   ||   Y   >=   n   ||   X   >=   n  )  {
        // If out of bounds, change direction (rotate clockwise/counter-clockwise)
        z   =   (  z   +   1  )   %   4  ;
        // And recursively call bomb from the *same* current position but with the new direction.
        bomb  (  y  ,  x  ,  z  )  ;
    }   else   {
        // If the next position `yx[Y][X]` is a '#' symbol (obstacle/wall).
        if  (  yx  [  Y  ]  [  X  ]   ==   "#"  )  {
            // Mark the position *before* the obstacle as a '+'.
            // This suggests backtracking or clearing a path.
            yx  [  Y   -   dy  [  z  ]  ]  [  X   -   dx  [  z  ]  ]   =   "+"  ;

            // Based on the current direction `z`, make a recursive call
            // with adjusted coordinates and a new starting direction.
            // This part is quite specific to the algorithm's logic.
            if  (  z   ==   3  )  {
                bomb  (  Y   -   2   *   dy  [  z  ]   -   1  ,   X   -   2   *   dx  [  z  ]  ,   0  )  ;
            }
            else   if  (  z   ==   0  )  {
                bomb  (  Y   -   2   *   dy  [  z  ]  ,   X   -   2   *   dx  [  z  ]   +   1  ,   1  )  ;
            }
            else   if  (  z   ==   1  )  {
                bomb  (  Y   -   2   *   dy  [  z  ]   +   1  ,   X   -   2   *   dx  [  z  ]  ,   2  )  ;
            }
            else   if  (  z   ==   2  )  {
                bomb  (  Y   -   2   *   dy  [  z  ]  ,   X   -   2   *   dx  [  z  ]   -   1  ,   3  )  ;
            }
        }   else   {
            // If the next position is not an obstacle (it's a '+').
            // Mark the current position `yx[y][x]` as a '#'.
            yx  [  y  ]  [  x  ]   =   "#"  ;
            // Store the current position in a 'last' variable (presumably global).
            last   =   [  y  ,  x  ]  ;
            // Recursively call bomb, moving to the next position (Y, X) with the same direction.
            bomb  (  Y  ,  X  ,  z  )  ;
        }
    }
}


// --- Global variables and input processing ---

// Read input from standard input using Node.js 'fs' module.
// The input is expected to be a string.
var   input   =   require  (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,   'utf8'  )  ;

// Process the input string:
// 1. Trim leading/trailing whitespace.
// 2. Split into an array of strings by newline character.
// 3. Convert each string element to a Number.
var   arr   =   input  .  trim  (  )  .  split  (  "\n"  )  .  map  (  Number  )  ;

// The first number in the array 'arr' represents the number of test cases, 'd'.
var   d   =   arr  .  shift  (  )  ;


// --- Main loop for processing each test case ---

/*
 * Loop through each test case.
 * 'd--' decrements 'd' and continues as long as 'd' is truthy (non-zero).
 */
while  (  d--  )  {
    // The next number in 'arr' is the grid size 'n' for the current test case.
    var   n   =   arr  .  shift  (  )  ;

    // Handle special cases for small grid sizes (n=0, n=1, n=2).

    // If grid size is 0, print an empty line.
    if  (  n   ==   0  )  {
        console  .  log  (  ""  )  ;
        continue  ; // Move to the next test case.
    }

    // If grid size is 1, print a single '#'.
    if  (  n   ==   1  )  {
        console  .  log  (  "#"  )  ;
        continue  ; // Move to the next test case.
    }

    // If grid size is 2, print a specific 2x2 pattern.
    if  (  n   ==   2  )  {
        var   str   =   "##"   +   "\n"   +   "# "  ;
        console  .  log  (  str  )  ;
        continue  ; // Move to the next test case.
    }

    // --- Grid initialization for n > 2 ---

    // Initialize a 2D array 'yx' (grid) of size n x n.
    // Each cell is initially filled with a '+' character.
    var   yx   =   [  ]  ;
    for  (  var   i   =   0  ;   i   <   n  ;   i++  )  {
        yx  [  i  ]   =   [  ]  ; // Initialize inner array for each row.
        for  (  var   j   =   0  ;   j   <   n  ;   j++  )  {
            yx  [  i  ]  [  j  ]   =   "+"  ; // Fill cell with '+'.
        }
    }

    // 'last' will store the coordinates of the last '#' placed by the 'bomb' function.
    var   last   =   [  ]  ;

    // Start the recursive 'bomb' function from the bottom-left corner (n-1, 0)
    // with an initial direction '0'.
    bomb  (  n   -   1  ,   0  ,   0  )  ;

    // Post-processing step: If 'n' is even, change the 'last' visited cell back to '+'.
    if  (  n   %   2   ==   0  )  {
        yx  [  last  [  0  ]  ]  [  last  [  1  ]  ]   =   "+"  ;
    }

    // --- Output generation ---

    // Convert the 2D array 'yx' into a string for printing:
    // 1. Join rows with newline characters.
    // 2. Remove commas (which are added by default when joining inner arrays).
    // 3. Replace all '+' characters with spaces.
    console  .  log  (  yx  .  join  (  "\n"  )  .  replace  (  /  \,  /g  ,  ""  )  .  replace  (  /  \+  /g  ,  " "  )  )  ;
}