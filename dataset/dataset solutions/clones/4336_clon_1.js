/*
 * This JavaScript program processes input to determine if a specific condition involving three numbers (N, M, K) can be met.
 * It uses a series of conditional checks and nested loops to evaluate different scenarios.
 *
 * The `Main` function serves as the entry point for the problem's logic, accepting the raw input string.
 */
function     Main   (  input   )
{
    // Step 1: Pre-process the raw input string.
    // First, split the entire input string into an array of lines based on newline characters.
    input    =    input    .    split    (    '\n'    )    ;

    // Often, the last line might be empty due to a trailing newline, so remove it.
    input    .    pop    (    )    ;

    // Step 2: Extract the relevant numbers (N, M, K) from the first line of the processed input.
    // The problem assumes the first line contains space-separated values.
    input    =    input    [    0    ]    .    split    (    ' '    )    ;

    // Declare and initialize the variables N, M, and K by parsing them from the input array.
    // Note: These are still strings, but JavaScript's type coercion will handle them as numbers in arithmetic operations.
    var    N    =    input    [    0    ]    ,
         M    =    input    [    1    ]    ,
         K    =    input    [    2    ]    ;

    // Step 3: Check for the simplest direct solutions.
    // If K is perfectly divisible by N or by M, then a 'Yes' condition is met immediately.
    if    (    K    %    N    ==    0    ||    K    %    M    ==    0    )
    {
        console    .    log    (    'Yes'    )    ; // Output 'Yes' to standard output.
        return    ; // Terminate function execution as the solution is found.
    }

    // Step 4: Check for an early exit condition where K is too small to satisfy any criteria.
    // If K is strictly less than both M and N, it's impossible to form K, so output 'No'.
    if    (    K    <    M    &&    K    <    N    )
    {
        console    .    log    (    'No'    )    ; // Output 'No'.
        return    ; // Terminate function.
    }

    // Step 5: Begin exhaustive search with the first set of nested loops.
    // This loop structure tests a specific mathematical relationship between N, M, K, and loop counters i, j.
    // The outer loop iterates from 1 to M (inclusive).
    for    (    var    i    =    1    ;    i    <=    M    ;    i    ++    )
    {
        // The inner loop iterates from 1 to N (inclusive).
        for    (    var    j    =    1    ;    j    <=    N    ;    j    ++    )
        {
            // Evaluate the first formula: K == (i * M + j * (N - 2 * i)).
            if    (    K    ==    (    i    *    M    +    j    *    (    N    -    2    *    i    )    )    )
            {
                console    .    log    (    'Yes'    )    ; // If match, output 'Yes'.
                return    ; // Terminate.
            }
        }
    }

    // Step 6: Continue exhaustive search with a second set of nested loops.
    // This loop structure tests an alternative mathematical relationship, possibly for a symmetric case or a different pattern.
    // The outer loop now iterates from 1 to N (inclusive).
    for    (    var    i    =    1    ;    i    <=    N    ;    i    ++    )
    {
        // The inner loop now iterates from 1 to M (inclusive).
        for    (    var    j    =    1    ;    j    <=    M    ;    j    ++    )
        {
            // Evaluate the second formula: K == (i * N + j * (M - 2 * i)).
            if    (    K    ==    (    i    *    N    +    j    *    (    M    -    2    *    i    )    )    )
            {
                console    .    log    (    'Yes'    )    ; // If match, output 'Yes'.
                return    ; // Terminate.
            }
        }
    }

    // Step 7: If none of the above conditions or loop evaluations yield a 'Yes', then no solution was found.
    console    .    log    (    'No'    )    ; // Output 'No'.
    return    ; // Explicitly return from the function.
}

// This line handles the execution of the `Main` function in an environment where
// input is read from standard input, typically in a competitive programming setup.
Main    (    require    (    "fs"    )    .    readFileSync    (    "/dev/stdin"    ,    "utf8"    )    )    ;