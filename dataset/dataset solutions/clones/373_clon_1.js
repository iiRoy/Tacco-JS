/*
 * This JavaScript file defines a utility function
 * to rotate a 2D array (matrix) by 90 degrees clockwise.
 * It also reads input from standard input, processes it,
 * and prints rotated versions of the input matrix.
 */

// Define the 'move' function which performs a 90-degree clockwise rotation.
function move (  yx  ) {
    // Declare a new array to store the rotated matrix.
    var   arr   =   [  ]  ;

    // Initialize the inner arrays for an 8x8 matrix.
    for  (  var   y  =  0  ;   y  <  8  ;   y  ++  )  {
        arr  [  y  ]  =  [  ]  ;
    }

    // Populate the new array with rotated elements.
    // The rotation logic is: new_arr[y][x] = original_arr[7-x][y]
    for  (  var   y  =  0  ;   y  <  8  ;   y  ++  )  {
        for  (  var   x  =  0  ;   x  <  8  ;   x  ++  )  {
            // Assign the value from the original matrix to its new rotated position.
            arr  [  y  ]  [  x  ]  =  yx  [  7  -  x  ]  [  y  ]  ;
        }
    }

    // Return the newly created and rotated array.
    return   arr  ;
}


// Read the entire input from standard input as a UTF-8 string.
var   input   =   require  (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,   'utf8'  )  ;

// Trim any leading/trailing whitespace from the input and split it into an array of lines.
var   Arr   =  (  input  .  trim  (  )  )  .  split  (  "\n"  )  ;

// Initialize an empty array to hold the 2D matrix of characters.
var   yx   =   [  ]  ;

// Populate the 'yx' array by splitting each input line into an array of characters.
for  (  var   i  =  0  ;   i  <  8  ;   i  ++  )  {
    yx  .  push  (  Arr  [  i  ]  .  split  (  ""  )  )  ;
}


// Perform the first 90-degree rotation.
yx   =   move  (  yx  )  ;
// Print the label for 90 degrees and the rotated matrix.
console  .  log  (  "90\n"  +  yx  .  join  (  "\n"  )  )  ;


// Perform the second 90-degree rotation (total 180 degrees from original).
yx   =   move  (  yx  )  ;
// Print the label for 180 degrees and the twice-rotated matrix.
console  .  log  (  "180\n"  +  yx  .  join  (  "\n"  )  )  ;


// Perform the third 90-degree rotation (total 270 degrees from original).
yx   =   move  (  yx  )  ;
// Print the label for 270 degrees and the thrice-rotated matrix.
console  .  log  (  "270\n"  +  yx  .  join  (  "\n"  )  )  ;

// End of script.