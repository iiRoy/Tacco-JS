// This is a JavaScript code snippet.
// It's designed to solve a specific problem.
function Main  (  input  ) {

    // First, process the input data.
    // The input is expected as a multi-line string.
    input  =  input.split ( "\n" ) ;

    // The first line contains space-separated values.
    var tmp = input [0] .split(" ");

    // Convert string values to integers.
    // parseInt is used for this conversion.
    var N = parseInt ( tmp [0] , 10 );
    var Y = parseInt ( tmp [1] , 10 );


    // Initialize variables for the solution.
    // These will store the final counts of bills.
    var     man = -1;
    var     gosen = -1;
    var     sen = -1;

    // Calculate an upper bound for the first loop.
    var mantani = Y / 10000 ;

    // Nested loops to find the correct combination of bills.
    // i represents 10000-yen bills.
    for ( i = 0 ; i <= mantani ; i ++ ) {
        // j represents 5000-yen bills.
        // The upper bound for j depends on N and i.
        for ( j = 0 ; j <= N - i ; j ++ ) {
            // Check if the current combination sums up to Y.
            if ( Y == i * 10000 + j * 5000 + ( N - i - j ) * 1000 ) {
                // If a solution is found, store the values.
                man = i ;
                gosen = j ;
                sen = N - i - j ;
            }
        }
        // If a solution for 'man' (10000-yen bills) is found, we can break early.
        if ( man != -1 ) {
            break ;
        }
    }


    // Output the results to the console.
    // The counts of 10000, 5000, and 1000-yen bills.
    console.log ( man + " " + gosen + " " + sen ) ;
}
/*
* This section handles standard input/output.
* Do not modify anything below this line.
* It reads the entire input and calls the Main function.
*/
Main ( require ( "fs" ) .readFileSync ( "/dev/stdin" , "utf8" ) );