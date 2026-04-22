var   Input   =   [ ] ;      //  Initialize an empty array named 'Input' to hold the raw data.

var   arr   =   [ ] ;        //  Initialize another empty array named 'arr' for storing counts.

/*
 *  Read the content of /dev/stdin synchronously.
 *  The content is decoded as UTF-8.
 *  Then, it is split into an array of strings using a regular expression:
 *  /,\\d+\\n{0,}/ which matches a comma, followed by one or more digits,
 *  and then zero or more newline characters.
 */
Input   =   require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) . split ( /,\d+\n{0,}/ ) ;

var   length   =   Input . length ;   //  Store the number of elements obtained from the input in 'length'.

var   a ;                      //  Declare a temporary variable 'a' to hold the current element during iteration.

//  First processing loop: Iterate through the 'Input' array to count occurrences of each element.
for   ( var   i   =   0 ;   i   <   length ;   i ++ )
{
    a   =   Input [ i ] ;      //  Assign the current element from 'Input' to variable 'a'.

    //  Check if the current element 'a' has been encountered before in 'arr'.
    if   ( arr [ a ]   ===   undefined )
    {
        arr [ a ]   =   1 ;   //  If 'a' is encountered for the first time, initialize its count to 1.
    }
    else
    {
        arr [ a ] ++ ;       //  If 'a' has been seen before, increment its existing count.
    }
}

/*
 *  Reassign the 'lenth' variable (note the original typo preserved)
 *  to the total number of elements in the 'arr' array.
 *  This array now holds the frequency counts.
 */
lenth   =   arr . length ;

//  Second loop: Iterate through the 'arr' array to find and print elements with counts greater than 1.
for   ( i   =   0 ;   i   <   lenth ;   i ++ )
{
    /*
     *  Check two conditions for the current element at index 'i' in 'arr':
     *  1.  It must not be 'undefined' (meaning it was a key that was incremented).
     *  2.  Its count must be strictly greater than 1 (meaning it's a duplicate).
     */
    if   ( arr [ i ]   !==   undefined   &&   arr [ i ]   >   1 )
    {
        //  If both conditions are met, log the index 'i' and its count to the console.
        console . log ( i   +   ' '   +   arr [ i ] ) ;
    }
}