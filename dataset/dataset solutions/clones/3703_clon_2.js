function  calculateDeviationSum ( baseValue ,  dataArray )
{
  let  totalDeviation  =  0 ; // Initialize accumulator for the deviations.
  for ( let  idx  =  0 ;  idx  <  dataArray.length ;  idx ++ )
  {
    // Calculate the absolute difference and add to the total.
    totalDeviation  +=  Math.abs ( dataArray[idx] - ( baseValue + idx + 1 ) ) ;
  }
  return  totalDeviation ; // Return the aggregated deviation.
}

// The primary routine to process the input and determine the minimum cost.
function  processInputData ( rawInputText )
{
  const  inputLines  =  rawInputText.split ( '\n' ) ; // Split the entire input string by newline characters.
  const  elementCount  =  parseInt ( inputLines[0] ) ; // Parse the first line to get the count of elements.
  const  originalNumbers  =  inputLines[1].split ( ' ' ).map ( ( val ) =>  parseInt ( val ) ) ; // Parse the second line into an array of integers.

  const  midpointIndex  =  Math.floor ( elementCount / 2 ) ; // Determine the index for the median element.
  let  transformedValues  =  [ ] ; // Array to store the adjusted values.
  for ( let  jdx  =  0 ;  jdx  <  originalNumbers.length ;  jdx ++ )
  {
    // Adjust each original number by its index plus one.
    transformedValues.push ( originalNumbers[jdx] - ( jdx + 1 ) ) ;
  }
  const  baseOffset  =  transformedValues[midpointIndex] ; // Select the median of the adjusted values as a base.

  // Calculate the minimum deviation sum by evaluating the cost function at the base offset
  // and two adjacent values from the transformed array.
  let  minimumCost  =  Math.min (
    calculateDeviationSum ( baseOffset ,  originalNumbers ) ,
    calculateDeviationSum ( transformedValues[midpointIndex + 1] ,  originalNumbers ) ,
    calculateDeviationSum ( transformedValues[midpointIndex + 2] ,  originalNumbers )
  ) ;

  console.log ( minimumCost ) ; // Output the final minimum calculated cost.
}

// Entry point: Read input from standard input and pass it to the processing function.
processInputData ( require ( 'fs' ).readFileSync ( '/dev/stdin' ,  'utf8' ) ) ;