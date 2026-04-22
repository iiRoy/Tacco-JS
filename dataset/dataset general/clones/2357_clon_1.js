/*
 * This is a Type I clone generated from the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * are strictly preserved. Only whitespace and comments have been altered
 * to create a visually distinct, yet functionally identical, code fragment.
 */

var DS = { /* Main application object for various utilities */

  Modal: function( cfg ) {

    // Assign configuration properties to the instance
    this.displayElem = cfg.displayElem;
    this._w = cfg._w || '598px'; // Default width for the modal, can be overridden
    this._h = cfg._h || 'auto'; // Default height for the modal, can be overridden

    // Construct the modal window's HTML structure using jQuery
    this.winHTML = $(
      '<table class="twoism_modal">\
        <tr>\
          <td colspan="3" class="tm_top"></td>\
        </tr>\
        <tr>\
          <td class="tm_left">&nbsp;</td>\
          <td valign="top" style="vertical-align:top;padding:1px;" id="tm_content">&nbsp;</td>\
          <td class="tm_right">&nbsp;</td>\
        </tr>\
        <tr>\
          <td colspan="3" class="tm_btm"></td>\
        </tr>\
      </table>'
    );


    /**
     * @method closeModal
     * Closes the modal window, fades out and removes overlay.
     * This function is responsible for cleaning up modal-related DOM elements.
     */
    this.closeModal = function() {
      var win = this.winHTML; // Cache reference to winHTML for use within the callback scope
      this.winHTML.fadeOut( 'medium', function() {
        $( '#modal_overlay' ).remove(); // Remove the overlay element from the DOM
        win.remove(); // Remove the modal window itself from the DOM
      } );
      return false; // Prevents default event behavior if this function is called as an event handler
    };


    /**
     * @method drawModal
     * Renders the modal window on the screen and positions it.
     * It also populates the modal's content area.
     */
    this.drawModal = function() {

      // Populate the modal's content area with the specified display element
      $( '#tm_content', this.winHTML ).html( this.displayElem );

      // Calculate the horizontal position to center the modal on the screen
      // Note: Division of a string ('598px') by 2 might result in NaN if not handled carefully.
      // The original expression is preserved as per Type I cloning rules.
      var x = ( $( 'body' ).width() / 2 ) - ( this._w / 2 );

      // Apply CSS styles for positioning, sizing, and initial hidden state of the modal
      this.winHTML.css( {
        'width': this._w + 'px',
        'height': this._h + 'px',
        'position': 'absolute',
        'z-index': 100005, // Ensures the modal appears above most other content
        'display': 'none', // Modal is initially hidden and will fade in
        'left': x, // Calculated left position for centering
        'top': $( document ).scrollTop() + 20 // Position relative to current scroll position
      } );

      // Append the modal to the document body and fade it into view
      $( 'body' ).append( this.winHTML );
      this.winHTML.fadeIn( 'medium' );

      return this; // Return the instance for method chaining
    };

    // The modal is drawn immediately upon instantiation of the Modal object.
    return this.drawModal();
  }, /* End of Modal component definition */


  Reviser: function( cfg ) {

    /* Reviser: Main component for in-place or modal editing functionality */

    this.cfg = cfg; // Store the configuration object for later reference
    this.threshold = cfg.threshold || 600; // Width threshold to decide between modal and inline editing
    this.overlay = cfg.overlay || true; // Flag to determine if a modal overlay should be displayed
    this.imageDir = cfg.imageDir || "/reviser/images"; // Directory path for editor menu images

    /* Callbacks for save operations, allowing custom pre- and post-processing */
    this.beforeSaveCallBack = cfg.beforeSave || function( html ) {
      return html;
    }; // Function to execute before saving content
    this.afterSaveCallBack = cfg.afterSave || function() {
      return false;
    }; // Function to execute after content has been saved


    // The jQuery element that is being edited
    this.editorElement = $( cfg.elm );
    // Reference to the original element; used for updating content after modal editing
    this.actualElement = this.editorElement;


    // Determines the editor type ('inline' or 'modal') based on configuration
    // or by comparing element width to the defined threshold.
    this.editorType = cfg.editorType || ( ( this.editorElement.width() < this.threshold ) ? 'modal' : 'inline' );


    /* -------- Editor Core Functions -------- */

    /**
     * @method drawModalEditor
     * Prepares and displays the editor within a modal window.
     * This method creates the necessary DOM structure for the modal editor.
     */
    this.drawModalEditor = function() {
      var frame = $( '<div id="modal_reviser"></div>' ); // Main container for the modal editor's content
      var editorContent = $( '<div id="editorContent" contenteditable="true"></div>' ); // The actual contenteditable area
      editorContent.html( this.editorElement.html() ); // Copy the HTML content from the original element

      frame.append( this.menu.html ); // Append the editor menu to the modal frame
      frame.append( editorContent ); // Append the editable content area to the modal frame

      // Instantiate a new DS.Modal to display the editor frame
      this.modal = new DS.Modal( {
        _w: 598, // Fixed width for the editor modal

        displayElem: frame // The content (menu + editable area) to be shown in the modal
      } );
      this.editorElement = editorContent; // Reassign editorElement to point to the modal's content area
    };


    /**
     * @method setupEditor
     * Initializes the editor, creating the menu and setting up the editing environment.
     * This method branches based on whether inline or modal editing is used.
     */
    this.setupEditor = function() {

      // Create a new Menu instance, passing the current editor instance to it
      this.menu = new DS.Menu( this );

      if ( this.editorType == 'inline' ) {
        this.appendMenuToElement(); // For inline editing, append the menu near the element
        this.setElementToEditable(); // Make the target element directly contenteditable
      } else {
        this.drawModalEditor(); // For modal editing, draw the editor inside a modal
      }

      // If the overlay option is enabled, draw the semi-transparent overlay
      if ( this.overlay ) this.drawOverlay();

      // Store a backup of the original content; this is used for the revert functionality
      this.contentBackup = this.editorElement.html();
    };


    /**
     * @method appendMenuToElement
     * Positions and displays the editor menu for inline editing.
     * The menu is appended to the body and positioned relative to the editable element.
     */
    this.appendMenuToElement = function() {

      var coords = this.editorElement.offset(); // Get the current position (offset) of the editable element

      // Set a unique ID for the menu's HTML container
      this.menu.html.attr( "id", this.editorElement[ 0 ].id + '_reviser' );
      $( 'body' ).append( this.menu.html ); // Append the menu HTML to the document body

      // Apply CSS styles to position the menu directly above the editable element
      this.menu.html.css( {
        'position': 'absolute',
        'display': 'none', // Menu is initially hidden
        'top': coords.top - 48, // Position 48px above the element
        'left': coords.left, // Align left with the element
        'z-index': 1000003, // A very high z-index to ensure visibility
        'display': 'none', // Ensure it's hidden before fading in
      } );

      this.menu.html.fadeIn( 'medium' ); // Fade in the menu smoothly
      // Original commented out animation: //this.menu.html.animate({ marginLeft: 500+coords.left, opacity: 'show'}, "medium");
    };


    /**
     * @method drawOverlay
     * Creates and displays a semi-transparent overlay that covers the entire document.
     * This overlay is typically used with modal editors or to highlight inline editing.
     */
    this.drawOverlay = function() {
      // Determine the background color for the editable element. If transparent, default to white.
      // This ensures the editable element is visible above the overlay.
      var bgcolor = ( this.editorElement.css( 'background-color' ) != 'transparent' ) ? this.editorElement.css( 'background-color' ) : '#fff';

      $( 'body' ).append( '<div id="modal_overlay"></div>' ); // Append the overlay element to the body

      // Apply CSS styles to the overlay for full-screen coverage and semi-transparency
      $( '#modal_overlay' ).css( {
        'background-color': '#000000', // Black background
        'height': $( document ).height(), // Cover the full document height
        'left': 0,
        'opacity': 0.7, // Semi-transparent
        'position': 'absolute',
        'top': 0,
        'width': '100%', // Cover the full document width
        'z-index': 100002, // Z-index below the modal/menu but above other page content
        'display': 'none' // Initially hidden
      } );

      // Adjust the editable element's z-index and background to appear above the overlay
      this.editorElement.css( {
        'z-index': 1000003,
        'position': 'relative',
        'background': bgcolor
      } );

      // Fade in the overlay and bind the menu's revert function to its click event
      $( '#modal_overlay' ).fadeIn( 'medium' ).click( this.menu.revert );
    };


    /**
     * @method setElementToEditable
     * Configures the target element to be editable by the user.
     * It also unbinds any existing click handlers on the element.
     */
    this.setElementToEditable = function() {
      this.editorElement.unbind( 'click' ); // Remove any previously bound click event handlers
      this.editorElement.attr( 'contenteditable', true ); // Set the contenteditable attribute to true
      return true;
    };


    /**
     * @method setElementToNonEditable
     * Disables editing for the target element, hides the menu and overlay,
     * and re-binds the click handler to re-initialize the editor.
     */
    this.setElementToNonEditable = function() {
      this.menu.html.fadeOut( 'medium' ); // Fade out and hide the editor menu
      $( '#modal_overlay' ).fadeOut( 'medium' ); // Fade out and hide the modal overlay

      // Disable contenteditable and reset the element's z-index
      this.editorElement.attr( 'contenteditable', false ).css( 'z-index', 100 );

      // Re-bind the click event to the editorElement to re-initialize Reviser on subsequent clicks
      $( this.editorElement ).click( function() {
        this.editor = new DS.Reviser( this.editor.cfg ); // Create a new Reviser instance
      } );

      return false;
    };

    /* ------------------------------------ */

    // The editor setup process is initiated immediately when Reviser is instantiated.
    this.setupEditor();
  }, /* End of Reviser component definition */


  Menu: function( editor ) {
    this.sourceMode = false; // A boolean flag to track if the editor is currently in source code mode

    // Extend the Menu instance with all the command methods defined in DS.Commands
    $.extend( this, DS.Commands );
    this.editor = editor; // Store a reference to the parent editor instance

    // The HTML structure for the editor's toolbar menu. This can be customized via config.
    this.html = this.editor.cfg.menuHTML || $(
      '<div class="reviser_menu" >\
        <a href="#" class="reviser_btn" id="boldSelection" alt="Text Bold"><img src="' + this.editor.imageDir + '/btn_strong.png" border="0"></a>\
        <a href="#" class="reviser_btn" id="italicSelection" alt="Text Italic"><img src="' + this.editor.imageDir + '/btn_em.png" border="0"></a>\
        <a href="#" class="reviser_btn" id="strikethroughSelection" alt="Text Strike"><img src="' + this.editor.imageDir + '/btn_strike.png" border="0"></a>\
        <a href="#" class="reviser_btn" id="underlineSelection" alt="Text Under"><img src="' + this.editor.imageDir + '/btn_underline.png" border="0"></a>\
        <a href="#" class="reviser_btn" id="insertP" alt="Insert Paragraph"><img src="' + this.editor.imageDir + '/btn_para.png" border="0"></a>\
        <a href="#" class="reviser_btn" id="insertH1" alt="Insert H1"><img src="' + this.editor.imageDir + '/btn_h1.png" border="0"></a>\
        <a href="#" class="reviser_btn" id="insertH2" alt="Insert H2"><img src="' + this.editor.imageDir + '/btn_h2.png" border="0"></a>\
        <a href="#" class="reviser_btn" id="insertH3" alt="Insert H3"><img src="' + this.editor.imageDir + '/btn_h3.png" border="0"></a>\
        <a href="#" class="reviser_btn" id="insertH4" alt="Insert H4"><img src="' + this.editor.imageDir + '/btn_h4.png" border="0"></a>\
        <a href="#" class="reviser_btn" id="insertImage" alt="Insert Image"><img src="' + this.editor.imageDir + '/btn_image.png" border="0"></a>\
        <a href="#" class="reviser_btn" id="createLink" alt="Insert Link"><img src="' + this.editor.imageDir + '/btn_link.png" border="0"></a>\
        <a href="#" class="reviser_btn" id="insertOrderedList" alt="Insert Ordered List"><img src="' + this.editor.imageDir + '/btn_ul.png" border="0"></a>\
        <a href="#" class="reviser_btn" id="insertUnorderedList" alt="Insert Ordered List"><img src="' + this.editor.imageDir + '/btn_ul.png" border="0"></a>\
        <a href="#" class="reviser_btn" id="sourceMode" alt="HTML"><img src="' + this.editor.imageDir + '/btn_source.png" border="0"></a>\
        <a href="#" class="reviser_btn" id="save" alt="Save"><img src="' + this.editor.imageDir + '/btn_save.png" border="0"></a>\
        <a href="#" class="reviser_btn" id="revert" alt="Cancel"><img src="' + this.editor.imageDir + '/btn_cancel.png" border="0"></a>\
      </div>'
    );

    // Binds click event handlers to all interactive buttons within the menu.
    this.bindMenu = function() {
      var scope = this; // Capture 'this' (the Menu instance) for use within the event handler's scope

      // Iterate over each button identified by the 'reviser_btn' class
      $( '.reviser_btn', this.html ).each( function() {
        $( this ).click( function() {
          // Call the corresponding method on the Menu instance, using the button's ID as the method name
          scope[ this.id ].call( scope );
          return false; // Prevent the default action of the anchor tag
        } );
      } );
    };


    /**
     * @method save
     * Finalizes the editing process by applying changes and executing callbacks.
     * It handles both inline and modal editor types.
     */
    this.save = function() {
      // If currently in source mode, switch back to rich text mode before saving
      if ( this.sourceModeActive ) this.exitSourceMode();

      // Process the editor content through the beforeSave callback
      var processedHtml = editor.beforeSaveCallBack( editor.editorElement.html() );

      if ( editor.editorType == 'inline' ) {
        editor.editorElement.html( processedHtml ); // Update the content of the inline editable element
        editor.setElementToNonEditable(); // Disable further inline editing
      } else { // Handle modal editor type
        editor.modal.closeModal(); // Close the modal window
        editor.actualElement.html( processedHtml ); // Update the original, non-modal element with the edited content
      }

      // Execute the afterSave callback with the final processed HTML content
      editor.afterSaveCallBack( processedHtml );
    };


    /**
     * @method revert
     * Discards any unsaved changes and restores the content to its original state.
     * It also closes the editor and modal if applicable.
     */
    this.revert = function() {
      editor.editorElement.html( editor.contentBackup ); // Restore the content from the initial backup
      editor.setElementToNonEditable(); // Disable editing and reset element state
      if ( editor.editorType == 'modal' ) editor.modal.closeModal(); // If it's a modal, close it
      return false; // Prevent default event action
    };


    // Execute the menu binding process immediately upon instantiation to make buttons functional.
    this.bindMenu();
    return this; // Return the instance of the Menu object
  }, /* End of Menu component definition */


  // Collection of base commands that can be executed on a contenteditable area.
  Commands: {

    createLink: function() {
      var url = this.needInput( "What url? (Use http://)" ); // Prompt the user for the URL
      return this.exec( 'createLink', url ); // Execute the 'createLink' command
    },
    boldSelection: function() {
      this.exec( 'bold', null ); // Execute the 'bold' command
    },
    underlineSelection: function() {
      return this.exec( 'underline', null ); // Execute the 'underline' command
    },
    italicSelection: function() {
      return this.exec( 'italic', null ); // Execute the 'italic' command
    },
    strikethroughSelection: function() {
      return this.exec( 'strikethrough', null ); // Execute the 'strikethrough' command
    },
    blockquoteSelection: function() {
      return this.exec( 'blockquote', null ); // Execute the 'blockquote' command
    },
    colorSelection: function( color ) {
      return this.exec( 'forecolor', color ); // Execute the 'forecolor' command with a specified color
    },
    insertOrderedList: function() {
      return this.exec( 'insertorderedlist', null ); // Execute the 'insertorderedlist' command
    },
    insertUnorderedList: function() {
      return this.exec( 'insertunorderedlist', null ); // Execute the 'insertunorderedlist' command
    },
    insertImage: function() {
      var url = this.needInput( "What url? (Use http://)" ); // Prompt the user for the image URL
      return this.exec( 'insertImage', url ); // Execute the 'insertImage' command
    },
    insertHTML: function( html ) {
      if ( $.browser.msie ) { // Special handling for Internet Explorer due to differing API
        var range = this.editingElement._selection.getRange();
        range.pasteHTML( html );
        range.collapse( false );
        range.select();
      } else {
        var html = this.needInput( 'HTML?' ); // For other browsers, prompt for HTML string
        return this.exec( 'insertHTML', html ); // Execute the 'insertHTML' command
      }
    },
    insertH1: function() {
      return this.exec( 'FormatBlock', "h1" ); // Apply H1 formatting
    },
    insertH2: function() {
      return this.exec( 'FormatBlock', "h2" ); // Apply H2 formatting
    },
    insertH3: function() {
      return this.exec( 'FormatBlock', "h3" ); // Apply H3 formatting
    },
    insertH4: function() {
      return this.exec( 'FormatBlock', "h4" ); // Apply H4 formatting
    },
    insertP: function() {
      return this.exec( 'FormatBlock', "p" ); // Apply Paragraph formatting
    },

    /**
     * @method exitSourceMode
     * Switches the editor back from source code editing (textarea) to rich text editing.
     */
    exitSourceMode: function() {
      this.sourceModeActive = false; // Reset the flag indicating source mode is no longer active
      var scope = this; // Preserve the 'this' context for event re-binding

      // Retrieve content from the textarea, remove newlines and tabs, and replace the textarea with this content
      var content = $( '#reviser_source' ).val().replace( "\n", "" ).replace( "\t", "" );
      $( '#reviser_source', this.editorElement ).replaceWith( content );

      // Re-bind the sourceMode button's click handler to switch back to source mode
      $( '#sourceMode', this.html ).unbind( 'click' ).click( function() {
        scope.sourceMode();
        return false;
      } );
      return false;
    },


    /**
     * @method sourceMode
     * Activates source code editing mode, replacing the rich text area with a textarea
     * containing the raw HTML content.
     */
    sourceMode: function() {
      this.sourceModeActive = true; // Set the flag indicating that source mode is now active
      var ta = $( '<textarea id="reviser_source"></textarea>' ); // Create a new textarea element
      var el = this.editor.editorElement; // Get a reference to the current editable element
      var content = el.html(); // Retrieve the current HTML content from the editable element
      var scope = this; // Preserve the 'this' context for event re-binding

      /*
       * Wrap the children of the editable element within the newly created textarea.
       * The innerHTML needs to be explicitly set after the wrapping operation.
       */
      el.children().wrapAll( ta );
      $( '#reviser_source' ).val( content ); // Set the textarea's value to the retrieved HTML content

      // Apply CSS styles to the textarea to match the dimensions of the original editable element
      $( '#reviser_source' ).css( {
        'width': el.width() - 10, // Adjust width slightly
        'height': el.height() // Match height
      } );

      // Re-bind the sourceMode button's click handler to switch back to rich text mode (exitSourceMode)
      $( '#sourceMode', this.html ).unbind( 'click' ).click( function() {
        scope.exitSourceMode();
        return false;
      } );
    },


    /**
     * @method needInput
     * Displays a prompt to the user and ensures a non-empty response is received.
     * It recursively calls itself if the user provides an empty input.
     */
    needInput: function( msg ) {
      var resp = prompt( msg ); // Display the browser's native prompt dialog
      if ( resp == "" ) { // Check if the response is an empty string
        this.needInput( msg ); // If empty, prompt the user again
      } else {
        return resp; // Return the non-empty user input
      }
    },


    /**
     * @method exec
     * A utility method to execute a document command (e.g., bold, italic).
     */
    exec: function( fn, val ) {
      document.execCommand( fn, false, val ); // Execute the specified document command
      return false; // Prevent default browser behavior for the command
    }
  } /* End of Commands object definition */
}; // End of DS object definition