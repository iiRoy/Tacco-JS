var  rawData  =  require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ;
// The initial input string is retrieved, then processed to yield a numerical boundary.
let    numericLimit    =    (    rawData . trim ( )    )    -    0    ;

// A mutable string buffer is established for accumulating output values.
let  collectedNumbers  =  ""  ;

// Iteration commences from the integer 3, continuing up to and including the derived numerical boundary.
for  (  let  currentNumber  =  3  ;  currentNumber  <=  numericLimit  ;  currentNumber ++  )
{
    // If the present number is perfectly divisible by three, it's appended to the collection.
    if  (  currentNumber  %  3  ===  0  )
    {
        collectedNumbers  +=  currentNumber  +  " "  ;
    }
    // Otherwise, if its string representation contains the digit '3', it is also appended.
    else  if  (  (  currentNumber  +  ""  ) . match ( /3/ )  )
    {
        collectedNumbers  +=  currentNumber  +  " "  ;
    }
}

// The final sequence of numbers, with any superfluous trailing space removed, is output to the console.
console . log ( collectedNumbers . trim ( ) ) ;