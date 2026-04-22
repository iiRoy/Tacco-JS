Element.implement(
  {
    /*
     * getSelectedText: Retrieves the currently selected text from the element.
     * This method handles browser-specific differences in text selection.
     */
    getSelectedText: function (  )
    {
      // Internet Explorer (Trident engine) uses a different selection model.
      if ( Browser.Engine.trident )
      {
        return document.selection.createRange(  ).text;
      }
      // For other modern browsers, use the standard selectionStart and selectionEnd properties.
      return this.get( 'value' ).substring( this.selectionStart, this.selectionEnd );
    }, // End of getSelectedText function definition.

    /**
     * replaceSelectedText: Replaces the current text selection with a new string.
     * @param {string} newtext - The string to insert in place of the selection.
     * @param {boolean} isLast - A flag indicating if this is the final text modification in a sequence.
     *                            If true, selection and scroll position might be adjusted.
     */
    replaceSelectedText: function ( newtext, isLast )
    {
      // Ensure 'isLast' is a boolean; default to true if not explicitly provided.
      var isLast = ( isLast == null ) ? true : isLast;

      // Preserve the current scroll position before making changes.
      var scroll_top = this.scrollTop;

      // Handle Internet Explorer's unique text range object for replacement.
      if ( Browser.Engine.trident )
      {
        this.focus(  ); // The element must be focused for selection manipulation.
        var range = document.selection.createRange(  ); // Obtain the text range object.
        range.text = newtext; // Perform the text replacement.
        if ( isLast )
        { // If this is the last step in a series of text changes...
          range.select(  ); // Re-select the modified text.
          this.scrollTop = scroll_top; // Restore the original scroll position.
        }

      }
      // For standard-compliant browsers.
      else
      {
        // Store the original start and end points of the selection.
        originalStart = this.selectionStart;
        originalEnd = this.selectionEnd;
        // Construct the new value by concatenating parts of the original value with the new text.
        this.value = this.get( 'value' ).substring( 0, originalStart ) + newtext + this.get( 'value' ).substring( originalEnd );
        if ( isLast == false )
        { // If more operations are expected, select the newly inserted text.
          this.setSelectionRange( originalStart, originalStart + newtext.length );
        }
        else
        { // If this is the final operation, place the cursor at the end of the inserted text.
          this.setSelectionRange( originalStart + newtext.length, originalStart + newtext.length );
          this.scrollTop = scroll_top; // Restore the scroll position.
        }
        this.focus(  ); // Ensure the element remains focused.
      }


    } // End of replaceSelectedText function.
  }
);


/*
 * Class: nawte
 *
 * Overview:
 *   The 'nawte' class provides a robust framework for building WYSIWYM (What You See Is What You Mean) editors.
 *   It integrates directly with an HTML textarea element, allowing for extensible text manipulation capabilities.
 *   Through the <addFunction> method, users can define custom operations, each typically associated with a toolbar button.
 *   These operations perform 'TextTransform' actions, making nawte highly versatile.
 *   For instance, a "bold" function would add a "bold" button to the editor's toolbar and apply the necessary
 *   transformations to render text in bold.
 *   A key strength of nawte is its independence from specific markup languages. It supports HTML, Markdown, Textile,
 *   or any other desired output format.
 *
 *   All TextTransform functions (including <wrapSelection>, <insertBefore>, <insertAfter>,
 *   <replaceSelection>, and <processEachLine>) accept an optional parameter named "isLast".
 *   This parameter is critical for chaining multiple text transformations efficiently.
 *   Setting 'isLast' to 'false' indicates that additional transformations will follow the current one.
 *   The example code provided below further clarifies its usage.
 *   Note: If your function performs only a single text transformation (e.g., only wrapping the selection),
 *   you can safely omit this parameter, as its default value is "true".
 *
 * General Example of Usage:
 *   (start code)
 *   // Creating a new nawte object instance
 *   var myNawteEditor = new nawte('thetext', 'toolbar');
 *
 *   // Adding a "List" button:
 *   // This button will either generate a new unordered list if no text is selected,
 *   // or convert each line of the current selection into a list item if text is present.
 *   myNawteEditor.addFunction("list", function() {
 *     var currentSelection = this.getSelection();
 *     if ( currentSelection == "" ) {
 *       this.replaceSelection("<ul>\n   <li>Item 1</li>\n   <li>...</li>\n</ul>");
 *     }
 *     else {
 *
 *       // Process each line to prepend list item tags.
 *       this.processEachLine(function(line) {
 *         var newline = "  <li>" + line + "</li>";
 *         return newline;
 *       }, false); // 'isLast' is false here, as we are applying more TextTransform methods.
 *
 *       // Insert the opening <ul> tag before the processed selection.
 *       this.insertBefore("<ul>\n", false);
 *       // Insert the closing </ul> tag. This is the final transformation in the sequence.
 *       this.insertAfter("\n</ul>", true); // Now 'isLast' is set to true.
 *
 *     }
 *   });
 *   (end)
 *
 * Version Information:
 *   Current Version: 0.3
 *
 * License Details:
 *   NAWTE is released under the permissive MIT License.
 *   (For full details, please refer to: http://opensource.org/licenses/mit-license.php)
 *
 * Changelog from previous versions:
 *   * From version 0.2 to version 0.3, notable changes include:
 *     - Introduction of a new "onchange" event: <nawte.onchange>
 *     - Addition of the "interceptTabs" option for enhanced tab key handling.
 *     - Several bugs have been identified and fixed.
 *
 *   For detailed information on the updated constructor, see: <nawte.nawte(constructor)>
 *
 */

var nawte = new Class(
  {

    Implements: Options, // Incorporates the MooTools Options mixin for configuration management.

    // Default configuration options for the nawte instance.
    options: {
      displatchChangeEvent: false, // Flag to enable or disable custom change event dispatching.
      changeEventDelay: 200,       // Time in milliseconds between checks for content changes.
      interceptTabs: true          // If true, the tab key will insert a tab character into the textarea.
    },
    /*
     * Constructor: nawte (constructor)
     *   Initializes a new instance of the nawte editor for a given textarea.
     *
     * Arguments:
     *   element - A string representing the ID of the textarea element to be managed.
     *   list    - An optional string representing the ID of the toolbar container (typically a UL element).
     *   options - An optional object containing configuration settings. Refer to the 'Options' section below.
     *
     * Options Parameters:
     *   dispatchChangeEvent - A boolean. Set to 'true' to enable a custom "change" event dispatch. Default: 'false'.
     *   changeEventDelay    - An integer. The delay (in milliseconds) for the periodical function that dispatches the change event. Default: '200'.
     *   interceptTabs       - A boolean. Set to 'true' to make the tab key insert a tab character into the textarea. Set to 'false' for default browser tab behavior. Default: 'true'.
     *
     * Additional Information about nawte 0.3:
     *   As introduced in nawte 0.3, there's a new 'options' parameter. It now allows for monitoring
     *   the "change" event of your textarea in a more reliable manner.
     *   This custom event will be triggered whenever the content of your textarea is modified,
     *   either by direct user input or through toolbar button interactions.
     *
     *   The rationale for this is that standard textarea "change" events typically do not fire
     *   when text is programmatically inserted by nawte or when content is pasted.
     *   By setting 'dispatchChangeEvent' to 'true', a periodical function will actively monitor
     *   the textarea for any changes and will fire the custom "change" event regardless of the
     *   modification source. The frequency of this monitoring can be adjusted via the 'changeEventDelay' option,
     *   with a default delay of 200 milliseconds.
     *
     * Example of Constructor Usage:
     *   (start code)
     *   var myNawte = new nawte('myTextarea', 'myToolbar', {
     *     dispatchChangeEvent: true,
     *     changeEventDelay: 150,
     *     interceptTab: true
     *   });
     *   (end)
     */
    initialize: function ( element, list, options )
    {

      this.el = $( element ); // Stores a reference to the textarea element.

      this.setOptions( options ); // Applies the provided options, merging with defaults.

      // If custom change event dispatching is enabled...
      if ( this.options.dispatchChangeEvent )
      {
        this.el.addEvents(
          {
            // When the textarea gains focus, start the periodical change check.
            'focus': function (  )
            {
              this.timer = this.watchChange.periodical( this.options.changeEventDelay, this );
            }.bind( this ),

            // When the textarea loses focus, clear the change check timer.
            'blur': function (  )
            {
              this.timer = $clear( this.timer );
            }.bind( this )
          }
        );
      }
      // If tab key interception is enabled...
      if ( this.options.interceptTabs )
      {

        this.el.addEvent( 'keypress', function ( event )
        {
          var event = new Event( event ); // Wrap the native event for MooTools compatibility.
          if ( event.key == "tab" )
          {
            event.preventDefault(  ); // Prevent the browser's default tab behavior.
            this.replaceSelection( "\t" ); // Insert a tab character into the text.
          }
        }.bind( this ) );

      }


      // Initialize the toolbar list element.
      if ( ! $defined( list ) || list == "" )
      {
        list = new Element( 'li' ); // Create a new list item if no list ID is provided.
        list.inject( this.el, 'before' ); // Inject the new list item before the textarea.
        this.list = list;
      }
      else
      {
        this.list = $( list ); // Use the existing list element identified by its ID.
      }
      // Store the initial content of the textarea for subsequent change detection.
      this.oldContent = this.el.get( 'value' );


    }, // End of initialize method.

    /*
     * Event: onchange
     *   This is a custom event fired when the content of the managed textarea changes.
     *
     * Details and Purpose:
     *   As discussed earlier, the native 'onchange' event of a textarea does not reliably trigger
     *   when content is programmatically inserted by nawte or when text is pasted into it.
     *   By enabling the "dispatchChangeEvent" option, this custom event will be fired
     *   by a periodical monitoring function every time a change in the textarea's content is detected.
     *
     *   The periodical function that performs this monitoring operates only when the textarea
     *   is focused and automatically ceases its operation when the textarea loses focus (is blurred).
     *
     *   This functionality is particularly useful for scenarios requiring real-time updates,
     *   such as implementing a live-preview feature. It ensures that you are notified
     *   of any modifications to the textarea's content, allowing your application to
     *   reflect these changes in a live preview.
     *
     * Example of Event Listener:
     *   To attach a listener to the custom 'change' event for a textarea with the ID "myText":
     *   (start code)
     *   $( 'myText' ).addEvent( 'change', function (  )
     *   {
     *     console.log( "My content was changed!" );
     *   } );
     *   (end)
     */

    watchChange: function (  )
    {
      // Compare the current textarea value with the previously stored value.
      if ( this.oldContent != this.el.get( 'value' ) )
      {
        this.oldContent = this.el.get( 'value' ); // Update the stored content.
        this.el.fireEvent( 'change' );            // Dispatch the custom 'change' event.
      }
    }, // End of watchChange method.


    /*
     * Function: getSelection
     *   Retrieves the text that is currently selected within the associated textarea.
     *
     * Return Value:
     *   selection - A string containing the currently selected text.
     */

    getSelection: function (  )
    {
      return this.el.getSelectedText(  ); // Delegates to the Element's getSelectedText method.
    }, // End of getSelection method.

    /*
     * Function: wrapSelection
     *   Wraps the current text selection with a specified string, placing it both before and after.
     *
     * Arguments:
     *   wrapper - A string that will enclose the textarea's current selection.
     *   isLast  - (Optional) A boolean flag; refer to the top-level documentation for its role in chained text transformations.
     *
     * Example:
     *   > this.wrapSelection( "**" );
     *   // If "selected text" was highlighted, it becomes: **selected text**
     */

    wrapSelection: function ( wrapper, isLast )
    {
      var isLast = ( isLast == null ) ? true : isLast; // Default 'isLast' to true if not provided.
      this.el.replaceSelectedText( wrapper + this.el.getSelectedText(  ) + wrapper, isLast );
    }, // End of wrapSelection method.

    /*
     * Function: insert
     *   Inserts text either before or after the current selection. This is a core TextTransform method.
     *
     * Arguments:
     *   insertText - A string, the content to be inserted.
     *   where      - A string, specifying the insertion point: either "before" or "after" the selection.
     *   isLast     - (Optional) A boolean flag; refer to the top-level documentation for its role in chained text transformations.
     *
     * Example:
     *   > this.insert( "Prefix: ", 'before' );
     *   // If "My Text" is selected, it becomes: Prefix: My Text
     */

    insert: function ( insertText, where, isLast )
    {
      var isLast = ( isLast == null ) ? true : isLast; // Default 'isLast' to true.
      where = ( where == "" ) ? 'after' : where;     // If 'where' is empty, default to 'after'.
      var newText = ( where == "before" ) ? insertText + this.el.getSelectedText(  ) : this.el.getSelectedText(  ) + insertText;
      this.el.replaceSelectedText( newText, isLast );
    },



    /*
     * Function: replaceSelection
     *   Replaces the entire current text selection with a new string. This is a TextTransform method.
     *
     * Arguments:
     *   newText - A string, the content that will replace the selection.
     *   isLast  - (Optional) A boolean flag; refer to the top-level documentation for its role in chained text transformations.
     *
     * Example:
     *   > this.replaceSelection( "New Content Here" );
     *   // Any previously selected text will be entirely replaced by: New Content Here
     */

    replaceSelection: function ( newText, isLast )
    {
      var isLast = ( isLast == null ) ? true : isLast; // Default 'isLast' to true.
      this.el.replaceSelectedText( newText, isLast );
    }, // End of replaceSelection method.

    /*
     * Function: processEachLine
     *   Applies a provided callback function to each individual line within the current text selection.
     *   This is a TextTransform method, useful for line-by-line modifications.
     *
     * Arguments:
     *   callback - A function. This function will be executed for each line of the selection.
     *              It should accept a single parameter 'line' (the current line string)
     *              and MUST return the transformed line string.
     *   isLast   - (Optional) A boolean flag; refer to the top-level documentation for its role in chained text transformations.
     *
     * Example:
     *   (start code)
     *   this.processEachLine( function ( line )
     *   {
     *     var newline = "*** " + line; // Prepend each line with "*** "
     *     return newline;
     *   } );
     *   // If the selection is:
     *   // "Line one
     *   // Line two"
     *   // It will be transformed to:
     *   // "*** Line one
     *   // *** Line two"
     *   (end)
     */

    processEachLine: function ( callback, isLast )
    {
      var isLast = ( isLast == null ) ? true : isLast; // Default 'isLast' to true.
      var lines = this.el.getSelectedText(  ).split( "\n" ); // Split the selected text into an array of lines.
      var newlines = [ ];                                 // Initialize an empty array to hold the transformed lines.

      lines.each( function ( line )
      {
        if ( line != "" )
        { // If the current line is not empty...
          newlines.push( callback.attempt( line, this ) ); // Apply the callback and add the result.
        }
        else
        {
          newlines.push( "" ); // Preserve empty lines as they are.
        }
      }.bind( this ) ); // Ensure 'this' context within the callback refers to the nawte instance.

      this.el.replaceSelectedText( newlines.join( "\n" ), isLast ); // Replace the selection with the re-joined lines.
    }, // End of processEachLine method.

    /*
     * Function: getValue
     *   A simple utility function to retrieve the entire content of the managed textarea.
     *
     * Return Value:
     *   value - A string containing the complete current content of the textarea.
     *
     * Example:
     *   > var currentTextContent = this.getValue(  );
     */

    getValue: function (  )
    {
      return this.el.get( 'value' ); // Returns the 'value' attribute of the textarea element.
    }, // End of getValue method.

    /*
     * Function: setValue
     *   A utility function to set the entire content of the managed textarea.
     *
     * Arguments:
     *   value - A string, the new content to be assigned to the textarea.
     *
     * Example:
     *   > this.setValue( "This is the new text for the editor." );
     */

    setValue: function ( text )
    {
      this.el.set( 'value', text ); // Sets the 'value' attribute of the textarea.
      this.el.focus(  );           // Ensures the textarea receives focus after its content is updated.
    }, // End of setValue method.

    /*
     * Function: addFunction
     *   This is the cornerstone method of NAWTE, enabling the extension of the editor's functionality
     *   by adding new operations, typically represented as toolbar buttons.
     *
     * Arguments:
     *   name     - A string: the display name for the function or button.
     *   callback - A function: the core logic to be executed when the button is activated.
     *              The 'this' context within this callback will refer to the nawte instance.
     *   args     - An optional object: allows for specifying additional HTML attributes
     *              (e.g., 'title', 'class') for the newly created button element.
     *
     * Comprehensive Information:
     *   The fundamental concept of NAWTE is realized through this method. Each function you add,
     *   for example, a function named "BOLD", will result in the creation of a new button
     *   on your editor's toolbar. Within the provided 'callback' function, you have full access
     *   to all TextTransform methods (such as 'wrapSelection', 'replaceSelection', etc.)
     *   to manipulate the current text selection, insert new text, or perform any other desired modifications.
     *
     * Example of Adding a Function:
     *   (start code)
     *   // We will add a 'bold' button that will enclose the selected text
     *   // within standard HTML <b> and </b> tags.
     *   myNawte.addFunction(
     *     'bold', // The name displayed on the button.
     *     function (  )
     *     {
     *       var currentSelection = this.getSelection(  ); // Get the currently selected text.
     *       this.replaceSelection( '<b>' + currentSelection + '</b>' ); // Replace it with bolded text.
     *     },
     *     { title: "Make Text Bold" } // Optional arguments: sets the button's title attribute for tooltips.
     *   );
     *   // And just like that, we now have a fully functional 'bold' button! It's quite elegant!
     *   // Notice the optional 'args' argument; you can pass an object containing HTML properties
     *   // to apply them directly to the newly created button. In this specific example,
     *   // we are setting its 'title' attribute to "Make Text Bold".
     *   (end)
     */

    addFunction: function ( name, callback, args )
    {
      var item = new Element( 'li' ); // Create a new list item element, which will contain the button.
      var itemlink = new Element(
        'a', // Create an anchor element to act as the button.
        {
          'events': {
            'click': function ( e )
            {
              new Event( e ).stop(  );       // Stop the default browser action for the anchor (e.g., navigating).
              callback.attempt( null, this ); // Execute the provided callback function, binding 'this' to the nawte instance.
            }.bind( this ) // Ensure the 'this' context inside the click handler is the nawte object.
          },
          'href': '#' // Set a dummy href for semantic reasons.
        }
      );
      itemlink.set( 'html', '<span>' + name + '</span>' ); // Set the inner HTML of the link to display the function name.
      itemlink.setProperties( args || { } );                 // Apply any additional properties provided in 'args'.
      itemlink.inject( item, 'bottom' );                     // Insert the link (button) into the list item.
      item.injectInside( this.list );                        // Inject the completed list item into the toolbar list.
    } // End of addFunction method.

  }
);