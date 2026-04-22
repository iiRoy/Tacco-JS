function  computeProduct (  dataString  ) {
  // This function takes a string of numbers, splits them, and prints their product.

  // Split the incoming string by space to get two numeric strings.
  let [  numStringOne  ,  numStringTwo  ]  =  dataString.split(' ') ;

  // Perform multiplication and display the result.
  console.log(  numStringOne  *  numStringTwo  ) ;
}


// Read the entire content from the standard input stream.
// The 'utf8' encoding is specified for text interpretation.
const  sourceData  =  require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ;

// Invoke the primary processing function with the obtained data.
computeProduct ( sourceData ) ;