/* This comment indicates a specific task was timed. */
/* clear time -9m */

/*
 * This function creates a deep copy of an array or object.
 * It handles nested structures recursively.
 *
 * @param parent The source object or array to clone.
 * @param child  (Optional) An existing object or array to populate with the cloned data.
 *               If not provided, a new array is created.
 * @returns The cloned child object/array.
 */
function  clone (  parent ,  child  ) {
  var  p ,
       toStr  =  Object . prototype . toString , // Shortcut for Object.prototype.toString
       astr   =  '[object Array]' ,             // String representation for an array
       has    =  Object . prototype . hasOwnProperty ; // Shortcut for Object.prototype.hasOwnProperty

  // Ensure child is initialized as an empty array if not provided.
  child  =  child  ||  [ ] ;

  // Iterate over all enumerable properties of the parent object.
  for  (  p  in  parent  ) {
    // Check if the property belongs to the parent itself (not inherited).
    if  (  has . call (  parent ,  p  )  ) {
      // If the property value is an object (including arrays).
      if  (  typeof  parent [ p ]  ===  "object"  ) {
        // Determine if the object is an array or a plain object, then initialize child[p] accordingly.
        child [ p ]  =  ( toStr . call ( parent [ p ] )  ===  astr  )  ?  [ ]  :  { } ;
        // Recursively clone nested objects/arrays.
        clone (  parent [ p ] ,  child [ p ]  ) ;
      } else {
        // For primitive values (numbers, strings, booleans, null, undefined), just assign them directly.
        child [ p ]  =  parent [ p ] ;
      }
    }
  }
  // Return the newly created (or modified) child object/array.
  return  child ;
}


(  function  (  input  ) {

  /*
   * This function rotates the coordinates of an array of points 90 degrees counter-clockwise.
   * It creates a new array to store the rotated points, leaving the original untouched.
   *
   * The rotation transformation for a point (x, y) 90 degrees counter-clockwise is (-y, x).
   *
   * @param coordinates: The array of point objects {x, y} to be rotated.
   * @returns A new array containing the rotated point objects.
   */
  function  turn (  coordinates  ) {
    var  copy  =  clone (  coordinates  ) ; // Create a deep copy to avoid modifying the original array.

    // Iterate through each point in the copied array.
    for  (  var  i  =  0 ,  len  =  copy . length ;  i  <  len ;  i ++  ) {
      var  tmp  =  copy [ i ] . x ; // Store original x-coordinate temporarily.
      copy [ i ] . x  =  - copy [ i ] . y ; // New x is the negative of original y.
      copy [ i ] . y  =  tmp ;             // New y is the original x.
    }
    return  copy ; // Return the array with rotated points.
  }

  /*
   * This function compares two arrays of point objects for deep equality.
   * It checks if both arrays have the same length and if each corresponding point has identical x and y coordinates.
   *
   * @param a The first array of point objects.
   * @param b The second array of point objects.
   * @returns True if the arrays are equal in content and structure, false otherwise.
   */
  function  equal (  a ,  b  ) {
    // If the lengths of the arrays are different, they cannot be equal.
    if  (  a . length  !==  b . length  ) {
      return  false ;
    }

    // Iterate through each element (point object) in the arrays.
    for  (  var  i  =  0 ,  len  =  a . length ;  i  <  len ;  i ++  ) {
      // Compare x and y coordinates of corresponding points.
      // If any coordinate pair does not match, the arrays are not equal.
      if  (  a [ i ] . x  !==  b [ i ] . x  ||  a [ i ] . y  !==  b [ i ] . y  ) {
        return  false ;
      }
    }
    // If all points match and lengths are equal, the arrays are considered equal.
    return  true ;
  }

  // Initialize variables by processing the input string.
  // Replace Windows-style newlines with Unix-style, then split by newline into an array of strings.
  var  inputs  =  input . replace (  /\r/g ,  ''  ) . split (  "\n"  ) ,
       n , // Variable to store the number of line segments + 1 (for loop control).
       m , // Variable to store the number of points in a line segment - 1 (for loop control).
       i , // Generic loop counter.
       j ; // Another generic loop counter.

  // Main processing loop, continues until a specific break condition is met (n === 1).
  while  (  true  ) {
    var  dataset  =  [ ] ; // Initialize an empty array to hold the current dataset of polylines.

    // Read the first line of input for the number of polylines in the current test case.
    // Add 1 because the loop condition 'n--' will decrement it immediately.
    n  =  parseInt (  inputs . shift ( )  )  +  1 ;

    // If n becomes 1 (meaning the input line was '0'), it signifies the end of all test cases.
    if  (  n  ===  1  ) {
      break ; // Exit the main processing loop.
    }

    /*
     * This block processes and stores the polyline data for the current dataset.
     * Each polyline is represented as an array of relative coordinates,
     * where the first point is always (0,0).
     */
    while  (  n --  ) {
      var  data  =  [ ] ; // Array to store coordinates for the current polyline.

      // Read the number of points for this polyline from input. Subtract 1 for loop control.
      m  =  parseInt (  inputs . shift ( )  )  -  1 ;

      var  line  =  inputs . shift ( ) . split (  ' '  ) , // Read the first point (x, y) of the polyline.
           base_x  =  parseInt (  line [ 0 ]  ) , // X-coordinate of the base point.
           base_y  =  parseInt (  line [ 1 ]  ) ; // Y-coordinate of the base point.

      // The first point of each polyline is always (0,0) relative to itself.
      data . push (  {  x :  0 ,  y :  0  }  ) ;

      // Read remaining points and convert them to relative coordinates based on the first point.
      while  (  m --  ) {
        var  line  =  inputs . shift ( ) . split (  ' '  ) , // Read the next point (x, y).
             x  =  parseInt (  line [ 0 ]  ) ,
             y  =  parseInt (  line [ 1 ]  ) ;
        data . push (  {
          x :  x  -  base_x , // Calculate relative x-coordinate.
          y :  y  -  base_y   // Calculate relative y-coordinate.
        }  ) ;
      }
      dataset . push (  data  ) ; // Add the processed polyline data to the dataset.
    }

    // console.log(dataset); // Debugging line: shows the parsed dataset.

    /*
     * Extract the target polyline from the beginning of the dataset.
     * This is the shape we are trying to find matches for.
     * Also, create a reversed and normalized version of this purpose polyline.
     */
    var  purpose  =  dataset . shift ( ) , // The primary polyline to match against.
         // Define and immediately execute a function to create the reversed and normalized purpose polyline.
         purpose_r  =  ( function ( ) {
           var  tmp  =  clone (  purpose  ) . reverse ( ) , // Create a reversed deep copy of the purpose polyline.
                len  =  tmp . length ,
                base_x  =  tmp [ 0 ] . x , // X-coordinate of the new first point (after reversal).
                base_y  =  tmp [ 0 ] . y ; // Y-coordinate of the new first point (after reversal).

           // Adjust all points in the reversed polyline to be relative to its new first point (0,0).
           for  (  var  i  =  0 ,  len  =  tmp . length ;  i  <  len ;  i ++  ) {
             tmp [ i ] . x  -=  base_x ;
             tmp [ i ] . y  -=  base_y ;
           }
           return  tmp ; // Return the normalized, reversed polyline.
         } ) ( ) ; // Immediately invoked function expression to assign its return value.

    // console.log(purpose, purpose_r); // Debugging line: shows the original and reversed purpose polylines.

    /*
     * Iterate through each polyline in the remaining dataset to find matches.
     * We are comparing each of these polylines against the 'purpose' polyline
     * and its reversed version, considering up to four rotations.
     */
    for  (  i  =  0 ,  len  =  dataset . length ;  i  <  len ;  i ++  ) {
      /*
       * For each polyline from the dataset, attempt to match it by rotating it
       * four times (0, 90, 180, 270 degrees counter-clockwise).
       */
      for  (  j  =  0 ;  j  <  4 ;  j ++  ) {
        // console.log(dataset[i]); // Debugging: shows the current dataset item before rotation.

        var  turned  =  turn (  dataset [ i ]  ) ; // Rotate the current polyline 90 degrees.

        // console.log(turned); // Debugging: shows the polyline after rotation.
        // console.log(purpose, equal(purpose, turned)); // Debugging: comparison with original purpose.
        // console.log(purpose_r, equal(purpose_r, turned)); // Debugging: comparison with reversed purpose.
        // console.log(); // Debugging: Adds a blank line for better readability in console output.

        // Check if the rotated polyline matches either the original purpose or its reversed version.
        if  (  equal (  turned ,  purpose  )  ||  equal (  turned ,  purpose_r  )  ) {
          console . log (  i  +  1  ) ; // If a match is found, print its 1-based index (i+1).
          break ; // Break out of the inner loop (rotations) as a match has been found for this dataset item.
        }
        // If no match after this rotation, update the dataset item with the newly turned version.
        // This ensures the next rotation (j+1) applies to the already rotated shape.
        dataset [ i ]  =  turned ;
      }
    }
    // After processing all polylines for the current dataset, print a separator.
    console . log (  "+++++"  ) ;
  }
} ) (  require (  "fs"  ) . readFileSync (  "/dev/stdin" ,  "utf8"  )  ) ;