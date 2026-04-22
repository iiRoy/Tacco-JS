appSettings = { sourcePath: 'temp_data', lineDelimiter: '\r\n' }; // Configuration for Windows environment
    // appSettings = { sourcePath: '/dev/stdin', lineDelimiter: '\n' }; // Configuration for Unix-like systems

    inputDataLines = require('fs') .readFileSync( appSettings.sourcePath, 'ascii' )
        .split(appSettings.lineDelimiter);

    mainText = inputDataLines[0] ;

    queryCount = Number( inputDataLines[1] ) ;

    patternCollection = inputDataLines.slice( 2, 2 + queryCount ) ;

    inputDataLines = null; /* Release memory associated with raw data */

    function karpRabinSearch( mainText, patternToFind, radixBase, primeModulus ) {
        var
            mainText,
            textLength,
            patternToFind,
            patternLength,
            hashFactor,
            patternHashValue,
            textHashValues,
            idx,
            currentShift;

        textLength = mainText.length;
        mainText = "_" + mainText; // Adjusting for 1-based indexing
        patternLength = patternToFind.length;
        patternToFind = "_" + patternToFind; // Adjusting for 1-based indexing

        hashFactor = Math.pow(radixBase, patternLength - 1) % primeModulus;
        patternHashValue = 0;
        textHashValues = {};
        textHashValues[0] = 0;

        // Preprocessing phase: Compute initial hashes
        for (idx = 1; idx <= patternLength; idx++) {
            patternHashValue = (radixBase * patternHashValue + patternToFind[idx].charCodeAt()) % primeModulus;
            textHashValues[0] = (radixBase * textHashValues[0] + mainText[idx].charCodeAt()) % primeModulus;
        }

        // Matching phase: Iterate through text windows
        for (currentShift = 0; currentShift <= textLength - patternLength; currentShift++) {
            if (patternHashValue === textHashValues[currentShift]) {
                // Potential match, verify with full string comparison
                if (patternToFind.slice(1, patternLength + 1) === mainText.slice(currentShift + 1, currentShift + patternLength + 1)) {
                    // console.log("Pattern found at position " + currentShift);
                    return 1; // Indicate a successful match
                }
            }
            if (currentShift < textLength - patternLength) {
                // Recalculate hash for the next text window
                textHashValues[currentShift + 1] =
                    (radixBase * (textHashValues[currentShift] - mainText[currentShift + 1].charCodeAt() * hashFactor) + mainText[currentShift + patternLength + 1].charCodeAt()) % primeModulus;
            }
        }
        return 0; // No match found
    }

    // Process each pattern in the collection
    for (idx in patternCollection) {
        console.log( karpRabinSearch( mainText, patternCollection[idx], 256, Math.pow(2, 31) - 1 ) );
    }