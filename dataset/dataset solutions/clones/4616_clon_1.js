/*
 * This is the primary function of the script.
 * It takes an input string, processes it according to specific rules,
 * and then prints a calculated sum to the console.
 *
 * @param {string} input - The raw input string, typically from stdin.
 */
function Main(  input  )
{
    // The input string is initially a single block of text.
    // We split it into an array of strings, where each element
    // corresponds to a line from the original input.
    input  =  input.split ( "\n" ) ;

    /*
     * The first line of the input is parsed here.
     * It's expected to contain space-separated numbers.
     * These numbers are mapped to their numerical representation.
     * 'mem' likely stores configuration parameters or memory-related values.
     */
    var   mem   =   input [ 0 ] . split ( " " ) . map ( Number ) ;


    // The second line of the input is processed similarly.
    // It's also expected to be a series of space-separated numbers.
    // 'arr' is the main array that will be iterated over for calculations.
    var   arr   =   input [ 1 ] . split ( " " ) . map ( Number ) ;


    // Initialize 'sum' to zero. This variable will accumulate the final result.
    var   sum   =   0 ;
    // 'st' (start) and 'end' are used to define and track intervals.
    // They are initialized to -1, indicating no active interval initially.
    var   st    =   -1 ;
    var   end   =   -1 ;


    /*
     * This is the core loop of the program.
     * It iterates through each element of the 'arr' array.
     * The variable 'i' serves as the index for the current element.
     */
    for ( var  i = 0 ; i < arr.length ; i ++ )
    {

        // Conditional logic: checks if the current 'end' of the interval
        // is less than the current array element 'arr[i]'.
        if (  end  <  arr [ i ]  )
        {
            // If 'end' is indeed less than 'arr[i]', it means a new, non-overlapping
            // interval is starting, or the previous one has ended.
            // The difference between 'end' and 'st' (the length of the previous interval)
            // is added to the total 'sum'.
            sum   +=   end   -   st ;

            // The 'st' (start) of the new interval is set to the current array element.
            st    =   arr [ i ] ;

            // The 'end' of the new interval is calculated by adding 'mem[1]'
            // to the current array element.
            end   =   arr [ i ]   +   mem [ 1 ] ;
        }
        else
        {
            // If 'end' is not less than 'arr[i]', it implies that the current
            // array element falls within or extends the existing interval.
            // In this case, only the 'end' of the current interval is updated,
            // extending it to 'arr[i] + mem[1]'.
            end   =   arr [ i ]   +   mem [ 1 ] ;
        }

    } // End of the for-loop iterating through 'arr'.


    // After the loop has completed, there might be one final interval
    // that needs its length added to the 'sum'. This line accounts for that.
    sum   +=   end   -   st ;


    // The final calculated sum is printed to the standard output.
    console . log ( sum ) ;

} // End of the Main function definition.

/*
 * This is the entry point for executing the script.
 * It reads the input from '/dev/stdin' (standard input),
 * decodes it as UTF-8, removes any leading/trailing whitespace,
 * and then passes the cleaned input string to the 'Main' function.
 * This setup is common in competitive programming environments for Node.js.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ) ;