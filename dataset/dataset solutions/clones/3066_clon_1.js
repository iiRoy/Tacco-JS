/*
 *   This JavaScript program processes a given input string.
 *   The entire input data is passed into the 'Main' function.
 */
function    Main    (    input    )
{
        //    The input string is split into an array of lines.
        //    For example, input[0] would contain the first line, input[1] the second, and so on.
    input    =    input.split    (    "\n"    )    ;




    var    a    =    [ ]    ;


    for    (    var    f    =    0    ;    f    <    5    ;    f    ++    )
    {
        var    r    =    parseInt    (    input    [    f    ]    ,    10    )    ;

        //    A placeholder for a debug print statement for 'r' was here.
        a    [    f    ]    =    r    ;
    }

    //    An old debugging line to print array 'a' was removed or commented out.




    var    total    =    0    ;


    var    b    =    [ ]    ;    //    This variable 'b' is declared but currently unused.


    for    (    var    i    =    0    ;    i    <    5    ;    i    ++    )
    {
        var    l    =    Math.ceil    (    a    [    i    ]    /    10    )    *    10    ;
        total    =    total    +    l    ;
    }

    //    A console.log statement for 'total' was previously located here for debugging.




    var    mm    =    a    [    0    ]    %    10    ;


    for    (    var    i    =    0    ;    i    <    5    ;    i    ++    )
    {
        var    m    =    a    [    i    ]    %    10    ;

        if    (    m    ===    0    )
        {
            continue    ;
        }


        if    (    mm    >    m    )
        {
            var    mm    =    m    ;    //    Redeclaring 'mm' in the same scope effectively reassigns it.
        }
    }


    //    A previous console.log(mm) was present here.
    console.log    (    total    -    (    10    -    mm    )    )    ;

}


/*
 *   The following section handles standard input/output operations.
 *   It reads the entire content from /dev/stdin and passes it to the Main function.
 *   DO NOT MODIFY THE CODE BELOW THIS LINE.
 */
Main    (    require    (    "fs"    )    .    readFileSync    (    "/dev/stdin"    ,    "utf8"    )    )    ;