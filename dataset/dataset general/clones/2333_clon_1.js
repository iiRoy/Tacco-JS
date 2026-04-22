/*
 * This file contains the implementation of the Select2Editor for Handsontable.
 * It extends the base TextEditor to provide enhanced dropdown selection capabilities
 * using the Select2 library.
 *
 * Version: 1.0.0
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

( function   ( Handsontable )    { // Start of the Immediately Invoked Function Expression (IIFE) for module encapsulation.

  "use strict" ; // Enforces strict mode for cleaner code and error prevention.


  // Define the Select2Editor by extending the existing Handsontable TextEditor prototype.
  // This inherits all standard text editing functionalities.
  var   Select2Editor   =   Handsontable.editors.TextEditor.prototype.extend ( ) ;


  /**
   * The 'prepare' method is called before an editor is opened.
   * It sets up the editor's internal state and options based on cell properties.
   *
   * @param {HTMLElement} td - The table cell element.
   * @param {number} row - The row index of the cell.
   * @param {number} col - The column index of the cell.
   * @param {string} prop - The property name associated with the column.
   * @param {*} value - The current value of the cell.
   * @param {object} cellProperties - An object containing all cell properties.
   */
  Select2Editor.prototype.prepare   =   function ( td,   row,   col,   prop,   value,   cellProperties ) {

    // Call the parent TextEditor's prepare method to ensure base setup is done.
    Handsontable.editors.TextEditor.prototype.prepare.apply ( this,   arguments ) ;


    // Initialize the editor's options object.
    this.options   =   { } ;

    // If custom Select2 options are provided in cellProperties, merge them.
    if ( this.cellProperties.select2Options ) {

      this.options   =   $.extend ( this.options,   cellProperties.select2Options ) ;

    }

  } ; // End of the `prepare` method definition.


  /**
   * 'createElements' is responsible for building the DOM structure of the editor.
   * It creates the input field and its parent container.
   */
  Select2Editor.prototype.createElements   =   function ( ) {

    // Cache the jQuery object for the document body for efficient access.
    this.$body   =   $ ( document.body ) ;

    // Store a reference to Handsontable's DOM utility for class manipulation.
    this.wtDom   =   Handsontable.Dom ;


    // Create the actual input element that will be used as the Select2 target.
    this.TEXTAREA   =   document.createElement ( 'input' ) ;

    // Ensure the input element is of type 'text'.
    this.TEXTAREA.setAttribute ( 'type',   'text' ) ;

    // Wrap the native input element with jQuery for easier manipulation.
    this.$textarea   =   $ ( this.TEXTAREA ) ;


    // Add the standard Handsontable input class to the created element.
    this.wtDom.addClass ( this.TEXTAREA,   'handsontableInput' ) ;


    // Get the style object of the textarea for direct CSS manipulation.
    this.textareaStyle   =   this.TEXTAREA.style ;

    // Initially set width and height to 0 to hide the native input.
    this.textareaStyle.width   =   0 ;
    this.textareaStyle.height   =   0 ;


    // Create a parent DIV element to hold the input.
    this.TEXTAREA_PARENT   =   document.createElement ( 'DIV' ) ;

    // Add a specific class for the input holder.
    this.wtDom.addClass ( this.TEXTAREA_PARENT,   'handsontableInputHolder' ) ;


    // Get the style object of the parent DIV.
    this.textareaParentStyle   =   this.TEXTAREA_PARENT.style ;

    // Position the parent DIV at the top-left corner by default.
    this.textareaParentStyle.top   =   0 ;
    this.textareaParentStyle.left   =   0 ;

    // Hide the parent DIV initially until the editor is opened.
    this.textareaParentStyle.display   =   'none' ;


    // Append the input element as a child of its parent container.
    this.TEXTAREA_PARENT.appendChild ( this.TEXTAREA ) ;


    // Append the entire editor structure to the Handsontable root element.
    this.instance.rootElement [ 0 ] .appendChild ( this.TEXTAREA_PARENT ) ;


    // Capture 'this' context for use within the closure of the hook.
    var   that   =   this ;

    // Register an 'afterRender' hook to refresh editor dimensions.
    Handsontable.PluginHooks.add ( 'afterRender',   function ( ) {

      // Use Handsontable's timeout mechanism for dimension refresh.
      that.instance.registerTimeout ( 'refresh_editor_dimensions',   function ( ) {

        that.refreshDimensions ( ) ; // Call the method to refresh dimensions.

      },   0 ) ; // Execute the timeout callback with no delay.

    } ) ; // End of 'afterRender' hook definition.

  } ; // End of the `createElements` method definition.


  // --- Event Handlers for Select2 Interaction ---

  /**
   * Handler for the Select2 'change' event.
   * This typically means a selection has been made.
   * The 'this' context will be bound to the editor instance.
   */
  var   onSelect2Changed   =   function ( ) {

    this.close ( ) ; // Close the editor.
    this.finishEditing ( ) ; // Finalize the editing process.

  } ; // End of `onSelect2Changed` handler.

  /**
   * Handler for the Select2 'select2-close' event.
   * This is triggered when the Select2 dropdown is closed.
   * The 'this' context will be bound to the editor instance.
   */
  var   onSelect2Closed   =   function ( ) {

    this.close ( ) ; // Close the editor.
    this.finishEditing ( ) ; // Finalize the editing process.

  } ; // End of `onSelect2Closed` handler.


  /**
   * Handler for the 'beforeKeyDown' Handsontable hook.
   * It intercepts keyboard events to control editor behavior,
   * particularly for Enter, Ctrl+key combinations, Home, and End.
   *
   * @param {KeyboardEvent} event - The keyboard event object.
   */
  var   onBeforeKeyDown   =   function   onBeforeKeyDown ( event ) {

    var   instance   =   this ; // Reference to the Handsontable instance.
    var   that   =   instance.getActiveEditor ( ) ; // Reference to the active editor instance.


    var   keyCodes   =   Handsontable.helper.keyCode ; // Access the key code helper.

    // Determine if the Ctrl key (or Cmd on Mac) is pressed, but not Alt.
    var   ctrlDown   =   ( event.ctrlKey   ||   event.metaKey )   &&   ! event.altKey ;


    // Only process events that originated from the editor's textarea.
    if ( event.target   !==   that.TEXTAREA   ||   event.isImmediatePropagationStopped ( ) ) {

      return ; // Ignore event if not from our textarea or already stopped.

    }


    // Handle special Ctrl key presses (Ctrl itself, Cmd, Windows key).
    // These should not interfere with text selection within the editor.
    if ( event.keyCode   ===   17   ||   event.keyCode   ===   224   ||   event.keyCode   ===   91   ||   event.keyCode   ===   93 ) {

      // When CTRL or its equivalent is pressed and cell is edited, don't prepare selectable text in textarea.
      event.stopImmediatePropagation ( ) ; // Prevent event from bubbling further.
      return ; // Stop processing this event.
    }


    // Use a switch statement to handle specific key presses.
    switch ( event.keyCode ) {

      case   keyCodes.ENTER : // Handle the Enter key.

        var   selected   =   that.instance.getSelected ( ) ; // Get the currently selected cell range.

        // Determine if multiple cells are selected.
        var   isMultipleSelection   =   ! ( selected [ 0 ]   ===   selected [ 2 ]   &&   selected [ 1 ]   ===   selected [ 3 ] ) ;

        // If Ctrl+Enter (and not multiple selection) or Alt+Enter, add a new line.
        if ( ( ctrlDown   &&   ! isMultipleSelection )   ||   event.altKey ) {

          if ( that.isOpened ( ) ) { // If the editor is currently open.

            that.val ( that.val ( )   +   '\n' ) ; // Append a newline character to the current value.
            that.focus ( ) ; // Re-focus the editor.

          } else { // If the editor is not yet open.

            that.beginEditing ( that.originalValue   +   '\n' ) ; // Start editing with a newline appended.

          }

          event.stopImmediatePropagation ( ) ; // Stop propagation to prevent default Handsontable behavior.

        }

        event.preventDefault ( ) ; // Prevent the default browser behavior for Enter (e.g., submitting a form).
        break ; // Exit the switch for ENTER.

      case   keyCodes.A : // Handle 'A' key.
      case   keyCodes.X : // Handle 'X' key.
      case   keyCodes.C : // Handle 'C' key.
      case   keyCodes.V : // Handle 'V' key.
        if ( ctrlDown ) { // If Ctrl is pressed along with these keys.
          event.stopImmediatePropagation ( ) ; // CTRL+A, CTRL+C, CTRL+V, CTRL+X should only work locally when cell is edited (not in table context).
          break ; // Exit the switch.
        }
      // Fall-through for Home and End if Ctrl is not pressed, or for A, X, C, V if Ctrl is not pressed.
      case   keyCodes.HOME : // Handle 'Home' key.
      case   keyCodes.END : // Handle 'End' key.
        event.stopImmediatePropagation ( ) ; // Home and End should only work locally when cell is edited (not in table context).
        break ; // Exit the switch.

    } // End of the key code switch statement.

  } ; // End of the `onBeforeKeyDown` handler.


  /**
   * The 'open' method is called when the editor needs to be displayed and activated.
   * It initializes Select2 on the textarea and sets up event listeners.
   */
  Select2Editor.prototype.open   =   function ( ) {

    // Make the parent container visible.
    this.textareaParentStyle.display   =   'block' ;

    // Add the 'beforeKeyDown' hook to intercept keyboard events.
    this.instance.addHook ( 'beforeKeyDown',   onBeforeKeyDown ) ;


    // Adjust the textarea's CSS properties to match the dimensions of the cell.
    this.$textarea.css ( {
      height :   $ ( this.TD ) .height ( ) , // Set height to match the cell's height.
      'min-width' :   $ ( this.TD ) .outerWidth ( ) // Set minimum width to match the cell's outer width.
    } ) ;


    // Explicitly show the textarea element.
    this.$textarea.show ( ) ;


    // Position the textarea precisely over the target cell.
    this.$textarea.offset ( $ ( this.TD ) .offset ( ) ) ;


    // Capture 'this' for use in event handlers.
    var   self   =   this ;

    // Initialize Select2 on the textarea with configured options.
    this.$textarea.select2 ( this.options )
        .on ( 'change',   onSelect2Changed.bind ( this ) ) // Bind the 'change' event to our handler.
        .on ( 'select2-close',   onSelect2Closed.bind ( this ) ) // Bind the 'select2-close' event.
        .on ( "select2-open",   function ( event ) { // Bind the 'select2-open' event.

          // When Select2 opens, find its search input.
          var   search   =   $ ( '.select2-drop-active .select2-search .select2-input' ) ;

          // Populate the search input with the current textarea value and trigger a 'paste' event.
          // This helps in pre-filling the search box if there's an existing value.
          search.val ( self.$textarea.val ( ) ) .trigger ( 'paste' ) ;

        } ) ;


    // Use a short timeout to ensure Select2 is fully rendered before attempting to focus.
    setTimeout ( function ( ) {

      self.$textarea.select2 ( 'focus' ) ; // Programmatically focus the Select2 input.

      // Simulate a click on the Select2 choice element to explicitly open the dropdown.
      self.$textarea.select2 ( 'container' ) .find ( '.select2-choice' ) .trigger ( 'mousedown' ) .trigger ( 'mouseup' ) ;

    },   50 ) ; // 50 milliseconds delay.

  } ; // End of the `open` method definition.


  /**
   * The 'close' method is called when the editor needs to be deactivated and hidden.
   * It cleans up event listeners and hides the editor elements.
   */
  Select2Editor.prototype.close   =   function ( ) {

    this.instance.listen ( ) ; // Re-enable Handsontable's global event listeners.
    this.instance.removeHook ( 'beforeKeyDown',   onBeforeKeyDown ) ; // Remove the custom keydown hook.
    this.$textarea.off ( ) ; // Unbind all event handlers from the textarea.
    this.$textarea.hide ( ) ; // Hide the textarea element.

    // Call the parent TextEditor's close method for standard cleanup.
    Handsontable.editors.TextEditor.prototype.close.apply ( this,   arguments ) ;

  } ; // End of the `close` method definition.


  /**
   * The 'val' method acts as both a getter and setter for the editor's value.
   *
   * @param {*} [value] - Optional. The value to set. If undefined, acts as a getter.
   * @returns {*} The current value of the editor if no argument is provided.
   */
  Select2Editor.prototype.val   =   function ( value ) {

    if ( typeof   value   ==   'undefined' ) { // If 'value' argument is not provided.

      return   this.$textarea.val ( ) ; // Return the current value from the textarea.

    } else { // If 'value' argument is provided.

      this.$textarea.val ( value ) ; // Set the textarea's value.

    }

  } ; // End of the `val` method definition.


  /**
   * The 'focus' method attempts to set focus on the editor.
   * Note: The base TextEditor's focus method is intentionally not called here
   * because Select2 handles its own focusing mechanism.
   */
  Select2Editor.prototype.focus   =   function ( ) {

    this.instance.listen ( ) ; // Ensure Handsontable is listening for events.

    // IMPORTANT: DO NOT CALL THE BASE TEXTEDITOR FOCUS METHOD HERE.
    // Doing so can lead to undesirable behavior and is not necessary
    // as Select2 manages its own focus internally.
    // Handsontable.editors.TextEditor.prototype.focus.apply(this, arguments); // This line is intentionally commented out.

  } ; // End of the `focus` method definition.


  /**
   * The 'beginEditing' method is invoked when the user initiates editing.
   * It allows for custom logic before the editor fully opens.
   *
   * @param {*} initialValue - The initial value to populate the editor with.
   */
  Select2Editor.prototype.beginEditing   =   function ( initialValue ) {

    // Check if there's a custom 'onBeginEditing' hook defined in Handsontable settings.
    var   onBeginEditing   =   this.instance.getSettings ( ) .onBeginEditing ;

    // If the hook exists and returns 'false', prevent editing from starting.
    if ( onBeginEditing   &&   onBeginEditing ( )   ===   false ) {

      return ; // Abort the editing process.

    }

    // Call the parent TextEditor's beginEditing method to ensure base functionality.
    Handsontable.editors.TextEditor.prototype.beginEditing.apply ( this,   arguments ) ;

  } ; // End of the `beginEditing` method definition.


  /**
   * The 'finishEditing' method is called when the editing session concludes.
   * It ensures Handsontable resumes listening and finalizes the edit.
   *
   * @param {boolean} isCancelled - True if editing was cancelled, false otherwise.
   * @param {boolean} ctrlDown - True if the Ctrl key was held down during finish.
   * @returns {boolean} The result of the parent TextEditor's finishEditing.
   */
  Select2Editor.prototype.finishEditing   =   function ( isCancelled,   ctrlDown ) {

    this.instance.listen ( ) ; // Ensure Handsontable is listening for events.

    // Call the parent TextEditor's finishEditing method to handle finalization.
    return   Handsontable.editors.TextEditor.prototype.finishEditing.apply ( this,   arguments ) ;

  } ; // End of the `finishEditing` method definition.


  // --- Editor Registration ---

  // Make the Select2Editor constructor available under Handsontable.editors.
  Handsontable.editors.Select2Editor   =   Select2Editor ;

  // Register the editor with Handsontable under the alias 'select2'.
  Handsontable.editors.registerEditor ( 'select2',   Select2Editor ) ;


} ) ( Handsontable ) ; // Pass the Handsontable object to the IIFE.