// This is an experimental implementation (Experiment 1) of a solution.
// It applies a sliding window (尺取法) technique in conjunction with cumulative sums.
// The core strategy involves initially sorting items based on their value in descending order.
// Subsequently, a sliding window approach is employed, constrained by a total weight limit.

function Main ( input )
{
  // --- Input parameter reception and initial parsing ---
  // The entire input string is first split by newline characters.
  // This produces an array where each element is a line from the input.
  input = input.split ( "\n" ) ;

  // The very first line of the input contains two crucial parameters:
  // N (the total number of items) and W (the maximum allowed total weight).
  inputStr = input[0].split ( " " ) ;

  // Parse N, the count of items, into an integer.
  var N = Number.parseInt ( inputStr[0] ) ;
  // Parse W, the maximum permissible weight, into an integer.
  var W = Number.parseInt ( inputStr[1] ) ;

  // Initialize an empty array. This array will be populated with item objects.
  // Each item object will itself be an array, typically [weight, value].
  var obj = [] ;

  // Begin a loop that iterates N times, once for each item.
  for ( var i = 0 ; i < N ; i++ )
  {
    // For each iteration, retrieve the line corresponding to the current item.
    // Note that item data starts from the second line (index 1) of the input array.
    inputStr = input[i + 1].split ( " " ) ;

    // Map the string components (weight and value) of the current item to integers.
    // Then, push this newly formed integer array (representing an item) into the 'obj' array.
    obj.push ( inputStr.map ( inputStr => parseInt ( inputStr ) ) ) ;
  }

  // --- Sorting phase ---
  // Sort the 'obj' array. The sorting logic is defined within the anonymous function.
  // The criterion for sorting is the second element (index 1) of each inner array,
  // which represents the item's value. The sort order is descending (highest value first).
  obj.sort ( function ( a , b ) { return ( b[1] - a[1] ) ; } ) ;


  // The following line is commented out but can be uncommented for debugging.
  // It would print the sorted array of objects to the console.
  // console.log ( obj ) ;


  // --- Initialize variables for the sliding window algorithm ---
  // 'wt' (current weight) will keep track of the cumulative weight of items
  // currently included within the active window.
  var wt = 0 ;

  // 'val' (current value) will accumulate the total value of items
  // presently within the active window.
  var val = 0 ;

  // 'ans' (answer) will store the maximum total value encountered so far
  // across all valid windows. It is initialized to 0.
  var ans = 0 ;


  // --- Sliding Window (Shakutori-hou) Algorithm Implementation ---
  // The outer loop's index 'i' serves as the left boundary (start) of the sliding window.
  // This loop iterates through each item, considering it as a potential starting point.
  for ( var i = 0 ; i < N ; i++ )
  {
    // Add the item at the current left boundary 'i' to the window.
    // (Optional debugging log): // console.log ( "val=" , val , "に" , obj[i][1] , "を加算" ) ;
    wt += obj[i][0] ;   // Increment the current total weight by the weight of item 'i'.
    val += obj[i][1] ;  // Increment the current total value by the value of item 'i'.

    // Initialize the right boundary 'j' of the window. It starts one position
    // to the right of the current left boundary 'i'.
    var j = i + 1 ;

    // The inner 'while' loop expands the window to the right.
    // It continues as long as 'j' is within the bounds of the 'obj' array.
    while ( j < N )
    {
      // Check if adding the item at index 'j' to the current window
      // would keep the total weight ('wt') within the maximum allowed weight ('W').
      if ( wt + obj[j][0] <= W )
      {
        // If it fits, then the item at index 'j' is included in the window.
        // (Optional debugging log): // console.log ( "val=" , val , "に" , obj[j][1] , "を加算" ) ;
        wt += obj[j][0] ;   // Add the weight of item 'j' to the total current weight.
        val += obj[j][1] ;  // Add the value of item 'j' to the total current value.
        j++ ;               // Move the right boundary 'j' one step further to the right.
      }
      else
      {
        // If adding item 'j' would exceed the weight limit 'W',
        // the window cannot be expanded further to the right from this point.
        break ; // Exit the inner 'while' loop.
      }
    }

    // After the window has been expanded as much as possible (or if it couldn't expand),
    // update the overall maximum value found ('ans') if the current window's total value ('val') is greater.
    ans = Math.max ( val , ans ) ;

    // Before the outer loop moves to the next item (incrementing 'i'),
    // the item that was at the previous left boundary 'i' must be removed from the window's
    // accumulated weight and value. This effectively slides the window.
    // (Optional debugging log): // console.log ( "val=" , val , "から" , obj[i][1] , "を除算" ) ;
    wt -= obj[i][0] ;   // Subtract the weight of the item being removed from the left boundary.
    val -= obj[i][1] ;  // Subtract the value of the item being removed from the left boundary.
  }

  // --- Output the final result ---
  // Print the maximum value found ('ans') to the console.
  console.log ( ans ) ;
}

// --- Main function invocation ---
// This line typically reads all input from standard input (stdin)
// in a competitive programming environment and passes it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;