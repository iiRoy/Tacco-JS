// This script processes input from standard input to calculate a range.
// It uses an immediately invoked function expression (IIFE).
console.log(
    (   (   args    )   =>  {
            // First, parse the input arguments.
            // The input consists of two lines: K (a single number) and a list of numbers A.
            // args.trim() removes leading/trailing whitespace.
            // .split`\n` splits the input into lines.
            // .map(r=>r.split` `.map(v=>v|0)) parses each line, converting values to integers.
            // The first line (K) is wrapped in an array, so we destructure it as [[K]].
            // The second line (A) is an array of numbers.
            const   [   [   K   ]   ,   A   ]   =   args
                                                        .trim()
                                                        .split`\n`
                                                        .map(  r   =>  r   .split` `
                                                                            .map(  v   =>  v   |   0   )
                                                                    )   ;

            // Initialize minimum and maximum values for the range.
            // These are starting values for the calculation.
            let     min     =   2   ,
                    max     =   2   ;

            // Loop backwards from K-2 down to 0.
            // This iterates through the array A in a specific order,
            // processing elements from right to left (or bottom to top conceptually).
            for (
                    let     i   =   K   -   2   ;   /* Initialize loop counter */
                            i   >=  0           ;   /* Loop condition: continue as long as i is non-negative */
                            i   --                  /* Decrement counter after each iteration */
                )
            {
                // Check for an impossible condition.
                // If the maximum possible value (max + A[i+1] - 1) is less than A[i],
                // then no valid range exists that satisfies the constraints.
                if  (
                        max     +   A   [   i   +   1   ]   -   1
                            <
                        A   [   i   ]
                    )
                {
                    // Return '-1' to indicate an error or impossible state.
                    return  '-1'    ;
                }

                // Calculate the new minimum value.
                // This step ensures that 'min' is a multiple of A[i]
                // and is at least the current 'min' value, effectively "rounding up".
                min     =   Math.ceil   (   min     /   A   [   i   ]   )
                                *   A   [   i   ]   ;

                // Calculate the new maximum value.
                // This updates 'max' based on A[i+1], ensuring it aligns with new constraints.
                max     =   Math.ceil   (   max     /   A   [   i   +   1   ]   )
                                *   A   [   i   +   1   ]
                                +   A   [   i   +   1   ]
                                -   1   ;

                // Adjust 'max' to be a multiple of A[i] (or just below).
                // Subtract the remainder when 'max' is divided by A[i],
                // ensuring that max is the largest multiple of A[i] not exceeding the current max.
                max     -=  max     %   A   [   i   ]   ;
            }

            // After the loop completes, construct the final result string.
            // The result is a string containing the final 'min' value
            // and the adjusted 'max' value (max + A[0] - 1), separated by a space.
            return  `${  min  } ${  max  +  A  [  0  ]  -  1  }`  ;

        }
    )   (
        // Read input from standard input synchronously.
        // 'fs' module is used for file system operations.
        // readFileSync reads the entire file content.
        // '/dev/stdin' is the standard input path on Unix-like systems.
        // 'utf8' specifies the character encoding for the input.
        require (   'fs'    )
            .readFileSync   (   '/dev/stdin'    ,   'utf8'  )
    )
)   ;