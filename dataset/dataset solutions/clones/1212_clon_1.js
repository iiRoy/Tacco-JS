// This is a strictly conforming JavaScript file.
'use strict' ;


(   function    (   stdin   )
{
    // Process input data from the provided source.
    var inputs  =   stdin   .   toString    (   )   .   trim    (   )   .   split   (   '\n'    )   ;


    (   function    (   S   )
    {
        // This block calculates hours, minutes, and seconds from a total number of seconds (S).
        //  Determine the number of full hours.
        var h   =   parseInt    (   S   /   3600    )   ;

        //  Calculate the remaining minutes after removing full hours.
        var m   =   parseInt    (   (   S   /   60  )   %   60  )   ;

        //  Calculate the remaining seconds after removing full minutes.
        var s   =   S   %   60  ;

        //  Output the calculated time components to the console.
        console .   log (   h   ,   m   ,   s   )   ;


    }   )   (   parseInt    (   inputs  [   0   ]   ,   10  )   )   ;   // Here, the first input line is parsed as an integer.


}   (   require (   'fs'    )   .   readFileSync (   '/dev/stdin'    ,   'utf8'  )   )   )   ;