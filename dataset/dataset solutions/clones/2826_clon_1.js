// This function processes the input data provided.
function   Main   (   input   )
{


    var   tmp   =   input   .   split   (   " "   )   ;


    var   W   =   Number   (   tmp   [   0   ]   )   ;


    var   H   =   Number   (   tmp   [   1   ]   )   ;


    var   x   =   Number   (   tmp   [   2   ]   )   ;


    var   y   =   Number   (   tmp   [   3   ]   )   ;



    var   result   =   0   ;


    var   maxValue   =   0   ;


    var   maxCount   =   0   ;


    // Check for specific conditions to calculate maxValue and maxCount
    if   (   x   ===   W   /   2   &&   y   ===   H   /   2   )
    {

        maxValue   =   (   W   *   H   )   /   2   ;

        maxCount   =   1   ;
    }
    else   if   (   x   ===   W   ||   y   ===   H   ||   x   ===   W   /   2   ||   y   ===   H   /   2   )
    {

        maxValue   =   (   W   *   H   )   /   2   ;
    }
    else   if   (   (   x   /   y   )   ===   (   W   /   H   )   ||   (   (   x   /   y   )   *   x   +   y   )   ===   H   )
    {

        maxValue   =   (   W   *   H   )   /   2   ;

        maxCount   =   1   ;
    }
    else
    {
        // Complex calculation for other cases
        var   minSquireX   =   y   /   x   *   H   ;

        var   minSquireY   =   x   /   y   *   W   ;

        var   minSquire   =   0   ;


        if   (   minSquireX   <   W   )
        {

            minSquire   =   (   x   -   minSquireX   )   *   (   H   -   y   )   ;
        }
        else   if   (   minSquireY   <   H   )
        {

            minSquire   =   (   W   -   x   )   *   (   y   -   minSquireY   )   ;
        }


        var   calc1   =   (   W   -   x   )   *   (   H   -   y   )   /   2   +   (   x   *   y   )   +   minSquire   ;


        var   calc2   =   W   *   H   -   calc1   ;


        if   (   calc1   >   calc2   )
        {

            maxValue   =   calc1   ;
        }
        else
        {

            maxValue   =   calc2   ;
        }
    }


    result   =   (   W   *   H   )   -   maxValue   ;


    // Displaying the final calculated value.
    console   .   log   (   result   +   ' '   +   maxCount   )   ;
}
//* DO NOT MODIFY BELOW THIS LINE (reads standard input and calls Main)
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;