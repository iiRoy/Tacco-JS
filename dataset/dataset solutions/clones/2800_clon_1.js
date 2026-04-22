/*
 * This is a JavaScript function named Main.
 * It processes some input data.
 *
 * The original purpose of some commented lines below
 * was likely for parsing multi-line input or specific array elements.
 */
function  Main (  input )
{
    // The following lines are commented out, likely for debugging or alternative input processing.
    // They indicate how input might be split or parsed.
    // 1行目がinput[0], 2行目がinput[1], …に入る (This comment explains input indexing)

    // input = input.split("\n"); // Example: splitting input by newlines
    // tmp = input[1].split(" ");  // Example: splitting a specific line by spaces

    // 文字列から10進数に変換するときはparseIntを使います // Reminder for string to integer conversion
    // var a = parseInt(input, 10); // Example: parsing an integer

    // 出力 (This comment simply means "output")


    // Declare an array named 'numbers' and initialize it with four elements from the 'input' array.
    var   numbers   =   new   Array (  input [ 0 ]  ,  input [ 1 ]  ,  input [ 2 ]  ,  input [ 3 ]  ) ;

    // Start a loop to iterate through the 'numbers' array.
    // Note: The loop condition `i <= numbers.length` and the `input[++i]` inside the loop
    // might lead to out-of-bounds access or unexpected behavior if not handled carefully.
    for   (   var   i   =   0   ;   i   <=   numbers.length   ;   i ++   )
    {
        // Check for a specific condition related to adjacent input elements.
        // The `input[++i]` increments 'i' *before* evaluation,
        // which means 'i' will be different for the next iteration of the loop
        // and might skip elements or cause issues.
        if   (   input [ i ]   -   input [ ++i ]   ==   0   )
        {
            // If the condition is met, print "Bad" to the console.
            console.log (  "Bad"  ) ;
            // Exit the loop immediately after printing "Bad".
            break ;
        }
        // If the first condition is not met, check for another condition.
        // This condition checks if the differences between consecutive elements are non-zero.
        // It's effectively checking if input[3] != input[2], input[2] != input[1], and input[1] != input[0].
        else   if   (   input [ 3 ]   -   input [ 2 ]    &&    input [ 2 ]   -   input [ 1 ]    &&    input [ 1 ]   -   input [ 0 ]   )
        {
            // If this second condition is met, print "good" to the console.
            console.log (  "good"  ) ;
            // Exit the loop immediately after printing "good".
            break ;
        }
    }
}


/*
 * This section ensures that the Main function is called with
 * standard input. It should not be modified according to the original
 * instructions provided with the code snippet.
 * It reads the entire content of /dev/stdin as UTF-8.
 */
// *この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main (  require ( "fs" ) . readFileSync ( "/dev/stdin" ,  "utf8" )  ) ;