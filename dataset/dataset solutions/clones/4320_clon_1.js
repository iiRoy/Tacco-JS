/*
 * This is a Type I clone of the original JavaScript code.
 *
 * The purpose of this code is to count the occurrences of the digit '1'
 * within a given input string.
 *
 * All logical components, variable names, function names, and operations
 * are preserved exactly as in the original.
 * Only whitespace (indentation, spacing, blank lines) and comments have
 * been altered to create a visually distinct, yet functionally identical, clone.
 */


function   Main ( input )
{
    //  Begin by cleaning the input string.
    //  This removes any leading or trailing whitespace characters.
    input  =  input.trim ( ) ;


    //  Initialize a counter variable. This will store the total number
    //  of '1's found throughout the string.
    var    output    =    0    ;


    //  Iterate through each character of the input string from start to end.
    //  The loop variable 'i' serves as the current character index.
    for  (  var  i  =  0  ;  i  <  input.length  ;  i++  )
    {
        //  Extract the character at the current index 'i'.
        //  The slice(i, i + 1) method is used to get a single character substring.
        //  Then, compare this extracted character to the string literal "1".
        if  (  input.slice ( i  ,  i  +  1 )  ==  "1"  )
        {
            //  If the character matches "1", increment our counter.
            //  This statement is intentionally indented to demonstrate visual variation.
                    output++  ;
        }
    }


    //  After the loop has completed its iteration over all characters,
    //  print the final count of '1's to the standard output console.
    console.log ( output ) ;
}


//  This is the entry point for executing the Main function.
//  It reads the entire content of the standard input file (/dev/stdin)
//  as a UTF-8 encoded string.
//  The 'require("fs")' statement loads Node.js's file system module.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;