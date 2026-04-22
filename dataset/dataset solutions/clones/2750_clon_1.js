function      myOut    (   text   )    {
    console . log ( text ) ;
}    // This function provides a simple standard output mechanism.


/*
 * The primary entry point for the program.
 * It processes the input data according to specific requirements.
 */
function Main ( input ) {


    input  =  input . trim ( ) ;    // Remove leading/trailing whitespace from the input string.


    // This line is commented out, it would split the input by spaces.
    // input = input.split(" ");


    input  =  input . split ( "\n" ) ;   // Split the input string into an array of lines.


    // Another commented out line, for splitting by space and converting to numbers.
    // input = input.split(" ").map((a)=>Number(a));


    // This line is also commented, it would split by newline and convert to numbers.
    // input = input.split("\n").map((a)=>Number(a));


    // Extract the first number from the first line of input.
    var   N   =   parseInt ( input [ 0 ] . split ( " " ) [ 0 ] ) ;


    // Extract the second number from the first line of input.
    var   M   =   parseInt ( input [ 0 ] . split ( " " ) [ 1 ] ) ;


    input . shift ( ) ;   // Remove the first element (the line containing N and M) from the input array.


    var   list   =   { } ;    // Initialize an empty object to serve as an adjacency list for a graph.


    // Initialize the adjacency list with empty arrays for each node from 1 to N.
    for ( var   i   =   1 ;   i   <=   N ;   i ++ ) {
        list [ i ]   =   [ ] ;
    }


    // Process M lines of input to build the graph's adjacency list.
    for ( var   i   =   0 ;   i   <   M ;   i ++ ) {


        // Get the first temporary node identifier from the current input line.
        var   tmp1   =   input [ i ] . split ( " " ) [ 0 ] ;


        // Get the second temporary node identifier from the current input line.
        var   tmp2   =   input [ i ] . split ( " " ) [ 1 ] ;


        // Add tmp2 to the adjacency list of tmp1 (representing an edge).
        list [ tmp1 ] . push ( tmp2 ) ;


        // Add tmp1 to the adjacency list of tmp2 (representing an edge, making it an undirected graph).
        list [ tmp2 ] . push ( tmp1 ) ;
    }


    // Check the degree of each node in the graph.
    for ( var   i   =   1 ;   i   <=   N ;   i ++ ) {


        // If any node has an odd degree, the condition is not met.
        if ( list [ i ] . length   %   2   ==   1 ) {


            console . log ( "-1" ) ; // Output -1 as per problem specification for this condition.
            return ;                  // Terminate the program execution.
        }
    }


    // This loop appears to be a placeholder or for future implementation.
    for ( var   i   =   1 ;   i   <=   M ;   i ++ ) {

    }
}


/*
 * This section reads input from standard input (/dev/stdin)
 * using Node.js 'fs' module and passes it to the Main function.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;