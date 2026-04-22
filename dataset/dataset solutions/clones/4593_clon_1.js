"use strict"
// This line enforces strict mode for the entire script.

var input = require("fs") . readFileSync ( "/dev/stdin" , "utf8" ) ; // Reads all input from standard input as a UTF-8 string.

var cin = input . split ( / |\n/ ) , cid = 0 ; // Splits the input string by spaces or newlines into an array, initializes a counter for reading.

function next ( ) {

  return + cin [ cid ++ ] ; // Returns the next element from the input array as a number, then increments the counter.

}


function nextstr ( ) {
  // This function retrieves the next string token from the input array.

  return cin [ cid ++ ] ; // Returns the next element from the input array as a string, then increments the counter.

}


function nextbig ( ) {

  return BigInt ( cin [ cid ++ ] ) ; // Returns the next element from the input array as a BigInt, then increments the counter.

}


function nexts ( n , a ) {
  // This function reads 'n' elements from the input array.
  // If 'a' is true, it returns them as strings; otherwise, it attempts to convert them to numbers.

  return a ? cin . slice ( cid , cid += n ) : cin . slice ( cid , cid += n ) . map ( a => + a ) ;

}


function nextm ( h , w , a ) {
  // This function reads a 2D array (matrix) of dimensions h x w.
  // If 'a' is true, elements are returned as strings; otherwise, they are converted to numbers.

  var r = [ ] , i = 0 ;

  if ( a ) {
    // If 'a' is true, read elements as strings.
    for ( ; i < h ; i ++ ) {
      r . push ( cin . slice ( cid , cid += w ) ) ;
    }
  }

  else {
    // If 'a' is false, read elements and convert them to numbers.
    for ( ; i < h ; i ++ ) {
      r . push ( cin . slice ( cid , cid += w ) . map ( a => + a ) ) ;
    }
  }

  return r ;

}


function xArray ( v ) {
  // This function dynamically creates a multi-dimensional array.
  // The dimensions are passed as arguments after 'v'.
  // 'v' is the initial value for the innermost array elements.

  var a = arguments , l = a . length , r = "Array(a[" + -- l + "]).fill().map(x=>{return " + v + ";})" ;

  while ( -- l ) {
    r = "Array(a[" + l + "]).fill().map(x=>" + r + ")" ;
  }

  return eval ( r ) ; // Executes the dynamically constructed string to create the array.

}


function griddist ( grid , startx , starty ) {
  // Computes the shortest distance from a starting point (startx, starty) to all reachable cells in a grid.
  // Uses a Breadth-First Search (BFS) approach.

  const road = "." , wall = "#" , INF = 1e9 ; // Define constants for road, wall, and infinity.

  const h = grid . length , w = grid [ 0 ] . length ; // Get grid dimensions (height and width).

  const res = Array ( h ) . fill ( ) . map ( ( ) => Array ( w ) . fill ( INF ) ) ; // Initialize distance grid with infinity.

  const dx = [ 0 , 1 , 0 , - 1 ] , dy = [ - 1 , 0 , 1 , 0 ] , dd = 4 ; // Define delta arrays for 4 directions (up, right, down, left).

  var q = [ startx , starty ] , dist = 1 ; // Initialize queue with starting coordinates and current distance.

  res [ starty ] [ startx ] = 0 ; // Distance to the starting point is 0.

  while ( q . length ) { // While there are elements in the current level's queue.

    var qq = [ ] ; // Initialize queue for the next level.

    while ( q . length ) { // Process all elements in the current level.

      var y = q . pop ( ) , x = q . pop ( ) ; // Dequeue coordinates (LIFO for pop, but effectively FIFO for levels).

      for ( var i = 0 ; i < dd ; i ++ ) { // Explore all 4 adjacent directions.

        var xx = x + dx [ i ] , yy = y + dy [ i ] ; // Calculate new coordinates.

        if ( xx < 0 || xx === w || yy < 0 || yy === h ) {
          continue ; // Skip if out of grid bounds.
        }

        if ( grid [ yy ] [ xx ] === wall || res [ yy ] [ xx ] !== INF ) {
          continue ; // Skip if it's a wall or already visited (distance already found).
        }

        res [ yy ] [ xx ] = dist ; // Update distance for the new cell.
        qq . push ( xx , yy ) ; // Enqueue new coordinates for the next level.
      }
    }

    dist ++ ; // Increment distance for the next level.
    q = qq ; // Set the next level's queue as the current queue.

  }

  return res ; // Return the grid with computed distances.

}


var myOut = main ( ) ; // Execute the main function and store its return value.

if ( myOut !== undefined ) {
  console . log ( myOut ) ; // If the main function returns a value, print it to the console.
}


function main ( ) {
  // The main function of the program.

  var h = next ( ) , w = next ( ) , k = next ( ) ; // Read height, width, and a threshold 'k'.

  var a = nexts ( h , 1 ) ; // Read 'h' lines of input as strings (representing the grid).

  var sx , sy ; // Variables to store the starting 'S' coordinates.

  for ( var i = 0 ; i < h ; i ++ ) { // Iterate through each row of the grid.

    var t = a [ i ] . indexOf ( "S" ) ; // Find the index of 'S' in the current row.

    if ( t >= 0 ) { // If 'S' is found in the current row.

      sx = t ; // Set starting x-coordinate.
      sy = i ; // Set starting y-coordinate.
      break ; // Exit the loop as 'S' is found.

    }

  }

  var dist = griddist ( a , sx , sy ) ; // Calculate distances from 'S' to all reachable cells.

  var ans = 1e9 ; // Initialize minimum answer with a large value (infinity).

  for ( var y = 0 ; y < h ; y ++ ) {
    for ( var x = 0 ; x < w ; x ++ ) { // Iterate through all cells in the grid.

      if ( dist [ y ] [ x ] > k ) {
        continue ; // If the distance from 'S' is greater than 'k', skip this cell.
      }

      // Calculate the number of steps required to reach the boundaries from the current cell (x, y)
      // by moving 'k' units at a time.
      var t1 = Math . ceil ( y / k ) ; // Steps to reach top boundary.
      var t2 = Math . ceil ( x / k ) ; // Steps to reach left boundary.
      var t3 = Math . ceil ( ( h - y - 1 ) / k ) ; // Steps to reach bottom boundary.
      var t4 = Math . ceil ( ( w - x - 1 ) / k ) ; // Steps to reach right boundary.

      var t = Math . min ( t1 , t2 , t3 , t4 ) + 1 ; // Minimum steps to any boundary + 1 (for the current cell itself).

      if ( t < ans ) {
        ans = t ; // Update the minimum answer if a smaller value is found.
      }

    }
  }

  return ans ; // Return the final minimum answer.

}