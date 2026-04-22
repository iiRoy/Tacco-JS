/*
 * This function processes input data to solve a specific problem.
 * It categorizes numbers based on thresholds A and B.
 */
function Main(  input  ) {
  // First, parse the input string into an array of lines.
  input = input.split( "\n" );

  // Extract N, which is the total count of points.
  N = Number(input[0]);

  // Read the thresholds A and B from the second line.
  AB = input[1].split(" "); // Split by space

  A = Number(  AB[0]  ); // Convert first part to number for threshold A
  B = Number(  AB[1]  ); // Convert second part to number for threshold B

  // Get the list of points from the third line.
  points = input[2].split(" "); // These are initially strings

  // Initialize arrays to store categorized points.
  P_under_A = [ ]; // Points less than or equal to A
  P_under_B = [ ]; // Points greater than A but less than or equal to B
  P_Not_AB = [ ];  // Points greater than B

  /*
   * Convert all point strings to numbers.
   * This loop iterates N times.
   */
  for(  i = 0;  i < N;  i++  ) {
    points[i] = Number(  points[i]  );
  }

  // Sort the points in ascending order.
  // This uses a custom comparison function.
  points.sort(  function(  a, b  ) {
    if ( a < b )  return -1; // a comes before b
    if ( a > b )  return 1;  // b comes before a
    return 0; // a and b are equal
  }  );

  // Iterate through the sorted points and categorize them.
  for(  i = 0;  i < N;  i++  ) {
    if (  points[i] <= A  ) {
      P_under_A.push(  points[i]  ); // Add to 'under A' category
    } else if (  points[i] <= B  ) {
      P_under_B.push(  points[i]  ); // Add to 'under B' category
    } else {
      P_Not_AB.push(  points[i]  ); // Add to 'not A or B' category
    }
  }

  // The final answer is the minimum length among the three categories.
  // This is printed to the console.
  console.log(  Math.min( P_under_A.length, P_under_B.length, P_Not_AB.length )  );
}

// Invoke the Main function with input read from standard input.
// This is typical for competitive programming environments.
Main(  require( "fs" ).readFileSync( "/dev/stdin", "utf8" )  );