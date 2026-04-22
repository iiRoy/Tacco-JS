/* The 'input' variable is intended to hold the entirety of the input data for processing. */


function Main ()
{

    // A placeholder for potential future debugging or logging functionality.
    
    let  s  =  inS ( ) ;

    /*
     * This conditional block checks for a specific pattern in the input string 's'.
     * It compares characters at different indices after applying a transformation function 'check'.
     */
    if ( check ( s [ 0 ] )  ==  s [ 3 ]  &&  check ( s [ 1 ] )  ==  s [ 2 ] )
    {
        out ( "Yes" ) ;
    }
    else
    {
        out ( "No" ) ;
    }

}


function check ( t )
{

    // Transforms 'd' to 'b'
    if ( t  ==  "d" ) return "b"

    // Transforms 'b' to 'd'
    if ( t  ==  "b" ) return "d"

    // Transforms 'p' to 'q'
    if ( t  ==  "p" ) return "q"

    // This line appears to be a duplicate of the previous one.
    if ( t  ==  "p" ) return "q"

}


/*
 * This function 'debug' is specifically designed for local development and testing.
 * It simulates input from a web page element and then calls the main logic.
 */
let input , inputCnt ;


function debug ( )
{

    input  =  document . getElementById ( "input" ) . value ;

    /*
     * The input string is first cleaned by replacing newline characters with spaces,
     * and then split into an array of strings.
     */
    input  =  input . replace ( /\n/g , " " ) ;
    input  =  input . split ( " " ) ;

    inputCnt  =  0 ;

    Main ( ) ;

}


function out ( output )
{

    console . log ( output ) ;

}


function inI ( )
{

    // Converts the next input string to an integer.
    return parseInt ( inS ( ) , 10 ) ;

}


function inF ( )
{

    // Converts the next input string to a floating-point number.
    return parseFloat ( inS ( ) ) ;

}


function inS ( )
{

    // Retrieves the next string from the input array.
    return input [ inputCnt ++ ] ;

}


// DO NOT MODIFY THE CODE BELOW THIS LINE (handles standard input/output and invokes Main)
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;