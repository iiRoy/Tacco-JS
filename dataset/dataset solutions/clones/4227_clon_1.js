/* This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions are kept exactly the same.
 * Only whitespace and comments have been altered significantly
 * to create visual distinction while maintaining logical equivalence.
 */

function   Main   ( input   )   { // Main function definition
  // Initialize input by splitting it into lines
  input   =   input.split ( "\n" ) ;

  // Process the first line to get dimensions H and W
  tmp   =   input [ 0 ] . split ( " " ) ;

  var   h   =   parseInt ( tmp [ 0 ] ) ; // Height of the grid
  var   w   =   parseInt ( tmp [ 1 ] ) ; // Width of the grid


  // Initialize a 2D array 'c' for cost matrix (10x10)
  c   =   new   Array ( 10 ) . fill ( 0 ) ;

  /* Loop to populate the cost matrix 'c'
   * Each row represents the cost to change a digit 'i' to another digit. */
  for   ( i = 0 ;   i < 10 ;   i ++ )   {
    cpre   =   input [ i + 1 ] . split ( " " ) ; // Get the i-th cost row from input

    // Parse integers for the current row of the cost matrix
    c [ i ]   =   [
      parseInt ( cpre [ 0 ] ) ,
      parseInt ( cpre [ 1 ] ) ,
      parseInt ( cpre [ 2 ] ) ,
      parseInt ( cpre [ 3 ] ) ,
      parseInt ( cpre [ 4 ] ) ,
      parseInt ( cpre [ 5 ] ) ,
      parseInt ( cpre [ 6 ] ) ,
      parseInt ( cpre [ 7 ] ) ,
      parseInt ( cpre [ 8 ] ) ,
      parseInt ( cpre [ 9 ] ) ,
    ] ;
  }


  // Initialize array 'a' to count occurrences of each digit (0-9) in the grid
  a   =   new   Array ( 10 ) . fill ( 0 ) ;

  // Loop through the input grid to count digit occurrences
  for   ( i = 0 ;   i < h ;   i ++ )   {
    apre   =   input [ i + 11 ] . split ( " " ) ; // Get the i-th row of the grid data

    for   ( j = 0 ;   j < w ;   j ++ )   {
      // Only count valid digits (non-negative)
      if   ( apre [ j ]   >=   0 )   {
        a [ apre [ j ] ] ++ ; // Increment count for the digit found
      }
    }
  }


  // Initialize array 'b' (purpose unclear from context, seems to store c[i][1])
  b   =   new   Array ( 10 ) . fill ( ) ;

  // Populate 'b' array
  for   ( i = 0 ;   i < 10 ;   i ++ )   {
    b [ i ]   =   c [ i ] [ 1 ] ; // Assign the cost to change digit 'i' to '1'
  }


  var   ans   =   0 ; // Initialize the total minimum cost


  // Main loop to calculate minimum cost for each digit (0-9)
  for   ( i = 0 ;   i < 10 ;   i ++ )   {
    // anspre: Stores minimum costs to reach other digits from 'i'
    anspre   =   new   Array ( 10 ) . fill ( 0 ) ;

    // Initialize anspre with default large values
    for   ( j = 0 ;   j < 10 ;   j ++ )   {
      anspre [ j ]   =   [ j , 10000 ] ; // [digit, min_cost_from_i]
    }

    // Cost to change 'i' to 'i' is 0
    anspre [ i ] [ 1 ]   =   0 ;

    // 'd' represents the set of unvisited nodes (digits)
    d   =   new   Array ( 0 , 1 , 2 , 3 , 4 , 5 , 6 , 7 , 8 , 9 ) ;

    // Check if digit 'i' exists in the grid and is not '1'
    if   ( a [ i ]   !=   0   &&   i   !=   1 )   {
      var   x   =   i ; // Current digit being processed (source node in Dijkstra)

      // Dijkstra-like algorithm to find shortest path from 'i' to '1'
      while   ( d . length   >   0 )   {
        var   n   =   10000 ; // Minimum cost found in current iteration
        var   y ; // Next digit to visit

        // Iterate through unvisited digits
        for   ( j = 0 ;   j < d . length ;   j ++ )   {
          // Relaxation step: update cost if a shorter path is found
          if   ( anspre [ x ] [ 1 ]   +   c [ x ] [ d [ j ] ]   <   anspre [ d [ j ] ] [ 1 ] )   {
            anspre [ d [ j ] ] [ 1 ]   =   anspre [ x ] [ 1 ]   +   c [ x ] [ d [ j ] ] ;
          }

          // Find the unvisited digit with the smallest current minimum cost
          if   ( anspre [ d [ j ] ] [ 1 ]   <   n   &&   anspre [ d [ j ] ] [ 1 ]   !=   0   &&   d . indexOf ( x )   !=   j )   {
            n   =   anspre [ d [ j ] ] [ 1 ] ;
            y   =   d [ j ] ; // Store this digit as the next 'x'
          }
        }

        // Remove the current digit 'x' from the set of unvisited digits
        d . splice ( d . indexOf ( x ) , 1 ) ;

        // Set the next digit to process
        x   =   y ;
      }

      // Add the total cost for changing digit 'i' to '1' (multiplied by its count)
      ans   =   ans   +   anspre [ 1 ] [ 1 ]   *   a [ i ] ;
    }
  }

  // Output the final calculated minimum cost
  console . log ( '%s' ,   ans ) ;
}

// Call the Main function with input read from stdin
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;