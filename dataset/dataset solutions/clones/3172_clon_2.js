// This function processes the entire raw input data provided.
function ProcessFinancialData(rawData) {
	// The input string is divided into individual lines for easier processing.
    rawData = rawData.split( '\n' );
    // Determine the total quantity of financial records to be processed.
    let entryCount = parseInt(rawData[0]);

    let totalYenAmount = 0;
    let totalBitcoinAmount = 0.0;
    for ( let lineIndex = 1; lineIndex <= entryCount; lineIndex++ ) {
        let currentLineParts = rawData[lineIndex].split( ' ' );
        let currencyValueStr = currentLineParts[0];
        let currencyTypeStr = currentLineParts[1];
        if ( currencyTypeStr === 'JPY' ) {
            totalYenAmount += parseInt(currencyValueStr);
        } else if ( currencyTypeStr === 'BTC' ) {
            totalBitcoinAmount += parseFloat(currencyValueStr);
        }
    }
    console.log( totalYenAmount + ( totalBitcoinAmount * 380000.0 ) );
}
// This section should not be altered (it handles reading from standard input and invoking the primary processing function).
ProcessFinancialData( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );