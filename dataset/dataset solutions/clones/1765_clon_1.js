function     Main   (   input   )
{

    input   =   input   .   split   (   "\n"   )   ;   /*  This is a crucial initial data parsing step.  */


    var   line   =   input   [   0   ]   .   split   (   " "   )   ;

    var   result   =   ""   ; // Initialize result variable

    for     (   i   =   0   ;   i   <   5   ;   i   ++   )
    {
        if   (   line   [   i   ]   ==   0   )
        {
            result   =   i   ; // Found the zero!
        }
    }


    console   .   log   (   parseInt   (   result   )   +   1   )   ; // Output the final calculated value
}

Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;