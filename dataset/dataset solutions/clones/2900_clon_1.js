/*
 * This function processes the input data.
 * The 'input' parameter contains the entire input as a string.
 */
function     Main    (    input    )    {

  input      =      input.split ( "\n" ) ;

  var    Q    =    parseInt ( input [ 0 ] ) ;

  // Process the input lines to extract queries.
  // Qs will be an array of arrays, where each inner array represents a query.
  var    Qs    =    input.slice ( 1,    Q    +    1 ) .map ( x    =>    x.split ( " " ) .map ( y    =>    parseInt ( y ) ) ) ;

  var    ans    =    new    Array ( Q ) ;
  ans.fill ( 0 ) ; // Initialize all elements of the answer array to zero.

  // Loop through each query in the Qs array.
  for    (    var    i    =    0    ;    i    <    Qs.length    ;    i    ++    )    {
    // Inner loop based on the third element of the current query (Qs[i][2]).
    for    (    var    j    =    0    ;    j    <    Qs [ i ] [ 2 ]    ;    j    ++    )    {
      // Special handling for the first iteration (j == 0).
      if    (    j    ==    0    )    {
        ans [ i ]    =    Qs [ i ] [ 0 ]    %    1000003    ;
      }    else    {
        // Subsequent iterations update ans[i] using a formula involving previous ans[i] and query parameters.
        ans [ i ]    =    ans [ i ]    *    (    Qs [ i ] [ 0 ]    +    j    *    Qs [ i ] [ 1 ]    )    %    1000003    ;
      }
    }
    // Output the calculated answer for the current query.
    console.log ( ans [ i ] ) ;
  }
}
/*
 * Please do not edit the lines below this point.
 * They are responsible for reading standard input and calling the Main function.
 */
Main    (    require ( "fs" ) .readFileSync ( "/dev/stdin" ,    "utf8" )    ) ;