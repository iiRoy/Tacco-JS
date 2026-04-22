/*
// A previous attempt to fetch initial content from a server endpoint.
// This block is currently inactive but serves as a historical reference.
$.get( "/input-data/sample.txt" ,  function ( fileContent ) {
  $( document ).ready(  function  () {
    textEditorInstance.setValue(fileContent);
  });
});
*/

$( document ).ready( function ()
{
    // Configure the main layout for the application interface.
  $( '#mainLayoutDiv' ).layout(
    {
      livePaneResizing:  true ,
      stateManagement__enabled: true,
      enableCursorHotkey: false,
      east__size: 500,
      north__resizable: false,
      north__closable: false,
      north__paneClass: 'hiddenLayoutClass',
      north__resizerClass: 'hiddenLayoutClass',
      south__resizable: false,
      south__closable: false,
      south__paneClass: 'hiddenLayoutClass',
      south__resizerClass: 'hiddenLayoutClass'
    }
  );

  // Initialize the primary code editing component.
  textEditorInstance = CodeMirror.fromTextArea(
    document.getElementById("codeEditorArea"),
    {
      mode: "functionalLang",
      lineNumbers:  true ,
      matchBrackets: true,
      autofocus: true,
      autoClearEmptyLines: true,
      indentUnit: 2,
      gutters: ["editor-error-gutter-mark"],
      // Enable code folding functionality.
      onGutterClick: CodeMirror.newFoldFunction( CodeMirror.indentRangeFinder ),
      // Define custom keybindings for indentation.
      extraKeys: {
        "Tab": function ( codeMirrorInst ) {
          codeMirrorInst.replaceSelection( "    ", "end" );
        },
        "Shift-Tab": "indentLess"
      }
    }
  );

  // Set up an event listener to highlight the currently active line.
  textEditorInstance.on( "cursorActivity", function () {
    textEditorInstance.removeLineClass( currentActiveLine, "background", "editor-active-line-highlight" );
    currentActiveLine = textEditorInstance.addLineClass(
      textEditorInstance.getCursor().line,
      "background",
      "editor-active-line-highlight"
    );
  });

  // Trigger code processing whenever the editor content changes.
  textEditorInstance.on( "change", function ( editorInstance, changeMeta ) {
    deferProcessing();
  });

  // Initially highlight the first line of the editor.
  currentActiveLine = textEditorInstance.addLineClass(0, "background", "editor-active-line-highlight");

  // Attach a click handler to the clear button to reset editor content.
  $( '#resetCodeButton' ).click( function () {
    textEditorInstance.setValue('');
  });

  // Immediately initiate the code analysis process upon load.
  initiateCodeAnalysis();
});

// Defines the delay in milliseconds before submitting code for analysis.
var processingDelayMs = 300;

// Reference to the CodeMirror editor instance.
var textEditorInstance = null;
// Stores the timeout ID for deferred processing.
var delayTimerRef = null;
// An array to keep track of line numbers with indicators.
var indicatedLineNumbers = [];
// An array to store CodeMirror marker objects for highlighted text.
var highlightedTextSegments = [];
// Stores the line handle of the currently highlighted line.
var currentActiveLine = 0;

// Regular expression to parse error messages from the compiler output.
var issuePattern = /^.*.idr:(\d+):(\d+):/gm;
// The character used to mark lines in the gutter.
var indicatorGlyph = '\u25cf';

// Flag indicating if the backend service has encountered a critical failure.
var backendServiceDown = false;

// Flag indicating if an API request is currently being processed.
var apiCallInProgress = false;

// Flag indicating if a new request should be sent once the current one completes.
var subsequentCallPending = false;


// Schedules a delayed submission of the editor's content for analysis.
function deferProcessing() {
  if ( backendServiceDown ) {
    return;
  }
  if ( delayTimerRef ) {
    window.clearTimeout( delayTimerRef );
  }
  delayTimerRef = window.setTimeout( initiateCodeAnalysis, processingDelayMs );
}

// Submits the current code to the server for analysis.
function initiateCodeAnalysis() {
  if ( apiCallInProgress ) {
    // Prevent multiple concurrent requests; queue this one.
    subsequentCallPending = true;
    return;
  }
  $.ajax(
    {
      type: 'POST',
      url: '/code-processor/input.js',
      data: textEditorInstance.getValue(),
      contentType: "text/x-javascript; charset=utf-8",
      success: handleAnalysisOutcome,
      dataType: 'text'
    }
  );
  apiCallInProgress = true;
}

// Callback function to handle the results received from the server.
function handleAnalysisOutcome( serverData, statusText, xhrObject ) {
  console.log( "analysis complete" );
  console.log( serverData );
  console.log( statusText );
  console.log( xhrObject );
  apiCallInProgress = false;
  annotateIssues( serverData || '' );
  // Previously, an error class might have been added.
  // $( '#outputDisplay' ).addClass( 'error' ).html( serverData );
  $( '#outputDisplay' ).html( serverData );
  /*
  // Detailed error handling logic, currently commented out.
  if ( serverData.hasOwnProperty('error') ) {
    $( '#outputDisplay' ).addClass( 'error' ).text( serverData.error );
  } else if ( serverData.hasOwnProperty('failure') ) {
    $( '#outputDisplay' ).addClass( 'error' ).text( serverData.failure );
    backendServiceDown = true;
  } else {
    $( '#outputDisplay' ).removeClass( 'error' ).text( serverData.result );
  }
  */

  if ( subsequentCallPending ) {
    subsequentCallPending = false;
    deferProcessing();
  }
}

// Parses the error output and places visual indicators in the editor.
function annotateIssues( diagnosticOutput ) {
  console.log( "marking diagnostic info" );
  console.log( diagnosticOutput );
  // Note: Future improvement could be to update existing markers instead of clearing all.
  removeIndicators();
  let currentMatch;
  while ( currentMatch = issuePattern.exec( diagnosticOutput ) ) {
    // CodeMirror uses zero-based indexing for lines.
    var position = { line: parseInt( currentMatch[1], 10 ) - 1, char: parseInt( currentMatch[2], 10 ) };
    placeLineIndicator( position.line );
    highlightSegment( position );
  }
}

// Adds a marker to the gutter of a specific line number.
function placeLineIndicator( lineNumber ) {
  indicatedLineNumbers.push( lineNumber );
  console.log( "setting gutter marker" );
  console.log( lineNumber );
  console.log( indicatorGlyph );
  textEditorInstance.setGutterMarker(
    lineNumber,
    "editor-error-gutter-mark",
    $( "<span class='editor-error-gutter-mark'>" + indicatorGlyph + "</span>" )[0]
  );
  // Alternative method using document.createTextNode, commented out.
  // textEditorInstance.setGutterMarker( lineNumber, "typecheck-error", document.createTextNode( indicatorGlyph ) );
}

// Clears all existing line and token indicators from the editor.
function removeIndicators() {
  $.each(
    indicatedLineNumbers,
    function ( index, lineNum ) {
      textEditorInstance.clearGutter( "editor-error-gutter-mark" );
    }
  );
  indicatedLineNumbers = [];

  $.each(
    highlightedTextSegments,
    function ( index, textMarker ) {
      textMarker.clear();
    }
  );
  highlightedTextSegments = [];
}

// Highlights a specific token based on its position within a line.
function highlightSegment( charPosition ) {
  var tokenDetails = textEditorInstance.getTokenAt( charPosition );
  var segmentMarker = textEditorInstance.markText(
      { line: charPosition.line, ch: tokenDetails.start },
      { line: charPosition.line, ch: tokenDetails.end },
      { className: "editor-error-text-highlight" }
  );
  highlightedTextSegments.push( segmentMarker );
}

// Utility function to create a DOM element with a specified class and content.
function createStyledElement( elementType, cssClass, elementContent ) {
  var newElement = document.createElement( elementType );
  newElement.className = cssClass;
  newElement.textContent = elementContent;
  // newElement.appendChild( document.createTextNode( elementContent ) ); // Alternative way to add text content.
  return newElement;
}