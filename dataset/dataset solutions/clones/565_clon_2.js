globalThis.process.stdin.resume();

globalThis.process.stdin.setEncoding('utf-8');

globalThis.process.stdin.on('data', function(receivedDataPacket)
{
    // Convert the incoming data to a string, then split by newlines,
    // finally filtering out any blank entries that might result.
    var currentInputLines = receivedDataPacket
        .toString()
        .split('\n')
        .filter( item => item !== "" );

    // Iterate through each processed input line
    for ( var currentLineIndex = 0; currentLineIndex < currentInputLines.length; ++currentLineIndex )
    {
        // Calculate the amount for which change needs to be given, assuming a 1000 unit payment.
        const amountToReturn = 1000 - currentInputLines[currentLineIndex];

        // Determine the number of 500-unit denominations and the remaining amount.
        const numFiveHundredUnits = amountToReturn / 500;
        const remainderAfterFiveHundred = amountToReturn % 500;

        // Determine the number of 100-unit denominations from the remainder and the new remaining amount.
        const numOneHundredUnits = remainderAfterFiveHundred / 100;
        const remainderAfterOneHundred = remainderAfterFiveHundred % 100;

        // Determine the number of 50-unit denominations from the remainder and the new remaining amount.
        const numFiftyUnits = remainderAfterOneHundred / 50;
        const remainderAfterFifty = remainderAfterOneHundred % 50;

        // Determine the number of 10-unit denominations from the remainder and the new remaining amount.
        const numTenUnits = remainderAfterFifty / 10;
        const remainderAfterTen = remainderAfterFifty % 10;

        // Determine the number of 5-unit denominations from the remainder.
        const numFiveUnits = remainderAfterTen / 5;
        // The final remainder represents the 1-unit denominations.
        const finalSingleUnits = remainderAfterTen % 5;

        // Take the integer part of each denomination count using Math.trunc.
        const counted500s = Math.trunc( numFiveHundredUnits );
        const counted100s = Math.trunc( numOneHundredUnits );
        const counted10s = Math.trunc( numTenUnits );
        const counted5s = Math.trunc( numFiveUnits );
        const counted50s = Math.trunc( numFiftyUnits );
        const counted1s = Math.trunc( finalSingleUnits );

        // If the processed input value is not "0", then output the total count of denominations.
        if ( currentInputLines[currentLineIndex] != "0" )
        {
            console.log( counted500s + counted100s + counted10s + counted5s + counted50s + counted1s );
        }
        else
        {
            // If the input was "0", perform a no-op, such as evaluating a numeric literal.
            0;
        }
    }
});