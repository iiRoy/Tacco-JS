/*
 * This JavaScript code processes input from standard input.
 * It reads data chunks, converts them to string, splits them by newline,
 * and then processes each line to determine a grade.
 */
process


    .stdin


    // Attach an event listener for the "data" event on standard input.
    // The callback function receives the data chunk as argument 'c'.
    .on(
        "data" ,

        function ( c ) {
            // Convert the data chunk 'c' to a string, trim whitespace,
            // and then split it into an array of lines based on newline characters.
            // The 'some' method iterates over these lines.
            // It stops and returns true if the callback returns a truthy value.
            ( c + "" )
                .trim()
                .split( "\n" )
                .some(
                    function ( s , m , f , r , x ) {
                        // For each line 's':
                        // 1. Split the line by space to get individual string components.
                        // 2. Convert the first component to a number and assign to 'm'.
                        // 3. Convert the second component to a number and assign to 'f'.
                        // 4. Convert the third component to a number and assign to 'r'.
                        // 5. Calculate the sum of 'm' and 'f' and assign to 'x'.
                        s = s.split( " " ) ,
                        m = +s[ 0 ] ,
                        f = +s[ 1 ] ,
                        r = +s[ 2 ] ,
                        x = m + f;

                        // Check for a specific termination condition:
                        // if 'm', 'f', and 'r' are all -1 (represented by !~ as -1 is ~0, so !~-1 is !0 which is true).
                        if (
                            !~m
                            &&
                            !~f
                            &&
                            !~r
                        ) {
                            // If the condition is met, return 1 to stop the 'some' iteration.
                            return 1;
                        }

                        // Log the calculated grade to the console based on a complex ternary operation.
                        // !~m || !~f ? "F"  : // If m or f is -1, the grade is "F".
                        // 80 <= x    ? "A"  : // Otherwise, if x (m+f) is 80 or more, the grade is "A".
                        // 65 <= x    ? "B"  : // Otherwise, if x is 65 or more, the grade is "B".
                        // 50 <= x    ? "C"  : // Otherwise, if x is 50 or more, the grade is "C".
                        // 30 <= x    ?       // Otherwise, if x is 30 or more:
                        //     50 <= r ? "C"  : //   If r is 50 or more, the grade is "C".
                        //               "D"  : //   Otherwise, the grade is "D".
                        //               "F"    // Otherwise (x is less than 30), the grade is "F".
                        console.log(
                            !~m
                            ||
                            !~f
                            ?
                            "F"
                            :
                            80
                            <=
                            x
                            ?
                            "A"
                            :
                            65
                            <=
                            x
                            ?
                            "B"
                            :
                            50
                            <=
                            x
                            ?
                            "C"
                            :
                            30
                            <=
                            x
                            ?
                            50
                            <=
                            r
                            ?
                            "C"
                            :
                            "D"
                            :
                            "F"
                        );
                    }
                );
        }
    )


    // After setting up the data listener, resume the stdin stream
    // to start receiving data.
    .resume();