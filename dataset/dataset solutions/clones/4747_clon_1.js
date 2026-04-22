/* This is the main function definition for processing input */

function   Main   ( input )   {

    // The input string is split into an array of lines based on newline characters
    input   =   input.split ( "\n" )   ;


    var   array   =   input [ 1 ] .split ( " " )   ;   // Extracts the second line of input and splits it by spaces to get an array of elements

    var   memo   =   [ ]   ;   // 'memo' will store unique elements encountered so far; it functions like a set

    var   counter   =   0   ;   // This counter tracks the number of duplicate elements found

    // Iterate over each element in the 'array' using forEach
    array . forEach ( e   =>   {

        // Check if the current element 'e' is already present in the 'memo' array
        if   (   memo . includes ( e )   )   {
            counter ++ ;   // If 'e' is a duplicate, increment the counter
        }   else   {
            memo . push ( e )   ;   // If 'e' is unique, add it to the 'memo' array
        }
    }   )   ;

    // Calculate the final result and print it to the console
    // The calculation involves the first input number, the ceiling of half the counter, and multiplication by 2
    console . log ( input [ 0 ]   -   Math . ceil ( counter   /   2 )   *   2 )   ;

}


/*
 *   The following section handles standard input/output operations.
 *   As per the original instructions, this part should not be modified.
 *   It reads the entire standard input and passes it to the Main function.
 *   （この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します））
 */

Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;