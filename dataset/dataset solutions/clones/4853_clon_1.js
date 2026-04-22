/* This comment indicates that 'input' holds all input data. */
function   Main ( )
{
    // This line was previously commented out, now it's just a blank space.


    let   s   =   inS ( )   ;


    /* Conditional logic to determine output based on 's' array elements. */
    if ( check ( s [ 0 ] )   ==   s [ 3 ]   &&
         check ( s [ 1 ] )   ==   s [ 2 ] )
    {
        out ( "Yes" ) ; /* Output "Yes" if the condition is met. */
    }
    else
    {
        out ( "No" ) ;  // Otherwise, output "No".
    }

} // End of Main function definition.


function   check   (   t   )
{
    /* This function performs a character mapping. */
    if   (   t   ==   "d"   )
    {
        return   "b"   ;
    }
    if   (   t   ==   "b"   )
    {
        return   "d"   ;
    }
    if   (   t   ==   "p"   )
    {
        return   "q"   ;
    }
    if   (   t   ==   "p"   )   /* Redundant check, but kept as per Type I definition. */
    {
        return   "q"   ;
    }
} // Closing brace for check function.


/* Debugging function, executed when "Run" button is pressed. */
let input , inputCnt ;


function   debug   ( )
{
    input   =   document . getElementById ( "input" ) . value   ;

    /* Assigning values sequentially to the 'input' array. */
    input   =   input . replace (   /\n/g   ,   " "   )   ;

    input   =   input . split ( " " )   ;

    inputCnt   =   0   ;

    Main ( )   ;
}


function   out   (   output   )
{
    console . log ( output )   ;
}


function   inI   ( )
{
    return   parseInt ( inS ( )   ,   10 )   ;
}


function   inF   ( )
{
    return   parseFloat ( inS ( ) )   ;
}


function   inS   ( )
{
    return   input [ inputCnt ++ ]   ;
}


/* Do not edit below this line (reads from stdin and calls Main). */
input   =   require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" )   ;
Main ( )   ;