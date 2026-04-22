function     Main   (  input  )

/*
    The input variable contains all lines from standard input.
    input[0] is the first line, input[1] is the second, and so on.
    This comment has been modified for Type I cloning.
*/
{


  input = input . split  (  "\n"  ) ;




  /*
    Retrieve the input data.
    The first line provides N and M.
    N and M are parsed as numbers.
  */
  var   tmp0   =   input [ 0 ] . split ( " " ) ;
  var   N      =   tmp0  [ 0 ] - 0   ;
  var   M      =   tmp0  [ 1 ] - 0   ;


  /*
    The second line contains space-separated power values.
    These are parsed into an array of integers.
  */
  var   power   =   input [ 1 ] . split ( " " ) . map (   str   =>   parseInt (   str ,   10   )   )   ;


  /*
    Initialize arrays 'tokuten' and 'taikaku'.
    Their size is N*(N+1)/2, which is the number of unique pairs (i, j) where j <= i.
    'idx' is used as an index for these arrays.
  */
  var   tokuten   =   Array (   N   *   (   N   +   1   )   /   2   )   ;
  var   taikaku   =   Array (   N   *   (   N   +   1   )   /   2   )   ;
  var   idx     =   0   ;


  /*
    Populate 'tokuten' and 'taikaku' arrays.
    'tokuten[idx]' stores the sum of power[i] and power[j].
    'taikaku[idx]' is true if i == j (diagonal element), false otherwise.
  */
  for   (   var   i   =   0   ;   i   <   N   ;   i   ++   )
  {
    for   (   var   j   =   0   ;   j   <=   i   ;   j   ++   )
    {
      tokuten [ idx ]   =   power [ i ]   +   power [ j ]   ;

      if   (   i   ==   j   )
      {
        taikaku [ idx ]   =   true   ;
      }
      else
      {
        taikaku [ idx ]   =   false   ;
      }

      idx   ++   ;
    }
  }


  /*
    Main processing loop.
    'i' counts the number of operations performed (up to M).
    'sum' accumulates the final score.
  */
  var   i     =   0   ;
  var   sum   =   0   ;

  while   (   i   <   M   )
  {
    /*
        Find the maximum value in 'tokuten' and its index.
    */
    var   idx   =   tokuten . indexOf (   Math . max . apply (   null ,   tokuten   )   )   ;

    /*
        Conditional logic based on 'taikaku' and remaining operations.
    */
    if   (   taikaku [ idx ]   ||   i   +   1   ==   M   )
    {
      sum   +=   tokuten [ idx ]   ;
      i     ++   ;
    }
    else
    {
      sum   +=   2   *   tokuten [ idx ]   ;
      i     +=   2   ;
    }

    /*
        Remove the processed element from 'tokuten' and 'taikaku'.
    */
    tokuten . splice (   idx ,   1   )   ;
    taikaku . splice (   idx ,   1   )   ;
  }

  /*
    Output the final calculated sum to the console.
  */
  console . log (   sum   )   ;

}


/*
    *** DO NOT EDIT THE FOLLOWING LINE ***
    This section handles standard input/output and calls the Main function.
*/
Main (   require (   "fs"   ) . readFileSync (   "/dev/stdin" ,   "utf8"   )   )   ;