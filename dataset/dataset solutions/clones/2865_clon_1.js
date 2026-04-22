// This file contains a JavaScript program for pathfinding or similar grid-based problem.
// Generated as a Type I clone, preserving all functional logic.

const main = ( inputs ) => {
   // Initialize grid dimensions from the first input line
   var H = inputs[0].split(" ")[0] - 0;
   var W = inputs[0].split(" ")[1] - 0;

   // Data structures to store grid information and path counts
   var map = {}; // Stores the grid layout
   var ymap = {}; // Stores horizontal path lengths
   var tmap = {}; // Stores vertical path lengths
   var keys = []; // List of navigable cell keys

   // Iterate through each row of the grid
   for ( var h = 0; h < H; h++ ) {
      map[h] = inputs[h+1]; // Populate the grid row

      // Iterate through each column in the current row
      for ( var w = 0; w < W; w++ ) {
         // Generate keys for adjacent cells and the current cell
         var ukey = (h - 1) + "_" + w; // Key for the cell above
         var lkey = h + "_" + (w - 1); // Key for the cell to the left
         var key = h + "_" + w; // Key for the current cell

         // Check if the current cell is an obstacle
         if ( map[h][w] == "#" ) {
            // Obstacles are ignored, no path possible
         } else {
            // If not an obstacle, it's a navigable cell
            keys.push( key ); // Add current cell key to the list

            // Calculate horizontal path length (ymap)
            if ( ymap[lkey] ) {
               ymap[key] = ymap[lkey]; // Inherit from left cell
               ymap[key].n++; // Increment path count
            } else {
               ymap[key] = { n: 1 }; // Start new path with count 1
            }

            // Calculate vertical path length (tmap)
            if ( tmap[ukey] ) {
               tmap[key] = tmap[ukey]; // Inherit from upper cell
               tmap[key].n++; // Increment path count
            } else {
               tmap[key] = { n: 1 }; // Start new path with count 1
            }
         }
      }
   }
   // Initialize the maximum answer found so far
   var ans = 0;
   var key; // Declare key variable for the loop

   // Iterate through the navigable cells in reverse order
   for ( var i = keys.length - 1; i >= 0; i-- ) {
      key = keys[i]; // Get the current cell key
      // Update the maximum answer based on combined horizontal and vertical paths
      ans = Math.max( ans, tmap[key].n + ymap[key].n - 1 );

      // Optimization: if max possible path is reached, break early
      if ( ans == H + W - 1 ) break;
   }
   // Output the final maximum path length
   console.log( ans );
}

// Execute the main function with input from standard input
main(
   require('fs')
   .readFileSync('/dev/stdin', 'UTF-8')
   .trim()
   .split("\n")
);