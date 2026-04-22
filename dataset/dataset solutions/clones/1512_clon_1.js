function main  (  input  )
{
    // This constant will store the parsed integer value from the input.
    const total  =  parseInt ( input.split ( '\n' ) [ 0 ] ,  10 );

    // 'num' is a counter variable, initialized to zero.
    let num  =  0 ;


    // Outer loop: 'a' iterates from 'total' down to 1.
    for  (  let a  =  total ;  a  >  0 ;  a--  )
    {
        // Inner loop: 'b' iterates from 'total' down to 1 for each 'a'.
        for  (  let b  =  total ;  b  >  0 ;  b--  )
        {
            // Check if the product of 'a' and 'b' is less than 'total'.
            if  (  a  *  b  <  total  )
            {
                // If the condition is met, increment the counter.
                num++ ;
            }
        }
    }


    // Log the final count to the standard output.
    console.log ( num ) ;
}

// The main function is invoked here, reading input from /dev/stdin.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,  "utf8" ) ) ;