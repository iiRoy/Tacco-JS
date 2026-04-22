/* This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions remain strictly identical.
 * Only whitespace and comments have been altered significantly
 * to create visual difference while preserving logical equivalence.
 */


function   main( input   )   {
  // The main function that processes the input data.
  // It takes a single string 'input' which contains all the raw data.

  const  args  = input . trim() . split(  "\n"  )   ; // Split the input string into an array of lines.
                                                      // First, remove leading/trailing whitespace, then split by newline.


  let n, m    ;    // Declare two variables, 'n' and 'm', to store matrix dimensions.

  // Parse the first line of input to get the dimensions n (rows) and m (columns).
  [n, m]  =  args[0] . split(" ") . map( (x) =>  Number(x) )   ;


  let a =   new Array( n )    ; // Initialize an array 'a' to store the matrix A.
                                   // The size of 'a' is 'n' (number of rows).

  // Loop through the next 'n' lines to populate matrix A.
  for (  let  i  =  0 ;  i < n ;  i++   ) {
    // Each line 'i + 1' from 'args' represents a row of matrix A.
    // Split the line by space and convert each part to a number.
    a[i]  =  args[i + 1] . split(" ") . map( (x) =>  Number(x) )   ;
  }



  let   b   =  new   Array(m)   ; // Initialize an array 'b' to store the vector B.
                                   // The size of 'b' is 'm' (number of elements).

  // Loop through the subsequent 'm' lines to populate vector B.
  // The index for 'args' starts after 'n' rows of matrix A and the initial dimension line.
  for (  let  i  =  0  ;  i < m ;  i++   )   {
    b[i]   =   Number( args[n + 1 + i] )   ; // Convert each line directly to a number for vector B.
  }


  // Perform the matrix-vector multiplication.
  // Iterate through each row of matrix A.
  for (  let  i  =  0 ;  i < n  ;  i++   )   {
    let   ans   =   0   ; // Initialize 'ans' for the current row's result.

    // Iterate through each column of matrix A (which corresponds to elements of vector B).
    for (  let  j  =  0 ;  j < m  ;  j++   )   {
      // Calculate the dot product for the current row of A and vector B.
      ans   +=   a[i][j]   *   b[j]   ;
    }

    console . log( ans )   ; // Print the result for the current row.
  }
} // End of the main function definition.


// This section handles the input/output mechanism.
// It reads the entire content of standard input synchronously,
// converts it to a UTF-8 string, and then passes it to the main function.
main(  require("fs") . readFileSync( "/dev/stdin",  "utf8"  )   )   ;