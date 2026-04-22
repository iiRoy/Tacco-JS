(
  function  computeFibonacciValue  (  )  {
    // Retrieve the input index from standard input and increment it for calculation.
    const  targetIndex  =  Number  (  require  ( 'fs' )  .  readFileSync  ( '/dev/stdin' ,  'utf8' )  )  +  1  ;

    // Calculate the square root of 5, a constant used in Binet's formula.
    const  fiveSquareRoot  =  Math  .  sqrt  (  5  )  ;

    /*
     *  Utilize Binet's formula to compute the Fibonacci number at the specified target index.
     *  The formula is F(n) = (Phi^n - Psi^n) / sqrt(5), where:
     *  Phi = (1 + sqrt(5)) / 2 (the golden ratio)
     *  Psi = (1 - sqrt(5)) / 2 (the conjugate golden ratio)
     *  The final result is rounded to the nearest whole number.
     */
    console  .  log  (
      Math  .  round  (
          1  /  fiveSquareRoot  *  (
              Math  .  pow  (  (  1  +  fiveSquareRoot  )  /  2  ,  targetIndex  )
              -  Math  .  pow  (  (  1  -  fiveSquareRoot  )  /  2  ,  targetIndex  )
          )
      )
    )  ;
  }
)  (  )  ;