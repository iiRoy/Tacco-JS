/*
 * This JavaScript function processes input to calculate a specific value.
 * It reads three numbers (a, b, c) and an exponent (k).
 * Then, it identifies the largest among a, b, c, and sums the other two.
 * Finally, it calculates (largest * 2^k) + sumOthers and prints the result.
 */
function  Main(  input  )
{
  // Split the entire input string by newline characters to get individual lines.
  const  lines  =  input . split('\n') ;

  // The first line contains three space-separated values (a, b, c).
  const  abc  =  lines[0] . split(' ') ;


  // Extract individual values from the parsed 'abc' array.
  const  a  =  abc[0] ;
  const  b  =  abc[1] ;
  const  c  =  abc[2] ;

  // The second line contains the exponent 'k'.
  const  k  =  lines[1] ;


  // Declare variables to store the largest number and the sum of the other two.
  let  largest ;
  let  sumOthers ;

  // Determine the largest number and the sum of the remaining two.
  // Check if 'a' is the largest.
  if (  a  >=  b  &&  a  >=  c  )
  {
    largest   =   a ; // 'a' is the largest
    sumOthers =   b  +  c ; // Sum of 'b' and 'c'
  }
  // If 'a' is not the largest, check if 'b' is the largest.
  else  if (  b  >=  c  )
  {
    largest   =   b ; // 'b' is the largest
    sumOthers =   a  +  c ; // Sum of 'a' and 'c'
  }
  // If neither 'a' nor 'b' is the largest, then 'c' must be.
  else
  {
    largest   =   c ; // 'c' is the largest
    sumOthers =   a  +  b ; // Sum of 'a' and 'b'
  } /* End of largest number determination block */


  // Calculate the final answer using the determined largest number, exponent, and sum of others.
  const  answer  =  largest  *  Math . pow(  2 ,  k  )  +  sumOthers ;

  // Output the calculated answer to the console.
  console . log(  answer  ) ;
}

// Invoke the Main function with input read from standard input.
Main(  require("fs") . readFileSync(  "/dev/stdin" ,  "utf8"  )  ) ;