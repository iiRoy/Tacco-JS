/*
 * This JavaScript module defines the core logic for processing
 * a series of input queries. It's designed to be executed in a Node.js
 * environment, reading from standard input and writing to standard output.
 *
 * The primary function, 'Main', handles the entire computation flow.
 */


// The main entry point function that processes the input string 's'.
function   Main (  s  )
{

  // First, the raw input string 's' is split into an array of lines.
  // Each element of the array will represent one line from the input.
  s  =  s . split ( "\n" ) ;


  // The very first line of the input ('s[0]') is parsed
  // as an integer, representing the total number of queries 'q' to process.
  // The unary plus operator converts the string to a number.
  const   q   =   + s [ 0 ] ;


  // A loop iterates 'q' times, processing each query individually.
  // The loop variable 'i' serves as a counter for the current query.
  for
  (
    var   i   =   0  ;
    i   <   q  ;
    i ++
  )
  {

    // For each iteration, the (i+1)-th line of the input 's'
    // contains the data for the current query.
    // This line is split by spaces, and each part is converted to a number.
    // The result is stored in an array 'a'.
    var   a   =   s [ i + 1 ] . split ( " " ) . map (  val  =>  + val  ) ;


    // 'b' is assigned the larger of the two numbers from the current query.
    var   b   =   Math . max (  a [ 0 ]  ,  a [ 1 ]  ) ;


    // The variable 'a' is then reassigned to hold the smaller
    // of the two numbers from the current query.
    a   =   Math . min (  a [ 0 ]  ,  a [ 1 ]  ) ;


    // A temporary variable 'c' is calculated.
    // This involves taking the square root of the product of 'a' and 'b',
    // rounding it up to the nearest integer, and then subtracting one.
    var   c   =   Math . ceil (  Math . sqrt (  a * b  )  )   -   1 ;


    // The initial value of the answer 'ans' is computed.
    // It's based on 'a', specifically (a - 1) multiplied by 2.
    var   ans   =   (  a   -   1  )   *   2 ;


    // A conditional check: if 'a' is less than 'b - 1',
    // the answer 'ans' is incremented by one.
    if
    (
      a   <   b   -   1
    )
    {
      ans ++ ;
    }


    // 'ans' is further updated by adding a value derived from 'c' and 'a'.
    // Specifically, it adds 2 times the maximum of (c - a) and 0.
    ans   +=   Math . max (  c   -   a  ,  0  )   *   2 ;


    // A final conditional adjustment to 'ans'.
    // If the floor of (a divided by c, then multiplied by b) is equal to 'c',
    // then 'ans' is decremented by one.
    if
    (
      Math . floor (  a   /   c   *   b  )   ===   c
    )
    {
      ans -- ;
    }


    // The calculated answer for the current query is printed to the console.
    console . log (  ans  ) ;

  } // End of the query processing loop.

} // End of the Main function definition.



// This line is responsible for invoking the 'Main' function.
// It reads the entire content of standard input (typically '/dev/stdin' on Linux/macOS)
// as a UTF-8 encoded string, and then passes this string to 'Main'.
Main (  require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )  ) ;