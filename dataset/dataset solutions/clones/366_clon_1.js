'use strict' ; /* This directive enforces strict mode. */

var AOJ = { } ;

// Self-executing anonymous function to encapsulate the library logic
( function ( ns )
{

  /**
   * Checks if the current environment is a web browser.
   * @returns {boolean} True if running in a browser, false otherwise.
   */
  var isBrowser = function ( ) {
    return typeof window !== 'undefined' ; // Check for the global window object
  } ;
  ns.isBrowser = isBrowser ; // Expose the function

  /*
   * Determines if the code is running in a Node.js environment.
   */
  var isNodejs = function ( )
  {
    return ! isBrowser ( ) ; // If not a browser, assume Node.js
  } ;

  ns.isNodejs = isNodejs ; // Export for external use


  if ( isBrowser ( ) )
  {
    // Function to HTML-encode a string for safe display
    var getHtmlEncoded = function ( string0 )
    {
      return String ( string0 )
        .replace ( /&/g , '&amp;' ) // Encode ampersands first
        .replace ( /"/g , '&quot;' ) // Encode double quotes
        .replace ( /'/g , '&#39;' ) // Encode single quotes
        .replace ( /</g , '&lt;' ) // Encode less than
        .replace ( />/g , '&gt;' ) ; // Encode greater than
    } ;
    ns.getHtmlEncoded = getHtmlEncoded ; // Make it accessible

    // Outputs code to a specific HTML element
    var outputCode = function ( function0 )
    {
      document . getElementById ( 'code' ) . innerHTML = '<pre><code>' + getHtmlEncoded ( function0 ) + '</code></pre>' ;
    } ;
    ns.outputCode = outputCode ; // Export function
  }


  var getInput = function ( )
  {
    var inputLines = [ ] ;

    if ( isBrowser ( ) )
    {
      var html = document.getElementById ( 'input' ) . innerHTML ;
      inputLines = html . split ( '<br>' ) ; // Split by HTML line breaks
      for ( var i = 0 ; i < inputLines . length ; i++ )
      {
        inputLines [ i ] = inputLines [ i ] . trim ( ) ; // Remove leading/trailing whitespace
      }
    }
    if ( isNodejs ( ) )
    {
      // Read from /dev/stdin in Node.js
      inputLines = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) . trim ( ) . split ( '\n' ) ;
    }
    return inputLines ; // Return processed input lines
  } ;


  var setLineReader = function ( callback )
  {
    if ( isBrowser ( ) )
    {
      var lines = getInput ( ) ;
      for ( var i = 0 ; i < lines . length ; i++ )
      {
        callback ( lines [ i ] ) ; // Call callback for each line
      }
    }
    if ( isNodejs ( ) )
    {
      // Using Node.js 'readline' module for stream processing
      var readStream = require ( 'fs' ) . ReadStream ( '/dev/stdin' ) ;
      var readlineInterface = require ( 'readline' ) . createInterface ( { 'input' : readStream , 'output' : { } } ) ;
      readlineInterface . on ( 'line' , function ( line ) {
        callback ( line ) ; // Process each line as it's read
      } ) ;
    }
  } ;
  ns.setLineReader = setLineReader ; // Export this utility function


  var doOutput = function ( outputLines )
  {
    if ( isBrowser ( ) )
    {
      // In browser, update a specific HTML element
      document . getElementById ( 'output' ) . innerHTML = outputLines . map ( getHtmlEncoded ) . join ( '<br>\n' ) ;
    }
    if ( isNodejs ( ) )
    {
      // In Node.js, print to console
      for ( var i = 0 ; i < outputLines . length ; i++ )
      {
        console . log ( outputLines [ i ] ) ;
      }
    }
  } ;
  ns.doOutput = doOutput ; // Expose the output function


  var outputLines = [ ] ; // Array to accumulate output lines for browser display

  var doOutputLine = function ( outputLine )
  {
    if ( isBrowser ( ) )
    {
      outputLines . push ( outputLine ) ;
      document . getElementById ( 'output' ) . innerHTML = outputLines . map ( getHtmlEncoded ) . join ( '<br>\n' ) ;
    }
    if ( isNodejs ( ) )
    {
      console . log ( outputLine ) ;
    }
  } ;
  ns.doOutputLine = doOutputLine ; // Expose single line output function


  var doMain = function ( main )
  {
    if ( isBrowser ( ) )
    {
      window . onload = function ( ) {
        outputCode ( main ) ; // Display source code
        main ( ) ; // Execute the main logic
      } ;
    }
    if ( isNodejs ( ) )
    {
      main ( ) ; // Just execute main logic directly
    }
  } ;
  ns.doMain = doMain ; // Export the main entry point
} ) ( AOJ ) ; /* Pass AOJ object as namespace */


var main = function ( )
{
  var fieldX = 0 ; /* X-coordinate of the field's origin */
  var fieldY = 0 ; /* Y-coordinate of the field's origin */
  var fieldWidth = 10 ; // Width of the simulation field
  var fieldHeight = 10 ; // Height of the simulation field

  // Define possible moves for Phyonkichi
  var phyonkichiMoves = [
    [ -1 , -2 ] , [ 0 , -2 ] , [ 1 , -2 ] ,
    [ -2 , -1 ] , [ 2 , -1 ] ,
    [ -2 , 0 ] , [ 2 , 0 ] ,
    [ -2 , 1 ] , [ 2 , 1 ] ,
    [ -1 , 2 ] , [ 0 , 2 ] , [ 1 , 2 ] // Phyonkichi's L-shaped moves
  ] ;

  // Define areas affected by a sprinkler
  var splinklerMoves = [
    [ -1 , -1 ] , [ 0 , -1 ] , [ 1 , -1 ] ,
    [ -1 , 0 ] , [ 0 , 0 ] , [ 1 , 0 ] , // Sprinkler affects a 3x3 square
    [ -1 , 1 ] , [ 0 , 1 ] , [ 1 , 1 ]
  ] ;

  var dataTypes = { } ; // Object to map input line types
  dataTypes . phyonkichiLocation = 0 ;
  dataTypes . numSprinklers = 1 ;
  dataTypes . splinklerLocations = 2 ;

  var input ; // Stores parsed input data for a test case
  var lineCount = 0 ; // Counter for input lines

  /*
   * Checks if a given (x, y) coordinate is within the defined field boundaries.
   * @param {number} x - The x-coordinate.
   * @param {number} y - The y-coordinate.
   * @returns {boolean} True if the location is in the field, false otherwise.
   */
  var isLocationInField = function ( x , y )
  {
    if ( fieldX <= x && x < fieldWidth )
    {
      if ( fieldY <= y && y < fieldHeight )
      {
        return true ;
      }
      else
      {
        return false ;
      }
    }
    else
    {
      return false ;
    }
  } ;

  /**
   * Calculates new locations based on an initial location and a set of moves.
   * Filters out locations that are outside the field.
   * @param {Array<number>} location - The starting [x, y] coordinate.
   * @param {Array<Array<number>>} moves - An array of [dx, dy] move vectors.
   * @returns {Array<Array<number>>} An array of valid new [x, y] locations.
   */
  var getMovedLocations = function ( location , moves )
  {
    var movedLocations = [ ] ; // Initialize array for results

    for ( var i = 0 ; i < moves . length ; i++ )
    {
      var move = moves [ i ] ;
      var x = location [ 0 ] + move [ 0 ] ; // Calculate new x
      var y = location [ 1 ] + move [ 1 ] ; // Calculate new y

      if ( isLocationInField ( x , y ) )
      {
        movedLocations . push ( [ x , y ] ) ; // Add if valid
      }
    }
    return movedLocations ;
  } ;

  // Get all possible next locations for Phyonkichi
  var getNextPhyonkichiLocations = function ( phyonkichiLocation )
  {
    return getMovedLocations ( phyonkichiLocation , phyonkichiMoves ) ;
  } ;

  // Get all locations that would be wet by a sprinkler
  var getWetLocations = function ( splinklerLocation )
  {
    return getMovedLocations ( splinklerLocation , splinklerMoves ) ;
  } ;

  var cache ; // Memoization cache for canSurvive function
  var stack ; // Call stack for debugging (not strictly needed for logic)
  var callCount ; // Counter for recursive calls

  /**
   * Determines if Phyonkichi can survive all sprinklers by finding a safe path.
   * This is a recursive, depth-first search approach with memoization.
   * @param {Array<number>} phyonkichiLocation - Current [x, y] of Phyonkichi.
   * @param {Array<Array<number>>} splinklerLocations - Remaining sprinkler locations to avoid.
   * @returns {boolean} True if a survival path exists, false otherwise.
   */
  var canSurvive = function ( phyonkichiLocation , splinklerLocations )
  {
    callCount++ ; // Increment call counter for analysis

    // Create a unique cache key for the current state
    var cacheKey = splinklerLocations . length + ', ' + phyonkichiLocation [ 0 ] + ', ' + phyonkichiLocation [ 1 ] ;

    if ( cacheKey in cache )
    {
      return cache [ cacheKey ] ; // Return cached result if available
    }

    stack . push ( phyonkichiLocation ) ; // Add current location to stack for path tracking

    if ( splinklerLocations . length <= 0 )
    {
      // console.log ( 'Stack: ' + JSON.stringify ( stack ) ) ; // Debugging line
      return true ; // No more sprinklers, Phyonkichi survives!
    }

    var splinklerLocation = splinklerLocations [ 0 ] ; // Get the current sprinkler to consider
    var nextPhyonkichiLocations = getNextPhyonkichiLocations ( phyonkichiLocation ) ; // Phyonkichi's possible next moves
    var wetLocations = getWetLocations ( splinklerLocation ) ; // Areas made wet by the current sprinkler

    // Iterate through Phyonkichi's possible next moves
    for ( var i = 0 ; i < nextPhyonkichiLocations . length ; i++ )
    {
      var nextPhyonkichiLocation = nextPhyonkichiLocations [ i ] ;

      // Check if this next move leads to a wet spot
      for ( var j = 0 ; j < wetLocations . length ; j++ )
      {
        var wetLocation = wetLocations [ j ] ;
        if ( nextPhyonkichiLocation [ 0 ] === wetLocation [ 0 ] &&
          nextPhyonkichiLocation [ 1 ] === wetLocation [ 1 ] )
        {
          // If Phyonkichi lands in a wet spot, try to survive the *remaining* sprinklers
          var nextSplinklerLocations = splinklerLocations . slice ( 1 ) ; // Remove the current sprinkler
          var can = canSurvive ( nextPhyonkichiLocation , nextSplinklerLocations ) ;
          if ( can )
          {
            // If a path is found from this state, it's a valid survival path
            cache [ cacheKey ] = true ; // Cache the positive result
            return true ;
          }
        }
      }
    }

    stack . splice ( stack . length - 1 , 1 ) ; // Backtrack: remove from stack

    cache [ cacheKey ] = false ; // If no path found, cache as false
    return false ; // Phyonkichi cannot survive from this state
  } ;


  var handleLine = function ( line )
  {
    var args = line . split ( ' ' ) ; // Split input line by space

    // Convert arguments to floating-point numbers
    for ( var i = 0 ; i < args . length ; i++ )
    {
      args [ i ] = parseFloat ( args [ i ] ) ;
    }

    // Determine the type of data based on line count modulo number of data types
    var dataType = lineCount % Object . keys ( dataTypes ) . length ;

    if ( dataType === dataTypes . phyonkichiLocation )
    {
      input = { } ; // Reset input object for new test case
      input . phyonkichi = { } ;
      input . splinklerLocations = [ ] ;
      input . phyonkichi . x = args [ 0 ] ;
      input . phyonkichi . y = args [ 1 ] ;

      if ( input . phyonkichi . x === 0 && input . phyonkichi . y === 0 )
      {
        // console.log ( 'end' ) ; // End condition for input (e.g., 0 0)
      }
    }
    else if ( dataType === dataTypes . numSprinklers )
    {
      input . numSprinklers = args [ 0 ] ;
    }
    else if ( dataType === dataTypes . splinklerLocations )
    {
      // Parse sprinkler locations (x, y pairs)
      for ( var i = 0 ; i < args . length ; i += 2 )
      {
        input . splinklerLocations . push ( [ args [ i ] , args [ i + 1 ] ] ) ;
      }

      // console.log ( JSON.stringify ( input ) ) ; // Debugging: show parsed input

      callCount = 0 ; // Reset call counter for each test case
      cache = { } ; // Clear memoization cache for each test case
      stack = [ ] ; // Clear stack for each test case

      // Run the survival simulation
      if ( canSurvive ( [ input . phyonkichi . x , input . phyonkichi . y ] , input . splinklerLocations ) )
      {
        AOJ . doOutputLine ( 'OK' ) ; // Phyonkichi can survive
      }
      else
      {
        AOJ . doOutputLine ( 'NA' ) ; // Phyonkichi cannot survive
      }
      // console.log ( 'callCount: ' + callCount ) ; // Debugging: show recursion depth
    }
    else
    {
      // Handle unknown data types if necessary, though not expected here
    }

    lineCount++ ; // Increment line counter
  } ;

  AOJ . setLineReader ( handleLine ) ; // Set up the line reader to process input
} ;

// Execute the main function using the AOJ utility
AOJ . doMain ( main ) ;