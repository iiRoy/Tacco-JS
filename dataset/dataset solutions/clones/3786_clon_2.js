function calculateMaxOperation ( initialString ) {
    // This function processes a string of numbers to find the maximum of three operations.

    initialString = initialString . trim ( ) ; // Remove any leading or trailing whitespace from the raw input.

    // Split the string by spaces and convert each part into a floating-point number.
    let numericArray = initialString . split ( " " ) . map ( parseFloat ) ;

    // Calculate the maximum value among addition, subtraction, and multiplication of the first two numbers.
    const finalResult = Math . max (
        numericArray [ 0 ] + numericArray [ 1 ] ,
        numericArray [ 0 ] - numericArray [ 1 ] ,
        numericArray [ 0 ] * numericArray [ 1 ]
    ) ;

    // Check if the calculated result is negative zero and normalize it to positive zero if so.
    if ( finalResult === - 0 ) {
        finalResult = 0 ;
    }

    // Output the final computed maximum value to the console.
    console . log ( finalResult ) ;
}

// Read input from standard input and pass it to the processing function.
calculateMaxOperation ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;