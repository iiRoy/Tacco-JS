"use strict" ;

const performCalculation = ( inputData ) => {

    inputData = inputData . trim ( ) . split ( "\n" ) ;

    let dimensionOne = parseInt(inputData[0].split(" ")[0]);
    let dimensionTwo = parseInt(inputData[0].split(" ")[1]);

    let resultDelta = dimensionOne * dimensionTwo;
    let sectionSizes = [ ... Array ( 3 ) ];

    for ( var outerLoopIdx = 0 ; outerLoopIdx < 2 ; outerLoopIdx++ ) {
        for ( var cutPosition = 1 ; cutPosition < dimensionOne ; cutPosition++ ) {

            // Calculate areas for a vertical split.
            sectionSizes[0] = cutPosition * dimensionTwo;
            sectionSizes[1] = (dimensionOne - cutPosition) * (dimensionTwo / 2);
            sectionSizes[2] = dimensionOne * dimensionTwo - (sectionSizes[0] + sectionSizes[1]);

            sectionSizes.sort((valX,valY)=>valX-valY);
            resultDelta = Math.min(resultDelta, sectionSizes[2] - sectionSizes[0]);

            // Determine areas for a horizontal division.
            sectionSizes[0] = cutPosition * dimensionTwo;
            sectionSizes[1] = ((dimensionOne - cutPosition) / 2) * dimensionTwo;
            sectionSizes[2] = dimensionOne * dimensionTwo - (sectionSizes[0] + sectionSizes[1]);

            sectionSizes.sort((valX,valY)=>valX-valY);
            resultDelta = Math.min(resultDelta, sectionSizes[2] - sectionSizes[0]);
        }

        // Rotate the grid dimensions by 90 degrees.
        let tempDimension = dimensionOne;
        dimensionOne = dimensionTwo;
        dimensionTwo = tempDimension;
    }

    console.log(resultDelta);
};

performCalculation( require('fs').readFileSync('/dev/stdin', 'utf8') );