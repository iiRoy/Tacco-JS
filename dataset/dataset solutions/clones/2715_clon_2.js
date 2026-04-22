var DATA_PARSER = ( function () {
    // Utility to parse raw string data
    function createParser( inputString ) {
        return new InputReader( inputString );
    }

    // Class for reading structured input
    function InputReader( rawData ) {
        this.inputLines = rawData.trim().split( "\n" );
        this.currentLineIndex = 0;
    }

    InputReader.prototype.extractValue = function ( asString ) {
        let linesRef = this.inputLines;
        let idxRef = this.currentLineIndex;
        let extractedItem;

        // If the current line hasn't been processed into an array, do so
        if ( typeof linesRef[idxRef] === "string" ) {
            linesRef[idxRef] = linesRef[idxRef].split( " " ).reverse();
        }

        extractedItem = linesRef[idxRef].pop();

        // Move to the next line if the current one is empty
        if ( !linesRef[idxRef].length ) {
            this.currentLineIndex++;
        }

        // Return as string or number based on flag
        return asString ? extractedItem : +extractedItem;
    };

    InputReader.prototype.readCurrentLine = function ( keepStrings ) {
        // Read the current line and advance the index
        let lineParts = this.inputLines[this.currentLineIndex++].split( " " );

        // Return parts as strings or convert to numbers
        return keepStrings ? lineParts : lineParts.map( element => +element );
    };

    InputReader.prototype.readMatrix = function ( numRows, returnStrings ) {
        // Extract multiple lines and split each into parts
        let matrixData = this.inputLines.slice( this.currentLineIndex, this.currentLineIndex += numRows ).map( row => row.split( " " ) );

        // Convert elements to numbers if not keeping strings
        return returnStrings ? matrixData : matrixData.map( row => row.map( element => +element ) );
    };

    InputReader.prototype.readRows = function ( count, stringOutput ) {
        // Get 'count' number of lines
        let rowItems = this.inputLines.slice( this.currentLineIndex, this.currentLineIndex += count );

        // Convert items to numbers if not keeping strings
        return stringOutput ? rowItems : rowItems.map( item => +item );
    };

    return createParser;
} )();

// Initialize the input processing object
var inputProcessor = DATA_PARSER( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );

// Function for creating N-dimensional arrays
function multiDimArray( initialValue ) {
    var argsList = arguments,
        lengthCount = argsList.length,
        arrayCreationString = "Array(argsList[" + --lengthCount + "]).fill(0).map(ignoredVar=>{return " + initialValue + ";})";
    while ( --lengthCount ) {
        arrayCreationString = "Array(argsList[" + lengthCount + "]).fill(0).map(ignoredVar=>" + arrayCreationString + ")";
    }
    return eval( arrayCreationString );
}

// Main program execution logic
function executeLogic() {
    var mainString = inputProcessor.extractValue( true ); // Get the primary string
    var targetPattern = inputProcessor.extractValue( true ); // Get the pattern string
    var patternRepetitions = calculateRepetitionFactor( targetPattern ); // Determine pattern repetitions

    // Adjust the target pattern if it's a repeating sequence
    if ( patternRepetitions > 1 ) {
        targetPattern = targetPattern.slice( 0, targetPattern.length / patternRepetitions );
    }

    var doubleString = mainString + mainString; // String concatenated with itself
    var tripleString = doubleString + mainString; // String concatenated thrice
    var patternLength = targetPattern.length; // Length of the (possibly adjusted) pattern

    var maxCount = 0,
        currentCount = 1; // Initialize max and current counts

    // Find the first occurrence of the pattern in the doubled string
    var startIndex = doubleString.indexOf( targetPattern );

    // If pattern not found, return 0
    if ( startIndex === -1 ) {
        return 0;
    }

    startIndex += patternLength; // Move index past the first occurrence

    // Loop through the doubled string to find consecutive pattern occurrences
    while ( startIndex < doubleString.length ) {
        var foundIndex = doubleString.indexOf( targetPattern, startIndex );
        if ( foundIndex === -1 ) { // No more occurrences
            break;
        }
        if ( startIndex === foundIndex ) { // Consecutive occurrence
            currentCount++;
        } else { // Non-consecutive, reset count and update max
            if ( maxCount < currentCount ) {
                maxCount = currentCount;
            }
            currentCount = 1;
        }
        startIndex = foundIndex + patternLength; // Advance index
    }

    // Update max count one last time after the loop
    if ( maxCount < currentCount ) {
        maxCount = currentCount;
    }

    // Check for a final consecutive occurrence spanning into the triple string
    foundIndex = tripleString.indexOf( targetPattern, startIndex );
    if ( foundIndex === startIndex ) {
        currentCount++;
        // If a very long sequence is found, it might be infinite (-1)
        if ( maxCount < currentCount ) {
            return -1;
        }
    }

    // Return the maximum count divided by the pattern's repetition factor, truncated
    return maxCount / patternRepetitions | 0;
}

// Determines the repetition factor of a string
function calculateRepetitionFactor( inputSequence ) {
    var sequenceLength = inputSequence.length;
    if ( sequenceLength === 1 ) {
        return 1; // Single character string has repetition factor 1
    }

    var factorsList = findDivisors( sequenceLength ); // Get all divisors of the length

    for ( var loopIndex = 0; loopIndex < factorsList.length; loopIndex++ ) {
        var numOccurrences = sequenceLength / factorsList[loopIndex];
        // Check if the string matches a pattern repeated 'numOccurrences' times
        if ( inputSequence.match( new RegExp( "(" + inputSequence.slice( 0, factorsList[loopIndex] ) + "){" + numOccurrences + "}" ) ) ) {
            return numOccurrences;
        }
    }
    return 1; // No internal repetition found, factor is 1
}

// Finds all divisors of a given integer
function findDivisors( numberInput ) {
    var divisorArray = [1]; // Start with 1 as a divisor
    var sqrtInt = Math.sqrt( numberInput ) | 0; // Integer part of the square root

    // If perfect square, add its root as a divisor
    if ( sqrtInt * sqrtInt === numberInput ) {
        divisorArray.push( sqrtInt );
    }

    // Find other divisors up to the square root
    for ( var counter = 2; counter < sqrtInt; counter++ ) {
        if ( numberInput % counter === 0 ) {
            divisorArray.push( counter, numberInput / counter );
        }
    }
    // Sort the divisors in ascending order
    return divisorArray.sort( ( valA, valB ) => valA - valB );
}

// Handle execution for competitive programming environments
if ( process.argv.length <= 2 ) {
    // If run without arguments, fork a child process with increased stack size
    require( "child_process" ).fork( "Entrypoint.js", ["initial"], {
        executionArguments: ["--stack-limit=240000"]
    } );
} else {
    // Otherwise, execute the main logic and print the result
    console.log( executeLogic() );
}