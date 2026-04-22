( function    processEntry( )    {
  // Acquire the numerical input from the standard input stream.
  const    inputVal    =    Number(
    require( 'fs' ) . readFileSync( '/dev/stdin' ,    'utf8' )
  ) ;


  // Establish a memoization storage array with the initial sequence values.
  const    memoStore    =    [    1    ,    1    ] ;


  // Declare a recursive function for sequence calculation, utilizing memoization.
  const    calcSequence    =    (    idx    )    =>
    memoStore[ idx ]
    ||
    ( memoStore[ idx ]    =
        calcSequence( idx - 1 )    +    calcSequence( idx - 2 ) ) ;


  // Output the final computed sequence result to the console.
  console . log(    calcSequence( inputVal )    ) ;

} ) ( ) ;