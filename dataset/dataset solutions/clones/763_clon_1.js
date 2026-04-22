/*
 * This JavaScript program reads data from standard input to simulate a voting or
 * counting process, determining a winner based on specific rules or declaring a tie.
 * It processes blocks of input, where each block starts with a number 'n'
 * indicating the count of subsequent items to process for that block.
 */

//  Import the Node.js 'fs' (file system) module.
//  Synchronously read the entire content of '/dev/stdin' (standard input)
//  and decode it as a UTF-8 string.
var input = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) ;

//  Trim any leading/trailing whitespace from the input string,
//  then split it into an array of strings based on newline characters.
//  Each element in 'arr' will represent a line from the input.
var arr = input . trim ( ) . split ( "\n" ) ;

//  This is the main processing loop. It continues indefinitely until
//  an explicit 'break' statement is encountered within its body.
while ( true )
{
    //  Extract the first element from the 'arr' array.
    //  The 'shift()' method removes the element and returns it.
    //  Subtracting 0 ( '- 0' ) is a common trick to explicitly convert the string to a number.
    var n = arr . shift ( ) - 0 ;

    //  Check if the extracted number 'n' is zero.
    if ( n == 0 )
    {
        //  If 'n' is 0, it signifies the end of input or a termination condition.
        //  Exit the 'while (true)' loop.
        break ;
    }

    //  Extract the next element from 'arr' (which should be a line of space-separated values).
    //  Split this string by spaces to get an array of individual items, storing it in 'a'.
    var a = arr . shift ( ) . split ( " " ) ;

    //  Initialize a boolean flag. This flag will be set to 'true' if a winner is found.
    var flag = false ;

    //  Initialize an empty object. This object will be used as a hash map
    //  to store the counts of each unique item encountered in array 'a'.
    var obj = { } ;

    //  Start a 'for' loop to iterate through the elements of array 'a'.
    //  The loop runs 'n' times, processing each item one by one.
    for ( var i = 0 ; i < n ; i ++ )
    {
        //  Increment the count for the current item 'a[i]' in the 'obj' object.
        //  The '|| 1' part handles the case where 'obj[a[i]]' is initially undefined (falsy),
        //  setting its value to 1 for the first occurrence. Otherwise, it adds 1 to the existing count.
        obj [ a [ i ] ] = obj [ a [ i ] ] + 1 || 1 ;

        //  Initialize an empty array 's'. This array will be used to store
        //  the counts and their corresponding items from 'obj' for sorting.
        var s = [ ] ;

        //  Iterate over each key (item) in the 'obj' object.
        for ( var k in obj )
        {
            //  Push an array containing the count and the item itself into 's'.
            //  Example: if obj = { 'apple': 3 }, then s.push([3, 'apple'])
            s . push ( [ obj [ k ] , k ] ) ;
        }

        //  Sort the 's' array. The sorting function compares the first elements
        //  of the inner arrays (which are the counts).
        //  This sorts 's' in ascending order based on counts.
        s . sort ( function ( a , b )
        {
            return a [ 0 ] - b [ 0 ] ; // Sorts numerically by the count (a[0]).
        } ) ;

        //  Calculate the number of remaining items to be processed in the current 'n' block.
        //  'i' is the current 0-indexed iteration, so 'i + 1' is the count of items processed so far.
        var nokori = n - ( i + 1 ) ;

        //  Edge case: If there's only one unique item counted so far.
        if ( s . length == 1 )
        {
            //  To avoid errors when comparing s[0] with s[1],
            //  we artificially add a second element with a count of 0.
            //  This simulates a scenario where no other item has been counted yet.
            s [ 1 ] = [ 0 ] ;
        }

        //  Check if the counts of the two lowest-ranked items are equal.
        //  s[0][0] is the count of the item with the lowest count.
        //  s[1][0] is the count of the item with the second lowest count.
        if ( s [ 0 ] [ 0 ] == s [ 1 ] [ 0 ] )
        {
            //  If they are equal, it means there's no clear leader among the lowest counts yet.
            //  Skip the rest of this iteration and move to the next item in the 'for' loop.
            continue ;
        }

        //  This is the core winning condition check.
        //  If the count of the current lowest-ranked item (s[0][0])
        //  is greater than the sum of the second lowest-ranked item's count (s[1][0])
        //  and the number of remaining items (nokori).
        if ( s [ 0 ] [ 0 ] > s [ 1 ] [ 0 ] + nokori )
        {
            //  If the condition is met, a winner is determined.
            //  Print the identifier of the winning item (s[0][1]) and the current turn number (i + 1).
            console . log ( s [ 0 ] [ 1 ] + " " + ( i + 1 ) ) ;

            //  Set the flag to 'true' to indicate a winner has been found.
            flag = true ;

            //  Exit the inner 'for' loop as the winner has been declared.
            break ;
        }
    }

    //  After the 'for' loop finishes (either by breaking or completing all iterations),
    //  check the 'flag'.
    if ( flag == false )
    {
        //  If 'flag' is still 'false', it means no winner was declared during the loop.
        //  This typically indicates a tie or an unresolved state.
        console . log ( "TIE" ) ;
    }
}
//  End of program execution.