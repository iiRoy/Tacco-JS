/*
 *  This file contains a JavaScript implementation
 *  for the matrix chain multiplication problem.
 *  It includes a helper function 'range'
 *  and an immediately invoked function expression (IIFE)
 *  to execute the main logic.
 *
 *  The algorithm computes the minimum number of scalar multiplications
 *  required to multiply a chain of matrices.
 *
 *  Author: AI Assistant
 *  Date: 2023-10-27
 */

function   range (  begin ,   end  )
{
    // Helper function to generate an array of numbers
    // from 'begin' up to (but not including) 'end'.
    // e.g., range(1, 5) -> [1, 2, 3, 4]

    return   Array
        .  from  (
            Array  (  end   -   begin  )  ,
            (   e  ,   i   )   =>   begin   +   i
        )   ;

}


( function   main (  )
{
    // The main execution block of the program.
    // This is an Immediately Invoked Function Expression (IIFE).


    // Read input from stdin, process it into lines.
    const   lines   =   require  (  'fs'  )
        .  readFileSync  (  '/dev/stdin'  ,   'utf8'  )
        .  trim  (  )
        .  split  (  '\n'  )   ;


    // The first line of input provides the number of matrices 'n'.
    const   n   =   Number  (   lines.  shift   (  )   )   ;


    // 'p' array stores the dimensions of the matrices.
    // A chain of 'n' matrices A_1, A_2, ..., A_n
    // has dimensions p[0] x p[1], p[1] x p[2], ..., p[n-1] x p[n].
    // The input format is a bit tricky, combining first and second parts.
    const   p   =   lines
        .  map  (   l   =>   l.  split  (  ' '  )  [  0  ]   )
        .  concat  (  [   lines  [  n  -  1  ]  .  split  (  ' '  )  [  1  ]   ]  )
        .  map  (  Number  )   ;


    // Initialize the 'm' table, which will store the minimum number of
    // scalar multiplications for subproblems.
    // m[i][j] will store the minimum cost to multiply matrices A_i through A_j.
    const   m   =   Array
        .  from  (
            Array  (  n   +   1  )  ,
            (  )   =>   (   Array  (  n   +   1  )   )
        )   ;


    // Base case: Multiplying a single matrix costs 0.
    // So, m[i][i] = 0 for all i.
    for   (   let   i   =   0  ;   i   <   n   +   1  ;   i  ++   )
    {
        m  [  i  ]  [  i  ]   =   0  ;
    }


    // Initialize loop variables.
    let   i   =   0  ,
        d   =   1  ;


    // 'd' represents the chain length (or length of the subproblem).
    // It ranges from 1 (for 2 matrices) up to n-1 (for n matrices).
    for   (   d   =   1  ;   d   <=   n   -   1  ;   d  ++   )
    {
        // 'i' represents the starting index of the matrix chain.
        // It ranges from 1 up to n - d.
        for   (   i   =   1  ;   i   <=   n   -   d  ;   i  ++   )
        {
            // Calculate the ending index of the current chain.
            // j = i + d.
            // m[i][j] is computed by considering all possible split points 'k'.
            m  [  i  ]  [  i  +  d  ]   =   range  (  i  ,   i   +   d  )
                .  map  (
                    k   =>
                        m  [  i  ]  [  k  ]
                        +   m  [  k   +   1  ]  [  i   +   d  ]
                        +   p  [  i   -   1  ]   *   p  [  k  ]   *   p  [  i   +   d  ]
                )
                .  sort  (
                    (   a  ,   b   )   =>   a   -   b
                )
                [  0  ]   ; // Take the minimum cost
        }
    }


    // The final result is stored in m[1][n],
    // representing the minimum cost to multiply matrices A_1 through A_n.
    console.  log  (   m  [  1  ]  [  n  ]   )   ;


} ) (  )   ; // End of the main IIFE.