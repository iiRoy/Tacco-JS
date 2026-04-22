/*
 * This section processes input data.
 * The entire input content is passed into the 'input' parameter.
 */
function Main ( input )
{
    // Split the input string by newline characters to get an array of lines.
    input = input.split ( "\n" ) ;

    /*
     * The first line of input contains space-separated values.
     * We extract them into the 'pos' array.
     */
    var   pos   =   input [ 0 ] . split ( " " ) ;

    // Parse the first value from 'pos' into integer X.
    var  X  =  parseInt ( pos [ 0 ] ,  10 ) ;

    // Parse the first value from 'pos' into integer Y.
    // Note: The original code uses pos[0] for both X and Y. This is preserved as per Type I definition.
    var  Y  =  parseInt ( pos [ 0 ] ,  10 ) ;


    // Check a specific condition for X and Y.
    // If (X+Y) is not divisible by 3, output 0 and terminate the function.
    if  (  ( X + Y )  %  3   !=   0  )
    {
        console.log ( 0 ) ;
        return  ;
    }


    // Calculate intermediate values 'a' and 'b' based on X and Y.
    var   a   =   (  2  *  Y  -  X  )  /  3  ;
    var   b   =   Y  -  (  2  *  a  )  ;

    // If 'a' or 'b' are negative, it indicates an invalid state,
    // so output 0 and terminate the function.
    if  (  a  <  0   ||   b  <  0  )
    {
        console.log ( 0 ) ;
        return  ;
    }


    // Calculate 'ue' (sum of a and b), which represents the total number of items.
    var   ue   =   a  +  b  ;

    // Determine 'sita' (the smaller of a and b), used in combination calculation.
    var   sita   =   (  a  >  b  )  ?  b  :  a  ;


    // Initialize variables for factorial-like calculations,
    // which are parts of a combination formula (nCr).
    var   ue_kaijou   =   1  ;
    var   sita_kaijou   =   1  ;

    // Loop to compute the numerator and denominator parts for the combination (C(ue, sita)).
    for   (  i  =  0  ;  i  <  sita  ;  i ++  )
    {
        ue_kaijou   *=   a  +  b  -  i  ;
        sita_kaijou   *=   i  +  1  ;
    }

    // Output the final calculated result, which is the combination value.
    console.log (  ue_kaijou  /  sita_kaijou  ) ;
} // End of Main function definition.


// *この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;