/*
 * This JavaScript file defines a function 'main' that processes a string.
 * It's designed to modify the string based on specific indices
 * and then check if the final string matches a target value.
 */


//  The primary function which takes a string 's' as input.
function  main  (  s  )

{

    //  Initialize a variable 'r' by removing leading/trailing whitespace from 's'.
    var    r    =    s . trim ( ) ;

    //  Define an array of integer indices for processing.
    var    inject    =    [ 0 ,    4 ,    6 ,    8 ] ;


    //  Begin a loop to iterate through each element in the 'inject' array.
    for  (  var    i    =    0 ;    i    <    inject . length ;    i ++  )

    {
        //  Retrieve the current index 'j' from the 'inject' array.
        var    j    =    inject [ i ] ;

        //  Print the character at position 'j' of string 'r' to the console.
        console . log ( r [ j ] ) ;


        //  Conditional check: if the character at r[j] is not 'A'.
        if  (  r [ j ]    !==    'A'  )

        {
            //  If the character is not 'A', insert 'A' at position 'j' in string 'r'.
            //  This reconstructs 'r' by concatenating parts of the original 'r'
            //  with the character 'A' in between.
            r    =    r . slice ( 0 ,    j )    +    "A"    +    r . slice ( j ,    r . length ) ;
        }
        //  End of the 'if' block for character modification.

    }
    //  End of the 'for' loop.


    //  After the loop completes, perform a final check on the modified string 'r'.
    //  Print "YES" if 'r' is exactly "AKIHABARA", otherwise print "NO".
    console . log ( r    ===    "AKIHABARA"    ?    "YES"    :    "NO" ) ;

}

//  Call the 'main' function.
//  The input string 's' is obtained by reading the entire content of '/dev/stdin'
//  as a UTF-8 encoded string using Node.js's 'fs' module.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,    'utf8' ) ) ;