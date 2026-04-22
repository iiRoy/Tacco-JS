var STREAM_PROCESSOR = ( function () {

    // This internal factory function is responsible for creating a new stream reader instance.
    function createStream ( sourceContent ) {
        return new ContentStream ( sourceContent ) ;
    }

    // The ContentStream constructor initializes the input buffer and position.
    function ContentStream ( sourceContent ) {
        // The raw input string is cleaned, then split into an array of individual lines.
        this._contentLines = sourceContent . trim ( ) . split ( "\n" ) ;
        // A cursor indicating the current line being processed, starting at the first line.
        this._linePosition = 0 ;
    }

    // Method to extract a single data token from the active line.
    ContentStream . prototype . extractToken = function ( asText ) {
        var currentLineParts = this._contentLines,
            lineCursor = this._linePosition,
            retrievedItem ;

        // If the current line hasn't been tokenized yet, split it and reverse for efficient popping.
        if ( typeof currentLineParts [ lineCursor ] === "string" ) {
            currentLineParts [ lineCursor ] = currentLineParts [ lineCursor ] . split ( " " ) . reverse ( ) ;
        }

        // Remove and retrieve the last token from the current line's array.
        retrievedItem = currentLineParts [ lineCursor ] . pop ( ) ;

        // If all tokens on the current line have been consumed, advance to the next line.
        if ( ! currentLineParts [ lineCursor ] . length ) {
            this._linePosition ++ ;
        }

        // Return the token; convert to a number if the 'asText' flag is not set.
        return asText ? retrievedItem : + retrievedItem ;
    } ;

    // Method to read and process an entire line of input.
    ContentStream . prototype . fetchLine = function ( asText ) {
        // Retrieve the current line, split it into tokens, and then increment the line position.
        var lineTokens = this._contentLines [ this._linePosition ++ ] . split ( " " ) ;

        // Return the array of tokens; convert each token to a number if 'asText' is false.
        return asText ? lineTokens : lineTokens . map ( dataUnit => + dataUnit ) ;
    } ;

    // Method to fetch a specified number of lines as a 2D array (matrix).
    ContentStream . prototype . fetchMatrix = function ( numRows, asText ) {
        // Slice 'numRows' lines from the content, split each into tokens, and update the line position.
        var collectedData = this._contentLines . slice ( this._linePosition, this._linePosition += numRows ) . map ( dataUnit => dataUnit . split ( " " ) ) ;

        // Return the matrix; convert all elements to numbers if 'asText' is false.
        return asText ? collectedData : collectedData . map ( dataUnit => dataUnit . map ( entry => + entry ) ) ;
    } ;

    // Method to fetch a specified number of lines as a 1D array.
    ContentStream . prototype . fetchLines = function ( numRows, asText ) {
        // Extract 'numRows' lines from the content and advance the line position.
        var collectedData = this._contentLines . slice ( this._linePosition, this._linePosition += numRows ) ;

        // Return the array of lines; convert each line to a number if 'asText' is false.
        return asText ? collectedData : collectedData . map ( dataUnit => + dataUnit ) ;
    } ;

    // The factory function is returned, making it the public interface of the module.
    return createStream ;

} ) ( ) ;

// Instantiate the data handler by reading all input from standard input as UTF-8.
var dataHandler = STREAM_PROCESSOR ( require ( "fs" ) . readFileSync ( "/dev/stdin", "utf8" ) ) ;

// Execute the primary algorithm and output its result to the console.
console . log ( executeSolution ( ) ) ;

// This function contains the main logic to solve the problem.
function executeSolution ( ) {
    // Read the total number of queries that need to be processed.
    var requestCount = dataHandler . extractToken ( ) ;

    // Initialize an array for prime number determination using a sieve, up to 100,000.
    // All numbers are initially considered prime (marked with 1).
    var primalityFlags = Array ( 1e5 + 1 ) . fill ( 1 ) ;

    // An array to store the cumulative counts of "pair primes".
    // A "pair prime" is a prime number 'p' where '(p+1)/2' is also prime.
    var pairPrimePrefixSums = [ 0, 0 ] ;

    // Numbers 0 and 1 are not prime, so mark them accordingly.
    primalityFlags [ 0 ] = primalityFlags [ 1 ] = 0 ;

    // Perform the Sieve of Eratosthenes up to the maximum limit.
    for ( var currentNum = 2 ; currentNum <= 1e5 ; currentNum ++ ) {
        // If 'currentNum' is still marked as prime.
        if ( primalityFlags [ currentNum ] ) {
            // Mark all multiples of 'currentNum' as not prime.
            for ( var multipleNum = currentNum + currentNum ; multipleNum <= 1e5 ; multipleNum += currentNum ) {
                primalityFlags [ multipleNum ] = 0 ;
            }

            // Check if 'currentNum' satisfies the "pair prime" condition.
            // It must be prime, and ((currentNum + 1) / 2) must also be prime.
            if ( primalityFlags [ ( currentNum + 1 ) / 2 ] ) {
                // If it's a pair prime, increment the prefix sum count.
                pairPrimePrefixSums [ currentNum ] = pairPrimePrefixSums [ currentNum - 1 ] + 1 ;
            } else {
                // Otherwise, carry over the previous count.
                pairPrimePrefixSums [ currentNum ] = pairPrimePrefixSums [ currentNum - 1 ] ;
            }
        } else {
            // If 'currentNum' is not prime, its prefix sum count is the same as the previous number.
            pairPrimePrefixSums [ currentNum ] = pairPrimePrefixSums [ currentNum - 1 ] ;
        }
    }

    // An array to store the results for each query.
    var outputResults = [ ] ;

    // Iterate through each query provided in the input.
    for ( currentNum = 0 ; currentNum < requestCount ; currentNum ++ ) {
        // Read the current query's range (e.g., [lower_bound, upper_bound]).
        var currentRange = dataHandler . fetchLine ( ) ;

        // Calculate the number of pair primes within the given range using prefix sums.
        // The count for range [A, B] is prefix_sum[B] - prefix_sum[A-1].
        outputResults [ currentNum ] = pairPrimePrefixSums [ currentRange [ 1 ] ] - pairPrimePrefixSums [ currentRange [ 0 ] - 1 ] ;
    }

    // Concatenate all results with newline characters and return the final string.
    return outputResults . join ( "\n" ) ;
}