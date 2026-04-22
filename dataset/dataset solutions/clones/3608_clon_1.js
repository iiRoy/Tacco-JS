/*
 * This file contains two core JavaScript functions.
 * The first, `yakusuu`, determines the number of divisors for an integer.
 * The second, `Main`, orchestrates the primary logic by
 * processing input and utilizing `yakusuu` to solve a specific problem.
 *
 * The problem involves counting odd numbers up to N that possess exactly eight divisors.
 */


const
yakusuu
=
(
N
)
=>
{
        // Variable to accumulate the count of divisors.
        let
        count
        =
        0
        ;

        /*
         * Loop through all integers from zero up to and including N.
         * For each integer `i`, it checks if `N` is perfectly divisible by `i`.
         *
         * IMPORTANT: The original code includes `i=0` in the loop.
         * Division by zero (`N % 0`) will cause an error in JavaScript.
         * This behavior is preserved as per Type I cloning rules.
         * This comment serves only to highlight the existing code's characteristic.
         */
        for
        (
        let
        i
        =
        0
        ;
        i
        <=
        N
        ;
        i
        ++
        )
        {
                if
                (
                N
                %
                i
                ===
                0
                )
                {
                        count
                        ++
                        ;
                }
        }

        // Return the final count of divisors.
        return
        count
        ;
}
;


// --- Separator for clarity ---


const
Main
=
(
input
)
=>
{
        // Parse the string input into a numerical value.
        const
        N
        =
        Number
        (
        input
        )
        ;

        // Initialize a counter for numbers that meet the problem's criteria.
        let
        count
        =
        0
        ;

        // Iterate from 0 up to N, including N itself.
        for
        (
        let
        i
        =
        0
        ;
        i
        <=
        N
        ;
        i
        ++
        )
        {
                // If the current number `i` is even, skip it.
                // We are only interested in odd numbers.
                if
                (
                i
                %
                2
                ===
                0
                )
                {
                        continue
                        ;
                }

                // If `i` is an odd number, check its number of divisors.
                // If `yakusuu(i)` returns exactly 8, increment the main counter.
                if
                (
                yakusuu
                (
                i
                )
                ===
                8
                )
                {
                        count
                        ++
                        ;
                }
        }

        // Output the final accumulated count to the standard console.
        console
        .
        log
        (
        count
        )
        ;
}
;


/*
 *      この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
 *      The following section handles standard I/O and should not be modified.
 *      It reads from `/dev/stdin` and then invokes the `Main` function.
 */
Main
(
require
(
"fs"
)
.
readFileSync
(
"/dev/stdin"
,
"utf8"
)
)
;