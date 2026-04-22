// This is a JavaScript program designed to process input data
// and generate a specific output pattern based on certain parameters.

function Main( input )
{
    // The Main function serves as the entry point for processing the input.
    // It takes a single string argument 'input' which contains the raw data.

    input = input . split ( "\n" ) ; // First, split the input string into an array of lines
                                     // using the newline character as a delimiter.

    // Retrieve and parse the height (h) and width (w) values from the first line of input.
    // The first line is expected to contain two space-separated integers.
    var h = parseInt ( input [ 0 ] . split ( " " ) [ 0 ] ) ; // Extract the first number as height.
    var w = parseInt ( input [ 0 ] . split ( " " ) [ 1 ] ) ; // Extract the second number as width.

    // Retrieve and parse the number of blocks (n) from the second line of input.
    // The second line is expected to contain a single integer.
    var n = parseInt ( input [ 1 ] ) ;


    // Process the third line of input, which contains space-separated block sizes.
    tmp = input [ 2 ] . split ( " " ) ; // Split the third line into an array of strings.


    // Initialize an empty array 'a'. This array will store the expanded sequence
    // of block identifiers based on their respective sizes.
    a = new Array ( ) ;

    // This loop iterates 'n' times, once for each block defined in the input.
    for ( i = 0 ; i < n ; i ++ )
    {
        // Convert the current block size (from 'tmp' array) to an integer.
        var x = parseInt ( tmp [ i ] ) ;

        // This inner loop pushes the current block's identifier (i+1) into array 'a'
        // 'x' number of times, effectively "expanding" the block.
        for ( j = 0 ; j < x ; j ++ )
        {
            a . push ( i + 1 ) ; // The block identifier is (i + 1) because 'i' is 0-indexed.
        }
    }


    // Initialize an empty string 'ans' which will accumulate the final output pattern.
    var ans = "" ;

    // Initialize an array 'anssub' of size 'h' (height), filled with empty strings.
    // Each element in 'anssub' will temporarily hold the string representation of a single row.
    anssub = new Array ( h ) . fill ( "" ) ;


    // This main loop iterates 'h' times, once for each row of the output grid.
    for ( i = 0 ; i < h ; i ++ )
    {
        // Start building the string for the current row with its first element.
        // The elements are taken from the 'a' array based on row and column index.
        anssub [ i ] = a [ i * w ] ;

        // This inner loop iterates through the remaining columns (from the second column onwards)
        // for the current row.
        for ( j = 1 ; j < w ; j ++ )
        {
            // This conditional block implements the alternating pattern logic.
            // Even-indexed rows are built by appending elements to the right.
            if ( i % 2 == 0 )
            {
                anssub [ i ] = anssub [ i ] + " " + a [ i * w + j ] ;
            }
            // Odd-indexed rows are built by prepending elements to the left.
            else
            {
                anssub [ i ] = a [ i * w + j ] + " " + anssub [ i ] ;
            }

            // After processing the last element of a row, append a newline character.
            // This ensures each row is on a separate line in the final output.
            if ( j == w - 1 )
            {
                anssub [ i ] = anssub [ i ] + "\n" ;
            }
        }

        // Append the completed string for the current row to the overall answer string.
        ans += anssub [ i ] ;
    }


    // After all rows are processed, remove the very last newline character from 'ans'.
    // This is because the problem typically expects no trailing newline at the end of the entire output.
    ans = ans . slice ( 0 , - 1 ) ;

    // Finally, print the accumulated answer string to the console.
    console . log ( '%s' , ans ) ;

}

// This section handles reading input from standard input and calling the Main function.
// It reads the entire content of "/dev/stdin" as a UTF-8 string and passes it to Main.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;