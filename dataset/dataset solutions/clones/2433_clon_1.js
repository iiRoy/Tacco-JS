// This line enforces strict mode for the entire script.
'use strict'
; // Enables strict parsing and error handling in JavaScript.

const
    fs = require
    (
        'fs'
    )
;
// This imports the built-in Node.js 'fs' module for file system operations.

let
    fac =
    [
    ]
; // Array to store factorials modulo a given number.
let
    inv =
    [
    ]
; // Array to store modular multiplicative inverses.
let
    finv =
    [
    ]
; // Array to store inverse factorials modulo a given number.

// Function to initialize factorial, inverse, and inverse factorial arrays up to n.
function
    initFactorialMod
    (
        n,
        mod
    )
{
    // Base cases for factorials and inverse factorials.
    fac
        [
            0
        ] = fac
        [
            1
        ] = 1
    ;
    finv
        [
            0
        ] = finv
        [
            1
        ] = 1
    ;
    // Base case for modular inverse.
    inv
        [
            1
        ] = 1
    ;

    // Loop to calculate values iteratively.
    for
    (
        let
            i = 2
        ;
        i <= n
        ;
        i
            ++
    )
    {
        // Calculate modular inverse using the property: inv[i] = mod - inv[mod % i] * (mod / i) % mod.
        inv
            [
                i
            ] = mod
            -
            inv
                [
                    mod
                        %
                    i
                ]
            *
            (
                mod
                    /
                i
            )
            %
            mod
        ;
        // Calculate factorial: fac[i] = (fac[i-1] * i) % mod.
        fac
            [
                i
            ] = fac
            [
                i
                    -
                1
            ]
            *
            i
            %
            mod
        ;
        // Calculate inverse factorial: finv[i] = (finv[i-1] * inv[i]) % mod.
        finv
            [
                i
            ] = finv
            [
                i
                    -
                1
            ]
            *
            inv
                [
                    i
                ]
            %
            mod
        ;
    }
}

// Function to calculate combinations (nCk) modulo a given number.
function
    combinationMod
    (
        n,
        k,
        mod
    )
{
    // If n is less than k, combination is 0.
    if
    (
        n
            <
        k
    )
        return
            0
        ;
    // If n or k are negative, combination is 0 (invalid input).
    if
    (
        n
            <
        0
            ||
        k
            <
        0
    )
        return
            0
        ;
    // Calculate nCk using precomputed factorials and inverse factorials: nCk = fac[n] * finv[k] * finv[n-k] % mod.
    return
        fac
            [
                n
            ]
        *
        (
            finv
                [
                    k
                ]
            *
            finv
                [
                    n
                        -
                    k
                ]
            %
            mod
        )
        %
        mod
    ;
}

// Main logic function to solve the problem for given x, y, and a modulus.
function
    solve
    (
        x,
        y,
        mod
    )
{
    // Check if (x + y) is divisible by 3. If not, no valid path exists.
    if
    (
        (
            x
                +
            y
        )
            %
        3
            >
        0
    )
    {
        return
            0
        ;
    }
    // Calculate n and m based on the problem's constraints (often related to grid paths).
    let
        n =
        (
            2
                *
            y
                -
            x
        )
            /
        3
    ;
    let
        m =
        (
            2
                *
            x
                -
            y
        )
            /
        3
    ;
    // If n or m are negative, it implies an invalid path configuration.
    if
    (
        n
            <
        0
            ||
        m
            <
        0
    )
    {
        return
            0
        ;
    }
    // Define a common modulus constant.
    const
        M = 10e9
            +
        7
    ;
    // Initialize factorial arrays up to (n + m) for combination calculation.
    initFactorialMod
    (
        n
            +
        m,
        M
    )
    ;
    // Return the combination (n+m)Cn modulo M, which represents the number of paths.
    return
        combinationMod
        (
            n
                +
            m,
            n,
            M
        )
    ;
}

// Entry point function for processing input.
function
    main
    (
        arg
    )
{
    // Split the input string by whitespace to get individual arguments.
    const
        args = arg
            .split
            (
                /\s/
            )
    ;
    // Parse the first argument as an integer for X.
    let
        X = parseInt
        (
            args
                [
                    0
                ],
            10
        )
    ;
    // Parse the second argument as an integer for Y.
    let
        Y = parseInt
        (
            args
                [
                    1
                ],
            10
        )
    ;
    // Call the solve function with X and Y, and log the result to the console.
    console
        .log
        (
            solve
            (
                X,
                Y
            )
        )
    ;
}

// Read input from standard input, decode it as UTF-8, and pass it to the main function.
main
(
    fs
        .readFileSync
        (
            '/dev/stdin',
            'utf8'
        )
)
;