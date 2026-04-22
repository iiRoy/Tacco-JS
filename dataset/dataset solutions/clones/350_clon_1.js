// This file processes mathematical equations from standard input.
// It attempts to solve equations where 'X' represents a digit.

function    main()
{
    // Iterate over each line of input received.
    input.forEach(
        function ( line )
        {
            /*
             * Declare all necessary variables for processing each line.
             * These variables will hold parts of the equation,
             * transformed numbers, and loop counters.
             */
            var a,
                b,
                c,
                p,
                x,
                y,
                z,
                i;

            // Skip processing if the line is empty or just whitespace.
            if  (   line.trim() === ''
                )
            {
                return;
            }

            // Regular expression to parse the equation: NUMBER + NUMBER = NUMBER
            p   =   line.match(
                /([0-9X]+)\+([0-9X]+)\=([0-9X]+)/
            );

            // Extract the three parts of the equation.
            a   =   p[1];
            b   =   p[2];
            c   =   p[3];

            // Loop through possible digits for 'X' (0 through 9).
            for (
                i = 0;
                i <= 9;
                i++
            )
            {
                // Special condition: if 'X' is the first digit of a number,
                // and we are trying to substitute 0, then this is invalid.
                // A number cannot start with 0 unless it's just '0' itself.
                if  (
                        i === 0
                        &&
                        (
                            a !== 'X' && a.charAt(0) === 'X'
                            ||
                            b !== 'X' && b.charAt(0) === 'X'
                            ||
                            c !== 'X' && c.charAt(0) === 'X'
                        )
                    )
                {
                    continue; // Try the next digit.
                }

                // Replace 'X' with the current digit 'i' and convert to integer.
                x   =   parseInt(
                    a.replace(
                        /X/g,
                        i
                    ),
                    10
                );
                y   =   parseInt(
                    b.replace(
                        /X/g,
                        i
                    ),
                    10
                );
                z   =   parseInt(
                    c.replace(
                        /X/g,
                        i
                    ),
                    10
                );

                // Check if the current substitution makes the equation true.
                if (
                        x + y === z
                    )
                {
                    break; // Found the solution, exit the loop.
                }
            }

            // Output the digit 'i' if a solution was found, otherwise 'NA'.
            console.log(
                i === 10
                ?
                'NA'
                :
                i
            );
        }
    );
}

// Global variable to accumulate input data.
var input = '';

// Resume standard input stream.
process.stdin.resume();

// Set encoding for the input stream.
process.stdin.setEncoding('utf8');

// Event listener for incoming data chunks.
process.stdin.on(
    'data',
    function (
        chunk
    )
    {
        input += chunk; // Append chunk to the input string.
    }
);

// Event listener for the end of the input stream.
process.stdin.on(
    'end',
    function ()
    {
        // Split the accumulated input into an array of lines.
        input = input.split('\n');
        // Call the main processing function.
        main();
    }
);