/*
 * This file defines the JsUnitTest.Unit.Logger object,
 * which is responsible for displaying test results within the DOM.
 *
 * This implementation focuses on manipulating HTML elements
 * to provide a visual log of test execution.
 */
JsUnitTest.Unit.Logger = function ( element )
{
    // The main DOM element where the logger will render its output.
    this.element = JsUnitTest.$( element );

    /*
     * If a valid element is provided, proceed to initialize
     * the necessary HTML structure for the log table.
     */
    if ( this.element )
    {
        this._createLogTable( ); // Call a private helper method to set up the table.
    }
}; /* --- End of JsUnitTest.Unit.Logger constructor --- */


/*
 * Prototype method to initiate logging for a new test.
 * This creates a new row in the log table for the given testName.
 */
JsUnitTest.Unit.Logger.prototype.start = function ( testName )
{
    // If the logger's element is not available, gracefully exit.
    if ( !this.element )
    {
        return;
    }

    // Get the `tbody` element where new log rows will be appended.
    var tbody = this.element.getElementsByTagName( 'tbody' ) [ 0 ];


    // Create a new table row (tr) for the current test.
    var tr = document.createElement( 'tr' );
    var td; // Declare a variable to hold table data cells.


    // --- First cell: Test Name ---
    // Create a new table data cell for displaying the test's name.
    td = document.createElement( 'td' );
    td.appendChild( document.createTextNode( testName ) ); // Populate the cell with the test name text.
    tr.appendChild( td ); // Append this name cell to the new row.


    // --- Second cell: Status (initially empty) ---
    // Create and append an empty table data cell for the test's status.
    tr.appendChild( document.createElement( 'td' ) );

    // --- Third cell: Message (initially empty) ---
    // Create and append another empty table data cell for any messages.
    tr.appendChild( document.createElement( 'td' ) );


    // Finally, append the newly created row to the table body.
    tbody.appendChild( tr );
}; /* --- End of start method --- */


/*
 * Prototype method to update the status of the most recently logged test.
 * It targets the status cell of the last log line.
 */
JsUnitTest.Unit.Logger.prototype.setStatus = function ( status )
{
    var logline = this.getLastLogLine( ); // Retrieve the last row that was added to the log.
    logline.className = status; // Apply a CSS class to the row based on the status (e.g., 'passed', 'failed').

    var statusCell = logline.getElementsByTagName( 'td' ) [ 1 ]; // Get the second `td` element (index 1) in the row.
    statusCell.appendChild( document.createTextNode( status ) ); // Insert the status text into this cell.
}; /* --- End of setStatus method --- */


/*
 * Prototype method to finalize a test's entry in the log.
 * It sets the status and displays a summary message.
 */
JsUnitTest.Unit.Logger.prototype.finish = function ( status, summary )
{
    // If the display element is missing, there's nothing to update.
    if ( !this.element )
    {
        return;
    }

    this.setStatus( status ); // Call setStatus to update the visual status.
    this.message( summary ); // Display the summary message for the completed test.
}; /* --- End of finish method --- */


/*
 * Prototype method to display an arbitrary message for the current test.
 * The message is placed in the message cell of the last log line.
 */
JsUnitTest.Unit.Logger.prototype.message = function ( message )
{
    // Prevent operations if the logger's element is not available.
    if ( !this.element )
    {
        return;
    }

    var cell = this.getMessageCell( ); // Get the specific cell designated for messages.


    // The original code commented out a text node approach.
    // We are using `innerHTML` to allow for richer content, including HTML tags.
    // cell.appendChild(document.createTextNode(this._toHTML(message)));
    cell.innerHTML = this._toHTML( message ); // Insert the HTML-formatted message into the cell.
}; /* --- End of message method --- */


/*
 * Prototype method to update the overall summary display of the test run.
 * This typically appears at the top of the log.
 */
JsUnitTest.Unit.Logger.prototype.summary = function ( summary )
{
    // Exit early if the display element is not configured.
    if ( !this.element )
    {
        return;
    }

    // Find the first `div` element within the logger's container.
    // This `div` is assumed to be the summary display area.
    var div = this.element.getElementsByTagName( 'div' ) [ 0 ];
    div.innerHTML = this._toHTML( summary ); // Update its content with the HTML-formatted summary.
}; /* --- End of summary method --- */


/*
 * Private helper method to retrieve the last `tr` element (log line)
 * added to the logger's table body.
 */
JsUnitTest.Unit.Logger.prototype.getLastLogLine = function ( )
{
    var tbody = this.element.getElementsByTagName( 'tbody' ) [ 0 ]; // Get the table body.
    var loglines = tbody.getElementsByTagName( 'tr' ); // Get all table rows within the body.
    return loglines [ loglines.length - 1 ]; // Return the last row in the collection.
}; /* --- End of getLastLogLine method --- */


/*
 * Private helper method to retrieve the message `td` element
 * for the most recently added log line.
 */
JsUnitTest.Unit.Logger.prototype.getMessageCell = function ( )
{
    var logline = this.getLastLogLine( ); // Get the current test's log row.
    return logline.getElementsByTagName( 'td' ) [ 2 ]; // Return the third `td` (index 2) for messages.
}; /* --- End of getMessageCell method --- */


/*
 * Private method to initialize the basic HTML structure for the logger.
 * This includes a summary div, a table, a header, and an empty body.
 */
JsUnitTest.Unit.Logger.prototype._createLogTable = function ( )
{
    var html = '<div class="logsummary">running...</div>' + // Summary display area
               '<table class="logtable">' +                  // Main log table
               '<thead>' +                                   // Table header section
               '<tr>' +
               '<th>Status</th>' +                            // Column for test status
               '<th>Test</th>' +                              // Column for test name
               '<th>Message</th>' +                           // Column for test message/details
               '</tr>' +
               '</thead>' +
               '<tbody class="loglines"></tbody>' +          // Table body for test log lines
               '</table>';
    this.element.innerHTML = html; // Inject the generated HTML into the logger's element.
}; /* --- End of _createLogTable method --- */


/*
 * This method, `appendActionButtons`, was found commented out in the original source.
 * It is retained here in its commented state to adhere to Type I cloning rules,
 * where code structure and content must remain identical, even for commented-out sections.
 * Comments themselves can be added, removed, or modified.
 */
JsUnitTest.Unit.Logger.prototype.appendActionButtons = function ( actions )
{
    // actions = $H(actions);
    // if (!actions.any()) return;
    // var div = new Element("div", {className: 'action_buttons'});
    // actions.inject(div, function(container, action) {
    //   var button = new Element("input").setValue(action.key).observe("click", action.value);
    //   button.type = "button";
    //   return container.insert(button);
    // });
    // this.getMessageCell().insert(div);
}; /* --- End of appendActionButtons method --- */


/**
 * Private helper method to convert plain text into HTML-safe text,
 * suitable for insertion into the DOM via innerHTML.
 * It escapes HTML special characters and converts newline characters to <br/> tags.
 *
 * @param { string } txt - The raw text string to be converted.
 * @returns { string } The HTML-safe string.
 */
JsUnitTest.Unit.Logger.prototype._toHTML = function ( txt )
{
    // First, escape any HTML entities in the text.
    // Then, replace newline characters with HTML break tags for multi-line display.
    return JsUnitTest.escapeHTML( txt ).replace( /\n/g , "<br/>" );
}; /* --- End of _toHTML method --- */