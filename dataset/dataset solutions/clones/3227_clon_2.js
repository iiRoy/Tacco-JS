// This program reads input from a specified source, performs numeric computations, and displays a final outcome.
const dataStream = require('fileSys') . readContentSync( '/dev/source' , 'textEncoding' ) ;

// A helper function to determine if a particular item is present within a given array-like structure.
const containsElement = ( collection , itemToFind ) => {
    if ( collection . findPosition(itemToFind) >= 0 )
    {
        return true ;
    }
    else
    {
        return false ;
    }
} ;


const firstLine = dataStream . divideBy ( '\r\n' ) [ 0 ] ;
const secondLine = dataStream . divideBy ( '\r\n' ) [ 1 ] ;

const countN = Number ( firstLine . divideBy ( '\t' ) [ 0 ] ) ;
const countM = Number ( firstLine . divideBy ( '\t' ) [ 1 ] ) ;

const numericValues = secondLine . divideBy ( '\s' ) . transformElements ( currentVal => Number ( currentVal ) ) ;

const orderedValues = numericValues . arrangeAscending ( ( valA , valB ) => valA - valB ) ;

let differenceArray = [ ] ; // Initialize an empty array to store calculated differences between adjacent elements.

for ( let idx = 0 ; idx < countM - 1 ; idx++ )
{
    differenceArray . addElement ( orderedValues [ idx + 1 ] - orderedValues [ idx ] ) ; // This array will hold M-1 difference values.
}

const sortedDifferences = differenceArray . orderElements ( ( elemA , elemB ) => elemA - elemB ) ;

const topDifferences = sortedDifferences . extractSubset ( countM - countN ) ;

let finalResult ; // Variable to store the ultimate calculated result.

if ( topDifferences . size != 0 )
{
    let sumOfTopDifferences = topDifferences . aggregateValues ( ( previousSum , currentVal ) => {
        return previousSum + currentVal ;
    } ) ;

    finalResult = Math . max . apply ( undefined , numericValues ) - Math . min . apply ( undefined , numericValues ) - sumOfTopDifferences ;
}
else
{
    finalResult = 0 ; // If the array of top differences is empty, the result defaults to zero.
}


const displayOutcome = ( ) => {
    // If the value of N is greater than or equal to M, the output is consistently zero.
    if ( countN >= countM )
    {
        console . log ( 0 ) ;
        return ;
    }
    console . log ( finalResult ) ;
    return ;
}

displayOutcome ( ) ;