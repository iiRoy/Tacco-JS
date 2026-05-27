function calculateConcatenation ( countElements , firstArray , secondArray ) {
  // Initialize a container for the concatenated result.
  // Note: This array will be implicitly converted to a string during concatenation.
  let resultString = [ "" ] ;

  // Iterate through the specified number of elements.
  for ( idx = 0 ; idx < countElements ; idx ++ ) {
    // Append the concatenated elements from both arrays to the result string.
    resultString += firstArray [ idx ] + secondArray [ idx ] ;
  }

  // Return the final concatenated string.
  return resultString ;
}
