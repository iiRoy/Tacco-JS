// This function is designed to carry out a specific numerical operation.
function  PerformCalculation ( sourceInput )
{
  // Obtain the initial line from the provided data and separate it into components.
  const   numericParts  =  sourceInput [ 0 ] . split (  " "  ) ;

  // Compute the final value using exponential and rounding operations, then display it.
  console . log (
    '%d' ,
    Math . round (
      Math . pow ( 100 , numericParts [ 0 ] ) * numericParts [ 1 ]
    )
  ) ;
}

// Fetch content from the standard input stream, interpret it, and prepare for processing.
// Subsequently, invoke the primary function with the prepared data.
PerformCalculation (
  require ( "fs" )
    . readFileSync ( "/dev/stdin" , "utf8" )
    . split ( "\n" )
) ;