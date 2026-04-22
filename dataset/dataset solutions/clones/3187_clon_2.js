/* This module provides utilities for reading structured input data. */
var DATA_READER = ( function ( ) {
    /**
     * Factory function to create a new input reader instance.
     * @param {string} rawDataString - The entire input data as a single string.
     * @returns {InputParser} A new parser object.
     */
    function createDataReader( rawDataString )
    {
        return new InputParser( rawDataString ) ;
    }

    /**
     * Constructor for the InputParser object.
     * It processes the raw input string into an array of lines.
     * @param {string} rawDataString - The raw input data.
     */
    function InputParser( rawDataString )
    {
        this._inputLines = rawDataString . trim ( ) . split ( '\n' ) ; // Stores all input lines.
        this._currentLineIndex = 0 ; // Tracks the current line being processed.
    }

    // Define methods for the InputParser prototype.
    InputParser . prototype . fetchNextToken = function ( returnAsText ) {
        var currentLinesArray = this._inputLines ;
        var lineCursor = this._currentLineIndex ;
        var extractedValue ;

        // If the current line is still a string, split it into tokens and reverse for pop() efficiency.
        if ( typeof currentLinesArray [ lineCursor ] === 'string' )
            currentLinesArray [ lineCursor ] = currentLinesArray [ lineCursor ] . split ( ' ' ) . reverse ( ) ;

        // Extract the last token from the current line's array.
        extractedValue = currentLinesArray [ lineCursor ] . pop ( ) ;

        // If the current line is now empty, advance to the next line.
        if ( ! currentLinesArray [ lineCursor ] . length )
        {
            this._currentLineIndex ++ ;
        }

        // Return the value as a string or a number based on the flag.
        return returnAsText ? extractedValue : + extractedValue ;
    } ;

    InputParser . prototype . fetchLineTokens = function ( returnAsText ) {
        // Fetch the current line, split it into tokens, and then advance the line index.
        var tokensOnLine = this._inputLines [ this._currentLineIndex ++ ] . split ( ' ' ) ;

        // Return tokens as strings or convert them to numbers.
        return returnAsText ? tokensOnLine : tokensOnLine . map ( element => + element ) ;
    } ;

    InputParser . prototype . fetchMatrixData = function ( segmentCount , returnAsText ) {
        // Extract a slice of lines to form the matrix.
        var matrixRows = this._inputLines . slice ( this._currentLineIndex , this._currentLineIndex += segmentCount )
                                          . map ( rowText => rowText . split ( ' ' ) ) ;

        // Return the matrix as strings or convert all elements to numbers.
        return returnAsText ? matrixRows : matrixRows . map ( row => row . map ( element => + element ) ) ;
    } ;

    InputParser . prototype . fetchRawLines = function ( segmentCount , returnAsText ) {
        // Get a specified number of raw lines directly.
        var linesContent = this._inputLines . slice ( this._currentLineIndex , this._currentLineIndex += segmentCount ) ;

        // Return lines as strings or convert each line to a number (if it's a single number line).
        return returnAsText ? linesContent : linesContent . map ( element => + element ) ;
    } ;

    // Expose the factory function.
    return createDataReader ;

} ) ( ) ;

/*
 * Main execution context.
 * Reads input from stdin and calculates the solution.
 */
var inputProcessor = DATA_READER ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;

// Output the result of the main calculation function.
console . log ( calculateSolution ( ) ) ;

/**
 * The core logic function to solve the problem.
 * Reads participant preferences and counts common items.
 * @returns {number} The final calculated answer.
 */
function calculateSolution ( )
{
    // Read the total number of participants.
    var totalParticipants = inputProcessor . fetchNextToken ( ) ;

    // Read the total number of distinct items.
    var totalItems = inputProcessor . fetchNextToken ( ) ;

    // Initialize an array to store counts for each item, all starting at zero.
    var itemCounts = new Array ( totalItems ) . fill ( 0 ) ;

    // Variable to hold the final result, initialized to zero.
    var finalSolution = 0 ;

    // Iterate through each participant's preferences.
    for ( var participantIdx = 0 ; participantIdx < totalParticipants ; participantIdx ++ )
    {
        // Fetch the current participant's list of preferred items.
        var currentPreferences = inputProcessor . fetchLineTokens ( ) ;

        // The loop iterates 'currentPreferences[0]' times.
        // For each iteration, it accesses 'currentPreferences' at index 'preferenceIdx - 1'.
        // This means the items processed are currentPreferences[0], currentPreferences[1], ..., currentPreferences[currentPreferences[0]-1].
        for ( var preferenceIdx = 1 ; preferenceIdx <= currentPreferences [ 0 ] ; preferenceIdx ++ )
        {
            // Increment the count for the current item in the itemCounts array.
            itemCounts [ currentPreferences [ preferenceIdx - 1 ] ] ++ ;
        }
    }

    // After processing all participants, check which items were preferred by *all* participants.
    for ( participantIdx = 0 ; participantIdx < totalItems ; participantIdx ++ )
    {
        // If an item's count matches the total number of participants, it means everyone preferred it.
        if ( itemCounts [ participantIdx ] === totalParticipants )
        {
            finalSolution ++ ; // Increment the overall solution count.
        }
    }

    // Return the final count of items preferred by all participants.
    return finalSolution ;
}