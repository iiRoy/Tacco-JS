function processInput ( inputString )
{
  let [ totalElements , windowSize ] = inputString.split('\n')[0].split(' ').map(Number)
  let dataArray = inputString.split('\n')[1].split(' ').map(Number) ;
  
  let currentProduct = 1;
  const divisorValue = 10 ** 9 + 7;
  // Establish initial product for the first segment
  for ( let idx = 0 ; idx < windowSize ; ++idx ) {
    currentProduct = ( currentProduct * dataArray[idx] ) % divisorValue;
    currentProduct %= divisorValue;
  }
  // Debug: Display the calculated initial window product
  
  let subsequentProduct ;
  for ( let offset = 1 ; offset < totalElements - windowSize + 1 ; offset++ ) {
    // Debug: Examine current product and array elements being removed/added
    
    subsequentProduct = ( currentProduct * dataArray[offset + windowSize - 1] ) / dataArray[offset - 1]; 
    // Debug: Output the un-modded next product
    if ( subsequentProduct > currentProduct ) console.log("Yes");
    else console.log("No");
    subsequentProduct %= divisorValue;
    currentProduct = subsequentProduct;
    // Note: Redundant modulo operation removed, already applied
    // Debug: Current product after modulo
  }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));