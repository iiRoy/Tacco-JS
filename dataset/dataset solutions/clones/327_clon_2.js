let dataStream = require('node:fs').readFileSync('/dev/stdin', 'utf8');

let lineArray = ( dataStream.trim() ).split('\n');

// Begin processing multiple datasets until a termination signal is received
while ( true ) {

    let recordCount = parseInt( lineArray.shift(), 10 );

    // If the dataset count is zero, exit the loop
    if ( recordCount === 0 ) {
        break;
    }

    let columnTotals = [];

    // Initialize all column totals to zero for the current dataset
    for ( let currentColumnIndex = 0; currentColumnIndex <= recordCount; currentColumnIndex++ ) {
        columnTotals[currentColumnIndex] = 0;
    }

    // Iterate through each data row in the current dataset
    for ( let rowIndex = 0; rowIndex < recordCount; rowIndex++ ) {
        let currentRowValues = lineArray.shift().split(' ').map(Number);

        // Calculate the sum of values for the current row
        let rowSummation = currentRowValues.reduce( function ( accumulatorValue, currentValue ) {
            return accumulatorValue + currentValue;
        });

        currentRowValues.push(rowSummation);

        // Add each value in the row to its corresponding column total
        currentRowValues.forEach( function ( elementValue, elementIndex ) {
            columnTotals[elementIndex] += elementValue;
        });

        // Format each number in the row to a fixed width for consistent output
        currentRowValues.forEach( function ( val, idx ) {
            currentRowValues[idx] = ( '    ' + val ).slice(-5);
        });

        console.log( currentRowValues.join('') );
    }

    // Format the final accumulated column totals for output
    columnTotals.forEach( function ( sumVal, sumIdx ) {
        columnTotals[sumIdx] = ( '    ' + sumVal ).slice(-5);
    });

    console.log( columnTotals.join('') );
}