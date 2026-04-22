/* This function processes the entire input data provided. */
function   Main  (  input  )   {

  var   list   =   input.split( "\n" )  [1]  .split( " " )  ;  // Extract and split the relevant line of input into an array of strings.

  for  (  var  i  =  0  ;  i  <  list.length  ;  i++  )  {
      list[i]  =  parseInt(  list[i]  )  ;  // Convert each string element in the list to an integer.
  }

  while  (  list.length  >  2  )  { // Continue processing the list until only two elements remain.

    /* Find the minimum value within the current list,
     * specifically excluding the first and last elements
     * to ensure they are not selected for removal. */
    var   tmpList   =   JSON.parse( JSON.stringify( list ) ) ; // Create a deep copy of the list.

    tmpList[0]  =  1e9  +  1  ;  // Temporarily set the first element to a very large value to exclude it from min calculation.
    tmpList[ tmpList.length  -  1 ]  =  1e9  +  1  ;  // Temporarily set the last element to a very large value.

    var   listMin   =   Math.min.apply( null,   tmpList ) ; // Determine the actual minimum value from the modified temporary list.

    var   listMinIndex   =   tmpList.indexOf( listMin ) ; // Get the index of this minimum value in the temporary list.

    var   mae   =   list[ listMinIndex  -  1 ] ; // Get the element immediately preceding the minimum.
    var   naka   =   list[ listMinIndex ] ; // Get the minimum element itself.
    var   ato   =   list[ listMinIndex  +  1 ] ; // Get the element immediately succeeding the minimum.

    list[ listMinIndex  -  1 ]  =  mae  +  naka  ; // Update the preceding element by adding the minimum to it.
    list[ listMinIndex  +  1 ]  =  ato  +  naka  ; // Update the succeeding element by adding the minimum to it.

    list.splice( listMinIndex,  1 )  ; // Remove the minimum element from the original list.
  }

  var   output   =   parseInt( list[0] )   +   parseInt( list[1] ) ; // Calculate the final sum of the two remaining elements.

  console.log( output ) ; // Output the calculated result to the console.
}
// DO NOT EDIT THE FOLLOWING LINE. This handles standard input/output and calls the Main function.
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) ;