var acquireInput = ( function () {
    // Factory function to create an input reader instance
    function makeReader ( sourceTxt ) {
        return new InputReader( sourceTxt );
    }

    // Constructor for the InputReader class
    function InputReader ( initialText ) {
        this._linesArray = initialText.trim().split( "\n" );
        this._currentLineIdx = 0;
    }

    // Method to read a single value from the current line
    InputReader.prototype.readNextValue = function ( asString ) {
        var linesRef = this._linesArray,
            currentIdx = this._currentLineIdx,
            resultValue;

        // If the current line hasn't been processed into parts yet, do so
        if ( typeof linesRef[currentIdx] === "string" ) {
            linesRef[currentIdx] = linesRef[currentIdx].split( " " ).reverse();
        }

        resultValue = linesRef[currentIdx].pop(); // Get the last element

        // If the current line is now empty, move to the next line
        if ( !linesRef[currentIdx].length ) {
            this._currentLineIdx++;
        }

        // Return as string or parsed number
        return asString ? resultValue : +resultValue;
    };

    // Method to read all values from the current line
    InputReader.prototype.readLineValues = function ( asString ) {
        var lineParts = this._linesArray[this._currentLineIdx++].split( " " );
        return asString ? lineParts : lineParts.map( item => +item );
    };

    // Method to read a matrix (2D array) of values
    InputReader.prototype.readMatrix = function ( numRows, returnStrings ) {
        var matrixData = this._linesArray.slice( this._currentLineIdx, this._currentLineIdx += numRows ).map( row => row.split( " " ) );
        return returnStrings ? matrixData : matrixData.map( row => row.map( item => +item ) );
    };

    // Method to read a specified number of raw lines
    InputReader.prototype.readRawLines = function ( count, keepStrings ) {
        var extractedLines = this._linesArray.slice( this._currentLineIdx, this._currentLineIdx += count );
        return keepStrings ? extractedLines : extractedLines.map( item => +item );
    };

    return makeReader;
} )();

var inputProcessor = acquireInput( require( "node:fs" ).readFileSync( "/dev/stdin", "utf8" ) );

function multiDimArray ( initialVal ) {
    var argsList = arguments,
        len = argsList.length,
        arrayCreationStr = "Array(argsList[" + --len + "]).fill(0).map(_=>{return " + initialVal + ";})";

    while ( --len ) {
        arrayCreationStr = "Array(argsList[" + len + "]).fill(0).map(_=>" + arrayCreationStr + ")";
    }

    return eval( arrayCreationStr );
}

var DisjointSet = ( function () {
    var _parentArr; // Global reference for the parent array within the closure

    // Factory function to create a DisjointSet instance
    function createDisjointSet ( numElements ) {
        return new DisjointSet( numElements );
    }

    // Constructor for the DisjointSet class
    function DisjointSet ( capacity ) {
        // Initialize parentLinks array with -1 for each element (plus one for 1-based indexing)
        _parentArr = this.parentLinks = Array( capacity + 1 ).fill( -1 );
    }

    // Finds the representative (root) of the set containing elementIndex
    DisjointSet.prototype.findRoot = function ( elementIndex ) {
        // If elementIndex is its own parent (negative value indicates root and size)
        if ( _parentArr[elementIndex] < 0 ) {
            return elementIndex;
        }
        // Path compression: set parent of elementIndex to its root
        return _parentArr[elementIndex] = this.findRoot( _parentArr[elementIndex] );
    };

    // Checks if two elements are in the same set
    DisjointSet.prototype.areConnected = function ( elem1, elem2 ) {
        return this.findRoot( elem1 ) === this.findRoot( elem2 );
    };

    // Joins the sets containing val1 and val2
    DisjointSet.prototype.joinSets = function ( val1, val2 ) {
        val1 = this.findRoot( val1 );
        val2 = this.findRoot( val2 );

        // If they are already in the same set, do nothing
        if ( val1 === val2 ) {
            return false;
        }

        // Union by size (smaller tree attaches to larger tree)
        if ( val1 < val2 ) { // Arbitrary tie-breaking if sizes are equal
            _parentArr[val1] += _parentArr[val2]; // Add size of val2's set to val1's set
            _parentArr[val2] = val1; // Make val1 the parent of val2's root
        } else {
            _parentArr[val2] += _parentArr[val1]; // Add size of val1's set to val2's set
            _parentArr[val1] = val2; // Make val2 the parent of val1's root
        }
        return true;
    };

    // Returns the size of the set containing the given index
    DisjointSet.prototype.setCardinality = function ( index ) {
        return -_parentArr[this.findRoot( index )];
    };

    return createDisjointSet;
} )();

var StringHasher = ( function () {
    // Constant base for polynomial hashing
    var hashBase = 1007;

    // Array of prime moduli for multiple hashing to reduce collisions
    var primeMods = [ 94906249, 94906247 ];

    // Precomputed powers of hashBase modulo primeMods
    var powerValues = [ [ 1 ], [ 1 ] ];

    // Precomputed prefix hashes for the string
    var prefixHashes = [ [ 0 ], [ 0 ] ];

    // Current length of the string being hashed
    var currentLength;

    // Factory function to create a StringHasher instance
    function createStringHasher ( inputString ) {
        return new StringHasher( inputString );
    }

    // Constructor for the StringHasher class
    function StringHasher ( initialStr ) {
        currentLength = this.size = initialStr.length;

        // Iterate through each modulus
        for ( var modIdx = 0; modIdx < primeMods.length; modIdx++ ) {
            powerValues[modIdx].length = prefixHashes[modIdx].length = currentLength + 1;

            // Compute powers and prefix hashes
            for ( var charIdx = 0; charIdx < currentLength; charIdx++ ) {
                powerValues[modIdx][charIdx + 1] = powerValues[modIdx][charIdx] * hashBase % primeMods[modIdx];
                prefixHashes[modIdx][charIdx + 1] = ( prefixHashes[modIdx][charIdx] * hashBase + initialStr.charCodeAt( charIdx ) ) % primeMods[modIdx];
            }
        }
    }

    // Finds the first occurrence of a target substring starting from a given index
    StringHasher.prototype.locateSubstring = function ( targetSubstr, startIndex ) {
        var targetHashVal = calculateHashForString( targetSubstr );
        var substrLength = targetSubstr.length;
        var numMods = primeMods.length;
        var searchRange = currentLength - substrLength + 1;

        // Iterate through possible starting positions
        for ( var charIdx = startIndex; charIdx < searchRange; charIdx++ ) {
            // Check the first hash value
            if ( getRangeHash( charIdx, charIdx + substrLength, 0 ) === targetHashVal[0] ) {
                var matchCount = 1;

                // Check remaining hash values
                for ( var modIdx = 1; modIdx < numMods; modIdx++ ) {
                    if ( getRangeHash( charIdx, charIdx + substrLength, modIdx ) !== targetHashVal[modIdx] ) {
                        break;
                    }
                    matchCount++;
                }
                // If all hash values match, return the starting index
                if ( matchCount === numMods ) {
                    return charIdx;
                }
            }
        }
        return -1; // Substring not found
    };

    // Verifies if a substring at a given position matches a precomputed hash
    StringHasher.prototype.verifyHashMatch = function ( substringHash, subLength, position ) {
        for ( var modIdx = 0; modIdx < primeMods.length; modIdx++ ) {
            var computedHash = getRangeHash( position, position + subLength, modIdx );
            if ( computedHash !== substringHash[modIdx] ) {
                return 0; // Mismatch found
            }
        }
        return 1; // All hashes match
    };

    // Appends a new string to the existing one and updates hashes
    StringHasher.prototype.appendString = function ( additionalString ) {
        var previousLength = currentLength;
        currentLength = this.size = currentLength + additionalString.length;

        for ( var modIdx = 0; modIdx < primeMods.length; modIdx++ ) {
            powerValues[modIdx].length = prefixHashes[modIdx].length = currentLength + 1;
            for ( var charIdx = previousLength; charIdx < currentLength; charIdx++ ) {
                powerValues[modIdx][charIdx + 1] = powerValues[modIdx][charIdx] * hashBase % primeMods[modIdx];
                prefixHashes[modIdx][charIdx + 1] = ( prefixHashes[modIdx][charIdx] * hashBase + additionalString.charCodeAt( charIdx - previousLength ) ) % primeMods[modIdx];
            }
        }
        return currentLength;
    };

    // Helper function to calculate hash values for an arbitrary string
    function calculateHashForString ( textValue ) {
        var resultHashes = [];
        for ( var modIdx = 0; modIdx < primeMods.length; modIdx++ ) {
            var tempHash = 0;
            for ( var charIdx = 0; charIdx < textValue.length; charIdx++ ) {
                tempHash = ( tempHash * hashBase + textValue.charCodeAt( charIdx ) ) % primeMods[modIdx];
            }
            resultHashes.push( tempHash );
        }
        return resultHashes;
    }

    // Helper function to get the hash of a substring within a given range
    function getRangeHash ( leftBound, rightBound, modIndex ) {
        var calculatedHash = ( prefixHashes[modIndex][rightBound] - prefixHashes[modIndex][leftBound] * powerValues[modIndex][rightBound - leftBound] ) % primeMods[modIndex];
        return calculatedHash < 0 ? calculatedHash + primeMods[modIndex] : calculatedHash;
    }

    // Expose the static hash calculation method
    createStringHasher.calculateHashForString = calculateHashForString;

    return createStringHasher;
} )();

global.console.log( executeSolution() );

function executeSolution () {
    var sourceString = inputProcessor.readNextValue( true ); // Read source string
    var targetString = inputProcessor.readNextValue( true ); // Read target string

    var sourceLen = sourceString.length;
    var targetLen = targetString.length;

    var doubledSource = sourceString + sourceString;
    // Ensure the doubled source string is long enough to find all potential matches
    while ( doubledSource.length < sourceLen + targetLen ) {
        doubledSource += sourceString;
    }

    var disjointSetsInstance = DisjointSet( sourceLen );
    var hasherInstance = StringHasher( doubledSource );
    var targetHashArray = StringHasher.calculateHashForString( targetString );

    // Iterate through all possible starting positions in the original source string
    for ( var currentIndex = 0; currentIndex < sourceLen; currentIndex++ ) {
        // Check if the target string matches a substring starting at currentIndex in the doubled source
        if ( hasherInstance.verifyHashMatch( targetHashArray, targetLen, currentIndex ) ) {
            // If it matches, unite the current index with the index where the pattern would end (cyclically)
            if ( !disjointSetsInstance.joinSets( currentIndex, ( currentIndex + targetLen ) % sourceLen ) ) {
                return -1; // If uniting fails (already connected and implies conflict), return -1
            }
        }
    }

    var finalResult = 1; // Initialize with 1 (minimum possible size if no matches or single element)

    // Find the maximum size of any connected component
    for ( currentIndex = 0; currentIndex < sourceLen; currentIndex++ ) {
        var currentSetSize = disjointSetsInstance.setCardinality( currentIndex );
        if ( finalResult < currentSetSize ) {
            finalResult = currentSetSize;
        }
    }

    return finalResult - 1; // The problem asks for the minimum number of character removals, which is max_set_size - 1
}