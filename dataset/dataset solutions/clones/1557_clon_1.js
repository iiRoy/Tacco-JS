/*
 * This JavaScript function is a Type I clone.
 * This means its functionality, identifiers, and expressions are identical
 * to an original source. Only whitespace and comments have been altered
 * to create a visually distinct, yet functionally equivalent, piece of code.
 */
function  MainD  ( input )
{

  //   First, the entire input string is divided into an array of lines.
  const  arr  =  input . split ( '\n' ) ;


  //   Next, each line is processed to separate its components by spaces,
  //   resulting in an array of arrays, where each inner array contains
  //   the two split parts from the original line.
  const  arrAB  =  arr . map (  val  =>  val . split ( ' ' )  ) ;


  //   Additionally, for each line, a Set object is created from its
  //   space-separated components. This is typically done for efficient
  //   lookup operations later in the code.
  const  setAB  =  arr . map (  val  =>  new  Set (  val . split ( ' ' )  )  ) ;


  //   Initialize a counter for the number of groups.
  //   It starts with the total number of initial items (lines in the input).
  let  groupNum  =  arrAB . length ;


  //   Outer loop: Iterates from the second element (index 1) up to the end
  //   of the `arrAB` array. This element (`i`) will be compared against
  //   all preceding elements.
  for  (  let  i  =  1 ;  i  <  arrAB . length ;  i++  )
  {
    // Inner loop: Compares the current element `arrAB[i]` with every
    // element that appeared before it, from index 0 up to `i-1`.
    for  (  let  j  =  0 ;  j  <  i ;  j++  )
    {
      /*
       *   Conditional check for overlap or relationship between elements.
       *   This condition evaluates if:
       *   1.  The Set at index `j` (`setAB[j]`) contains the first element
       *       of the array at index `i` (`arrAB[i][0]`).
       *   OR
       *   2.  The Set which is the *first element* of `setAB[j]`
       *       (`setAB[j][0]`) contains the second element of the array
       *       at index `i` (`arrAB[i][1]`).
       *       NOTE: The expression `setAB[j][0].has(...)` implies a specific
       *       structure for `setAB[j]` (e.g., an array where the first element
       *       is a Set). This exact expression is preserved as per Type I cloning rules.
       */
      if  (  setAB [ j ] . has ( arrAB [ i ] [ 0 ] )  ||  setAB [ j ] [ 0 ] . has ( arrAB [ i ] [ 1 ] )  )
      {
        //   If the condition is met (an overlap or relationship is found),
        //   the group count is decremented.
        groupNum-- ;

        //   Once a relationship is found for the current `i`, there's no
        //   need to check `i` against any further preceding `j` elements.
        //   Therefore, the inner loop is terminated.
        break ;
      }
    }
  }

  //   Finally, the calculated total number of groups is printed to the console.
  console . log ( groupNum ) ;

}


//   This is the entry point for executing the program.
//   It reads the entire content of `/dev/stdin` as a UTF-8 string,
//   removes any leading/trailing whitespace, and then passes this
//   processed string as input to the `MainD` function.
MainD ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ) ;