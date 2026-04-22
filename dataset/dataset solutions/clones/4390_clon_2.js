process.stdin.resume();
process.stdin.setEncoding('utf8');

var inputDataLines = [];
var inputScanner = require('readline') . createInterface ( {
    input : process.stdin,
    output : process.stdout
} ) ;
inputScanner . on ( 'line' , ( currLine ) => {
    inputDataLines . push ( currLine ) ;
} ) ;
inputScanner . on ( 'close' , ( ) => {
    const [ quarterPrice, halfPrice, singlePrice, doublePrice ] = inputDataLines [ 0 ] . split ( " " ) . map ( stringValue => BigInt ( stringValue ) ) ;
    const totalItems = BigInt ( inputDataLines [ 1 ] ) ;
    if ( totalItems % 2n === 0n ) {
        const costPerTwoUnits = findMinimum ( quarterPrice * 8n , halfPrice * 4n , singlePrice * 2n , doublePrice ) ;
        outputResult ( totalItems / 2n * costPerTwoUnits ) ;
    } else {
        const costPerSingleItem = findMinimum ( quarterPrice * 4n , halfPrice * 2n , singlePrice ) ;
        const doubleItemCost = doublePrice ;
        if ( costPerSingleItem * 2n < doubleItemCost ) {
            outputResult ( totalItems * costPerSingleItem ) ;
        } else {
            outputResult ( ( totalItems - 1n ) / 2n * doubleItemCost + costPerSingleItem ) ;
        }
    }
} ) ;

var findMinimum = ( ...valuesToCompare ) => { return valuesToCompare . reduce ( ( currentMin , nextValue ) => currentMin < nextValue ? currentMin : nextValue , valuesToCompare [ 0 ] ) } ;
var outputResult = ( finalCalculation ) => { console . log ( finalCalculation . toString ( ) ) } ;