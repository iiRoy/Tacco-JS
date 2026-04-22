/*
 * This is a Type I clone of the original JavaScript code.
 * It strictly adheres to the definition:
 * - All identifiers, variable names, function names, operators, and expressions
 *   remain completely unchanged.
 * - The only modifications are extensive variations in whitespace
 *   (indentation, spacing, blank lines) and comments (added, removed, modified).
 * The logical and structural integrity of the code is preserved.
 */

function       Main  (  input  )
{
    // Process the input string into an array of numbers.
    input  =  input . split (  ' '  ) . map (  value  =>  parseInt (  value  )  )  ;


    // Destructure the input array into N and M.
    const  [  N , M  ]  =  input  ;


    // Initialize an array to store the answer pairs.
    let  ans  =  [ ]  ;


    // Handle the case where N is odd.
    if  (  N  %  2  )
    {
        /*
         * For odd N, pairs are symmetric (l, N-1-l).
         * Loop from l=1 up to the point where l and r cross.
         */
        for  (  let  l  =  1  ,  r  =  N  -  1  ;  l  <  r  ;  l ++  ,  r --  )
        {
                        // Add the pair to the answer array.
                        ans . push (  l  +  ' '  +  r  )  ;
        }
    }
    // Handle the case where N is even.
    else
    {
        // A flag to ensure only one adjustment is made for even N.
        let  flag  =  false  ;
        /*
         * For even N, similar symmetric pairing, but one adjustment is needed
         * to avoid a duplicate or invalid pair.
         */
        for  (  let  l  =  1  ,  r  =  N  -  1  ;  l  <  r  ;  l ++  ,  r --  )
        {
                        // Check if an adjustment is needed for this pair.
                        if  (  ! flag  &&  r  -  l  <=  N  /  2  )
                        {
                                        // Decrement r to make an adjustment.
                                        -- r  ;
                                        // Set the flag to true to prevent further adjustments.
                                        flag  =  true  ;
                        }
                        // Push the current pair (l, r) to the answer array.
                        ans . push (  l  +  ' '  +  r  )  ;
        }
    }


    // Iterate M times to print the first M pairs from the 'ans' array.
    for  (  let  i  =  1  ;  i  <=  M  ;  i ++  )
    {
        // Output each pair to the console.
        console . log (  ans  [  i  -  1  ]  )  ;
    }
}

// This line is typically used for local testing, commented out for production input.
//Main ( '12 5' ) ;

// The following line reads input from standard input and calls the Main function.
// It should not be altered as per the original problem statement's instruction.
Main  (  require  (  "fs"  ) . readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )  ;