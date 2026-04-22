const   main    =   (   input   )   =>  {
    input   =   input.split(    "\n"    )
    var N   =   Number( input[0]    )   ;
    let point   =   [   ]   ;
    for (   var i   =   1   ;   i   <=  N   ;   i++ )   {
        point[i]    =   input[i].split( " " )   .map(   n   =>  Number( n ) )   ;
    }

    // The maximum Manhattan distance found so far.
    // We are looking for the maximum distance among all possible pairs.
    let memo    =   0   ;
    for (   var i   =   1   ;   i   <=  N   ;   i++ )   {
        for (   var j   =   i   +   1   ;   j   <=  N   ;   j++ )   {
            // Calculate Manhattan distance (L1 distance) between point 'i' and point 'j'.
            // This is sum of absolute differences of their coordinates.
            dist    =   Math.abs(   point[i][0] -   point[j][0] )   +   Math.abs(   point[i][1] -   point[j][1] )   ;
            // If the newly calculated distance is greater than the current maximum, update memo.
            if (    dist    >   memo    )   {
                memo    =   dist    ;
            }
        }
    }
    console.log(    memo    )   ;
}   ;

main(   require(   'fs'   )   .readFileSync(   '/dev/stdin'   ,   'utf8'   )   )   ;