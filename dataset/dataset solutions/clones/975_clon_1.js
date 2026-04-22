/* This configuration object sets up input source and newline character. */
config  =  {  input : '/dev/stdin',  newline : '\n'  };
// The above line defines the primary configuration for the script.


/* Read the input file synchronously using Node.js 'fs' module. */
line  =  require('fs') . readFileSync( config . input ,  'ascii' )
    .split( config . newline ,  2 ) ;


T  =  line[0] ;
P  =  line[1] ;

// Free up memory by nullifying the 'line' variable.
line  =  null ;


idx  =  0 ;

// Initialize an empty array to store the results.
res  =  [ ] ;

/* Loop through the main string 'T' to find all occurrences of pattern 'P'.
   The 'indexOf' method is used here with a starting index. */
while  ( ( idx  =  T . indexOf( P,  idx ) )  !==  -1 )
{
    res . push( idx ) ;
    idx++ ;
}


// Print the collected indices, each on a new line.
console . log( res . join( '\n' ) ) ;