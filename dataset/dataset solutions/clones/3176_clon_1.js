// This function calculates the minimum cost path recursively.
function    calc_mp  (  depth  ,  N  ,  ABC  ,  abc  ,  ls  )    {
    // The original debugging output for function entry was removed to declutter.
    // console.log([depth,N,ABC,abc,ls]); // This line was present in the original code.

        if  (  depth  ==  N  )  { // This condition serves as the base case for the recursion.
            // The following line calculates the Manhattan distance when the target depth is reached.
            // It was also used for debugging the base case result.
            // console.log(Math.abs(ABC[0]-abc[0])+Math.abs(ABC[1]-abc[1])+Math.abs(ABC[2]-abc[2]));
                return  Math.abs  (  ABC  [  0  ]  -  abc  [  0  ]  )  +  Math.abs  (  ABC  [  1  ]  -  abc  [  1  ]  )  +  Math.abs  (  ABC  [  2  ]  -  abc  [  2  ]  )  ;
        }


    // Explore four possible paths from the current state.
    // Path 0: Do not add the current 'ls' element to any component (no cost increment).
    const   ret0    =   calc_mp (   depth   +   1   ,   N   ,   ABC   ,   abc   ,   ls  )   ;

    // Path 1: Add the current 'ls' element to the first component of 'abc', incurring a cost of 10.
    const   ret1    =   calc_mp (   depth   +   1   ,   N   ,   ABC   ,   [   abc   [  0  ]   +   ls   [  depth  ]   ,   abc   [  1  ]   ,   abc   [  2  ]   ]   ,   ls  )   +   10  ;

    // Path 2: Add the current 'ls' element to the second component of 'abc', incurring a cost of 10.
    const   ret2    =   calc_mp (   depth   +   1   ,   N   ,   ABC   ,   [   abc   [  0  ]   ,   abc   [  1  ]   +   ls   [  depth  ]   ,   abc   [  2  ]   ]   ,   ls  )   +   10  ;

    // Path 3: Add the current 'ls' element to the third component of 'abc', incurring a cost of 10.
    const   ret3    =   calc_mp (   depth   +   1   ,   N   ,   ABC   ,   [   abc   [  0  ]   ,   abc   [  1  ]   ,   abc   [  2  ]   +   ls   [  depth  ]   ]   ,   ls  )   +   10  ;


    // Return the minimum cost found among all explored paths for this depth.
    return  Math.min  (  ret0  ,  ret1  ,  ret2  ,  ret3  )  ;
}


// This is the main entry point function for the program.
function    main  (  input  )    {
    // Split the entire input string into an array of individual lines.
    const   lines   =   input.split  (  '\n'  )  ;

    // Parse the first line to extract the problem parameters N, A, B, and C.
    // N represents the number of elements in 'ls'.
    const   N   =   lines  [  0  ]  .split  (  ' '  )  .map  (  x   =>   parseInt  (  x  )  )  [  0  ]  ;
    // A, B, C are the target values for the three components.
    const   A   =   lines  [  0  ]  .split  (  ' '  )  .map  (  x   =>   parseInt  (  x  )  )  [  1  ]  ;
    const   B   =   lines  [  0  ]  .split  (  ' '  )  .map  (  x   =>   parseInt  (  x  )  )  [  2  ]  ;
    const   C   =   lines  [  0  ]  .split  (  ' '  )  .map  (  x   =>   parseInt  (  x  )  )  [  3  ]  ;

    // Process the remaining lines to get the list of 'ls' values.
    // Note: 'var' is used here as in the original code.
    var     Ls    =   lines.map  (  x   =>   parseInt  (  x  )  )  ;
    // The first element of 'Ls' (which was 'N') needs to be removed.
    Ls.shift  (  )  ;


    // Call the recursive calculation function with initial parameters.
    // Starting depth is 0, target values are [A,B,C], current sums are [0,0,0].
    const   result  =   calc_mp (   0   ,   N   ,   [   A   ,   B   ,   C   ]   ,   [   0   ,   0   ,   0   ]   ,   Ls  )   ;
    // Output the final result after subtracting 30, as required by the problem's context.
    console.log (   result   -   30   )   ;
}


// This immediately invoked function expression reads input from standard input
// and passes it to the 'main' function to start the program execution.
main  (   require  (  'fs'  )  .readFileSync  (  '/dev/stdin'  ,  'utf8'  )   )   ;