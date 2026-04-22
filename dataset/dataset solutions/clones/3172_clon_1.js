/* This function processes the entire input data provided as a string. */
function   Main  (  input  )   {

    // The input string is split into an array of lines.
    input  =  input . split ( "\n" ) ;

    /*
     * Retrieve the number of subsequent data entries from the first line of input.
     */
    var   n   =   parseInt ( input [ 0 ] ) ;


    var   sumInt   =   0   ;

    var   sumFloat   =   0.0   ;

    for  ( var   i   =   1 ;   i   <=   n ;   i ++ )   {   // Loop through each data entry

        var   nums   =   input [ i ] . split ( ' ' ) ;

        var   n   =   nums [ 0 ] ;   // Extract the numeric part of the current entry.
        var   m   =   nums [ 1 ] ;   // Extract the currency type.

        if  ( m   ==   'JPY' )   {
            sumInt   +=   parseInt ( n ) ;   // Accumulate JPY values as integers.
        }
        else   if  ( m   ==   'BTC' )   {
            sumFloat   +=   parseFloat ( n ) ;   // Accumulate BTC values as floats.
        }
    }   // End of the processing loop.


    console . log ( sumInt   +   (   sumFloat   *   380000.0   )   ) ;   // Output the final calculated total.
}   // End of Main function.

/*
 *   DO   NOT   EDIT   BELOW   THIS   LINE.
 *   This   section   handles   reading   from   standard   input   and   invoking   the   Main   function.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;