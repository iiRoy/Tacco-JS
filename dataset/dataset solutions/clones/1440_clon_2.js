var     rawInputData    =   require('fs').readFileSync('/dev/stdin'    ,   'utf8'   ) ;

// Transform the obtained string into an array of numerical values
// by splitting it based on spaces and converting each part to a number.
var coordinateComponents    =   rawInputData
    .split(' ')
    .map(   function    (   element     )   {
        return  +   element    ;
    }   )   ;

// Deconstruct the array to assign specific coordinate values to distinct variables.
var firstXCoord     =   coordinateComponents[0]   ;
var firstYCoord     =   coordinateComponents[1]   ;
var secondXCoord    =   coordinateComponents[2]   ;
var secondYCoord    =   coordinateComponents[3]   ;

// Calculate the square of the Euclidean distance between the two points.
// This involves squaring the differences in both X and Y dimensions and summing them.
var distanceSquaredValue    =   Math.pow(   firstXCoord     -   secondXCoord    ,   2   )   +
                                Math.pow(   firstYCoord     -   secondYCoord    ,   2   )   ;

// Compute the final Euclidean distance by taking the square root
// and then format the output to exactly five decimal places before displaying.
console.log(    Math.sqrt(  distanceSquaredValue    )   .toFixed(   5   )   )   ;