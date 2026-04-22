var receivedStrings = [];
var consoleIO = require('readline');

var ioManager = consoleIO.createInterface(
    {
        input:  process.stdin ,
        output: process.stdout
    }
);

ioManager.on(
    'line',
    function (currentLine) {
        receivedStrings.push(currentLine);
    }
);

ioManager.on(
    'close',
    function ( ) {
        var initialCount = Number(receivedStrings[0]);
        var numberArray = receivedStrings[1].split(" ").map( itemString => Number(itemString) );

        var tally = {};
        for ( var analyzedVal of numberArray ) {
            if ( tally[analyzedVal] === undefined ) {
                tally[analyzedVal] = 0;
            }
            tally[analyzedVal]++;
        }

        var accumulatedSum = 0;
        Object.keys(tally).forEach(
            mapKey => {
                var numericKey = Number(mapKey);
                
                // Compare the numeric key with its frequency count
                if ( numericKey !== tally[numericKey] ) {

                    if ( numericKey < tally[numericKey] ) {
                        accumulatedSum += tally[numericKey] - numericKey;
                    }
                    else {
                        accumulatedSum += tally[numericKey];
                    }
                }
            }
        );

        console.log(accumulatedSum);
    }
);