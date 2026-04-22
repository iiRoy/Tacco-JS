function   Main (  input )
{

    //  The input string provided to the function is initially a single block of text.
    //  We split it into an array of strings, where each element represents a line.
    input = input . split ( "\n" ) ;

    //  The first line of the input is expected to contain space-separated numbers.
    //  These numbers are parsed and stored in the 'mem' array.
    var mem = input[ 0 ] . split ( " " ) . map ( Number ) ;


    //  Similarly, the second line of input is processed.
    //  It also contains space-separated numbers which are parsed into the 'arr' array.
    var arr = input[ 1 ] . split ( " " ) . map ( Number ) ;


    //  This loop iterates through each element of the 'arr' array.
    //  The purpose is to transform each number into its remainder when divided by 2.
    //  Effectively, this converts all numbers in 'arr' to either 0 or 1.
    for ( var i = 0 ; i < arr . length ; i ++ )
    {
        arr[ i ] %= 2 ; // In-place modulo 2 operation
    }


    //  Initialize an array named 'ans' with two BigInt values.
    //  These values serve as the starting state for the main computation.
    var ans = [ BigInt ( 1 ) , BigInt ( 0 ) ] ;


    //  This is the core logic loop, processing each element of the 'arr' array.
    //  The state of 'ans' is updated based on the value of arr[i].
    for ( var i = 0 ; i < arr . length ; i ++ )
    {
        //  Condition 1: If the current element in 'arr' is 0.
        if ( arr[ i ] == 0 )
        {
            //  When arr[i] is 0, both elements of 'ans' are doubled.
            ans[ 0 ] *= 2n ;
            ans[ 1 ] *= 2n ;
        }
        else // Condition 2: If the current element in 'arr' is 1 (since it's either 0 or 1).
        {
            //  When arr[i] is 1, a temporary sum is calculated.
            var tmp = ans[ 0 ] + ans[ 1 ] ;

            //  Both elements of 'ans' are then updated to this calculated sum.
            ans[ 0 ] = tmp ;
            ans[ 1 ] = tmp ;
        }
        //  This line was originally commented out, and it still is, just with a slight modification.
        //  console . log ( "Intermediate 'ans' value: " , ans ) ;
    }


    //  Finally, the program outputs a specific element from the 'ans' array.
    //  The index for this element is determined by the second value in the 'mem' array.
    //  The selected BigInt value is converted to its string representation before printing.
    console . log ( ans[ mem[ 1 ] ] . toString ( ) ) ;
}

//  The 'Main' function is invoked immediately after its definition.
//  It reads input from standard input (/dev/stdin), decodes it as UTF-8,
//  removes leading/trailing whitespace, and passes the cleaned string to 'Main'.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ) ;