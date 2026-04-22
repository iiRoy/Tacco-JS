( function ( ) { // This immediately invoked function expression encapsulates the CustomHtml definition.

  /**
   * CustomHtml Constructor Function
   *
   * Creates a brand new instance of the CustomHtml extension. This extension
   * is designed for integration with a rich text editor, such as Medium Editor.
   *
   * Licensed under the MIT license agreement.
   * Copyright (c) 2014 jillix. All rights reserved.
   *
   * @name CustomHtml
   * @function
   * @param { Object } options An object literal containing the configuration
   *                           parameters for this specific extension instance.
   *                           The following properties are typically expected:
   *  - buttonText: A string representing the text to display on the toolbar button.
   *                Defaults to `</>` if not provided.
   *  - htmlToInsert: The actual HTML string that will be inserted into the
   *                  editor's content area when the button is clicked.
   */
  function CustomHtml ( options ) {
    // Initialize the button element that will be added to the editor's toolbar.
    this . button = document . createElement ( 'button' );
    // Assign a CSS class for styling purposes, typically used by the editor.
    this . button . className = 'medium-editor-action';

    // Check for innerText support to set the button's display text.
    if ( this . button . innerText ) {
      this . button . innerText = options . buttonText || "</>"; // Use provided text or default.
    } else {
      // Fallback for browsers that only support textContent (e.g., Firefox prior to some versions).
      this . button . textContent = options . buttonText || "</>";
    }

    // Bind the click event handler to the button, ensuring 'this' context is correct.
    this . button . onclick = this . onClick . bind ( this );

    // Store the options for later use, particularly for accessing htmlToInsert.
    this . options = options;
  }

  // --- Static Method Definition ---
  // This method is responsible for inserting HTML content at the current caret position.
  CustomHtml . insertHtmlAtCaret = function ( html ) {
    var sel, range; // Declare variables for selection and range objects.

    if ( window . getSelection ) {
      // Modern browsers (IE9+, non-IE) support window.getSelection.
      sel = window . getSelection ( );
      if ( sel . getRangeAt && sel . rangeCount ) {
        range = sel . getRangeAt ( 0 ); // Get the first (and usually only) range.
        range . deleteContents ( ); // Remove selected content, if any.

        // Note: Range.createContextualFragment() is a more elegant solution,
        // but it lacks support in older browsers (e.g., IE9).
        // Therefore, we use a more compatible approach.

        var el = document . createElement ( "div" ); // Create a temporary container.
        el . innerHTML = html; // Populate it with the HTML to insert.
        var frag = document . createDocumentFragment ( ), node, lastNode; // Create a document fragment.

        // Move all child nodes from the temporary div to the fragment.
        while ( ( node = el . firstChild ) ) {
          lastNode = frag . appendChild ( node );
        }
        range . insertNode ( frag ); // Insert the fragment into the document.

        // After insertion, we need to carefully preserve the selection.
        if ( lastNode ) {
          range = range . cloneRange ( ); // Clone the current range.
          range . setStartAfter ( lastNode ); // Set the start of the range after the last inserted node.
          range . collapse ( true ); // Collapse the range to a caret.
          sel . removeAllRanges ( ); // Clear existing selections.
          sel . addRange ( range ); // Add the new range, effectively placing the caret.
        }
      }
    } else if ( document . selection && document . selection . type != "Control" ) {
      // Older Internet Explorer versions (IE < 9) use document.selection.
      document . selection . createRange ( ) . pasteHTML ( html ); // Direct HTML paste.
    }
  };

  /**
   * onClick Handler
   *
   * This method serves as the click event handler for the button.
   * When the button is activated, it triggers the static `insertHtmlAtCaret`
   * method to place the configured HTML into the editor.
   *
   * @name onClick
   * @function
   * @private
   */
  CustomHtml . prototype . onClick = function ( ) {
    // Call the static helper method with the HTML content specified in options.
    CustomHtml . insertHtmlAtCaret ( this . options . htmlToInsert );
  };

  /**
   * getButton Method
   *
   * This function is a required interface method for extensions used with
   * the Medium Editor. It provides the editor with the actual DOM button
   * element to be displayed in its toolbar.
   *
   * @name getButton
   * @function
   * @return { HTMLButtonElement } The pre-configured HTML button element
   *                               that will be attached to the Medium Editor
   *                               toolbar UI.
   */
  CustomHtml . prototype . getButton = function ( ) {
    return this . button; // Return the internally managed button element.
  };

  // Expose the CustomHtml constructor globally under the `window` object.
  // This makes it accessible for external instantiation and usage.
  window . CustomHtml = CustomHtml;

} ) ( ); // Execute the IIFE.