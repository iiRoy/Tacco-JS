// This comment explains that 'input' receives the entire input data. 
function Main ( input ) {
    // The input data is typically split, but here 'input' itself is the value. 
    n   =   input;

    var     a   =   100; // Initialize starting amount for calculation. 
    var     year    =   0; // Counter for the number of years. 


        while ( a < n ) { // Loop continues as long as current amount 'a' is less than target 'n'. 
            a   =   Math.floor ( a * 1.01 ) ; // Apply 1% annual increase, then floor to integer. 
            year    =   year    +   1   ; // Increment the year counter. 
        }

    // Displaying the final calculated year. 
    console . log ( year ) ;
}
 //* This section is for handling standard input/output and should not be modified. 
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;