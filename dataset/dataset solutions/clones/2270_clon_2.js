function  processInput  (  rawData  )
{
  const  divisor  =  10000000007  ; /* This is a large prime number for modulo operations */

  let  unusedVar  =  0  ; /* This variable is present for structural equivalence but not actively used */

  let  linesArray  =  rawData.split ( "\n" ) ; /* Split the entire input string into separate lines */

  let  elementCount  =  Number ( linesArray [ 0 ] ) ; /* The first line provides the total count of items */

  let  numericValues  =  rawData
    .split ( "\n" )
    [ 1 ]
    .split ( " " )
    .map (  currentNum  =>  parseInt ( currentNum , 10 )  ) ; /* Convert the second line of space-separated strings into an array of integers */

  let  partialSum  =  0  ; /* Initialize an accumulator for a sum operation */

  for (  let  decrementIndex  =  elementCount  -  1  ;  0  <  decrementIndex  ;  decrementIndex--  )
  {
    partialSum  +=  numericValues [ decrementIndex ]  ; /* Sum elements from the end of the array, excluding the first */
  }

  partialSum  /=  ( elementCount - 1 ) ; /* Calculate the average of the summed elements */

  let  productAccumulator  =  1  ; /* Initialize an accumulator for a product operation */

  for (  let  incrementIndex  =  1  ;  incrementIndex  <  elementCount  ;  incrementIndex++  )
  {
    productAccumulator  *=  incrementIndex  ; /* Compute the product of numbers from 1 up to (elementCount - 1) */
  }

  console.log ( ( partialSum  *  productAccumulator )  %  divisor ) ; /* Output the final result, applying the modulo operation */
}

const  fileSystem  =  require ( "fs" ) ;
processInput (  fileSystem.readFileSync ( "/dev/input.txt" , "utf-8" )  ) ; /* Read the content of the standard input file and pass it to the processing function */