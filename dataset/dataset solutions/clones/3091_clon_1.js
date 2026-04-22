/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains exact functionality and identifier names,
 * but varies whitespace and adds comments extensively.
 */

"use strict"
; // Enforce strict mode for better code quality.


// Helper class 'I' for parsing input.
function I
(
    s, /* Input string */
    f  /* Conversion function, defaults to Number */
)
{
    // Split the input string into lines.
    this._s = s.split(
        "\n"
    );

    // Current column index within a line.
    this._c = 0
    ;

    // Current line index.
    this._l = 0;

    // Function to convert parsed tokens.
    this._f = f || Number
    ;
}

// Prototype method 'a' to get the next token.
I.prototype.a = function
(
)
{
    // Get the current line.
    var l =
        this
            ._s
                [
                    this
                        ._l
                ]
    ;

    // If no more lines, return undefined.
    if
    (
        !l
    )
    {
        return
        ;
    }

    // Trim whitespace and split the line into tokens.
    var t = l
        .trim()
            .split(" ")
    ;

    // Get the token at the current column.
    var a = t[
        this
            ._c
    ]
    ;

    // Increment column index.
    this._c++
    ;

    // If all tokens in the current line have been consumed,
    // reset column and move to the next line.
    if
    (
        t
            .length
                ===
        this
            ._c
    )
    {
        this
            ._c = 0
        ;
        this
            ._l++
        ;
    }

    // Return the converted token.
    return this._f(a)
    ;
};

// Prototype method 'l' to get all tokens from the current line.
I.prototype.l = function
(
)
{
    // Retrieve the current line.
    var l = this._s[
        this._l
    ]
    ;

    // If no line exists, return.
    if
    (
        !l
    )
    {
        return
        ;
    }

    // Reset column index for the new line.
    this._c = 0
    ;

    // Advance to the next line.
    this._l++
    ;

    // Split the line, map each token using the conversion function, and return.
    return l
        .split(" ")
            .map(this._f)
    ;
};



// The main function where the program logic resides.
function main
(
    input /* The input string received from stdin. */
)
{
    // Initialize the input parser.
    const o = new I
    (
        input
    )
    ;

    // Read the first integer N.
    const N = o
        .a()
    ;

    // Read the second integer X.
    const X = o
        .a()
    ;

    // Initialize an array S to store subsequent N integers.
    const S = []
    ;

    // Loop N times to populate array S.
    for
    (
        let i = 0
        ;
        i < N
        ;
        i++
    )
    {
        S
            .push
                (
                    o
                        .a()
                )
        ;
    }

    // Sort the array S in ascending order.
    S
        .sort
            (
                (a, b) => a - b
            )
    ;

    // Precompute factorials modulo 1000000007.
    const fac = [
        1,
        1
    ]
    ;
    for
    (
        let i = 2
        ;
        i <= N
        ;
        i++
    )
    {
        fac[i] = fac[i - 1] * i % 1000000007
        ;
    }

    // Debugging lines (commented out in original, kept commented).
    // console.log(sum);
    // console.log({S, fac})

    // Conditional logic based on the first element of S.
    if
    (
        S
            [0]
                ===
        1
    )
    {
        console
            .log
                (
                    0
                )
        ;
    }
    else
    {
        console
            .log
                (
                    calc
                        (
                            X,
                            N
                        )
                )
        ;
    }

    // Recursive helper function 'calc'.
    function calc
    (
        cur,   /* Current value */
        count  /* Remaining count */
    )
    {
        // Debugging line (commented out).
        // console.log({cur, count, flag: cur < S[0]})

        // Base case: if current value is less than the smallest element in S.
        if
        (
            cur
                <
            S
                [0]
        )
        {
            return cur * fac[count]
            ;
        }

        // Find the index of the first element in S that is not less than 'cur'.
        let index = 0
        ;
        while
        (
            S
                [index]
                    <
            cur
        )
        {
            index++
            ;
        }

        // Initialize result for this call.
        let result = 0
        ;

        // Loop through elements of S up to 'index'.
        for
        (
            let i = 0
            ;
            i < index
            ;
            i++
        )
        {
            // Recursive call and add to result.
            result += calc
            (
                cur % S[i],
                count - 1
            )
            ;

            // Apply modulo to prevent overflow.
            result = result % 1000000007
            ;
        }

        // Return the final result modulo 1000000007.
        return result % 1000000007
        ;
    }
}


// Read input from stdin and pass it to the main function.
main
(
    require("fs")
        .readFileSync
            (
                "/dev/stdin",
                "utf8"
            )
)
;