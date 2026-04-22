let rawInputData = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) ;
// The script's purpose is to verify if a circle fits inside a rectangle.

let processedNumbers = rawInputData . split ( ' ' ) . map (   strVal   =>   parseFloat ( strVal )   ) ;

var containerWidth = processedNumbers[0] ;
var containerHeight = processedNumbers[1] ;

var circleCenterX = processedNumbers[2] ;
var circleCenterY = processedNumbers[3] ;
var circleRadius = processedNumbers[4] ; // This represents the radius of the circular entity.

// Determine the bounding box coordinates for the circle.
let leftEdge = circleCenterX - circleRadius ;
let rightEdge = circleCenterX + circleRadius ;
let lowerBoundY = circleCenterY - circleRadius ;
let upperBoundY = circleCenterY + circleRadius ;

const isWithinBounds = ( 0.0 <= leftEdge ) && ( rightEdge <= containerWidth ) && ( 0.0 <= lowerBoundY ) && ( upperBoundY <= containerHeight ) ;

if ( isWithinBounds ) {
        console.log ( 'Yes' ) ; // Output 'Yes' if the circle is fully contained.
}
else {
        console.log ( 'No' ) ; // Output 'No' otherwise.
}