/*
 * This program processes input data.
 * The 'input' variable will hold all the input data.
 */
 function   Main  (  input  )
{

    input   =   input . split ( "\n" ) ;


    var   S   =   input [ 0 ] ;

    S   =   S . replace ( /o/g , "" ) ;

    // Check the length of the processed string S
    if  (  S . length   >=   8  ) {
        console . log ( "NO" ) ;
    }
    else
    { // If S is shorter, it's a "YES"
        console . log ( "YES" ) ;
    }

} // End of Main function

/*
 * The following line handles standard input/output
 * and calls the Main function.
 * Please do not modify this part.
 */
Main (  require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" )  ) ;