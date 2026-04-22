function   Main  (  input  )   {
    // This is the main function that processes the input.
    // It takes a single string 'input' as its argument.


    // Split the input string by space to get individual values.
    var   inputSplit   =   input . split ( ' ' ) ;


    // The first element is the number of items (maisu).
    var   maisu   =   inputSplit [ 0 ] ;
    // Calculate the total cost based on 'maisu'.
    // Each item costs 500. parseInt ensures 'maisu' is treated as an integer.
    var   sougaku   =   500   *   parseInt ( maisu , 10 ) ;
    // The second element is the amount of money available (kingaku).
    var   kingaku   =   inputSplit [ 1 ] ;


    // Now, we compare the total cost (sougaku) with the available money (kingaku).
    if   (   sougaku   >=   kingaku   )   {
        // If the total cost is less than or equal to the available money, print 'yes'.
        console . log ( 'yes' ) ;
    }   else   {
        // Otherwise, if the total cost is greater, print 'no'.
        console . log ( 'no' ) ;
    }
    // End of conditional check.
}


// * この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
// * Please do not edit below this line (reads from stdin and calls Main once).
Main   (   require   ( "fs" ) . readFileSync   ( "/dev/stdin" ,   "utf8" )   )   ;