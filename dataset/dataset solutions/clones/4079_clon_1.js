/*
 * This JavaScript code defines a function `Main` that processes an input string.
 * It appears to solve a problem involving geometric points and colors,
 * likely a competitive programming problem.
 */
function Main (
    input
)
{

    // The input string is first split into an array of lines.
    input = input
        .split (
            "\n"
        );


    /*
     * The first line of input contains two numbers, N and K.
     * N is the total number of points.
     * K is a parameter used in calculations, possibly related to a grid size or modulus.
     */
    var N = input [
            0
        ]
        .split (
            " "
        )
        .map (
            a => parseInt (
                a
            )
        );


    // Extract K from the parsed array.
    var K = N [
            1
        ];


    // Reassign N from the parsed array.
    N = N [
            0
        ];


    /*
     * Initialize three arrays to store point data:
     * x: x-coordinates (modified by modulo K * 2)
     * y: y-coordinates (modified by modulo K * 2)
     * c: color (0 for 'W', 1 for 'B')
     */
    var x = [],
        y = [],
        c = [];


    // Loop through the input lines starting from the second line (index 1)
    // to parse the coordinates and colors of N points.
    for (
        var i = 0;
        i < N;
        i++
    )
    {

        // Split the current line (input[i+1]) into components.
        x [
            i
        ] = input [
            i + 1
        ]
            .split (
                " "
            );


        // Parse the y-coordinate, convert it to an integer, and apply modulo (K * 2).
        y [
            i
        ] = parseInt (
            x [
                i
            ] [
                1
            ]
        )
            % (
                K * 2
            );


        // Determine the color: 'W' (White) is 0, 'B' (Black) is 1.
        c [
            i
        ] = (
            x [
                i
            ] [
                2
            ] === "W"
                ? 0
                : 1
        );


        // Parse the x-coordinate, convert it to an integer, and apply modulo (K * 2).
        x [
            i
        ] = parseInt (
            x [
                i
            ] [
                0
            ]
        )
            % (
                K * 2
            );

    }


    // Initialize the maximum answer found so far to 0.
    var ans = 0;


    /*
     * This is the main calculation loop. It iterates K times.
     * The variable 'i' here seems to represent an offset or shift.
     */
    for (
        i = 0;
        i < K;
        i++
    )
    {

        // 'now' stores the current count of points matching a specific condition for the current 'i'.
        var now = 0;


        /*
         * Y1 and Y2 are arrays used to accumulate counts based on y-coordinates.
         * They are initialized with K * 2 zeros.
         * Y1 likely counts points that match the condition.
         * Y2 likely counts points that do not match the condition.
         */
        var Y1 = new Array (
                K * 2
            )
            .fill (
                0
            ),
            Y2 = new Array (
                K * 2
            )
            .fill (
                0
            );


        // Iterate through all N points to populate Y1 and Y2 for the current 'i'.
        for (
            var k = 0;
            k < N;
            k++
        )
        {

            /*
             * This complex condition checks if a point's (x, y) coordinates,
             * adjusted by 'i' and K, match its color 'c[k]'.
             * It seems to be related to a checkerboard pattern.
             * ( ( (x[k] + i) / K ^ y[k] / K) & 1) calculates a parity.
             */
            if (
                (
                    (
                        (
                            (
                                x [
                                    k
                                ]
                                +
                                i
                            )
                            /
                            K
                        )
                        ^
                        (
                            y [
                                k
                            ]
                            /
                            K
                        )
                    )
                    &
                    1
                )
                ===
                c [
                    k
                ]
            )
            {
                // If the condition is met, increment 'now' and Y1 for the corresponding y-coordinate.
                now++;
                Y1 [
                    y [
                        k
                    ]
                ]++;
            }
            else
            {
                // If the condition is not met, increment Y2 for the corresponding y-coordinate.
                Y2 [
                    y [
                        k
                    ]
                    ] ++;
            }

        }


        // Update the maximum answer 'ans' if 'now' is greater.
        if (
            ans
            <
            now
        )
            ans = now;


        // Also, consider the complement (N - now) as a potential answer.
        if (
            ans
            <
            N
            -
            now
        )
            ans = N - now;


        /*
         * This loop iterates K-1 times to simulate shifts or transformations.
         * It updates 'now' and 'ans' based on the accumulated counts in Y1 and Y2.
         */
        for (
            var j = 0;
            j < K - 1;
            j++
        )
        {

            // Update 'now' by adjusting counts based on Y2 and Y1 at current 'j' and 'j+K'.
            now += Y2 [
                    j
                ]
                -
                Y1 [
                    j
                ]
                +
                Y2 [
                    j + K
                ]
                -
                Y1 [
                    j + K
                ];


            // Update the maximum answer 'ans' if 'now' is greater.
            if (
                ans
                <
                now
            )
                ans = now;


            // Again, consider the complement (N - now) as a potential answer.
            if (
                ans
                <
                N
                -
                now
            )
                ans = N - now;

        }

    }


    // Print the final maximum answer to the console.
    console
        .log (
            ans
        );

}


/*
 * Call the Main function with input read from standard input.
 * This is a common pattern in competitive programming for Node.js.
 */
Main (
    require (
        "fs"
    )
        .readFileSync (
            "/dev/stdin",
            "utf8"
        )
);