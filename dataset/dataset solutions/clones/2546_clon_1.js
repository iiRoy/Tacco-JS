/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains exact logical and structural equivalence
 * with the provided source. Only whitespace and comments
 * have been modified extensively to create a visually
 * distinct but functionally identical version.
 */

function    Main   (   arg   )    {

    //  Declare and initialize variable 'N'
    //  It extracts the first number from the first line of the input 'arg'.
    var    N    =    arg . split ( "\n" ) [ 0 ] . split ( " " ) [ 0 ]   -   0    ;

    //  Declare and initialize variable 'K'
    //  It extracts the second number from the first line of the input 'arg'.
    var    K    =    arg . split ( "\n" ) [ 0 ] . split ( " " ) [ 1 ]   -   0    ;

    /*
     *  Declare and initialize variable 'P'.
     *  This extracts the numbers from the second line of the input 'arg',
     *  splitting them by spaces and converting each segment to a number.
     */
    var    P    =    arg . split ( "\n" ) [ 1 ] . split ( " " ) . map ( v   =>   v   -   0 )    ;


    //  Initialize an empty array to store the results of the processing.
    var    ans    =    [ ]    ;


    //  Begin a loop that iterates 'N - K + 1' times.
    //  The loop variable 'i' represents the starting index for slicing.
    for    (    var    i    =    0    ;    i    <    N    -    K    +    1    ;    i ++    )    {

        //  Create a temporary sub-array 'tmp' by slicing 'P' from 'i' to 'i + K'.
        var    tmp    =    P . slice ( i ,    i    +    K )    ;

        //  Sort the temporary sub-array 'tmp'.
        //  Note: 'compareNumbers' is an external function assumed to be defined elsewhere.
        tmp . sort ( compareNumbers )    ;

        //  Construct a new array for the current iteration 'i'.
        //  It concatenates the part of 'P' before 'i', the sorted 'tmp',
        //  and the part of 'P' after 'i + K'.
        //  The resulting array is then converted to a string and stored in 'ans[i]'.
        ans [ i ]    =    P . slice ( 0 ,    i ) . concat ( tmp ) . concat ( P . slice ( i    +    K ) ) . toString ( )    ;
    }


    //  Create a Set named 'aa' from the 'ans' array.
    //  A Set automatically handles uniqueness, so 'aa.size' will give the count of unique strings.
    var    aa    =    new    Set ( ans )    ;


    //  Output the size of the Set 'aa' to the console.
    //  This represents the total number of unique processed permutations.
    console . log ( aa . size )    ;
}

//  Call the 'Main' function.
//  The input 'arg' is obtained by reading the content of '/dev/stdin'
//  using Node.js's 'fs' module, encoded in UTF-8.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,    "utf8" ) )    ;