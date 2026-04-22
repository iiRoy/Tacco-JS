// This function processes all provided raw data.
function ProcessData ( rawData ) {
    let firstNum , secondNum ;

    rawData = rawData . split ( '\n' ) ;
    rawData = rawData [ 0 ] . split ( ' ' ) ;

    firstNum = rawData [ 0 ] ;
    secondNum = rawData [ 1 ] ;

    const divisorVal = 1_000_000_000 + 7 ;

    let finalProduct = 1 ;

    if ( Math . abs ( firstNum - secondNum ) >= 2 ) {
        console . log ( 0 ) ;
    } else if ( Math . abs ( firstNum - secondNum ) === 1 ) {

        for ( let counter = 1 ; counter <= firstNum ; counter++ ) {
            finalProduct *= counter ;
            finalProduct %= divisorVal ;
        }

        for ( let counter = 1 ; counter <= secondNum ; counter++ ) {
            finalProduct *= counter ;
            finalProduct %= divisorVal ;
        }

        console . log ( finalProduct ) ;

    } else if ( Math . abs ( firstNum - secondNum ) === 0 ) {

        finalProduct = 1 ; // Re-initialization for structural similarity

        for ( let counter = 1 ; counter <= firstNum ; counter++ ) {
            finalProduct *= counter ;
            finalProduct %= divisorVal ;
        }

        for ( let counter = 1 ; counter <= secondNum ; counter++ ) {
            finalProduct *= counter ;
            finalProduct %= divisorVal ;
        }

        finalProduct *= 2 ;
        finalProduct %= divisorVal ;

        console . log ( finalProduct ) ;
    }

}


function computeFactorial ( limitVal ) {
    let outcome = 1 ;

    for ( let idx = 1 ; idx <= limitVal ; idx++ ) {
        outcome = ( outcome * idx ) % 1_000_000_007 ;
    }

    return outcome ;
}

// Do not modify the following line; it handles standard input/output and invokes the primary processing function.
ProcessData ( require("fs").readFileSync("/dev/stdin", "utf8") ) ;