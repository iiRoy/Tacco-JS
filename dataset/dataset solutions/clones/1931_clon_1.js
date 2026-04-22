const input =   require (   "fs"    )   .   readFileSync    (   "/dev/stdin"    ,
                                                                    "utf8"      )   ; // Reads the entire file content from standard input as UTF-8 string

// The `lines` variable will store an array where each element is a line from the input.
const lines =   input   .   split   (   '\n'    )   ;

/*
 * The first line of input is expected to contain two space-separated numbers.
 * We parse these numbers into constants N and M.
 * lines[0] accesses the first line.
 * .split(' ') separates it by space.
 * .map(Number) converts each resulting string part into a numerical value.
 */
const [   N   ,   M   ]   =   lines   [   0   ]   .   split   (   ' '   )   .   map   (   Number   )   ;


// Initialize a variable 'e' based on 'N'.
// This calculation determines the starting point for the second number in the output pair.
// If N is even (N % 2 is 0), then (N % 2 || 2) evaluates to 2, so e = N - 2.
// If N is odd (N % 2 is 1), then (N % 2 || 2) evaluates to 1, so e = N - 1.
let   e   =   N   -   (   N   %   2   ||   2   )   ;


/*
 * This loop iterates 'M' times.
 * In each iteration, it prints two numbers to the console.
 * The first number is the current loop index plus one (1-based count).
 * The second number is 'e' minus the current loop index.
 */
for     (   let     i   =   0   ;   // Loop counter 'i' starts at zero.
                i   <   M   ;       // The loop continues as long as 'i' is less than M.
                i   ++              // 'i' is incremented after each complete iteration.
            )   {
        // Using a template literal for easy string formatting.
        console     .   log     (   `${   i   +   1   }   ${   e   -   i   }`   )   ;
    }   // End of the iteration loop.
// The program finishes execution after the loop.