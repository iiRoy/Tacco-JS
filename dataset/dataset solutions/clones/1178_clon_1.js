/*
 * This is a Type I clone of the original JavaScript code.
 * It processes input lines to calculate some statistical value, likely
 * a form of standard deviation or variance, for multiple datasets.
 *
 * No logical modifications have been introduced. The core functionality,
 * algorithms, variable names, function names, and expressions remain
 * precisely as they were in the original source.
 *
 * The only alterations pertain to whitespace (indentation, spacing,
 * blank lines) and the addition of extensive comments to make the
 * code visually distinct and more verbose, while preserving its exact
 * operational equivalence.
 */
function   main  ( lines )
{

    // The input string, containing all data, is first split into individual
    // lines based on the newline character. This creates an array where
    // each element is one line from the input.
    const   input   =   lines.split ( '\n' ) ;


    // This primary loop iterates through the 'input' array.
    // Each problem instance consists of two lines: the first line specifies
    // the count of numbers, and the second line contains the numbers themselves.
    // Therefore, the loop increments its counter 'i' by 2 in each step.
    for  ( let  i = 0 ;  i < input.length ;  i += 2 )
    {

        // A termination condition is checked: if the current line (input[i])
        // is the string '0', it signifies the end of input or problems.
        if  ( input [ i ]  ==  '0' )
        {
            // Upon encountering the termination marker, the loop is exited.
            break ;
        }


        // Initialize an empty string variable to accumulate the final
        // formatted output for the current set of numbers.
        let   output   =   '' ;

        // Initialize a numeric variable to store intermediate calculations.
        // This variable will accumulate the sum of squared differences.
        let   tmpCalc   =   0 ;


        /*
         * This nested loop processes the actual numbers provided for the
         * current problem instance. The number of iterations is determined
         * by the value found in `input[i]`, which represents the count
         * of numbers in the dataset. The `- 0` is used to ensure
         * string-to-number conversion.
         */
        for  ( let  k = 0 ;  k < input [ i ] - 0 ;  k ++ )
        {
            // The line containing the numbers (input[i+1]) is split by spaces
            // to obtain an array of string representations of individual numbers.
            const   tmpArray   =   input [ i + 1 ].split ( ' ' ) ;

            // Calculate the arithmetic average of the numbers in `tmpArray`.
            // The `reduce` method sums all elements after explicitly converting
            // them to numbers (using `a - 0` and `b - 0`), then divides by the count.
            const   average   =   tmpArray.reduce ( function ( a, b ) { return ( a - 0 ) + ( b - 0 ) } ) / input [ i ] ;

            // Accumulate the sum of squared differences from the average.
            // This is a key step in calculating variance or standard deviation.
            // `Math.pow` raises the difference to the power of 2.
            tmpCalc   +=   Math.pow ( tmpArray [ k ]  -  average ,  2 )  /  input [ i ] ;
        }

        // After the inner loop completes, calculate the square root of `tmpCalc`.
        // This final step typically yields the standard deviation.
        // The result is then formatted to four decimal places using `toFixed(4)`.
        output   +=   ( Math.sqrt ( tmpCalc ) ).toFixed ( 4 ) ;

        // The computed and formatted output for the current dataset is printed
        // to the console, followed by a newline.
        console.log ( output ) ;

    } // End of the outer 'for' loop, processing all input pairs.

} // End of the 'main' function definition.


/*
 * This is the entry point for executing the script.
 * It reads the entire content of standard input (typically '/dev/stdin'
 * in POSIX-like environments) as a UTF-8 encoded string.
 * The 'fs' (file system) module is required to perform this operation.
 * The read content is then passed to the 'main' function for processing.
 */
main ( require ( 'fs' ).readFileSync ( '/dev/stdin' ,  'utf8' ) ) ;