'use strict'; // Enable strict mode for better error handling and cleaner code.

var AOJ = { }; // Initialize the global AOJ object.

( function ( ns ) { // Self-executing anonymous function to encapsulate modules.
  // Determines if the current environment is a web browser.
  var isBrowser = function ( ) {
    return typeof window !== 'undefined';
  };
  ns.isBrowser = isBrowser; // Expose isBrowser function to the AOJ namespace.

  // Determines if the current environment is Node.js.
  var isNodejs = function ( ) {
    return ! isBrowser ( ); // Node.js if not a browser.
  };
  ns.isNodejs = isNodejs; // Expose isNodejs function.

  // --- Browser-specific functionalities ---
  if ( isBrowser ( ) ) {

    // Encodes HTML special characters to prevent XSS.
    var getHtmlEncoded = function ( string0 ) {
      return String ( string0 )
        .replace ( /&/g , '&amp;' )
        .replace ( /"/g , '&quot;' )
        .replace ( /'/g , '&#39;' )
        .replace ( /</g , '&lt;' )
        .replace ( />/g , '&gt;' );
    };
    ns.getHtmlEncoded = getHtmlEncoded; // Expose HTML encoder.

    // Outputs code to a designated HTML element, typically for display.
    var outputCode = function ( function0 ) {
      document.getElementById ( 'code' ) .innerHTML = '<pre><code>' + getHtmlEncoded ( function0 ) + '</code></pre>';
    };
    ns.outputCode = outputCode; // Expose code outputter.

  } // End of browser-specific block.

  // Retrieves input lines, handling both browser and Node.js environments.
  var getInput = function ( ) {
    var inputLines = [ ]; // Array to store input lines.

    if ( isBrowser ( ) ) {
      // In browser, reads from an HTML element.
      var html = document.getElementById ( 'input' ) .innerHTML;
      inputLines = html.split ( '<br>' );
      for ( var i = 0 ; i < inputLines.length ; i++ ) {
        inputLines [ i ] = inputLines [ i ] .trim ( ); // Trim whitespace.
      }
    }

    if ( isNodejs ( ) ) {
      // In Node.js, reads from standard input.
      inputLines = require ( 'fs' ) .readFileSync ( '/dev/stdin' , 'utf8' ) .trim ( ) .split ( '\n' );
    }

    return inputLines;
  };
  ns.getInput = getInput; // Expose input getter.

  // Sets up a line reader to process input line by line.
  var setLineReader = function ( callback ) {
    if ( isBrowser ( ) ) {
      var lines = getInput ( ); // Get all lines at once.
      for ( var i = 0 ; i < lines.length ; i++ ) {
        callback ( lines [ i ] ); // Process each line.
      }
    }

    if ( isNodejs ( ) ) {
      // For Node.js, use 'readline' module for streaming input.
      var readStream = require ( 'fs' ) .ReadStream ( '/dev/stdin' );
      var readlineInterface = require ( 'readline' ) .createInterface ( { 'input' : readStream , 'output' : { } } );
      readlineInterface.on ( 'line' , function ( line ) {
        callback ( line ); // Callback for each line read.
      } );
    }
  };
  ns.setLineReader = setLineReader; // Expose line reader setup.

  // Outputs an array of lines to the appropriate output.
  var doOutput = function ( outputLines ) {
    if ( isBrowser ( ) ) {
      // In browser, updates an HTML element.
      document.getElementById ( 'output' ) .innerHTML = outputLines.map ( getHtmlEncoded ) .join ( '<br>\n' );
    }

    if ( isNodejs ( ) ) {
      // In Node.js, prints to console.
      for ( var i = 0 ; i < outputLines.length ; i++ ) {
        console.log ( outputLines [ i ] );
      }
    }
  };
  ns.doOutput = doOutput; // Expose bulk output function.

  var outputLines = [ ]; // Buffer for browser output lines.

  // Outputs a single line, accumulating in browser or printing immediately in Node.js.
  var doOutputLine = function ( outputLine ) {
    if ( isBrowser ( ) ) {
      outputLines.push ( outputLine ); // Add to buffer.
      document.getElementById ( 'output' ) .innerHTML = outputLines.map ( getHtmlEncoded ) .join ( '<br>\n' ); // Update display.
    }

    if ( isNodejs ( ) ) {
      console.log ( outputLine ); // Print directly.
    }
  };
  ns.doOutputLine = doOutputLine; // Expose single line output.

  // Sets up the main function to run, handling browser onload or direct execution in Node.js.
  var doMain = function ( main ) {
    if ( isBrowser ( ) ) {
      window.onload = function ( ) { // Execute on page load.
        outputCode ( main ); // Display the main function's code.
        main ( ); // Run the main logic.
      };
    }

    if ( isNodejs ( ) ) {
      main ( ); // Just run main directly.
    }
  };
  ns.doMain = doMain; // Expose main function runner.

} ) ( AOJ ); // Pass AOJ as the namespace.

// --- Main application logic starts here ---
var main = function ( ) {
  // Define game field boundaries.
  var fieldX = 0;
  var fieldY = 0;
  var fieldWidth = 10;
  var fieldHeight = 10;

  // Phyonkichi's possible moves (Knight-like moves).
  var phyonkichiMoves = [
    [ -1 , -2 ] , [ 0 , -2 ] , [ 1 , -2 ] ,
    [ -2 , -1 ] , [ 2 , -1 ] ,
    [ -2 , 0 ] , [ 2 , 0 ] ,
    [ -2 , 1 ] , [ 2 , 1 ] ,
    [ -1 , 2 ] , [ 0 , 2 ] , [ 1 , 2 ]
  ];

  // Sprinkler's wet area (3x3 grid centered on sprinkler).
  var splinklerMoves = [
    [ -1 , -1 ] , [ 0 , -1 ] , [ 1 , -1 ] ,
    [ -1 , 0 ] , [ 0 , 0 ] , [ 1 , 0 ] ,
    [ -1 , 1 ] , [ 0 , 1 ] , [ 1 , 1 ]
  ];

  // Checks if a given (x, y) coordinate is within the defined field boundaries.
  var isLocationInField = function ( x , y ) {
    if ( fieldX <= x && x < fieldWidth ) { // Check X-coordinate.
      if ( fieldY <= y && y < fieldHeight ) { // Check Y-coordinate.
        return true; // Location is valid.
      } else {
        return false; // Y is out of bounds.
      }
    } else {
      return false; // X is out of bounds.
    }
  };

  // Calculates new locations based on a starting location and a set of moves.
  var getMovedLocations = function ( location , moves ) {
    var movedLocations = [ ]; // Array to store valid new locations.
    for ( var i = 0 ; i < moves.length ; i++ ) {
      var move = moves [ i ];
      var x = location [ 0 ] + move [ 0 ]; // Calculate new X.
      var y = location [ 1 ] + move [ 1 ]; // Calculate new Y.
      if ( isLocationInField ( x , y ) ) {
        movedLocations.push ( [ x , y ] ); // Add if within field.
      }
    }
    return movedLocations;
  };

  // Gets Phyonkichi's next possible locations.
  var getNextPhyonkichiLocations = function ( phyonkichiLocation ) {
    return getMovedLocations ( phyonkichiLocation , phyonkichiMoves );
  };

  // Gets locations that would be wet by a sprinkler.
  var getWetLocations = function ( splinklerLocation ) {
    return getMovedLocations ( splinklerLocation , splinklerMoves );
  };

  var cache; // Cache for memoization in canSurvive.
  var stack; // Stack to track Phyonkichi's path (for debugging/path reconstruction).
  var callCount; // Counter for recursive calls.

  // Recursive function to determine if Phyonkichi can survive all sprinklers.
  var canSurvive = function ( phyonkichiLocation , splinklerLocations ) {
    callCount++; // Increment call counter.

    // Create a unique key for caching based on remaining sprinklers and Phyonkichi's current position.
    var cacheKey = splinklerLocations.length + ', ' + phyonkichiLocation [ 0 ] + ', ' + phyonkichiLocation [ 1 ];
    if ( cacheKey in cache ) {
      return cache [ cacheKey ]; // Return cached result if available.
    }

    stack.push ( phyonkichiLocation ); // Add current location to stack.

    if ( splinklerLocations.length <= 0 ) {
      // console.log ( 'Stack: ' + JSON.stringify ( stack ) ); // Debugging line.
      return true; // No more sprinklers, Phyonkichi survived!
    }

    var splinklerLocation = splinklerLocations [ 0 ]; // Current sprinkler to consider.
    var nextPhyonkichiLocations = getNextPhyonkichiLocations ( phyonkichiLocation ); // Phyonkichi's next moves.
    var wetLocations = getWetLocations ( splinklerLocation ); // Areas made wet by the current sprinkler.

    // Iterate through all possible next moves for Phyonkichi.
    for ( var i = 0 ; i < nextPhyonkichiLocations.length ; i++ ) {
      var nextPhyonkichiLocation = nextPhyonkichiLocations [ i ];

      // Check if the next Phyonkichi location is *not* wet by the current sprinkler.
      // This is the core logic: Phyonkichi must move to a *dry* spot.
      var isWet = false;
      for ( var j = 0 ; j < wetLocations.length ; j++ ) {
        var wetLocation = wetLocations [ j ];
        if ( nextPhyonkichiLocation [ 0 ] === wetLocation [ 0 ] &&
             nextPhyonkichiLocation [ 1 ] === wetLocation [ 1 ] ) {
          isWet = true;
          break; // This next location is wet, cannot survive here.
        }
      }

      // If the next Phyonkichi location is NOT wet, then Phyonkichi can potentially survive by moving there.
      if ( ! isWet ) {
          var nextSplinklerLocations = splinklerLocations.slice ( 1 ); // Remove current sprinkler.
          var can = canSurvive ( nextPhyonkichiLocation , nextSplinklerLocations ); // Recurse with remaining sprinklers.
          if ( can ) {
            cache [ cacheKey ] = true; // Cache success.
            stack.splice ( stack.length - 1 , 1 ); // Pop from stack (backtrack).
            return true; // Found a path to survive.
          }
      }
    }

    stack.splice ( stack.length - 1 , 1 ); // No path found from this location, pop from stack.
    cache [ cacheKey ] = false; // Cache failure.
    return false; // No path found to survive from this state.
  };

  // Enum-like object for input data types.
  var dataTypes = { };
  dataTypes.phyonkichiLocation = 0;
  dataTypes.numSprinklers = 1;
  dataTypes.splinklerLocations = 2;

  var input; // Object to store parsed input for each test case.
  var lineCount = 0; // Tracks current line number for input parsing.

  // Callback function to process each line of input.
  var handleLine = function ( line ) {
    var args = line.split ( ' ' ); // Split line by spaces.
    for ( var i = 0 ; i < args.length ; i++ ) {
      args [ i ] = parseFloat ( args [ i ] ); // Convert to numbers.
    }

    var dataType = lineCount % Object.keys ( dataTypes ) .length; // Determine input type based on line cycle.

    if ( dataType === dataTypes.phyonkichiLocation ) {
      // First line of a test case: Phyonkichi's starting position.
      input = { }; // Initialize input object.
      input.phyonkichi = { };
      input.splinklerLocations = [ ];
      input.phyonkichi.x = args [ 0 ];
      input.phyonkichi.y = args [ 1 ];
      if ( input.phyonkichi.x === 0 && input.phyonkichi.y === 0 ) {
        // console.log ( 'end' ); // Debugging: end of input signal.
      }
    } else if ( dataType === dataTypes.numSprinklers ) {
      // Second line: Number of sprinklers.
      input.numSprinklers = args [ 0 ];
    } else if ( dataType === dataTypes.splinklerLocations ) {
      // Third line: Sprinkler locations.
      for ( var i = 0 ; i < args.length ; i += 2 ) {
        input.splinklerLocations.push ( [ args [ i ] , args [ i + 1 ] ] );
      }

      // console.log ( JSON.stringify ( input ) ); // Debugging: show parsed input.

      // Reset cache and call count for each new test case.
      callCount = 0;
      cache = { };
      stack = [ ]; // Reset stack for new path.

      // Run the survival check.
      if ( canSurvive ( [ input.phyonkichi.x , input.phyonkichi.y ] , input.splinklerLocations ) ) {
        AOJ.doOutputLine ( 'OK' ); // Phyonkichi can survive.
      } else {
        AOJ.doOutputLine ( 'NA' ); // Phyonkichi cannot survive.
      }
      // console.log ( 'callCount: ' + callCount ); // Debugging: show number of recursive calls.
    } else {
      // This block is intentionally left empty; it handles potential future data types.
    }
    lineCount++; // Increment line counter for next input line.
  };

  AOJ.setLineReader ( handleLine ); // Start reading input lines using the defined handler.
};

// Execute the main function through AOJ's controlled environment.
AOJ.doMain ( main );