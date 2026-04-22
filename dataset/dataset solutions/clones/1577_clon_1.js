// This JavaScript file processes numerical data from standard input.
// It aims to solve a problem involving array manipulation and summation.


function  Main  (  input  )
{
    // The first line of input is parsed as an integer N.
    const   N   =   parseInt  (  input.split(  '\n'  )[0]  )  ;

    /*
     * The second line of input contains space-separated numbers.
     * These are converted into an array of numbers, named A.
     */
    const   A   =   input.split(  '\n'  )[1]  .split(  ' '  )  .map(  Number  )  ;

    // Initialize a variable 'result' to store the cumulative sum.
    let     result  =   0  ;


    // Iterate through the array 'A' from the first element up to the second-to-last element.
    // The loop variable 'i' is implicitly declared in the global scope if not explicitly declared with 'let' or 'const'.
    for  (  i  =  0  ;  i  <  N  -  1  ;  i++  )
    {
        // Check if the current element A[i] is greater than or equal to the next element A[i+1].
        if  (  A[i]  >=  A[i+1]  )
        {
            // If the condition is true, calculate the difference and add it to 'result'.
            result  =  result  +  A[i]  -  A[i+1]  ;
            // Then, update the next element A[i+1] to be equal to the current element A[i].
            A[i+1]  =  A[i]  ;
        }
    }

    // Print the final computed 'result' to the console.
    console.log  (  result  )  ;
}


// This line calls the 'Main' function.
// It reads the entire content of standard input as a UTF-8 string using Node.js 'fs' module.
Main  (  require(  "fs"  )  .readFileSync(  "/dev/stdin"  ,  "utf8"  )  )  ;