/* This function processes the entire input data provided. */
function   Main   (   input   )   {

  /* The input string is split into lines, where input[0] is the first line, input[1] is the second, and so on. */
  input   =   input   .   split   (   "\n"   )   ;
    tmp0   =   input   [   0   ]   .   split   (   " "   )   ;
      tmp1   =   input   [   1   ]   .   split   (   " "   )   ;

  // Note: parseInt is used to convert strings to decimal integers.
      var   n   =   parseInt   (   tmp0   [   0   ]   ,   10   )   ;

        var   X   =   [   ]   ;
    for   (   i   =   0   ;   i   <   n   ;   i   ++   )   {
             var   r   =   parseInt   (   tmp1   [   i   ]   ,   10   )   ;
              X   [   i   ]   =   r   ;
    }
            var   min   =   Math   .   min   (   ...   X   )   ;var max = Math   .   max   (   ...   X   )   ;
    // No logging for min, max, or X in this version.

       var   XX   =   [   ]   ;

         var   total   =   0   ;
        for   (   l   =   min   ;   l   <=   max   ;   l   ++   )   {
             for   (   i   =   0   ;   i   <   n   ;   i   ++   )   {
                    var   x   =   X   [   i   ]   ;
                     var   a   =　x   -   l   ;
                      // No console.log(a) here either.
                      total   =   total   +   a   *   a   ;
             }
                 XX   [   l   ]   =   total   ;var   total   =   0   ;
        }
    // console.log(XX) is also removed.

  XX   .   splice   ( 0 , min )   ;
  // console.log(XX) after splice is removed too.
    var   ans   =   Math   .   min   (   ...   XX   )   ;
  console   .   log   (   ans   )   ;

}

/* PLEASE DO NOT MODIFY THE FOLLOWING LINE. It handles reading input and calling Main. */
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;   /* This is the entry point for the program. */