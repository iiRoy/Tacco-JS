/*
 * This is a JavaScript program designed to solve a specific pathfinding problem.
 * The 'Main' function processes an input string, calculates a series of movements,
 * and then prints the resulting path.
 */
function         Main
(
    input /* The raw input string provided to the function. */
)
{
    // Process the input string:
    // 1. Split by newline to get the first line.
    // 2. Split that line by spaces.
    // 3. Convert each part to a number.
    input = input
        .split
            (
                "\n"
            )
                [0]
                    .split
                        (
                            " "
                        )
                            .map
                                (
                                    Number
                                )
    ;

    // Define a target object 't' using parts of the processed input.
    // input[2] will be assigned to 'x', input[3] to 'y'.
    var t =
        {
            x : input[2], // X-coordinate from input
            y : input[3]  // Y-coordinate from input
        }
    ;

    // Initialize an empty string to build the answer (path).
    var ans = "";

    // --- First set of movements: Up, Right, Down, Left to reach (x, y) and return ---

    // Move 'U' (Up) 't.y' times.
    for (var i = 0; i < t.y; i++)
    {
        ans += "U";
    }

    // Move 'R' (Right) 't.x' times.
    for (var i = 0; i < t.x; i++)
    {
        ans += "R";
    }

    // Move 'D' (Down) 't.y' times.
    for (var i = 0; i < t.y; i++)
    {
        ans += "D";
    }

    // Move 'L' (Left) 't.x' times.
    for (var i = 0; i < t.x; i++)
    {
        ans += "L";
    }

    // --- Second set of movements: A more complex path ---

    // Add a single 'L' movement.
    ans += "L";

    // Move 'U' (Up) 't.y + 1' times.
    for (var i = 0; i < t.y + 1; i++)
    {
        ans += "U";
    }

    // Move 'R' (Right) 't.x + 1' times.
    for (var i = 0; i < t.x + 1; i++)
    {
        ans += "R";
    }

    // Add 'DR' (Down, Right) movements.
    ans += "DR";

    // Move 'D' (Down) 't.y + 1' times.
    for (var i = 0; i < t.y + 1; i++)
    {
        ans += "D";
    }

    // Move 'L' (Left) 't.x + 1' times.
    for (var i = 0; i < t.x + 1; i++)
    {
        ans += "L";
    }

    // Add a single 'U' movement.
    ans += "U";

    // Output the final calculated path string to the console.
    console.log
        (
            ans
        )
    ;
}

// Call the Main function, reading input from standard input.
Main
    (
        require
            (
                "fs"
            )
                .readFileSync
                    (
                        "/dev/stdin", // Path to standard input
                        "utf8"        // Encoding for reading the file
                    )
    )
;