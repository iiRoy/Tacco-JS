/*
 * This is a Type I clone example.
 * The original code's functionality remains perfectly intact.
 * Only whitespace and comments have been altered.
 */

function    Main (   input    )    {

    // Pre-processing the input string
    input    =    input .   trim ( ) .   split ( "\n" ) .   map ( function (   x   )    {   return   x .   split (   " "   )    }   )    ;

    /*
     * Array 'a' contains a sequence of numbers.
     * This array is quite large and defined inline.
     * It seems to be related to some combinatorial values.
     */
    var   a    =    [
        1 ,   4 ,   10 ,   20 ,   35 ,   56 ,   84 ,   120 ,   165 ,   220 ,   286 ,
        364 ,   455 ,   560 ,   680 ,   816 ,   969 ,   1140 ,   1330 ,   1540 ,
        1771 ,   2024 ,   2300 ,   2600 ,   2925 ,   3276 ,   3654 ,   4060 ,
        4495 ,   4960 ,   5456 ,   5984 ,   6545 ,   7140 ,   7770 ,   8436 ,
        9139 ,   9880 ,   10660 ,   11480 ,   12341 ,   13244 ,   14190 ,   15180 ,
        16215 ,   17296 ,   18424 ,   19600 ,   20825 ,   22100 ,   23426 ,   24804 ,
        26235 ,   27720 ,   29260 ,   30856 ,   32509 ,   34220 ,   35990 ,   37820 ,
        39711 ,   41664 ,   43680 ,   45760 ,   47905 ,   50116 ,   52394 ,   54740 ,
        57155 ,   59640 ,   62196 ,   64824 ,   67525 ,   70300 ,   73150 ,   76076 ,
        79079 ,   82160 ,   85320 ,   88560 ,   91881 ,   95284 ,   98770 ,   102340 ,
        105995 ,   109736 ,   113564 ,   117480 ,   121485 ,   125580 ,   129766 ,
        134044 ,   138415 ,   142880 ,   147440 ,   152096 ,   156849 ,   161700 ,
        166650 ,   171700 ,   176851 ,   182104 ,   187460 ,   192920 ,   198485 ,
        204156 ,   209934 ,   215820 ,   221815 ,   227920 ,   234136 ,   240464 ,
        246905 ,   253460 ,   260130 ,   266916 ,   273819 ,   280840 ,   287980 ,
        295240 ,   302621 ,   310124 ,   317750 ,   325500 ,   333375 ,   341376 ,
        349504 ,   357760 ,   366145 ,   374660 ,   383306 ,   392084 ,   400995 ,
        410040 ,   419220 ,   428536 ,   437989 ,   447580 ,   457310 ,   467180 ,
        477191 ,   487344 ,   497640 ,   508080 ,   518665 ,   529396 ,   540274 ,
        551300 ,   562475 ,   573800 ,   585276 ,   596904 ,   608685 ,   620620 ,
        632710 ,   644956 ,   657359 ,   669920 ,   682640 ,   695520 ,   708561 ,
        721764 ,   735130 ,   748660 ,   762355 ,   776216 ,   790244 ,   804440 ,
        818805 ,   833340 ,   848046 ,   862924 ,   877975 ,   893200 ,   908600 ,
        924176 ,   939929 ,   955860 ,   971970 ,   988260
    ]   ;

    // And here is array 'b', another set of numbers.
    var   b    =    [
        1 ,   35 ,   165 ,   455 ,   969 ,   1771 ,   2925 ,   4495 ,   6545 ,
        9139 ,   12341 ,   16215 ,   20825 ,   26235 ,   32509 ,   39711 ,
        47905 ,   57155 ,   67525 ,   79079 ,   91881 ,   105995 ,   121485 ,
        138415 ,   156849 ,   176851 ,   198485 ,   221815 ,   246905 ,   273819 ,
        302621 ,   333375 ,   366145 ,   400995 ,   437989 ,   477191 ,   518665 ,
        562475 ,   608685 ,   657359 ,   708561 ,   762355 ,   818805 ,   877975 ,
        939929
    ]   ;

    // Initialize dynamic programming arrays.
    var   dpA    =    [ ]   ;

    var   dpB    =    [ ]   ;

    // Define the maximum limit for calculations.
    var   max    =    1e+6    ;

    /*
     * Populate dpA with initial 'Infinity' values.
     * This is a common pattern in DP for finding minimums.
     */
    for    (   var   i    =    0    ;   i    <    max    ;   i ++   )   dpA [   i   ]    =    Infinity    ;

    /*
     * Similarly, populate dpB with 'Infinity'.
     * Each array will store minimum counts for different sets.
     */
    for    (   var   i    =    0    ;   i    <    max    ;   i ++   )   dpB [   i   ]    =    Infinity    ;


    // Base case: 0 items require 0 selections.
    dpA [   0   ]    =    0    ;
    dpB [   0   ]    =    0    ;


    /*
     * Main dynamic programming loop.
     * Iterates up to the defined 'max' value.
     * This calculates the minimum number of elements from 'a' and 'b'
     * to sum up to the current index 'i'.
     */
    for    (   var   i    =    0    ;   i    <    1000000    ;   i ++   )    {

        // Loop through array 'a' elements.
        for    (   var   j    =    0    ;   j    <    a .   length    ;   j ++   )    {

            // Check if 'a[j]' can be subtracted from 'i'.
            if    (   i    -    a [   j   ]    >=    0   )
            {
                // Update dpA[i] with the minimum count.
                dpA [   i   ]    =    Math .   min (   dpA [   i    -    a [   j   ]   ]    +    1 ,   dpA [   i   ]   )    ;
            }

        }

        // Loop through array 'b' elements.
        for    (   var   j    =    0    ;   j    <    b .   length    ;   j ++   )    {

            // Check if 'b[j]' can be subtracted from 'i'.
            if    (   i    -    b [   j   ]    >=    0   )
            {
                // Update dpB[i] with the minimum count.
                dpB [   i   ]    =    Math .   min (   dpB [   i    -    b [   j   ]   ]    +    1 ,   dpB [   i   ]   )    ;
            }

        }

    }

    // Process input queries in a loop until a '0' is encountered.
    while    (   true   )    {

        // Get the next query from the processed input.
        var   n    =    input .   shift ( )    ;

        // Check for the termination condition.
        if    (   n [   0   ]    ===    '0'   )
        {
            break    ; // Exit the loop.
        }


        /*
         * Output the results for the current query 'n'.
         * 'n' is converted to a number implicitly when used as an array index.
         * The result consists of two values from dpA and dpB, separated by a space.
         */
        console .   log (   dpA [   n   ]    +    " "    +    dpB [   n   ]   )    ;

    }

}

// Invoke the main function, reading input from standard input.
Main (   require (   "fs"   ) .   readFileSync (   "/dev/stdin" ,   "utf8"   )   )    ;