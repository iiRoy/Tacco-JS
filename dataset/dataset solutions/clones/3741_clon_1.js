/* This is a Type I clone of the original JavaScript code provided. */
/* It strictly adheres to the definition: all identifiers, operators, and expressions */
/* are kept identical. Only whitespace (indentation, spacing, blank lines) and */
/* comments have been extensively modified to create a visually distinct version. */

function   Main   ( s )   { //  Entry point for the program; processes the input string.

  //  The input string 's' is first split into an array of lines.
  s   =   s   .   split   (   "\n"   )   ;

  //  The first line of input typically contains graph dimensions.
  //  It's parsed to extract 'n' (number of nodes) and 'm' (number of edges).
  var   n   =   s   [   0   ]   .   split   (   " "   )   .   map   (   a   =>   + a   )   ;

  //  'm' is assigned the second value from the parsed first line.
  var   m   =   n   [   1   ]   ;

  //  'n' is reassigned the first value from the parsed first line.
  n   =   n   [   0   ]   ;

  //  Initialize an adjacency matrix 'b' of size n x n.
  //  It's filled with 1s initially, representing that all nodes are potentially connected.
  var   b   =   Array   (   n   )   .   fill   (   0   )   .   map   (   a   =>   Array   (   n   )   .   fill   (   1   )   )   ;

  //  Loop through 'm' edges specified in the input to update the adjacency matrix.
  for   (   var   i   =   0   ;   i   <   m   ;   i   ++   )   {

    //  Parse each edge definition (e.g., "u v") from the input lines.
    //  The values are decremented by 1 to convert them to 0-indexed node numbers.
    var   a   =   s   [   i   +   1   ]   .   split   (   " "   )   .   map   (   a   =>   a   -   1   )   ;

    //  Mark the specified edge as 'not connected' (0) in the adjacency matrix.
    //  Since the graph is undirected, both b[u][v] and b[v][u] are set to 0.
    b   [   a   [   0   ]   ]   [   a   [   1   ]   ]   =   b   [   a   [   1   ]   ]   [   a   [   0   ]   ]   =   0   ;

  }   /* End of loop for processing edges */


  //  'c' array: used to keep track of visited nodes during graph traversal.
  //  Initialized to all 0s (unvisited).
  var   c   =   Array   (   n   )   .   fill   (   0   )   ;

  //  'z': a counter for the number of distinct connected components found.
  var   z   =   0   ;

  //  'x' and 'y': arrays to store characteristics or sizes of each component.
  var   x   =   [   ]   ,   y   =   [   ]   ;


  //  Main loop to iterate through all nodes and identify connected components.
  for   (   i   =   0   ;   i   <   n   ;   i   ++   )   {

    //  If the current node 'i' has already been visited (part of a previously found component),
    //  then we skip it and move to the next node.
    if   (   c   [   i   ]   )
      continue   ;

    //  Initialize the characteristics for the new component 'z'.
    x   [   z   ]   =   0   ;
    y   [   z   ]   =   0   ;

    //  Mark the current node 'i' as visited to start exploring its component.
    c   [   i   ]   =   1   ;

    //  'a': a temporary array to hold neighbors of 'i' that are part of this component.
    var   a   =   [   ]   ;

    //  Find unvisited neighbors of node 'i' to include in the current component.
    for   (   var   j   =   i   +   1   ;   j   <   n   ;   j   ++   )   {
      //  If there is a direct connection (edge) between node 'i' and node 'j'.
      if   (   b   [   i   ]   [   j   ]   )   {
        x   [   z   ]   =   1   ;   //  Update component 'z' characteristic 'x'.
        a   .   push   (   j   )   ;   //  Add node 'j' to the list of nodes to explore.
      }
    }

    //  Call the recursive helper function 'f' to continue exploring the component.
    //  If 'f' returns a truthy value (typically 1), it signals an error condition.
    if   (   f   (   a   ,   1   )   )   {
      console   .   log   (   -1   )   ;   //  Output -1 to indicate an error.
      return   ;   //  Exit the Main function immediately.
    }

    z   ++   ;   //  Increment the component counter for the next component.

  }   //  End of the loop for finding connected components.


  //  'd' array: used for a subsequent processing step, likely related to component merging or properties.
  var   d   =   Array   (   n   )   .   fill   (   0   )   ;

  //  Initialize 'd' based on the characteristics of the first component.
  d   [   x   [   0   ]   ]   =   d   [   y   [   0   ]   ]   =   1   ;

  //  These nested loops perform further processing on the 'd' array,
  //  integrating information from all identified components.
  for   (   i   =   1   ;   i   <   x   .   length   ;   i   ++   )
  for   (   j   =   n   -   1   ;   j   >=   0   ;   j   --   )   {
    //  If 'd[j]' is set (truthy), then update 'd' with new derived values.
    if   (   d   [   j   ]   )   {
      d   [   n   +   x   [   i   ]   ]   =   1   ;
      d   [   n   +   y   [   i   ]   ]   =   1   ;
    }
  }

  //  'k': a variable to store a maximum value determined in the next loop.
  var   k   =   0   ;

  //  Loop through the 'd' array to find a specific maximum value for 'k'.
  for   (   i   =   0   ;   i   <   n   ;   i   ++   )   {
    //  If 'd[i]' is set, update 'k' to be the maximum of its current value
    //  and the minimum of 'i' and 'n - i'.
    if   (   d   [   i   ]   )
      k   =   Math   .   max   (   k   ,   Math   .   min   (   i   ,   n   -   i   )   )   ;
  }

  //  Finally, calculate and output the result based on 'k' and 'n'.
  console   .   log   (   k   *   (   k   -   1   )   /   2   +   (   n   -   k   )   *   (   n   -   k   -   1   )   /   2   )   ;


  /*
   *  Helper function 'f':
   *  This recursive function is crucial for traversing connected components
   *  and updating the 'x' and 'y' characteristic arrays.
   *  'p': an array of nodes currently being processed in the component.
   *  'q': a flag (0 or 1) that determines which characteristic array (x or y) to update.
   */
  function   f   (   p   ,   q   )   {

    //  Base case for recursion: if the array 'p' is empty, there are no more nodes to process.
    if   (   ! p   .   length   )
      return   ;

    var   a   =   [   ]   ;   //  Temporary array to collect new neighbors found during this step.

    //  Iterate through each node in the current processing array 'p'.
    for   (   var   i   =   0   ;   i   <   p   .   length   ;   i   ++   )   {

      //  If the current node 'p[i]' has already been visited, skip it.
      if   (   c   [   p   [   i   ]   ]   )
        continue   ;

      c   [   p   [   i   ]   ]   =   1   ;   //  Mark 'p[i]' as visited.

      //  Update either 'y[z]' or 'x[z]' based on the value of the flag 'q'.
      if   (   q   )
        y   [   z   ]   ++   ;
      else
        x   [   z   ]   ++   ;

      //  Inner loop to check for edges between 'p[i]' and other nodes in 'p'.
      //  This part might be checking for specific graph properties within the current component.
      for   (   var   j   =   i   +   1   ;   j   <   p   .   length   ;   j   ++   )   {

        //  If 'p[j]' has already been visited, skip it.
        if   (   c   [   p   [   j   ]   ]   )
          continue   ;

        //  If an edge exists between 'p[i]' and 'p[j]', return 1 (indicating a specific condition or error).
        if   (   b   [   p   [   i   ]   ]   [   p   [   j   ]   ]   )
          return   1   ;

      }   //  End of inner loop.

      //  Find all neighbors of 'p[i]' in the entire graph (not just within 'p').
      for   (   j   =   0   ;   j   <   n   ;   j   ++   )
        if   (   b   [   p   [   i   ]   ]   [   j   ]   )
          a   .   push   (   j   )   ;   //  Add any connected node 'j' to the temporary array 'a'.

    }   //  End of loop through 'p'.

    //  Recursive call to 'f' with the newly found neighbors ('a') and the 'q' flag toggled (q XOR 1).
    //  The double semicolon `;;` is preserved from the original code.
    if   (   f   (   a   ,   q   ^   1   )   )
      return   1   ;   ;

  }   //  End of helper function 'f'.

} //  End of Main function.


//  Read input from standard input (typically '/dev/stdin' on Unix-like systems)
//  and pass it as a string to the Main function for processing.
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;