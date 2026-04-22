/*

   This is a Type I clone of the original JavaScript code.
   Only whitespace and comments have been altered.
   The functional logic and identifiers remain identical.

   Initial commented-out section from the original:
   $.get("/sources/Foo.idr", function(src) {
     $(document).ready(function () {
       EDITOR.setValue(src);
     });
   });

*/
$( document ).ready(
  function ( ) {

  // Initialize the layout for the container element
  $( '#container' ).layout(
    {
      livePaneResizing: true, // Enable live resizing of panes
      stateManagement__enabled: true, // Allow state management
      enableCursorHotkey: false, // Disable cursor hotkeys

      east__size: 500, // Set initial size for the east pane

      north__resizable: false, // Make north pane non-resizable
      north__closable: false, // Make north pane non-closable
      north__paneClass: 'nonexistentClass', // Assign a non-existent class to north pane
      north__resizerClass: 'nonexistentClass', // Assign a non-existent resizer class to north pane

      south__resizable: false, // Make south pane non-resizable
      south__closable: false, // Make south pane non-closable
      south__paneClass: 'nonexistentClass', // Assign a non-existent class to south pane
      south__resizerClass: 'nonexistentClass' // Assign a non-existent resizer class to south pane
    }
  );



  // Set up the CodeMirror editor instance
  EDITOR = CodeMirror.fromTextArea(
    document.getElementById( "hs" ),
    {
      mode: "haskell", // Set editor mode to Haskell
      lineNumbers: true, // Display line numbers
      matchBrackets: true, // Enable bracket matching
      autofocus: true, // Automatically focus the editor on load
      autoClearEmptyLines: true, // Automatically clear empty lines

      indentUnit: 2, // Set indentation unit to 2 spaces
      gutters: [ "CodeMirror-x-errorLine" ], // Add a gutter for error lines


      // Configuration for code folding
      onGutterClick: CodeMirror.newFoldFunction( CodeMirror.indentRangeFinder ),

      // Custom key bindings for indentation
      extraKeys: {
        "Tab": function ( cm ) { cm.replaceSelection( "    ", "end" ); }, // Replace Tab with 4 spaces
        "Shift-Tab": "indentLess" // Shift-Tab for outdenting
      }
    }
  );


  // Event listener to highlight the active line in the editor
  EDITOR.on(
    "cursorActivity",
    function ( ) {
      EDITOR.removeLineClass( HIGHLIGHTED_LINE, "background", "CodeMirror-x-activeLine" ); // Remove old highlight
      HIGHLIGHTED_LINE = EDITOR.addLineClass(
        EDITOR.getCursor( ).line,
        "background",
        "CodeMirror-x-activeLine"
      ); // Add new highlight
    }
  );

  // Event listener for changes in the editor content, schedules a submission
  EDITOR.on( "change", function ( edt, changeDescription ) { scheduleSubmission( ); } );



  // Initially highlight the first line
  HIGHLIGHTED_LINE = EDITOR.addLineClass( 0, "background", "CodeMirror-x-activeLine" );


  // Click handler for the clear button
  $( '#clearButton' ).click(
    function ( ) {
      EDITOR.setValue( '' ); // Clear editor content
    }
  );

  // Submit code immediately on page load
  submitCode( );
}
);

// Delay in milliseconds before submitting code after a change
var SUBMIT_DELAY = 300;

// Reference to the CodeMirror editor instance
var EDITOR = null;
// Timer for delayed submissions
var TIMER = null;
// Array to store line numbers with markers
var MARKED_LINES = [ ];
// Array to store text markers
var MARKED_TOKENS = [ ];
// Stores the line number of the currently highlighted line
var HIGHLIGHTED_LINE = 0;

// Regular expression to parse error messages from the compiler output
var ERROR_REGEXP = /^.*.idr:(\d+):(\d+):/gm;
// Character used for gutter markers
var MARKER_STRING = '\u25cf';

// Flag indicating if the server has reported a service failure
var SERVICE_FAILURE = false;

// Flag indicating if a request to the server is currently in progress
var REQUEST_PENDING = false;

// Flag indicating if a new request should be sent once the current one completes
var REQUEST_QUEUED = false;


/**
 * Schedules a submission of the editor content after a delay.
 * Clears any previously scheduled submissions.
 */
function scheduleSubmission( ) {

  if ( SERVICE_FAILURE ) {
    return;
  }

  if ( TIMER ) {
    window.clearTimeout( TIMER ); // Clear existing timer
  }

  TIMER = window.setTimeout( submitCode, SUBMIT_DELAY ); // Set new timer
}

/**
 * Submits the current code in the editor to the server for validation.
 * Prevents multiple simultaneous requests.
 */
function submitCode( ) {

  if ( REQUEST_PENDING ) {
    // Avoid multiple simultaneous active requests.
    REQUEST_QUEUED = true; // Queue the request
    return;
  }

  $.ajax(
    {
      type: 'POST', // HTTP method
      url: '/sources/Foo.idr', // Target URL
      data: EDITOR.getValue( ), // Editor content as data
      contentType: "text/x-haskell; charset=utf-8", // Content type header
      success: validationResultsHandler, // Callback on success
      dataType: 'text' // Expected data type from server
    }
  );

  REQUEST_PENDING = true; // Mark request as pending
}

/**
 * Handles the results received from the server after code submission.
 * Parses and displays errors, and manages request queue.
 * @param {string} data - The response data from the server.
 * @param {string} textStatus - The status of the request.
 * @param {jqXHR} jqXHR - The jQuery XMLHttpRequest object.
 */
function validationResultsHandler( data, textStatus, jqXHR ) {

  console.log( "foo" ); // Debugging log
  console.log( data ); // Log response data
  console.log( textStatus ); // Log text status
  console.log( jqXHR ); // Log jqXHR object

  REQUEST_PENDING = false; // Clear pending flag

  markErrors( data || '' ); // Mark errors based on response

  // Update the result display area
  $( '#result' ).html( data );

  /*
  // Original commented-out logic for handling different response types
  if ( data.hasOwnProperty( 'error' ) ) {
    $( '#result' ).addClass( 'error' ).text( data.error );
  } else if ( data.hasOwnProperty( 'failure' ) ) {
    $( '#result' ).addClass( 'error' ).text( data.failure );
    SERVICE_FAILURE = true;
  } else {
    $( '#result' ).removeClass( 'error' ).text( data.result );
  }
  */

  if ( REQUEST_QUEUED ) {
    REQUEST_QUEUED = false; // Clear queued flag
    scheduleSubmission( ); // Schedule the next submission
  }
}

/**
 * Parses an error trace and marks corresponding lines and tokens in the editor.
 * @param {string} errorTrace - The error message string from the compiler.
 */
function markErrors( errorTrace ) {

  console.log( "merkEruers" ); // Debugging log
  console.log( errorTrace ); // Log error trace

  // TODO: Implement logic to avoid re-adding existing markers more efficiently

  clearMarkers( ); // Clear all previous markers

  let match; // Declare match variable for regex iteration
  while ( ( match = ERROR_REGEXP.exec( errorTrace ) ) ) {
    // CodeMirror uses 0-based line numbering, so adjust.
    var pos = {
      line: parseInt( match[ 1 ], 10 ) - 1,
      ch: parseInt( match[ 2 ], 10 )
    };

    addLineMarker( pos.line ); // Add a marker to the gutter
    markToken( pos ); // Mark the specific token in the line
  }
}

/**
 * Adds a gutter marker to a specified line number in the editor.
 * @param {number} lineno - The 0-based line number to mark.
 */
function addLineMarker( lineno ) {

  MARKED_LINES.push( lineno ); // Store the line number

  console.log( "setting gutter" ); // Debugging log
  console.log( lineno ); // Log line number
  console.log( MARKER_STRING ); // Log marker string

  // Set the gutter marker using a jQuery-created span element
  EDITOR.setGutterMarker(
    lineno,
    "CodeMirror-x-errorLine",
    $( "<span class='CodeMirror-x-errorLine'>" + MARKER_STRING + "</span>" )[ 0 ]
  );
  // EDITOR.setGutterMarker(lineno, "typecheck-error", document.createTextNode(MARKER_STRING)); //, 'CodeMirror-x-errorLine');
}

/**
 * Clears all error markers (gutter markers and text markers) from the editor.
 */
function clearMarkers( ) {

  // Clear gutter markers
  $.each(
    MARKED_LINES,
    function ( idx, n ) {
      EDITOR.clearGutter( "CodeMirror-x-errorLine" );
    }
  );

  MARKED_LINES = [ ]; // Reset the array of marked lines

  // Clear text markers
  $.each(
    MARKED_TOKENS,
    function ( idx, marker ) {
      marker.clear( );
    }
  );

  MARKED_TOKENS = [ ]; // Reset the array of marked tokens
}

/**
 * Marks a specific token at a given position in the editor with an error style.
 * @param {object} pos - An object with 'line' and 'ch' properties indicating the token's position.
 */
function markToken( pos ) {

  var tokenInfo = EDITOR.getTokenAt( pos ); // Get token information

  var marker = EDITOR.markText(
    { line: pos.line, ch: tokenInfo.start }, // Start position of the token
    { line: pos.line, ch: tokenInfo.end }, // End position of the token
    { className: "CodeMirror-x-errorToken" } // CSS class for styling the token
  );

  MARKED_TOKENS.push( marker ); // Store the created text marker
}

/**
 * Creates an HTML element with specified tag, class, and text content.
 * @param {string} elem - The HTML tag name (e.g., 'span', 'div').
 * @param {string} cls - The CSS class name for the element.
 * @param {string} cnt - The text content for the element.
 * @returns {HTMLElement} The newly created HTML element.
 */
function elemClassContent( elem, cls, cnt ) {

  var e = document.createElement( elem ); // Create element
  e.className = cls; // Set class name
  e.textContent = cnt; // Set text content
  // e.appendChild(document.createTextNode(cnt)); // Alternative way to set text content
  return e; // Return the element
}