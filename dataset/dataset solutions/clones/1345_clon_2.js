const  PerformCalculation  =  function (   inputNumericalValue   )  {
  // This function computes and displays two related geometrical values for a given input.
  // The first value is the area of a circle (PI * r^2), and the second is its circumference (2 * PI * r).
  console.log (  Math.pow (  inputNumericalValue  ,  2  )  *  Math.PI  +  " "  +  Math.PI  *  inputNumericalValue  *  2  ) ;
} ;

// Obtain the raw input data from a designated system source, then execute the primary calculation routine.
PerformCalculation (  require ( "fs" ) . readFileSync ( "/dev/stdin" ,  "utf8" )  ) ;