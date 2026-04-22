function                                     Main(
                                                                input
)
{
    // Define a helper function to calculate the sum of array elements
    var sum                               = function (
                                                                arr
    )
    {
        // Initialize sum accumulator
        var sum                               = 0;

        // Iterate over each element in the array
        arr.forEach(
            function (
                                                                elm
            )
            {
                // Add the current element to the sum
                sum                               += elm;
            }
        );

        // Return the calculated sum
        return                                  sum;
    };


    // Define constant for modulo operation, a large prime number
    var C                                 = 1e+9                                    + 7;

    // Define another constant, likely for splitting large numbers
    var C2                                = 1e+5;


    // Process the input string: trim whitespace, split by newlines,
    // then split each line by spaces.
    input                                 = input
                                                                .trim(
                                                                )
                                                                .split(
                                                                    "\n"
                                                                )
                                                                .map(
                                                                    function (
                                                                        x
                                                                    )
                                                                    {
                                                                        return                                  x.split(
                                                                            " "
                                                                        )
                                                                    }
                                                                );

    // Parse N and K from the first line of the processed input
    var N                                 = parseInt(
                                                                input[0][0],
                                                                10
    );
    var K                                 = parseInt(
                                                                input[0][1],
                                                                10
    );


    // Initialize an array to store results of fastRuijoR calculations
    // Its length is based on K, rounded up.
    var vec_ruijoR                        = Array.from(
                                                                {
                                                                    length: Math.ceil(
                                                                        K
                                                                    )
                                                                },
                                                                (
                                                                )                                    => 0
    );

    // Temporary variable for calculations
    var tmp;


    // Loop to pre-calculate powers for various bases up to K
    for (
        var i                             = 1;
        i                                 <= K;
        i++
    )
    {
        // Calculate tmp as floor(K / i) using bitwise OR 0 for integer truncation
        tmp                               = (
                                                                K                                    / i                                    | 0
        );

        // Update i based on tmp, effectively processing groups of numbers
        i                                 = (
                                                                K                                    / tmp                                    | 0
        );

        // Store the result of fastRuijoR in vec_ruijoR
        // Note: oldProduct is implicitly global here, as it's not declared with var/let/const
        vec_ruijoR[
                                                                i                                    - 1
        ]                                 = oldProduct                          = fastRuijoR(
                                                                i,
                                                                N,
                                                                C,
                                                                C2
        );
    }


    // Initialize an array to store count patterns, all zeros initially
    var vec_countPattern                  = Array.from(
                                                                {
                                                                    length: K
                                                                },
                                                                (
                                                                )                                    => 0
    );

    // Variable to hold the upper limit for inner loop
    var limit;

    // Initialize the final answer
    var ans                               = 0;


    // Main loop to calculate the final answer using inclusion-exclusion principle
    for (
        var x                             = K;
        x                                 >= 1;
        x--
    )
    {
        // Calculate the limit for the inner loop
        limit                             = (
                                                                K                                    / x                                    | 0
        );

        // Get the pre-calculated power from vec_ruijoR
        tmp                               = vec_ruijoR[
                                                                limit                                    - 1
        ];

        // Subtract previously calculated patterns
        for (
            var j                         = 2;
            j                                 <= limit;
            j++
        )
        {
            tmp                               -= vec_countPattern[
                                                                x                                    * j                                    - 1
            ];
        }

        // Apply modulo operation to tmp
        tmp                               = mod(
                                                                tmp,
                                                                C
        );

        // Add to the total answer, using kakeruR for multiplication
        ans                               += kakeruR(
                                                                x,
                                                                tmp,
                                                                C,
                                                                C2
        );

        // console.log("xa", x, ans); // Original comment: debugging output, now commented out

        // Apply modulo C to the answer
        ans                               %= C;

        // Store the calculated pattern count for x
        vec_countPattern[
                                                                x                                    - 1
        ]                                 = tmp;
    }

    // Print the final result to the console
    console.log(
                                                                ans
    );
}


// Function for modular multiplication (a * b) % C, optimized for large b with C2
function                                     kakeruR(
                                                                a,
                                                                b,
                                                                C,
                                                                C2
)
{
    // Declare temporary variables
    var tmpQ,
        tmpR,
        ans;

    // Split b into quotient (tmpQ) and remainder (tmpR) based on C2
    tmpQ                                  = (
                                                                b                                    / C2                                    | 0
    ); // Integer division
    tmpR                                  = b                                    - (
                                                                tmpQ                                    * C2
    ); // Remainder

    // Calculate (a * b) % C using properties of modular arithmetic
    // (a * (tmpQ * C2 + tmpR)) % C = ((a * tmpQ * C2) % C + (a * tmpR) % C) % C
    ans                                   = (
                                                                a                                    * tmpQ                                    % C
    )                                    * C2                                    % C                                    + (
                                                                a                                    * tmpR
    );

    // Apply final modulo C
    ans                                   %= C;

    // Return the result
    return                                  ans;
}


// Function for modular exponentiation (a^b % C) using binary exponentiation
function                                     fastRuijoR(
                                                                a,
                                                                b,
                                                                C,
                                                                C2
)
{
    // Initialize answer to 1 (a^0)
    var ans                               = 1;

    // Convert exponent b to its binary string representation
    var binary                            = b.toString(
                                                                2
    );

    // Get the length of the binary string
    var l                                 = binary.length;

    // Initialize temporary variable with base 'a'
    var tmp                               = a;

    // Loop through the binary representation of b from right to left
    for (
        var i                             = 0;
        i                                 < l;
        i++
    )
    {
        // If the current bit is '1', multiply 'ans' by 'tmp'
        if (
            binary.substr(
                                                                (
                                                                i                                    + 1
            )                                    * -1,
                                                                1
            )                                    == '1'
        )
            ans                               = kakeruR(
                                                                ans,
                                                                tmp,
                                                                C,
                                                                C2
            );

        // Square 'tmp' for the next iteration (tmp = tmp^2)
        tmp                               = kakeruR(
                                                                tmp,
                                                                tmp,
                                                                C,
                                                                C2
        );
    }

    // Return the final result
    return                                  ans;
}


// Custom modulo function that handles negative results from % operator in JS
function                                     mod(
                                                                i,
                                                                j
)
{
    // If (i % j) is negative, add j (or -j if j is negative) to make it positive
    return                                  (
                                                                i                                    % j
    )                                    < 0                                    ? (
                                                                i                                    % j
    )                                    + 0                                    + (
                                                                j                                    < 0                                    ?                                    -j                                    :                                    j
    )                                    : (
                                                                i                                    % j                                    + 0
    );
}


// Read input from /dev/stdin and pass it to the Main function
Main(
                                                                require(
                                                                    "fs"
                                                                )
                                                                .readFileSync(
                                                                    "/dev/stdin",
                                                                    "utf8"
                                                                )
);