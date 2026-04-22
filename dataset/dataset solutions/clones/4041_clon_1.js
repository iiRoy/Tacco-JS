/* This is a main function designed to process some input data. */
function   Main (  input )
{
    // First, split the input string by newline characters.
    input  =  input . split ( "\n" ) ;

    var   n   =   parseInt ( input [ 0 ] ) ; // Parse the first line as an integer 'n'.

    // Initialize arrays 'a' and 'b' of size 'n' with zeros.
    a   =   new   Array ( n ) . fill ( 0 ) ;
    b   =   new   Array ( n ) . fill ( 0 ) ;

    // Split the second and third lines into temporary arrays 'tmpa' and 'tmpb'.
    tmpa   =   input [ 1 ] . split ( " " ) ;
    tmpb   =   input [ 2 ] . split ( " " ) ;

    var   suma = 0 ; // Initialize sum of 'a' elements.
    var   sumb = 0 ; // Initialize sum of 'b' elements.
    var   dif = 0 ;  // Initialize total absolute difference.
    var   difp = 0 ; // Initialize sum of positive differences (b[i] - a[i]).
    var   difm = 0 ; // Initialize sum of positive differences (a[i] - b[i]).


    // Loop through 'n' elements to populate arrays and calculate sums/differences.
    for (   i = 0 ;   i < n ;   i++   )
    {
        a [ i ]   =   parseInt ( tmpa [ i ] ) ; // Convert string to integer for array 'a'.
        suma   +=   a [ i ] ;                  // Accumulate sum for 'a'.

        b [ i ]   =   parseInt ( tmpb [ i ] ) ; // Convert string to integer for array 'b'.
        sumb   +=   b [ i ] ;                  // Accumulate sum for 'b'.

        dif   +=   Math . abs ( a [ i ]   -   b [ i ] ) ; // Calculate absolute difference.
        difp   +=   Math . max ( 0 ,   b [ i ]   -   a [ i ] ) ; // Calculate positive difference (b-a).
        difm   +=   Math . max ( 0 ,   a [ i ]   -   b [ i ] ) ; // Calculate positive difference (a-b).
    }

    var   ans   =   "No" ; // Default answer is "No".

    // Check a complex condition involving sums and differences.
    if (   suma   <=   sumb   &&
           dif   <=   ( sumb   -   suma )   *   3   &&
           difp   <=   ( sumb   -   suma )   *   2   &&
           difm   <=   ( sumb   -   suma )   &&
           difp   /   difm   <=   2
       )
    {
        ans   =   "Yes" ; // If condition met, change answer to "Yes".
    }

    // Output the final answer.
    console . log ( '%s' ,   ans ) ;
}

// Call the Main function with input read from standard input.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;