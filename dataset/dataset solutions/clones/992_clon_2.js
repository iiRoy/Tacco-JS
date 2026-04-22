(function (  dataString ) {
    // This self-executing function processes input data to find the HCF.
    
    const numericValues = dataString .split(' ') .map( Number ) ;

    let firstNum  =  numericValues .shift() ; // Extract the initial number.
    let secondNum = numericValues .shift() ; // Extract the subsequent number.

    console.log( findHighestCommonFactor ( firstNum , secondNum ) ) ;
} ) ( require ( 'fs' ) .readFileSync ( '/dev/stdin' , 'utf8' ) ) ;


/**
 * Determines the highest common factor (HCF) between two integer values.
 * @param {number} valA - The first integer.
 * @param {number} valB - The second integer.
 * @returns {number} The greatest common factor.
 */
function findHighestCommonFactor ( valA , valB ) {
    // Retrieve all common factors and then select the largest one.
    return Math .max .apply ( null , listCommonFactors ( valA , valB ) ) ;
}


/**
 * Compiles a list of all common factors for two given integers.
 * The internal logic includes a simplified Euclidean algorithm step.
 * @param {number} valA - The initial integer value.
 * @param {number} valB - The second integer value.
 * @returns {Array<number>} An array containing all common factors.
 */
function listCommonFactors ( valA , valB ) {
    // Perform a modulo operation to reduce one of the numbers,
    // mimicking a step in the Euclidean algorithm if one is larger.
    if ( valA > valB ) {
        valA = valA % valB ;
    }
    else if ( valA < valB ) {
        let temporaryHolder = valB ;
        valB = valA ;
        valA = temporaryHolder % valA ;
    }

    // Initialize an empty array to store identified common factors.
    const factorList = [ ] ;

    // Iterate from 1 up to the (potentially modified) first number.
    for ( let counter = 1 ; counter <= valA ; counter ++ ) {
        // Check if the current counter divides both numbers without remainder.
        if ( valA % counter === 0 && valB % counter === 0 ) {
            factorList .push( counter ) ; // Add the common factor to the list.
        }
    }

    return factorList ; // Deliver the collected common factors.
}