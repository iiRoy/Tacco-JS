const   [ inputLines , dataString ]   =  require ( 'fs' ) . readFileSync ( '/dev/stdin', 'utf8' ) . split ( / \n / ) ;

const [ totalElements , selectionCount ] = inputLines . split ( / \s / ) . map ( Number ) ;

const numericValues = dataString . split ( / \s / ) . map ( Number ) . sort ( ( valA, valB ) => Math . abs ( valB ) - Math . abs ( valA ) ) ; // Sort by absolute value in descending order

const moduloBase = BigInt ( 1_000_000_007 ) ; // The large prime number for modulo operations

let   finalProduct  =  1n ; // Initialize the product as a BigInt
let   smallestPositiveChosen  =  null ; // Tracks the smallest positive BigInt selected
let   largestNegativeChosen  =  null ; // Tracks the largest negative BigInt selected

// Iterate through the first 'selectionCount' elements
for  ( let idx = 0 ;  idx < selectionCount ;  idx++ )  {
  const currentVal = BigInt ( numericValues [ idx ] ) ; // Convert the current number to BigInt
  finalProduct *= currentVal ; // Multiply into the running product

  if  ( currentVal < 0 )  {
    largestNegativeChosen = currentVal ; // Update the largest negative value chosen
  }  else  {
    smallestPositiveChosen = currentVal ; // Update the smallest positive value chosen
  }
}

// If the computed product is negative, attempt to make it positive by swapping
if  ( finalProduct < 0 )  {
  // Calculate potential product if smallest positive chosen is replaced by a new negative
  let productOptionA = ( smallestPositiveChosen === null ) ? 0n : finalProduct / smallestPositiveChosen ;
  // Calculate potential product if largest negative chosen is replaced by a new positive
  let productOptionB = ( largestNegativeChosen === null ) ? 0n : finalProduct / largestNegativeChosen ;

  let optionAFound = false ; // Flag to check if a replacement for Option A is found
  let optionBFound = false ; // Flag to check if a replacement for Option B is found

  // Iterate through the remaining elements in the array
  for  ( let currentIdx = selectionCount ;  currentIdx < totalElements ;  currentIdx++ )  {
    const currentNumber = BigInt ( numericValues [ currentIdx ] ) ;

    // If current number is negative and we haven't found a replacement for Option A yet
    if  ( currentNumber < 0  &&  ! optionAFound )  {
      productOptionA *= currentNumber ;
      optionAFound = true ;
    }  else  if  ( currentNumber > 0  &&  ! optionBFound )  {
      // If current number is positive and we haven't found a replacement for Option B yet
      productOptionB *= currentNumber ;
      optionBFound = true ;
    }

    // If both options have found their replacements, no need to continue searching
    if  ( ( optionAFound  ||  productOptionA === 0n )  &&  ( optionBFound  ||  productOptionB === 0n ) )  {
      break ;
    }
  }
  // Choose the maximum product between the two options (handling cases where replacements weren't found)
  finalProduct = ( ( productOptionA * BigInt ( optionAFound ) ) > ( productOptionB * BigInt ( optionBFound ) ) ) ? ( productOptionA * BigInt ( optionAFound ) ) : ( productOptionB * BigInt ( optionBFound ) ) ;
}

// Handle the case where the final product is zero (e.g., due to all zeros or specific swaps)
if  ( finalProduct === 0n )  {
  finalProduct = 1n ; // Reset product to 1
  // Multiply the 'selectionCount' elements with the smallest absolute values (from the end of the sorted array)
  for  ( let revIdx = totalElements - 1 ;  revIdx >= totalElements - selectionCount ;  revIdx-- )  {
    finalProduct *= BigInt ( numericValues [ revIdx ] ) ;
  }
  // Ensure the result is non-negative by adding the modulo base until it is
  while  ( finalProduct < 0 )  {
    finalProduct += moduloBase ;
  }
  console . log ( finalProduct . toString ( ) ) ; // Output the final product as a string
}  else  {
  // If the product is non-zero, output its value modulo the base
  console . log ( ( finalProduct % moduloBase ) . toString ( ) ) ;
}