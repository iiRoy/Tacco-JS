/*
 * This is a Type I clone of an existing JavaScript program.
 * It processes input to calculate a specific sum.
 */

 function   Main (   input   )   {

  //   Parse the first element of the input array as the number N.
  var    N    =    parseInt (   input [   0   ]   ,    10   )   ;


  /*
   *  Slice the input array from the second element onwards,
   *  then map each element to an integer for array B.
   */
  var    B    =    input .   slice (   1   ) .   map (   n   =>    parseInt (   n   )   )   ;


  //   Initialize the sum with the first element of array B.
  var    sum    =    B [   0   ]   ;

  //   Loop through the array B starting from the second element.
  for    (   var    i    =    1   ;    i    <    N   ;    i   ++   )   {

   //   Check if this is the last iteration of the loop.
   if    (   i    ===    N    -    1   )   {

    //   If it's the last element, add the previous element of B to sum.
    sum    +=    B [   i    -    1   ]   ;

   }    else    {

    //   Otherwise, add the minimum of the current and previous elements of B to sum.
    sum    +=    Math .   min (   B [   i    -    1   ]   ,    B [   i   ]   )   ;

   }

  }

  //   Print the final calculated sum to the console.
  console .   log (   sum   )   ;

 }


 //   Read input from stdin, trim whitespace, and split by newlines or spaces.
 Main (   require (   "fs"   ) .   readFileSync (   "/dev/stdin"   ,    "utf8"   ) .   trim (   ) .   split (   /\n|\s/   )   )   ;