/*
 * This is a Type I clone generated from an original JavaScript source file.
 * All variable names, function names, operators, and expressions are preserved.
 * Only whitespace and comments have been altered for visual distinction.
 * This clone should be logically and structurally identical to the original.
 */

function main  ( input )
{
  // Split the entire input string by newline characters to get an array of lines.
  var inputs = input . split ( "\n" ) ;

  /*
   * Parse the initial three parameters (A, B, Q) from the first line of input.
   * These parameters are expected to be space-separated.
   */
  var A = Number ( inputs [ 0 ] . split ( " " ) [ 0 ] ) ; // Number of type 1 places
  var B = Number ( inputs [ 0 ] . split ( " " ) [ 1 ] ) ; // Number of type 2 places
  var Q = Number ( inputs [ 0 ] . split ( " " ) [ 2 ] ) ; // Number of queries


  var list = [ ] ; // Initialize an empty array to store all places (type 1 and type 2).
  var idx = 1 ; // Initialize an index to track the current line number in 'inputs'.

  // Loop to populate the 'list' with 'A' number of type 1 places.
  // Each place object has a 'type', 'place' (its coordinate), and an initial 'dis' (distance) set to MAX_VALUE.
  for ( var i = 0 ; i < A ; i ++ , idx ++ )
  {
    list . push ( { type : 1 , place : Number ( inputs [ idx ] ) , dis : Number . MAX_VALUE } ) ;
  }

  // Loop to populate the 'list' with 'B' number of type 2 places.
  // Similar to type 1, each place object is created.
  for ( var i = 0 ; i < B ; i ++ , idx ++ )
  {
    list . push ( { type : 2 , place : Number ( inputs [ idx ] ) , dis : Number . MAX_VALUE } ) ;
  }


  var tmp_a , tmp_b ; // Temporary variables to hold the last encountered type 1 and type 2 places during iteration.

  // Sort the combined list of places based on their 'place' coordinate in ascending order.
  list . sort ( ( a , b ) => a . place - b . place ) ;

  // Iterate through the sorted list to calculate and update the 'dis' (distance) property for each place.
  // 'dis' represents the distance to the nearest other-type place.
  list . forEach ( v => {
    if ( v . type == 1 ) { // If the current place 'v' is of type 1.
      if ( tmp_b ) { // If a previous type 2 place (tmp_b) has been encountered.
        tmp_b . dis = Math . min ( tmp_b . dis , v . place - tmp_b . place ) ; // Update tmp_b's distance.
        v . dis = v . place - tmp_b . place ; // Set current type 1's distance to tmp_b.
      }
      tmp_a = v ; // Update tmp_a to the current type 1 place.
    } else { // If the current place 'v' is of type 2.
      if ( tmp_a ) { // If a previous type 1 place (tmp_a) has been encountered.
        tmp_a . dis = Math . min ( tmp_a . dis , v . place - tmp_a . place ) ; // Update tmp_a's distance.
        v . dis = v . place - tmp_a . place ; // Set current type 2's distance to tmp_a.
      }
      tmp_b = v ; // Update tmp_b to the current type 2 place.
    }
  } ) ;


  /*
   * Now, process each of the 'Q' queries.
   * For each query, a new 'pl' (query place) is given, and we need to find the optimal answer.
   */
  for ( var i = 0 ; i < Q ; i ++ , idx ++ )
  {
    var pl = Number ( inputs [ idx ] ) ; // Parse the current query place.
    var trg = bsearch ( list , pl ) ; // Use binary search to find the index of the closest place in 'list' to 'pl'.
    var ans = 0 ; // Initialize the answer for the current query.

    if ( trg < 0 ) { // If 'pl' is smaller than all places in the sorted list.
      // The answer is the distance from 'pl' to the first place, plus that place's pre-calculated 'dis'.
      ans = Math . abs ( list [ 0 ] . place - pl ) + list [ 0 ] . dis ;
    } else if ( trg >= list . length - 1 ) { // If 'pl' is larger than or equal to all places in the sorted list.
      // The answer is the distance from 'pl' to the last place, plus that place's pre-calculated 'dis'.
      ans = Math . abs ( list [ list . length - 1 ] . place - pl ) + list [ list . length - 1 ] . dis ;
    } else { // 'pl' falls somewhere between two places in the list.
      // Compare two potential answers: one using the place at 'trg', and one using the place at 'trg + 1'.
      ans = Math . min (
        Math . abs ( list [ trg ] . place - pl ) + list [ trg ] . dis , // Answer using the place at 'trg'.
        Math . abs ( list [ trg + 1 ] . place - pl ) + list [ trg + 1 ] . dis // Answer using the place at 'trg + 1'.
      ) ;
    }
    console . log ( ans ) ; // Output the calculated answer for the current query.
  }

  return list ; // Return the modified list (though this return value is not used in the typical execution flow).
}

/*
 * bsearch function: Performs a binary search on the 'list' to find an appropriate index for 'place'.
 * It aims to return the index of the element whose 'place' value is just less than or equal to the target 'place'.
 */
function bsearch ( list , place )
{
  var a = 0 , b = list . length ; // Initialize the search range [a, b). 'a' is inclusive, 'b' is exclusive.
  var ave = ~~ ( ( a + b ) / 2 ) ; // Calculate the initial middle index. '~~' is a fast floor operation.

  while ( a < b ) { // Continue searching as long as the lower bound is less than the upper bound.
    if ( list [ ave ] . place > place ) { // If the middle element's place is greater than the target 'place'.
      b = ave - 1 ; // Adjust the upper bound to search in the left half.
    } else { // If the middle element's place is less than or equal to the target 'place'.
      a = ave + 1 ; // Adjust the lower bound to search in the right half.
    }
    ave = ~~ ( ( a + b ) / 2 ) ; // Recalculate the middle index for the new search range.
  }

  // After the loop, 'ave' might need adjustment.
  // If 'list[ave]' exists and its 'place' is strictly greater than the target 'place',
  // then the correct index is one before 'ave'. Otherwise, 'ave' is the correct index.
  if ( list [ ave ] && list [ ave ] . place > place )
    return ave - 1 ;
  else
    return ave ;
}

// Execute the main function by reading input from standard input.
// This is a common pattern in competitive programming environments.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;