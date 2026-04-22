/*
 * This JavaScript code processes input from standard input (stdin).
 * It calculates and prints the day of the week for given dates.
 * The year is fixed to 2004 for all calculations.
 */

// Attach an event listener to the standard input stream.
process
    .stdin
    .on
        (
            "data"
            ,
            /*
             * The callback function is executed whenever data is received.
             * 'c' represents the chunk of data received.
             */
            function
                (
                    c
                )
{

    // Declare and initialize variables.
    // 't' holds an array of abbreviated day names.
    // 'd' is a Date object used for calculations.
    var
        t = [
            "Sun"
            ,
            "Mon"
            ,
            "Tues"
            ,
            "Wednes"
            ,
            "Thurs"
            ,
            "Fri"
            ,
            "Satur"
        ]
        ,
        d = new Date
    ;

    // Set the year for the Date object to 2004.
    // This is a fixed year for all date calculations in this script.
    d
        .setYear
            (
                2004
            )
    ;

    /*
     * Process the input data:
     * 1. Convert the data chunk 'c' to a string.
     * 2. Remove leading/trailing whitespace using trim().
     * 3. Split the string into an array of lines based on the newline character.
     * 4. Use the 'some' array method to iterate over each line.
     *    'some' stops iteration if the callback returns a truthy value.
     */
    (
        c + ""
    )
        .trim
            (

            )
        .split
            (
                "\n"
            )
        .some
            (
                function
                    (
                        n
                    )
                {
                    // Split each line 'n' by space to get month and day parts.
                    n
                        =
                        n
                            .split
                                (
                                    " "
                                )
                    ;

                    // Check if the first part (representing the month) is not a valid number.
                    // The unary plus operator converts n[0] to a number.
                    if
                        (
                            !
                            +
                            n
                                [
                                    0
                                ]
                        )
                    {
                        // If it's not a valid number, return 1 (truthy) to stop the 'some' iteration.
                        return
                            1
                        ;
                    }

                    // Set the month and day of the Date object 'd'.
                    // n[0] is the month (1-indexed), so subtract 1 for JavaScript's 0-indexed months.
                    // n[1] is the day.
                    d
                        .setMonth
                            (
                                +
                                n
                                    [
                                        0
                                    ]
                                -
                                1
                                ,
                                +
                                n
                                    [
                                        1
                                    ]
                            )
                    ;

                    // Get the day of the week (0 for Sunday, 6 for Saturday) using getDay().
                    // Use this index to retrieve the day name from array 't'.
                    // Concatenate "day" to form the full day name (e.g., "Sunday").
                    // Finally, print the result to the console.
                    console
                        .log
                            (
                                t
                                    [
                                        d
                                            .getDay
                                                (

                                                )
                                    ]
                                +
                                "day"
                            )
                    ;
                }
            )
    ;
}
        )
    // The resume() method is called to explicitly tell the stream to begin emitting data events.
    .resume
        (

        )
; // End of the entire program execution chain.