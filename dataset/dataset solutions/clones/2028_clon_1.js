/*
 * This JavaScript code snippet is designed to process input from the standard input.
 * It reads lines of input, parses specific numerical values, performs calculations,
 * and then outputs a final result to the standard output.
 *
 * This section ensures that the standard input stream remains open and active
 * for continuous data reception.
 */
process
    .
    stdin
    .
    resume
    (
    )
    ;


// Set the character encoding for the standard input stream to UTF-8
// to correctly interpret incoming text data.
process.stdin.setEncoding('utf8');


// Initialize an empty array to store all the lines read from the input.
var
    lines
    =
    [
    ]
    ;


/*
 * Create a readline interface to handle input and output operations.
 * This interface allows reading input line by line and writing output.
 */
var
    reader
    =
    require
    (
        'readline'
    )
    .
    createInterface
    (
        {
            input
                :
                process
                    .
                    stdin
            ,
            output
                :
                process
                    .
                    stdout
        }
    )
    ;


// Register an event listener for the 'line' event.
// This callback function is executed every time a new line of input is received.
reader
    .
    on
    (
        'line'
        ,
        (
            line
        )
            =>
        {
            // Add the received line to the 'lines' array.
            lines
                .
                push
                (
                    line
                )
                ;
        }
    )
    ;


/*
 * Register an event listener for the 'close' event.
 * This callback function is triggered when the input stream ends.
 * All core logic and calculations are performed within this block.
 */
reader
    .
    on
    (
        'close'
        ,
        (
        )
            =>
        {
            // The first line of input contains two space-separated numbers.
            // Split this line into an array of strings.
            var
                kn
                =
                lines
                [
                    0
                ]
                .
                split
                (
                    ' '
                )
                ;


            // Convert the first part to a number and assign it to variable 'k'.
            var
                k
                =
                Number
                (
                    kn
                    [
                        0
                    ]
                )
                ;


            // Convert the second part to a number and assign it to variable 'n'.
            var
                n
                =
                Number
                (
                    kn
                    [
                        1
                    ]
                )
                ;


            // The second line of input contains 'n' space-separated numbers.
            // Split this line into an array of strings.
            var
                a
                =
                lines
                [
                    1
                ]
                .
                split
                (
                    ' '
                )
                ;


            // Convert each string element in array 'a' to a number using the map function.
            a
                =
                a
                .
                map
                (
                    function
                    (
                        str
                    )
                    {
                        return
                            Number
                            (
                                str
                            )
                            ;
                    }
                )
                ;

            // An array to store calculated distances (kyori).
            var
                kyori
                =
                [
                ]
                ;


            /*
             * Loop through the array 'a' to calculate the distances between
             * consecutive elements. This forms the primary segments.
             */
            for
            (
                i
                =
                0
                ;
                i
                <
                n
                -
                1
                ;
                i
                ++
            )
            {
                // Calculate the difference between the current element and the next.
                kyori
                    .
                    push
                    (
                        a
                        [
                            i
                            +
                            1
                        ]
                        -
                        a
                        [
                            i
                        ]
                    )
                    ;
            }


            // Calculate the distance for the wrap-around segment, connecting the last
            // element back to the first, considering 'k' as the total length.
            kyori
                .
                push
                (
                    k
                    +
                    a
                    [
                        0
                    ]
                    -
                    a
                    [
                        n
                        -
                        1
                    ]
                )
                ;


            // Find the maximum distance among all calculated segments.
            var
                max
                =
                Math
                .
                max
                (
                    ...
                        kyori
                )
                ;


            // Get the index of the maximum distance found.
            var
                index
                =
                kyori
                .
                indexOf
                (
                    max
                )
                ;


            // Remove the maximum distance segment from the 'kyori' array.
            // This is typically done to find the sum of remaining segments.
            kyori
                .
                splice
                (
                    index
                    ,
                    1
                )
                ;


            // Sum up all the remaining distances in the 'kyori' array.
            var
                ans
                =
                kyori
                .
                reduce
                (
                    function
                    (
                        a
                        ,
                        x
                    )
                    {
                        return
                            a
                            +
                            x
                            ;
                    }
                )
                ;


            // Print the final calculated answer to the console (standard output).
            console
                .
                log
                (
                    ans
                )
                ;
        }
    )
    ;