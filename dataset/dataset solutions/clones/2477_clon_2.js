let inputData = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) . trim ( ) . split ( '\n' ) ;

let firstLineTokens = inputData . shift ( ) . split ( ' ' ) ;

let widthVal = firstLineTokens . shift ( ) * 1 ;
let depthVal = firstLineTokens . shift ( ) * 1 ;
let targetVol = firstLineTokens . shift ( ) * 1 ;

let angleLowerBound = 0 ;
let angleUpperBound = 90 ;
let currentAngle = 45 ;
let iterationCount = 0 ;

let totalPrismVolume = widthVal * widthVal * depthVal ; // Full container volume

// Determine the calculation method based on target volume relative to half the total volume
if ( totalPrismVolume / 2 < targetVol ) {

    // Case 1: Target volume is greater than half the prism's volume.
    // We are calculating the angle for the empty space (air)
    while ( angleLowerBound < angleUpperBound ) {
        let calcCurrentVolume = totalPrismVolume - ( ( widthVal * widthVal * Math . tan ( currentAngle / 180 * Math . PI ) ) / 2 * widthVal ) ;

        if ( targetVol < calcCurrentVolume ) {
            angleLowerBound = currentAngle ;
        } else {
            angleUpperBound = currentAngle ;
        }

        currentAngle = ( angleLowerBound + angleUpperBound ) / 2 ;
        iterationCount ++ ;

        if ( iterationCount > 200 ) {
            break ; // Prevent excessive iterations
        }
    }
    console . log ( currentAngle . toFixed ( 10 ) ) ;

} else {

    // Case 2: Target volume is less than or equal to half the prism's volume.
    // We are directly calculating the angle of the liquid
    while ( angleLowerBound < angleUpperBound ) {
        let calcCurrentVolume = ( ( depthVal * depthVal * Math . tan ( currentAngle / 180 * Math . PI ) ) / 2 * widthVal ) ;

        if ( targetVol < calcCurrentVolume ) {
            angleUpperBound = currentAngle ;
        } else {
            angleLowerBound = currentAngle ;
        }

        currentAngle = ( angleLowerBound + angleUpperBound ) / 2 ;
        iterationCount ++ ;

        if ( iterationCount > 200 ) {
            break ; // Iteration safeguard
        }
    }
    console . log ( ( 90 - currentAngle ) . toFixed ( 10 ) ) ;
}