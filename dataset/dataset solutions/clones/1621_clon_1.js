/*
 * This is the main function that processes the input.
 * It calculates the number of points within a certain distance D from the origin.
 */
function   main(  input  )
{
  // Split the input string into an array of lines based on the newline character.
  input  =  input.split('\n') ;


  // Parse the first line of the input.
  // It contains two space-separated numbers: N (number of points) and D (maximum allowed distance).
  const [ N , D ]   =   input[0] . split(' ') . map(Number) ;

  // Process subsequent lines to extract point coordinates.
  // The slice method gets the lines corresponding to points (from index 1 up to N, inclusive).
  // Each line string is then mapped to a point object {x: number, y: number}.
  const points  =  input
    .slice(  1,   N + 1  )  // Get lines containing point coordinate data.
    .map(  s  =>
      {
        // Split the string for each point by space and convert parts to numbers.
        let v   =   s.split(' ').map(Number) ;
        // Return an object representing the point with x and y coordinates.
        return   {  x : v[0] ,   y : v[1]  }
      }
    ) ;

  // Pre-calculate D squared (D*D) to avoid repeated square root calculations inside the loop.
  // This helps in efficiently checking if a point's squared distance from origin is within D squared.
  let D2   =   D * D ;

  // Initialize a counter to keep track of points that are within the specified distance D.
  let count   =   0 ;

  // Iterate over each point in the 'points' array.
  points . forEach(  p  =>
    {
      // Calculate the squared Euclidean distance of the current point (p) from the origin (0,0).
      // The formula is (x^2 + y^2).
      // If this squared distance is less than or equal to D2, the point is within the radius D.
      if  (  (  p.x  *  p.x   +   p.y  *  p.y  )   <=   D2  )
      {
        // Increment the counter if the point satisfies the distance condition.
        count++ ;
      }
    }
  ) ;

  // Print the final count of points that are within the distance D from the origin.
  console . log(  count  ) ;
}


// --- Program Entry Point ---
// This part handles reading input from standard input (stdin) and initiating the main function.
// It uses Node.js 'fs' module to read the file, converts it to 'utf8' string, and trims whitespace.
main(  require('fs')
  .readFileSync('/dev/stdin',   'utf8')
  .trim()
) ;