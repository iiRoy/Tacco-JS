/*
 *  Core module for processing input data streams.
 *  This module provides methods to parse text content line by line or token by token.
 */
var INPUT_PROCESSOR = ( function ( ) {

  /**
   *  Creates a new instance of the LineByLineReader.
   *  @param {string} sourceContentString - The entire input text content.
   *  @returns {LineByLineReader} An initialized reader object.
   */
  function createInputReader( sourceContentString ) {
    return new LineByLineReader( sourceContentString ) ;
  }

  /**
   *  Constructor for the LineByLineReader.
   *  It prepares the input string by splitting it into individual lines.
   *  @param {string} sourceContentString - The raw string content to be parsed.
   */
  function LineByLineReader( sourceContentString ) {
    // Store the processed lines. Each line is trimmed and then split.
    this._textLines = sourceContentString . trim ( ) . split ( "\n" ) ;
    // Initialize the pointer for the current line being read.
    this._currentLinePointer = 0 ;
  }

  /**
   *  Prototype methods for LineByLineReader.
   */
  LineByLineReader.prototype.fetchNextValue = function ( returnAsString ) {
    var currentLineArray = this._textLines ,
      lineCursor = this._currentLinePointer ,
      extractedSegment ;

    // If the current line hasn't been processed into tokens yet (it's still a single string),
    // convert it into an array of tokens by splitting by space and reversing.
    // Reversing allows efficient popping from the end.
    if ( typeof currentLineArray[lineCursor] === "string" ) {
      currentLineArray[lineCursor] = currentLineArray[lineCursor] . split ( " " ) . reverse ( ) ;
    }

    // Extract the last token from the current line's array.
    extractedSegment = currentLineArray[lineCursor] . pop ( ) ;

    // If the current line is now empty after popping, advance to the next line.
    if ( ! currentLineArray[lineCursor] . length ) {
      this._currentLinePointer ++ ;
    }

    // Return the segment. If 'returnAsString' flag is true, return as string,
    // otherwise attempt to convert to a number.
    return returnAsString ? extractedSegment : + extractedSegment ;
  };

  LineByLineReader.prototype.obtainLineValues = function ( returnAsString ) {
    // Retrieve the current line, split it by spaces, and then advance the line pointer.
    var lineTokens = this._textLines[ this._currentLinePointer ++ ] . split ( " " ) ;

    // Depending on the flag, return tokens as strings or convert them to numbers.
    return returnAsString ? lineTokens : lineTokens . map ( elementX => + elementX ) ;
  };

  LineByLineReader.prototype.extractMatrix = function ( numberOfSegments , returnAsString ) {
    // Slice 'numberOfSegments' lines from the current position, then advance the pointer.
    // Each sliced line is then split into tokens.
    var resultCollection = this._textLines . slice ( this._currentLinePointer , this._currentLinePointer += numberOfSegments ) . map ( elementX => elementX . split ( " " ) ) ;

    // If 'returnAsString' is true, return the matrix of string tokens.
    // Otherwise, map each token in the matrix to its numeric equivalent.
    return returnAsString ? resultCollection : resultCollection . map ( elementX => elementX . map ( elementY => + elementY ) ) ;
  };

  LineByLineReader.prototype.retrieveRows = function ( numberOfSegments , returnAsString ) {
    // Slice 'numberOfSegments' lines from the current position and advance the pointer.
    var resultCollection = this._textLines . slice ( this._currentLinePointer , this._currentLinePointer += numberOfSegments ) ;

    // If 'returnAsString' is true, return the array of string rows.
    // Otherwise, map each row to its numeric equivalent (assuming single number per row).
    return returnAsString ? resultCollection : resultCollection . map ( elementX => + elementX ) ;
  };

  // The factory function is returned, allowing external code to create reader instances.
  return createInputReader ;

} ) ( ) ;

// Alias 'require' for module loading to a new identifier as per cloning rules.
var importModule = require ;
// Alias 'console' for output operations.
var outputStream = console ;
// Alias 'eval' for dynamic code execution.
var executeCodeString = eval ;

// Obtain the filesystem module using the aliased 'require'.
var filesystemModule = importModule ( "fs" ) ;

// Initialize a data handler by reading content from standard input using aliased functions.
var dataHandler = INPUT_PROCESSOR ( filesystemModule . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


/*
 *  Utility function to construct a multi-dimensional array.
 *  This function dynamically generates code to create arrays of specified dimensions and fills them.
 *  @param {any} fillValue - The value to initialize array elements with.
 *  @returns {Array} A new multi-dimensional array.
 */
function buildMultiDimensionalArray ( fillValue ) {
  var argumentList = arguments ,
    dimCount = argumentList . length ,
    arrayDefinitionString = "Array(argumentList[" + --dimCount + "]).fill(fillValue)" ;

  // Loop to build the nested array creation string.
  while ( --dimCount ) {
    arrayDefinitionString = "Array(argumentList[" + dimCount + "]).fill(0).map(ignoredItem =>" + arrayDefinitionString + ")" ;
  }
  // Execute the generated string to create the array using the aliased 'eval'.
  return executeCodeString ( arrayDefinitionString ) ;
}


// Invoke the main processing function and display its result using the aliased 'console.log'.
outputStream . log ( calculateMaxConcurrentEvents ( ) ) ;


/**
 *  Main function to calculate the maximum number of concurrent events.
 *  Reads event data, processes it by channel, and determines the peak concurrency.
 *  @returns {number} The maximum number of events happening simultaneously.
 */
function calculateMaxConcurrentEvents ( ) {
  // Read the total number of events.
  var eventCount = dataHandler . fetchNextValue ( ) ;
  // Read the total number of distinct channels.
  var channelCount = dataHandler . fetchNextValue ( ) ;

  // Initialize an array of arrays to store events per channel.
  // Each inner array will hold [start_time, end_time] pairs for events in that channel.
  var channelEventList = Array ( channelCount ) . fill ( 0 ) . map ( elementX => [ ] ) ;

  // Variable to keep track of the latest end time across all events.
  var maximumEndTime = 0 ;

  // Loop through each event to populate channel schedules and find the global maximum end time.
  for ( var loopCounter = 0 ; loopCounter < eventCount ; loopCounter ++ ) {
    // Read event details: [start_time, end_time, channel_id].
    var currentEventDetails = dataHandler . obtainLineValues ( ) ;
    // Add the event's start and end times to its respective channel list.
    // Adjust channel_id (0-indexed).
    channelEventList[ currentEventDetails[2] - 1 ] . push ( [ currentEventDetails[0] , currentEventDetails[1] ] ) ;
    // Update maximum end time if this event extends further.
    if ( maximumEndTime < currentEventDetails[1] ) {
      maximumEndTime = currentEventDetails[1] ;
    }
  }

  // Prepare arrays to hold all individual event start and end points.
  var eventStartPoints = [ ] ,
    eventEndPoints = [ ] ;

  // Process each channel's events to merge overlapping intervals.
  for ( loopCounter = 0 ; loopCounter < channelCount ; loopCounter ++ ) {
    // Sort events within each channel by their start times.
    channelEventList[loopCounter] . sort ( ( elementX , elementY ) => elementX[0] - elementY[0] ) ;
    var currentChannelLength = channelEventList[loopCounter] . length ;

    // Iterate through sorted events for the current channel to merge overlaps.
    for ( var innerLoopCounter = 0 ; innerLoopCounter < currentChannelLength ; innerLoopCounter ++ ) {
      // Record the effective start point of the current (potentially merged) interval.
      eventStartPoints . push ( channelEventList[loopCounter][innerLoopCounter][0] - 1 ) ; // Adjust start time for point-based counting

      // Merge intervals: while the next event overlaps or is contiguous with the current one,
      // extend the current interval's end point.
      while ( innerLoopCounter + 1 < currentChannelLength &&
              channelEventList[loopCounter][innerLoopCounter][1] + 1 >= channelEventList[loopCounter][innerLoopCounter+1][0] ) {
        innerLoopCounter ++ ;
      }
      // Record the effective end point of the current (merged) interval.
      eventEndPoints . push ( channelEventList[loopCounter][innerLoopCounter][1] ) ;
    }
  }

  // Sort all collected start points and end points globally.
  eventStartPoints . sort ( ( elementX , elementY ) => elementX - elementY ) ;
  eventEndPoints . sort ( ( elementX , elementY ) => elementX - elementY ) ;

  // Pointers for iterating through sorted start and end times.
  var startPointer = 0 ,
    endPointer = 0 ;
  // Variables to store the maximum concurrency found and the current active event count.
  var peakConcurrency = 0 ,
    activeEventsNow = 0 ;

  // Iterate through time points from 0 up to the maximum end time.
  // This uses a sweep-line algorithm to count active events.
  for ( timeIndex = 0 ; timeIndex <= maximumEndTime ; timeIndex ++ ) {
    // At each time point, decrement active count for events that just ended.
    while ( eventEndPoints[endPointer] === timeIndex ) {
      activeEventsNow -- ;
      endPointer ++ ;
    }
    // At each time point, increment active count for events that just started.
    while ( eventStartPoints[startPointer] === timeIndex ) {
      activeEventsNow ++ ;
      startPointer ++ ;
    }
    // Update the peak concurrency if the current active count is higher.
    if ( peakConcurrency < activeEventsNow ) {
      peakConcurrency = activeEventsNow ;
    }
  }

  // Return the maximum number of concurrent events.
  return peakConcurrency ;
}