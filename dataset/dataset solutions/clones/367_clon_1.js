'use strict'
; // Enforce strict mode for better code quality.

var AOJ =
    {}; // Initialize the main application object.

// Immediately Invoked Function Expression (IIFE) to encapsulate AOJ functionality.
( function( ns )
{

    /*
     * Determines if the current execution environment is a web browser.
     * Checks for the presence of the 'window' object, which is typically
     * available only in browser environments.
     */
    var isBrowser = function()
    {
        return typeof window !==
            'undefined'
            ;
    }

    // Expose the isBrowser function on the AOJ namespace.
    ns.isBrowser = isBrowser;


    /**
     * Determines if the current execution environment is Node.js.
     * This is inferred by checking if it's NOT a browser environment.
     */
    var isNodejs = function()
    {
        return !
            isBrowser()
            ;
    }
    ; // End of isNodejs function definition.

    // Expose the isNodejs function on the AOJ namespace.
    ns.isNodejs = isNodejs;


    // Conditional block: Only define browser-specific utilities if in a browser environment.
    if (
        isBrowser()
    )
    {
        /*
         * Encodes a string for safe display in HTML.
         * Replaces common HTML special characters with their entity equivalents.
         * @param {string} string0 - The input string to be HTML-encoded.
         * @returns {string} The HTML-encoded string.
         */
        var getHtmlEncoded =
            function( string0 )
            {
                return String( string0 )
                    .replace( /&/g, '&amp;' )
                    .replace( /"/g, '&quot;' )
                    .replace( /'/g, '&#39;' )
                    .replace( /</g, '&lt;' )
                    .replace( />/g, '&gt;' )
                    ;
            }
        ; // End of getHtmlEncoded.

        // Make getHtmlEncoded available globally via the namespace.
        ns.getHtmlEncoded = getHtmlEncoded;


        // Function to display code on a web page.
        var outputCode = function( function0 )
        {
            // Assumes an HTML element with id 'code' exists.
            document.getElementById( 'code' )
                .innerHTML = '<pre><code>' +
                getHtmlEncoded( function0 ) +
                '</code></pre>'
                ;
        }
        ; // End of outputCode.

        // Expose outputCode.
        ns.outputCode = outputCode;
    }


    /*
     * Retrieves input lines from either the browser (from a DOM element)
     * or Node.js (from standard input /dev/stdin).
     * @returns {Array<string>} An array of input lines.
     */
    var getInput = function()
    {
        var inputLines = []; // Initialize an empty array for input lines.

        // Browser-specific input handling.
        if ( isBrowser() )
        {
            // Get HTML content from an element with id 'input'.
            var html = document.getElementById( 'input' )
                .innerHTML;
            inputLines = html.split( '<br>' ); // Split by <br> tags.

            // Trim whitespace from each line.
            for ( var i = 0; i < inputLines.length; i++ )
            {
                inputLines[ i ] = inputLines[ i ]
                    .trim();
            }
        }

        // Node.js-specific input handling.
        if ( isNodejs() )
        {
            // Read entire file synchronously from /dev/stdin, trim, and split by newlines.
            inputLines = require( 'fs' )
                .readFileSync( '/dev/stdin', 'utf8' )
                .trim()
                .split( '\n' )
                ;
        }
        return inputLines;
    }
    ; // End of getInput.


    /*
     * Sets up a line-by-line reader for input.
     * Calls the provided callback function for each line read.
     * @param {function(string)} callback - The function to call for each line.
     */
    var setLineReader = function( callback )
    {
        // Browser implementation: process all lines at once.
        if ( isBrowser() )
        {
            var lines = getInput(); // Get all input lines.
            // Iterate and call callback for each line.
            for ( var i = 0; i < lines.length; i++ )
            {
                callback( lines[ i ] );
            }
        }

        // Node.js implementation: use readline module for streaming input.
        if ( isNodejs() )
        {
            var readStream = require( 'fs' )
                .ReadStream( '/dev/stdin' );
            var readlineInterface = require( 'readline' )
                .createInterface(
                    {
                        'input': readStream,
                        'output': {}
                    }
                )
                ;
            // Event listener for 'line' events.
            readlineInterface.on( 'line', function( line )
            {
                callback( line );
            } );
        }
    }
    ; // End of setLineReader.

    // Expose setLineReader on the AOJ namespace.
    ns.setLineReader = setLineReader;


    /*
     * Outputs an array of lines to the appropriate destination (browser DOM or console).
     * @param {Array<string>} outputLines - An array of strings to output.
     */
    var doOutput = function( outputLines )
    {
        // Browser output: update a DOM element.
        if ( isBrowser() )
        {
            document.getElementById( 'output' )
                .innerHTML = outputLines
                .map( getHtmlEncoded ) // HTML encode each line.
                .join( '<br>\n' ) // Join with <br> for newlines in HTML.
                ;
        }

        // Node.js output: print to console.
        if ( isNodejs() )
        {
            for ( var i = 0; i < outputLines.length; i++ )
            {
                console.log( outputLines[ i ] );
            }
        }
    }
    ; // End of doOutput.

    // Expose doOutput.
    ns.doOutput = doOutput;


    // Internal array to accumulate output lines for browser display.
    var outputLines = []

    /*
     * Outputs a single line. For browser, it accumulates and updates the DOM.
     * For Node.js, it prints directly.
     * @param {string} outputLine - The single line to output.
     */
    var doOutputLine = function( outputLine )
    {
        // Browser-specific logic.
        if ( isBrowser() )
        {
            outputLines.push( outputLine ); // Add line to buffer.
            document.getElementById( 'output' )
                .innerHTML = outputLines
                .map( getHtmlEncoded )
                .join( '<br>\n' )
                ;
        }

        // Node.js-specific logic.
        if ( isNodejs() )
        {
            console.log( outputLine ); // Print directly to console.
        }
    }
    ; // End of doOutputLine.

    // Expose doOutputLine.
    ns.doOutputLine = doOutputLine;


    /*
     * Sets up the main function to run at the appropriate time
     * (on window.onload for browser, immediately for Node.js).
     * @param {function()} main - The primary function to execute.
     */
    var doMain = function( main )
    {
        // Browser: run main function after the page has loaded.
        if ( isBrowser() )
        {
            window.onload = function()
            {
                outputCode( main ); // Display the source code of main.
                main(); // Execute the main logic.
            }
            ;
        }

        // Node.js: run main function immediately.
        if ( isNodejs() )
        {
            main();
        }
    }
    ; // End of doMain.

    // Expose doMain.
    ns.doMain = doMain;

} )( AOJ )
; // End of the IIFE, passing AOJ as the namespace.


// The main logic of the application.
var main = function()
{
    // Define the game field boundaries.
    var fieldX = 0
    ;
    var fieldY = 0
    ;
    var fieldWidth = 10
    ;
    var fieldHeight = 10
    ;

    // Define Phyonkichi's possible moves (knight-like moves).
    var phyonkichiMoves = [
        [ -1, -2 ], [ 0, -2 ], [ 1, -2 ],
        [ -2, -1 ], [ 2, -1 ],
        [ -2, 0 ], [ 2, 0 ],
        [ -2, 1 ], [ 2, 1 ],
        [ -1, 2 ], [ 0, 2 ], [ 1, 2 ]
    ]
    ; // Array of [dx, dy] offsets.

    // Define sprinkler's wet area (3x3 square centered on sprinkler).
    var splinklerMoves = [
        [ -1, -1 ], [ 0, -1 ], [ 1, -1 ],
        [ -1, 0 ], [ 0, 0 ], [ 1, 0 ],
        [ -1, 1 ], [ 0, 1 ], [ 1, 1 ]
    ]
    ; // Array of relative coordinates.

    // Enumeration-like object for input data types.
    var dataTypes = {};
    dataTypes.phyonkichiLocation = 0;
    dataTypes.numSprinklers = 1;
    dataTypes.splinklerLocations = 2;

    // Object to store parsed input data.
    var input = {};
    input.phyonkichi = {}; // Phyonkichi's starting location.
    input.splinklerLocations = []; // Array of sprinkler locations.

    var lineCount = 0; // Counter for input lines.

    /*
     * Checks if a given (x, y) coordinate is within the defined field boundaries.
     * @param {number} x - The X coordinate.
     * @param {number} y - The Y coordinate.
     * @returns {boolean} True if the location is in the field, false otherwise.
     */
    var isLocationInField = function( x, y )
    {
        if ( fieldX <= x && x < fieldWidth )
        {
            if ( fieldY <= y && y < fieldHeight )
            {
                return true;
            }
            else
            {
                return false;
            }
        }
        else
        {
            return false;
        }
    }
    ; // End of isLocationInField.

    /*
     * Calculates all possible new locations by applying a set of moves
     * from a starting location, filtering out moves that go out of bounds.
     * @param {Array<number>} location - The starting location [x, y].
     * @param {Array<Array<number>>} moves - An array of [dx, dy] move offsets.
     * @returns {Array<Array<number>>} An array of valid new locations.
     */
    var getMovedLocations = function( location, moves )
    {
        var movedLocations = []; // Initialize array for results.
        for ( var i = 0; i < moves.length; i++ )
        {
            var move = moves[ i ]; // Current move offset [dx, dy].
            var x = location[ 0 ] + move[ 0 ]; // Calculate new X.
            var y = location[ 1 ] + move[ 1 ]; // Calculate new Y.

            if ( isLocationInField( x, y ) )
            {
                movedLocations.push( [ x, y ] ); // Add valid location.
            }
        }
        return movedLocations;
    }
    ; // End of getMovedLocations.

    /*
     * Gets all possible next locations for Phyonkichi from a given starting point.
     * @param {Array<number>} phyonkichiLocation - Phyonkichi's current location [x, y].
     * @returns {Array<Array<number>>} An array of valid next Phyonkichi locations.
     */
    var getNextPhyonkichiLocations = function( phyonkichiLocation )
    {
        return getMovedLocations( phyonkichiLocation, phyonkichiMoves );
    }
    ; // End of getNextPhyonkichiLocations.

    /*
     * Gets all locations that become wet from a given sprinkler location.
     * @param {Array<number>} splinklerLocation - The sprinkler's location [x, y].
     * @returns {Array<Array<number>>} An array of locations that are wet.
     */
    var getWetLocations = function( splinklerLocation )
    {
        return getMovedLocations( splinklerLocation, splinklerMoves );
    }
    ; // End of getWetLocations.

    // Cache for memoization in the canSurvive function.
    var cache = {};
    var stack = []; // To keep track of Phyonkichi's path (for debugging/visualization).
    var callCount = 0; // Counter for recursive calls.

    /*
     * Determines if Phyonkichi can survive all sprinklers.
     * This is a recursive function using depth-first search and memoization.
     * @param {Array<number>} phyonkichiLocation - Phyonkichi's current location [x, y].
     * @param {Array<Array<number>>} splinklerLocations - Remaining sprinkler locations to consider.
     * @returns {boolean} True if Phyonkichi can survive, false otherwise.
     */
    var canSurvive = function( phyonkichiLocation, splinklerLocations )
    {
        callCount++; // Increment call counter.

        // Create a unique cache key for the current state.
        var cacheKey = splinklerLocations.length + ', ' + phyonkichiLocation[ 0 ] + ', ' + phyonkichiLocation[ 1 ];

        // Check if result is already in cache.
        if ( cacheKey in cache )
        {
            return cache[ cacheKey ];
        }

        stack.push( phyonkichiLocation ); // Add current location to stack (path).

        // Base case: If no sprinklers left, Phyonkichi survives.
        if ( splinklerLocations.length <= 0 )
        {
            // console.log('End of a possible path. Stack: ' + JSON.stringify(stack));
            return true;
        }

        var splinklerLocation = splinklerLocations[ 0 ]; // Get the current sprinkler.
        var nextPhyonkichiLocations = getNextPhyonkichiLocations( phyonkichiLocation ); // Phyonkichi's next possible moves.
        var wetLocations = getWetLocations( splinklerLocation ); // Areas made wet by the current sprinkler.

        // Iterate through all possible next moves for Phyonkichi.
        for ( var i = 0; i < nextPhyonkichiLocations.length; i++ )
        {
            var nextPhyonkichiLocation = nextPhyonkichiLocations[ i ];

            // Check if this next Phyonkichi location is safe (not wet).
            // This is actually checking if the next Phyonkichi location IS wet.
            // The logic here seems to be: if nextPhyonkichiLocation is wet, THEN try to survive.
            // This implies Phyonkichi must move into a wet area and survive it.
            // Re-reading: "if nextPhyonkichiLocation[0] === wetLocation[0] && nextPhyonkichiLocation[1] === wetLocation[1]"
            // This means: if the *next* Phyonkichi location IS one of the wet locations, then
            // recursively call canSurvive for the *next* sprinkler. This seems to be the core logic.
            for ( var j = 0; j < wetLocations.length; j++ )
            {
                var wetLocation = wetLocations[ j ];

                if ( nextPhyonkichiLocation[ 0 ] === wetLocation[ 0 ] &&
                    nextPhyonkichiLocation[ 1 ] === wetLocation[ 1 ] )
                {
                    // If the next Phyonkichi location is wet, consider the next sprinkler.
                    var nextSplinklerLocations = splinklerLocations.slice( 1 ); // Remaining sprinklers.
                    var can = canSurvive( nextPhyonkichiLocation, nextSplinklerLocations );

                    if ( can )
                    {
                        // If Phyonkichi can survive from this wet spot, then this path is viable.
                        // No need to pop from stack here as we found a successful path.
                        // Cache the result for this state and return true.
                        cache[ cacheKey ] = true;
                        return true;
                    }
                }
            }
        }

        // If no path was found after checking all next moves, Phyonkichi cannot survive from this state.
        stack.splice( stack.length - 1, 1 ); // Remove current location from stack (backtrack).
        cache[ cacheKey ] = false; // Cache the negative result.
        return false;
    }
    ; // End of canSurvive.

    /*
     * Handles a single line of input, parsing it based on the current dataType.
     * @param {string} line - The input line string.
     */
    var handleLine = function( line )
    {
        var args = line.split( ' ' ); // Split line by space.
        for ( var i = 0; i < args.length; i++ )
        {
            args[ i ] = parseFloat( args[ i ] ); // Convert arguments to numbers.
        }

        // Determine the type of data this line represents.
        var dataType = lineCount % Object.keys( dataTypes ).length;

        if ( dataType === dataTypes.phyonkichiLocation )
        {
            input.phyonkichi.x = args[ 0 ];
            input.phyonkichi.y = args[ 1 ];
            if ( input.phyonkichi.x === 0 && input.phyonkichi.y === 0 )
            {
                // console.log('End condition detected: 0 0 input for Phyonkichi location.');
                // This might be an end-of-input marker in some problem settings.
            }
        }
        else if ( dataType === dataTypes.numSprinklers )
        {
            input.numSprinklers = args[ 0 ];
        }
        else if ( dataType === dataTypes.splinklerLocations )
        {
            // Parse sprinkler locations (pairs of x, y coordinates).
            for ( var i = 0; i < args.length; i += 2 )
            {
                input.splinklerLocations.push( [ args[ i ], args[ i + 1 ] ] );
            }

            // Reset call counter and cache for each new test case.
            callCount = 0;
            cache = {}; // Clear cache for new test case.
            stack = []; // Clear stack for new test case.

            // Run the main survival logic.
            if ( canSurvive( [ input.phyonkichi.x, input.phyonkichi.y ], input.splinklerLocations ) )
            {
                AOJ.doOutputLine( 'OK' ); // Phyonkichi can survive.
            }
            else
            {
                AOJ.doOutputLine( 'NA' ); // Phyonkichi cannot survive.
            }
            // console.log('Total calls for this case: ' + callCount);

            // Reset input for the next test case.
            input.splinklerLocations = [];
        }
        else
        {
            // Handle unknown data types or ignore them.
        }
        lineCount++; // Increment line counter.
    }
    ; // End of handleLine.

    // Set up the line reader to process input using the handleLine function.
    AOJ.setLineReader( handleLine );

}
; // End of main function.

// Register the main function with the AOJ framework to be executed.
AOJ.doMain( main );