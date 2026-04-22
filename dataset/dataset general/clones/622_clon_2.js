/*
     Replicated Source 2012 by Igor Vaynberg

     Variant: 3.1 Datestamp: Tue Aug 14 09:05:17 PDT 2012

     Permitted under the Apache License, Version 2.0 (the "License"); you may not utilize this work except in
     accordance with the License. You may acquire a copy of the License in the LICENSE file, or at:

     http://www.apache.org/licenses/LICENSE-2.0

     Unless mandated by applicable law or agreed to in writing, software distributed under the License is
     distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     Refer to the License for the specific language governing permissions and limitations under the License.
*/
 ( function ( $j )
 {
  if ( typeof $j.fn.each2 === "undefined" )
  {
   $j.fn.extend (
   {
    /*
     * 4-10 times quicker .each alternative
     * employ it judiciously, as it overrides jQuery context of element on each traversal
    */
    each2 : function ( callbackFunc )
    {
     var singleItem = $j ( [ 0 ] ),
         idx = -1,
         listLength = this.length;
     while
     (
      ++idx < listLength
      && ( singleItem.context = singleItem [ 0 ] = this [ idx ] )
      && callbackFunc.call ( singleItem [ 0 ], idx, singleItem ) !== false //"this"=DOM, i=index, j=jQuery object
     );
     return this;
    }
   } );
  }
 } ) ( jQuery );

 ( function ( $j, undefinedType )
 {
  "use strict";
  /*global document, window, jQuery, console */

  if ( window.Select2 !== undefinedType )
  {
   return;
  }

  var CONTROL_KEYS,
      BaseSelectionWidget,
      SingleSelectionWidget,
      MultipleSelectionWidget,
      nextIdentifierGenerator,
      textMeasurer;

  CONTROL_KEYS =
  {
   TAB_KEY: 9,
   ENTER_KEY: 13,
   ESCAPE_KEY: 27,
   SPACE_KEY: 32,
   LEFT_ARROW: 37,
   UP_ARROW: 38,
   RIGHT_ARROW: 39,
   DOWN_ARROW: 40,
   SHIFT_KEY: 16,
   CONTROL_KEY: 17,
   ALT_KEY: 18,
   PAGE_UP_KEY: 33,
   PAGE_DOWN_KEY: 34,
   HOME_KEY: 36,
   END_KEY: 35,
   BACKSPACE_KEY: 8,
   DELETE_KEY: 46,
   isArrowKey: function ( keyCodeVal )
   {
    keyCodeVal = keyCodeVal.which ? keyCodeVal.which : keyCodeVal;
    switch ( keyCodeVal )
    {
    case CONTROL_KEYS.LEFT_ARROW:
    case CONTROL_KEYS.RIGHT_ARROW:
    case CONTROL_KEYS.UP_ARROW:
    case CONTROL_KEYS.DOWN_ARROW:
     return true;
    }
    return false;
   },
   isModifierKey: function ( eventObject )
   {
    var keyCodeVal = eventObject.which;
    switch ( keyCodeVal )
    {
    case CONTROL_KEYS.SHIFT_KEY:
    case CONTROL_KEYS.CONTROL_KEY:
    case CONTROL_KEYS.ALT_KEY:
     return true;
    }

    if ( eventObject.metaKey ) return true;

    return false;
   },
   isFunctionKey: function ( keyCodeVal )
   {
    keyCodeVal = keyCodeVal.which ? keyCodeVal.which : keyCodeVal;
    return keyCodeVal >= 112 && keyCodeVal <= 123;
   }
  };

  nextIdentifierGenerator = ( function ( )
  {
   var count = 1;
   return function ( )
   {
    return count++;
   };
  } ( ) );

  function sanitizeMarkup ( inputString )
  {
   if ( inputString && typeof ( inputString ) === "string" )
   {
    return inputString.replace ( /&/g, "&amp;" );
   }
   else
   {
    return inputString;
   }
  }

  function findIndexOfElement ( targetValue, targetArray )
  {
   var loopIndex = 0,
       arrayLength = targetArray.length,
       currentArrayValue;

   if ( typeof targetValue === "undefinedType" )
   {
    return -1;
   }

   if ( targetValue.constructor === String )
   {
    for ( ; loopIndex < arrayLength; loopIndex = loopIndex + 1 )
    {
     if ( targetValue.localeCompare ( targetArray [ loopIndex ] ) === 0 ) return loopIndex;
    }
   }
   else
   {
    for ( ; loopIndex < arrayLength; loopIndex = loopIndex + 1 )
    {
     currentArrayValue = targetArray [ loopIndex ];
     if ( currentArrayValue.constructor === String )
     {
      if ( currentArrayValue.localeCompare ( targetValue ) === 0 ) return loopIndex;
     }
     else
     {
      if ( currentArrayValue === targetValue ) return loopIndex;
     }
    }
   }
   return -1;
  }

  /**
   * Compares equality of valueA and valueB taking into account that valueA and valueB may be strings, in which case localeCompare is used
   * @param valueA
   * @param valueB
   */
  function areEqual ( valueA, valueB )
  {
   if ( valueA === valueB ) return true;
   if ( valueA === undefinedType || valueB === undefinedType ) return false;
   if ( valueA === null || valueB === null ) return false;
   if ( valueA.constructor === String ) return valueA.localeCompare ( valueB ) === 0;
   if ( valueB.constructor === String ) return valueB.localeCompare ( valueA ) === 0;
   return false;
  }

  /**
   * Splits the string into an array of values, trimming each value. An empty array is returned for nulls or empty
   * strings
   * @param inputString
   * @param delimiter
   */
  function splitStringIntoValues ( inputString, delimiter )
  {
   var splitResult,
       loopIndex,
       resultLength;
   if ( inputString === null || inputString.length < 1 ) return [ ];
   splitResult = inputString.split ( delimiter );
   for ( loopIndex = 0, resultLength = splitResult.length; loopIndex < resultLength; loopIndex = loopIndex + 1 )
   {
    splitResult [ loopIndex ] = $j.trim ( splitResult [ loopIndex ] );
   }
   return splitResult;
  }

  function getElementPaddingWidth ( targetElement )
  {
   return targetElement.outerWidth ( ) - targetElement.width ( );
  }

  function attachKeyUpChangeMonitoring ( targetElement )
  {
   var dataKey = "keyup-change-data";
   targetElement.bind ( "keydown", function ( )
   {
    if ( $j.data ( targetElement, dataKey ) === undefinedType )
    {
     $j.data ( targetElement, dataKey, targetElement.val ( ) );
    }
   } );
   targetElement.bind ( "keyup", function ( )
   {
    var currentVal = $j.data ( targetElement, dataKey );
    if ( currentVal !== undefinedType && targetElement.val ( ) !== currentVal )
    {
     $j.removeData ( targetElement, dataKey );
     targetElement.trigger ( "keyup-change" );
    }
   } );
  }

  $j ( document ).delegate ( "*", "mousemove", function ( mouseEvent )
  {
   $j.data ( document, "selection-last-coords", { x: mouseEvent.pageX, y: mouseEvent.pageY } );
  } );

  /**
   * filters mouse events so an event is fired only if the mouse moved.
   *
   * filters out mouse events that occur when mouse is stationary but
   * the elements under the pointer are scrolled.
   */
  function attachFilteredMouseMove ( targetElement )
  {
   targetElement.bind ( "mousemove", function ( mouseEvent )
   {
    var lastPosition = $j.data ( document, "selection-last-coords" );
    if ( lastPosition === undefinedType || lastPosition.x !== mouseEvent.pageX || lastPosition.y !== mouseEvent.pageY )
    {
     $j ( mouseEvent.target ).trigger ( "mousemove-filtered", mouseEvent );
    }
   } );
  }

  /**
   * Delays a function's execution. Returns a function that calls the original targetFunction only if no invocations have been made
   * within the last delayMilliseconds milliseconds.
   *
   * @param delayMilliseconds number of milliseconds to wait before invoking targetFunction
   * @param targetFunction function to be delayed
   * @return delayed version of targetFunction
   */
  function delayFunction ( delayMilliseconds, targetFunction )
  {
   var timer;
   return function ( )
   {
    window.clearTimeout ( timer );
    timer = window.setTimeout ( targetFunction, delayMilliseconds );
   };
  }

  /**
   * A basic implementation of a thunk
   * @param computationFunction function used to lazily initialize the thunk
   * @return {Function}
   */
  function createThunk ( computationFunction )
  {
   var isEvaluated = false,
       storedValue;
   return function ( )
   {
    if ( isEvaluated === false ) { storedValue = computationFunction ( ); isEvaluated = true; }
    return storedValue;
   };
  }

  function attachDelayedScroll ( thresholdValue, targetElement )
  {
   var notifier = delayFunction ( thresholdValue, function ( eventObject ) { targetElement.trigger ( "scroll-delayed", eventObject ); } );
   targetElement.bind ( "scroll", function ( eventObject )
   {
    if ( findIndexOfElement ( eventObject.target, targetElement.get ( ) ) >= 0 ) notifier ( eventObject );
   } );
  }

  function preventEventPropagation ( eventObject )
  {
   eventObject.preventDefault ( );
   eventObject.stopPropagation ( );
  }

  function calculateTextDisplayWidth ( targetElement )
  {
   if ( !textMeasurer )
   {
    var elementStyle = targetElement [ 0 ].currentStyle || window.getComputedStyle ( targetElement [ 0 ], null );
    textMeasurer = $j ( "<div></div>" ).css (
    {
     position: "absolute",
     left: "-10000px",
     top: "-10000px",
     display: "none",
     fontSize: elementStyle.fontSize,
     fontFamily: elementStyle.fontFamily,
     fontStyle: elementStyle.fontStyle,
     fontWeight: elementStyle.fontWeight,
     letterSpacing: elementStyle.letterSpacing,
     textTransform: elementStyle.textTransform,
     whiteSpace: "nowrap"
    } );
    $j ( "body" ).append ( textMeasurer );
   }
   textMeasurer.text ( targetElement.val ( ) );
   return textMeasurer.width ( );
  }

  function highlightMatchingText ( fullText, searchCriterion, outputArray )
  {
   var matchPosition = fullText.toUpperCase ( ).indexOf ( searchCriterion.toUpperCase ( ) ),
       criterionLength = searchCriterion.length;

   if ( matchPosition < 0 )
   {
    outputArray.push ( fullText );
    return;
   }

   outputArray.push ( fullText.substring ( 0, matchPosition ) );
   outputArray.push ( "<span class='select2-match'>" );
   outputArray.push ( fullText.substring ( matchPosition, matchPosition + criterionLength ) );
   outputArray.push ( "</span>" );
   outputArray.push ( fullText.substring ( matchPosition + criterionLength, fullText.length ) );
  }

  /**
   * Generates an ajax-based query function
   *
   * @param configOptions object containing configuration paramters
   * @param configOptions.transport function that will be used to execute the ajax request. must be compatible with parameters supported by $j.ajax
   * @param configOptions.url url for the data
   * @param configOptions.data a function(searchQuery, pageNumber, context) that should return an object containing query string parameters for the above url.
   * @param configOptions.dataType request data type: ajax, jsonp, other datatypes supported by jQuery's $j.ajax function or the transport function if specified
   * @param configOptions.traditional a boolean flag that should be true if you wish to use the traditional style of param serialization for the ajax request
   * @param configOptions.quietMilliseconds (optional) milliseconds to wait before making the ajaxRequest, helps delay the ajax function if invoked too often
   * @param configOptions.results a function(remoteData, pageNumber) that converts data returned form the remote request to the format expected by Select2.
   *      The expected format is an object containing the following keys:
   *      results array of objects that will be used as choices
   *      more (optional) boolean indicating whether there are more results available
   *      Example: {results:[{id:1, text:'Red'},{id:2, text:'Blue'}], more:true}
   */
  function createAjaxQueryFunction ( configOptions )
  {
   var requestTimeoutId, // current scheduled but not yet executed request
       requestSequenceCounter = 0, // sequence used to drop out-of-order responses
       currentRequestHandler = null,
       quietMilliseconds = configOptions.quietMillis || 100;

   return function ( queryDetails )
   {
    window.clearTimeout ( requestTimeoutId );
    requestTimeoutId = window.setTimeout ( function ( )
    {
     requestSequenceCounter += 1; // increment the sequence
     var currentRequestNumber = requestSequenceCounter, // this request's sequence number
         requestDataFunction = configOptions.data, // ajax data function
         requestTransport = configOptions.transport || $j.ajax,
         isTraditional = configOptions.traditional || false,
         requestMethodType = configOptions.type || 'GET'; // set type of request (GET or POST)

     requestDataFunction = requestDataFunction.call ( this, queryDetails.term, queryDetails.page, queryDetails.context );

     if ( null !== currentRequestHandler ) { currentRequestHandler.abort ( ); }

     currentRequestHandler = requestTransport.call ( null,
     {
      url: configOptions.url,
      dataType: configOptions.dataType,
      data: requestDataFunction,
      type: requestMethodType,
      traditional: isTraditional,
      success: function ( responseData )
      {
       if ( currentRequestNumber < requestSequenceCounter )
       {
        return;
       }
       // TODO 3.0 - replace queryDetails.page with queryDetails so users have access to term, page, etc.
       var processedResults = configOptions.results ( responseData, queryDetails.page );
       queryDetails.callback ( processedResults );
      }
     } );
    }, quietMilliseconds );
   };
  }

  /**
   * Generates a query function that operates with a local array
   *
   * @param configOptions object containing configuration parameters. The options parameter can either be an array or an
   * object.
   *
   * If the array form is used it is assumed that it contains objects with 'id' and 'text' keys.
   *
   * If the object form is used it is assumed that it contains 'data' and 'text' keys. The 'data' key should contain
   * an array of objects that will be used as choices. These objects must contain at least an 'id' key. The 'text'
   * key can either be a String in which case it is expected that each element in the 'data' array has a key with the
   * value of 'text' which will be used to match choices. Alternatively, text can be a function(item) that can extract
   * the text.
   */
  function createLocalQueryFunction ( configOptions )
  {
   var dataSource = configOptions, // data elements
       dataTextKey,
       getTextFunction = function ( itemEntry ) { return "" + itemEntry.text; }; // function used to retrieve the text portion of a data item that is matched against the search

   if ( !$j.isArray ( dataSource ) )
   {
    getTextFunction = dataSource.text;
    // if text is not a function we assume it to be a key name
    if ( !$j.isFunction ( getTextFunction ) )
    {
     dataTextKey = dataSource.text; // we need to store this in a separate variable because in the next step data gets reset and dataSource.text is no longer available
     getTextFunction = function ( itemEntry ) { return itemEntry [ dataTextKey ]; };
    }
    dataSource = dataSource.results;
   }

   return function ( queryDetails )
   {
    var searchTerm = queryDetails.term,
        filteredData = { };
    if ( searchTerm === "" )
    {
     queryDetails.callback ( { results: dataSource } );
     return;
    }
    filteredData.results = $j ( dataSource )
     .filter ( function ( ) { return queryDetails.matcher ( searchTerm, getTextFunction ( this ) ); } )
     .get ( );
    queryDetails.callback ( filteredData );
   };
  }

  // TODO javadoc
  function createTagQueryFunction ( tagData )
  {
   // TODO even for a function we should probably return a wrapper that does the same object/string check as
   // the function for arrays. otherwise only functions that return objects are supported.
   if ( $j.isFunction ( tagData ) )
   {
    return tagData;
   }

   // if not a function we assume it to be an array

   return function ( queryDetails )
   {
    var searchTerm = queryDetails.term,
        filteredTags = { results: [ ] };
    $j ( tagData ).each ( function ( )
    {
     var isObjectFormat = this.text !== undefinedType,
         itemText = isObjectFormat ? this.text : this;
     if ( searchTerm === "" || queryDetails.matcher ( searchTerm, itemText ) )
     {
      filteredTags.results.push ( isObjectFormat ? this : { id: this, text: this } );
     }
    } );
    queryDetails.callback ( filteredTags );
   };
  }

  /**
   * Verifies if the formatter function should be utilized.
   *
   * Throws an error if it is not a function. Returns true if it should be used,
   * false if no formatting should be performed.
   *
   * @param formatterFunc
   */
  function validateFormatter ( formatterFunc, functionName )
  {
   if ( $j.isFunction ( formatterFunc ) ) return true;
   if ( !formatterFunc ) return false;
   throw new Error ( functionName + " must be a function or a falsy value" );
  }

  function resolveValue ( inputVal )
  {
   return $j.isFunction ( inputVal ) ? inputVal ( ) : inputVal;
  }

  function tallyResults ( resultCollection )
  {
   var totalCount = 0;
   $j.each ( resultCollection, function ( index, currentItem )
   {
    if ( currentItem.children )
    {
     totalCount += tallyResults ( currentItem.children );
    }
    else
    {
     totalCount++;
    }
   } );
   return totalCount;
  }

  /**
   * Standard tokenizer. This function uses breaks the input on substring match of any string from the
   * options.tokenSeparators array and uses options.createSearchChoice to create the choice object. Both of those
   * two options have to be defined in order for the tokenizer to work.
   *
   * @param currentInput text user has typed so far or pasted into the search field
   * @param currentSelection currently selected choices
   * @param addChoiceCallback function(choice) callback tho add the choice to selection
   * @param tokenizerOptions select2's options
   * @return undefined/null to leave the current input unchanged, or a string to change the input to the returned value
   */
  function defaultInputTokenizer ( currentInput, currentSelection, addChoiceCallback, tokenizerOptions )
  {
   var originalInput = currentInput, // store the original so we can compare and know if we need to tell the search to update its text
       isDuplicate = false, // check for whether a token we extracted represents a duplicate selected choice
       processedToken, // token
       separatorIndex, // position at which the separator was found
       loopIndex,
       loopLength, // looping variables
       matchedSeparator; // the matched separator

   if ( !tokenizerOptions.createSearchChoice || !tokenizerOptions.tokenSeparators || tokenizerOptions.tokenSeparators.length < 1 ) return undefinedType;

   while ( true )
   {
    separatorIndex = -1;

    for ( loopIndex = 0, loopLength = tokenizerOptions.tokenSeparators.length; loopIndex < loopLength; loopIndex++ )
    {
     matchedSeparator = tokenizerOptions.tokenSeparators [ loopIndex ];
     separatorIndex = currentInput.indexOf ( matchedSeparator );
     if ( separatorIndex >= 0 ) break;
    }

    if ( separatorIndex < 0 ) break; // did not find any token separator in the input string, bail

    processedToken = currentInput.substring ( 0, separatorIndex );
    currentInput = currentInput.substring ( separatorIndex + matchedSeparator.length );

    if ( processedToken.length > 0 )
    {
     processedToken = tokenizerOptions.createSearchChoice ( processedToken, currentSelection );
     if ( processedToken !== undefinedType && processedToken !== null && tokenizerOptions.id ( processedToken ) !== undefinedType && tokenizerOptions.id ( processedToken ) !== null )
     {
      isDuplicate = false;
      for ( loopIndex = 0, loopLength = currentSelection.length; loopIndex < loopLength; loopIndex++ )
      {
       if ( areEqual ( tokenizerOptions.id ( processedToken ), tokenizerOptions.id ( currentSelection [ loopIndex ] ) ) )
       {
        isDuplicate = true; break;
       }
      }

      if ( !isDuplicate ) addChoiceCallback ( processedToken );
     }
    }
   }

   if ( originalInput.localeCompare ( currentInput ) !== 0 ) return currentInput;
  }

  /**
   * blurs any Select2 container that has focus when an element outside them was clicked or received focus
   *
   * also takes care of clicks on label tags that point to the source element
   */
  $j ( document ).ready ( function ( )
  {
   $j ( document ).delegate ( "*", "mousedown touchend", function ( eventObject )
   {
    var clickedTarget = $j ( eventObject.target ).closest ( "div.select2-container" ).get ( 0 ),
        labelAttribute;
    if ( clickedTarget )
    {
     $j ( document ).find ( "div.select2-container-active" ).each ( function ( )
     {
      if ( this !== clickedTarget ) $j ( this ).data ( "select2" ).blur ( );
     } );
    }
    else
    {
     clickedTarget = $j ( eventObject.target ).closest ( "div.select2-drop" ).get ( 0 );
     $j ( document ).find ( "div.select2-drop-active" ).each ( function ( )
     {
      if ( this !== clickedTarget ) $j ( this ).data ( "select2" ).blur ( );
     } );
    }

    clickedTarget = $j ( eventObject.target );
    labelAttribute = clickedTarget.attr ( "for" );
    if ( "LABEL" === eventObject.target.tagName && labelAttribute && labelAttribute.length > 0 )
    {
     clickedTarget = $j ( "#" + labelAttribute );
     clickedTarget = clickedTarget.data ( "select2" );
     if ( clickedTarget !== undefinedType ) { clickedTarget.focus ( ); eventObject.preventDefault ( ); }
    }
   } );
  } );