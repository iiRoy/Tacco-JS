/*
 * This JavaScript code processes input data based on specific conditions
 * related to two numerical values, N and M.
 * It primarily calculates factorials modulo a large prime number.
 */

// The 'Main' function serves as the primary entry point for the program's logic.
function Main(  input  ) {
    // Declare variables N and M; these will store integers derived from input.
    var N, M;

    // First, split the entire input string by newline characters.
    // This assumes that the relevant data is on the first line.
    input = input.split(  "\n"  );

    // Then, take the first line of the input and split it by spaces.
    // This separates the two numbers, N and M.
    input = input[0].split(  " "  );

    // Assign the first parsed string to N and the second to M.
    N = input[0];
    M = input[1];

    // Define the modulus for all arithmetic operations to prevent overflow and
    // ensure results stay within a manageable range.
    var mod = 1000000000 + 7; /* A commonly used prime modulus: 1,000,000,007 */

    // Initialize the 'result' variable, which will hold the final computed value.
    var result = 1;

    // Begin conditional logic based on the absolute difference between N and M.

    // Case 1: If the absolute difference between N and M is 2 or greater.
    if(  Math.abs(  N - M  ) >= 2  ) {
        // In this specific scenario, the problem defines the result as 0.
        console.log(  0  );
    }
    // Case 2: If the absolute difference between N and M is exactly 1.
    else if(  Math.abs(  N - M  ) == 1  ) {
        // Calculate N factorial (N!) modulo 'mod'.
        for(  var i = 1; i <= N; i++  ) {
            result *= i; // Multiply current result by 'i'.
            result %= mod; // Apply modulo operation.
        }

        // Calculate M factorial (M!) modulo 'mod' and multiply it with the
        // already computed N! part.
        for(  var i = 1; i <= M; i++  ) {
            result *= i; // Multiply current result by 'i'.
            result %= mod; // Apply modulo operation.
        }

        // Output the final calculated result for this case.
        console.log(  result  );
    }
    // Case 3: If N and M are equal (absolute difference is 0).
    else if(  Math.abs(  N - M  ) == 0  ) {

        // Re-initialize 'result' to 1. This step is redundant if previous
        // branches are mutually exclusive but is kept for exact structural
        // cloning as per Type I definition.
        result = 1;

        // Compute N factorial (N!) modulo 'mod'.
        for(  var i = 1; i <= N; i++  ) {
            result *= i;
            result %= mod;
        }

        // Compute M factorial (M!) modulo 'mod' and multiply it with the
        // current result. Since N == M, this is effectively N! * N!.
        for(  var i = 1; i <= M; i++  ) {
            result *= i;
            result %= mod;
        }
        // For the N == M case, the problem requires multiplying the result by 2.
        result *= 2;
        result %= mod; // Ensure the final result is also modulo 'mod'.

        // Display the final computed result for the N == M scenario.
        console.log(  result  );
    }

}


// This helper function computes the factorial of a number 'n'
// using modular arithmetic to keep the intermediate and final results
// within bounds of 1000000007.
function factorial(  n  ) {
    var result = 1; // Initialize factorial result.
    // Loop from 1 up to 'n', multiplying each number.
    for (  var i = 1; i <= n; i++  ) {
        result = (  result * i  ) % 1000000007; // Apply modulo at each step.
    }
    return result; // Return the modular factorial.
}

// The following line is crucial for running the script in a typical competitive
// programming environment. It reads from standard input and passes the data
// to the 'Main' function.
// This part should generally remain untouched as it handles I/O.
Main(  require(  "fs"  ).readFileSync(  "/dev/stdin", "utf8"  )  );