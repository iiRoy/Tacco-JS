/*
 * This JavaScript file contains code designed to solve a grid-based
 * pathfinding or simulation problem. It uses a recursive function
 * 'bomb' to navigate through a 2D character array.
 * The script reads input from standard input, processes multiple
 * test cases, and outputs results to the console.
 */


function   bomb  (  y  ,  x  )
{
    // Check if the current cell has already been visited.
    // If it has, it indicates a loop in the path.
    if  (  yx  [  y  ]  [  x  ]  ==  "#"  )  {

        result  =  "LOOP"  ;

        return  ;
    }

    // Check if the current cell is the target or end point.
    // If it is, store its coordinates as the result.
    if  (  yx  [  y  ]  [  x  ]  ==  "."  )  {

        result  =  x  +  " "  +  y  ;

        return  ;
    }


    var  dx  =  0  ;  // Initialize horizontal displacement.
    var  dy  =  0  ;  // Initialize vertical displacement.


    // Determine movement direction based on the character in the current cell.
    if  (  yx  [  y  ]  [  x  ]  ==  ">"  )
        dx++  ; // Move right.

    if  (  yx  [  y  ]  [  x  ]  ==  "<"  )
        dx--  ; // Move left.

    if  (  yx  [  y  ]  [  x  ]  ==  "^"  )
        dy--  ; // Move up.

    if  (  yx  [  y  ]  [  x  ]  ==  "v"  )
        dy++  ; // Move down.


    // Mark the current cell as visited to prevent revisiting and infinite recursion.
    yx  [  y  ]  [  x  ]  =  "#"  ;

    // Recursively call the 'bomb' function for the next calculated cell.
    bomb  (  y  +  dy  ,  x  +  dx  )  ;
}


// --- Main Program Execution Flow ---

// Use Node.js 'fs' module to read all input from standard input.
var  input  =  require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ;


// Pre-process the input: remove leading/trailing whitespace and split into lines.
var  Arr  =  (  input  .  trim()  )  .  split ( "\n" ) ;


// Loop indefinitely to handle multiple test cases until a specific termination condition is met.
while  (  true  )
{
    // Extract the first line of the current test case, split by space, and convert to numbers.
    // This line typically contains grid dimensions (e.g., rows and columns).
    var  n  =  Arr  .  shift()  .  split ( " " )  .  map ( Number ) ;


    // Check if the dimensions are 0 0, which signals the end of input.
    if  (  n [ 0 ]  ==  0  &&  n [ 1 ]  ==  0  )
        break  ; // Exit the main loop.


    // Initialize an empty 2D array (grid) for the current test case.
    var  yx  =  [  ]  ;


    // Populate the grid based on the provided dimensions (n[0] represents the number of rows).
    for  (  var  i  =  0  ;  i  <  n [ 0 ]  ;  i++  )
    {
        // Get the next line from the input array, split it into individual characters.
        var  arr  =  (  Arr  .  shift()  )  .  split ( "" )  ;

        // Add the processed row of characters to the grid.
        yx  .  push ( arr )  ;
    }


    // Initialize the 'result' variable for the current test case.
    // This will hold the outcome of the 'bomb' function.
    var  result  =  ""  ;


    // Start the recursive 'bomb' function from the initial position (0, 0).
    bomb ( 0 , 0 ) ;


    // Output the final result for the current test case to the console.
    console  .  log ( result )  ;
}