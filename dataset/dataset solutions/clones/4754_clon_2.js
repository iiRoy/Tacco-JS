/*
 * This module defines a primary routine for data manipulation.
 * It reads a string of space-separated numbers, parses them,
 * and performs a specific calculation.
 */
function  processInputData  (  inputString  )  {

  // The initial input is a string, which needs to be broken down.
  // We'll use a local variable to hold these string components.
  let  numericComponents  =  inputString . split (  " "  ) ;

  /*
   * A loop is initiated to iterate over the first four elements
   * of the array. Each element, which is currently a string,
   * will be converted into its integer representation.
   */
  for  (  let  iteratorIndex  =  0  ;  iteratorIndex  <  4  ;  iteratorIndex ++  )  {
    numericComponents [  iteratorIndex  ]  =  Number . parseInt (  numericComponents [  iteratorIndex  ]  ,  10  ) ; // Explicit radix for safety
  }

  // After parsing, we compute two products and then find the maximum of these.
  // The result is then output to the standard console.
  console . log (
    (  numericComponents [  0  ]  *  numericComponents [  1  ]  >  numericComponents [  2  ]  *  numericComponents [  3  ]  )
      ?  (  numericComponents [  0  ]  *  numericComponents [  1  ]  )
      :  (  numericComponents [  2  ]  *  numericComponents [  3  ]  )
  ) ;
}


// The routine is invoked here.
// Data is sourced from standard input using the 'fs' module
// and then passed to the main processing function.
processInputData (
  require (  'fs'  ) . readFileSync (  '/dev/stdin'  ,  'utf8'  )
) ;