// This is a Type I clone of the original JavaScript code.
// It maintains exact logical and structural identity,
// with extensive modifications only to whitespace and comments.

function   main(  arg  )
{
    // The input argument is first split by spaces.
    arg = arg  .  split(' ') ;


    // Log the split array for debugging or informational purposes.
    console.log( arg ) ;

    // Initialize a counter variable.
    var   count   =   0  ;

    // Extract the first and second elements from the split array.
    // These will be used in the subsequent loop.
    var mon = arg[0] ;
    var sv  = arg[1] ;

    // This loop repeatedly subtracts 'sv' from 'mon'
    // and increments the counter until 'mon' is less than 'sv'.
    // It's essentially a division operation using subtraction.
    while  (  sv  <=  mon  )
    {
        // Subtract sv from mon.
        mon = mon - sv ;

        // Increment the counter. Note the double semicolon,
        // which is syntactically valid but unusual.
        count++  ;  ;
    }

    // After the loop, log the final count.
    console.log(  count  ) ;
}


// Call the main function with content read from standard input.
// This ensures the program executes with external data.
main(  require( 'fs' ) .  readFileSync(  '/dev/stdin'  , 'utf8'  )  ) ;