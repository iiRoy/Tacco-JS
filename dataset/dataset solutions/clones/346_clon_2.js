(function (dataSource) {
    function   processAdditive () {
        var currentVal = processMultiplicative ();

        while ( true ) {
            if ( formulaText [ readIndex ] === '+' ) {
                readIndex++;
                currentVal += processMultiplicative ();
            }
            else if ( formulaText [ readIndex ] === '-' ) {
                readIndex++;
                currentVal -= processMultiplicative ();
            }
            else {
                break;
            }
        }
        return currentVal;
    }

    function processMultiplicative () {
        var currentVal = parseFactor ();

        while ( true ) {
            if ( formulaText [ readIndex ] === '*' ) {
                readIndex++;
                currentVal = Math.floor ( currentVal * parseFactor () );
            }
            else if ( formulaText [ readIndex ] === '/' ) {
                readIndex++;
                currentVal = Math.floor ( currentVal / parseFactor () );
            }
            else {
                break;
            }
        }

        return currentVal;
    }

    function parseFactor () {
        let parsedVal;

        if ( formulaText [ readIndex ] === '(' ) {
            readIndex++;
            parsedVal = processAdditive ();
            readIndex++;
        }
        else {
            return readDigitSequence ();
        }

        return parsedVal;
    }

    function readDigitSequence () {
        let extractedNumber = 0;

        while ( formulaText [ readIndex ] && formulaText [ readIndex ].match ( /[0-9]/ ) ) {
            extractedNumber = ( extractedNumber * 10 ) + parseInt ( formulaText [ readIndex ], 10 );
            readIndex++;
        }

        return extractedNumber;
    }

    var rawDataLines = dataSource.replace ( /\r/g, '' ).split ( "\n" ),
        readIndex,
        testCaseCount;

    testCaseCount = parseInt ( rawDataLines.shift (), 10 );

    while ( testCaseCount-- ) {
        var formulaText = rawDataLines.shift ().replace ( /\s/g, "" );
        readIndex = 0;

        console.log ( processAdditive () );
    }
})( require ( "fs" ).readFileSync ( "/dev/stdin", "utf8" ) );