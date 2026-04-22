/*
 * This JavaScript code solves a specific problem involving lighthouse visibility.
 * It processes input data to determine which lighthouses are "visible"
 * based on their relative strengths and connections provided in the input.
 * The solution adheres to standard competitive programming practices for input/output.
 */

const   main   =   (   input   )   =>
{
        // First, preprocess the raw input string:
        // - Remove any leading/trailing whitespace using trim().
        // - Split the string into an array of lines based on the newline character.
    input   =   input . trim (  ) . split (  '\n'  )


        // The first line of input contains two numbers, N and M.
        // We parse these by splitting the line by space and converting to numbers.
    const   [   n   ,   m   ]   =   input [ 0 ] . split (  ' '  ) . map (  Number  )

        // The remaining lines of input (from the second line onwards) represent connections.
        // We use destructuring to skip the first line and put the rest into 'arr'.
    const   [   ,   ... arr   ]   =   input


        // Initialize the 'lighthouse' array.
        // It starts with a dummy 0 at index 0 (to align with 1-based indexing often used in problems).
        // The actual lighthouse strengths are parsed from the second line of input.
    const   lighthouse   =   [   0   ,   ... input [ 1 ] . split (  ' '  ) . map (  Number  )   ]

        // Initialize the 'ans' array, which will track the visibility of each lighthouse.
        // It also starts with a dummy 'false' at index 0.
        // All N lighthouses (from index 1 to N) are initially considered 'true' (visible).
    const   ans   =   [   false   ,   ... new   Array (   n   ) . fill (  true  )   ]



        // Iterate through each connection specified in the 'arr' array.
        // Each element in 'arr' represents a pair of lighthouses (a, b).
    for   (   let   i = 0  ;   i < arr . length  ;   i ++   )
    {
                // Parse the current connection line to get the two lighthouse indices, 'a' and 'b'.
        const   [   a   ,   b   ]   =   arr [ i ] . split (  ' '  ) . map (  Number  )


                // Compare the strengths of lighthouse 'a' and lighthouse 'b'.
                // If 'a' is stronger or equally strong as 'b', then 'b' cannot be seen.
        if   (   lighthouse [ a ]   >=   lighthouse [ b ]   )
        {
                        ans [ b ]   =   false
        }
                // Otherwise, if 'b' is stronger or equally strong as 'a', then 'a' cannot be seen.
        else   if   (   lighthouse [ a ]   <=   lighthouse [ b ]   )
        {
                            ans [ a ]   =   false
        }
    }


        // Initialize a counter to store the total number of visible lighthouses.
    let   count   =   0

        // Iterate through the 'ans' array, starting from index 1 (skipping the dummy).
        // For each lighthouse, if its 'ans' value is 'true', increment the counter.
    for   (   let   i = 1  ;   i < ans . length  ;   i ++   )
    {
            if   (   ans [ i ]   )
            {
                            count ++
            }
    }


        // Finally, print the total count of visible lighthouses to the console.
    return   console . log (  count  )
}

// This block handles the execution environment.
// It checks the 'MYTEST' environment variable.
process . env . MYTEST
        // If 'MYTEST' is defined:
    ?   (
                // If 'MYTEST' is exactly 'test', call the 'test()' function (presumably defined elsewhere).
                process . env . MYTEST   ===   'test'
            ?   test (  )
                        // Otherwise, read input from 'dev/stdin' and pass it to 'main'.
            :   main (   require (  'fs'  ) . readFileSync (  'dev/stdin'  ,   'utf8'  )   )
    )
        // If 'MYTEST' is not defined, read input from '/dev/stdin' and pass it to 'main'.
    :   main (   require (  'fs'  ) . readFileSync (  '/dev/stdin'  ,   'utf8'  )   )