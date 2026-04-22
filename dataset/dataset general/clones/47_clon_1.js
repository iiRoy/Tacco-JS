/**
 * This file contains the implementation for CodeMirrorIntellisense,
 * a module designed to provide intelligent auto-completion features.
 *
 * Provides an intellisense functionality for text editing components like
 * <textarea> elements or <input> fields. It manages triggers for suggestions.
 *
 * @param {string|HTMLElement} editor - The ID string of the target element, or
 *                                      the actual DOM element reference itself.
 * @class CodeMirrorIntellisense
 * @author Original Author
 * @version 1.0.1
 * @license MIT
 */
var CodeMirrorIntellisense = function( editor )
{
  // Internal instances for managing declarations and method suggestions.
  var decls = new DeclarationsIntellisense(); // Manages declaration popups.
  var meths = new MethodsIntellisense();     // Manages method signature popups.

  // Storage for various key triggers, categorized by their action (up/down)
  // and target (declarations/methods).
  var triggers = {
    upDecls:     [], // Triggers for declarations on key-up events.
    downDecls:   [], // Triggers for declarations on key-down events.
    upMeths:     [], // Triggers for methods on key-up events.
    downMeths:   []  // Triggers for methods on key-down events.
  };

  // Callbacks to be invoked when specific triggers are activated.
  var declarationsCallback = null;
  var methodsCallback      = null;

  // Stores the starting position for auto-completion filtering.
  // This helps in determining which part of the text needs to be completed.
  var autoCompleteStart = {
    lineIndex:    0,
    columnIndex:  0
  };

  // A flag indicating if an auto-completion process has been initiated.
  var triggered = false; // Currently unused, but kept for future extensions.


  /**
   * Processes a given set of triggers against an event.
   * If a trigger matches, its associated callback is executed.
   *
   * @param {Array<KeyTrigger>} triggers - An array of trigger objects to check.
   * @param {KeyboardEvent} evt          - The keyboard event that occurred.
   * @param {function} callback          - The function to call if a trigger matches.
   * @returns {boolean} True if a trigger was successfully processed, false otherwise.
   */
  function processTriggers( triggers, evt, callback )
  {
    // Iterate over all registered triggers in the provided array.
    for ( var k in triggers )
    {
      var item = triggers[ k ]; // Current trigger item being evaluated.

      // Extract trigger properties, defaulting to false or 0 if not specified.
      var shiftKey = item.shiftKey || false;
      var ctrlKey  = item.ctrlKey  || false;
      var keyCode  = item.keyCode  || 0;
      var preventDefault = item.preventDefault || false;

      // Check if the current event matches the trigger's key combination.
      if ( evt.keyCode === keyCode && evt.shiftKey === shiftKey && evt.ctrlKey === ctrlKey )
      {
        // If a match is found, capture the current cursor position.
        var cursor = editor.getCursor();
        autoCompleteStart.columnIndex = cursor.ch;    // Store column index.
        autoCompleteStart.lineIndex   = cursor.line;  // Store line index.

        callback( item ); // Execute the callback associated with the trigger.

        // If the trigger specifies to prevent default browser behavior, do so.
        if ( preventDefault )
        {
          evt.preventDefault();    // Stop default action (e.g., typing character).
          evt.cancelBubble = true; // Stop event bubbling.
        }
        return true; // A trigger was handled.
      }
    }
    return false; // No trigger matched the event.
  }


  /**
   * Initializes the editor by attaching necessary event listeners for key actions.
   *
   * @param {object} e - The editor instance (e.g., CodeMirror editor object).
   */
  function setEditor( e )
  {
    editor = e; // Assign the provided editor instance.

    // Attach a 'keyup' event listener to the editor.
    editor.on( 'keyup', function( cm, evt )
    {
      // If the declarations UI is currently visible, update its filter.
      if ( decls.isVisible() )
      {
        decls.setFilter( getFilterText() );
      }

      // Process 'up' triggers for declarations first.
      // If no declaration trigger is processed, then try processing 'up' triggers for methods.
      if ( ! processTriggers( triggers.upDecls, evt, declarationsCallback ) )
      {
        processTriggers( triggers.upMeths, evt, methodsCallback );
      }
    });

    // Attach a 'keydown' event listener to the editor.
    editor.on( 'keydown', function( cm, evt )
    {
      // If declarations UI is visible, handle key presses for navigation or filtering.
      if ( decls.isVisible() )
      {
        if ( evt.keyCode === 8 ) // Handle Backspace key.
        {
          decls.setFilter( getFilterText() ); // Update filter text.
        }
        else
        {
          decls.handleKeyDown( evt ); // Allow declarations UI to handle key down events.
        }
      }

      // Process 'down' triggers for declarations first.
      // If no declaration trigger is processed, then try processing 'down' triggers for methods.
      if ( ! processTriggers( triggers.downDecls, evt, declarationsCallback ) )
      {
        processTriggers( triggers.downMeths, evt, methodsCallback );
      }

      // If methods UI is visible, allow it to handle key down events.
      if ( meths.isVisible() )
      {
        meths.handleKeyDown( evt );
      }
    });
  }


  // --- Event Handlers for UI Visibility and Interactions ---

  // Register a callback for when the visibility of the declarations UI changes.
  decls.onVisibleChanged( function( v )
  {
    // If the declarations UI becomes visible, position it correctly.
    if ( v )
    {
      var coords = editor.cursorCoords( true, 'page' ); // Get cursor screen coordinates.
      decls.setPosition( coords.left, coords.bottom );  // Set UI position relative to cursor.
    }
  });

  // Register a callback for when the visibility of the methods UI changes.
  meths.onVisibleChanged( function( v )
  {
    // If the methods UI becomes visible, position it correctly.
    if ( v )
    {
      var coords = editor.cursorCoords( true, 'page' ); // Get cursor screen coordinates.
      meths.setPosition( coords.left, coords.bottom );  // Set UI position relative to cursor.
    }
  });

  // Register a callback for when an item is selected from the declarations UI.
  decls.onItemChosen( function( item )
  {
    // Determine the value to insert; prefer 'value' over 'name'.
    var itemValue = item.value || item.name;

    var cursor = editor.getCursor(); // Get current cursor position.
    // var line = editor.getLine( autoCompleteStart.lineIndex ); // This line is not used.

    // Define the range to replace in the editor.
    var startRange = { line: cursor.line, ch: autoCompleteStart.columnIndex };
    var endRange   = { line: cursor.line, ch: cursor.ch };

    // Replace the text in the editor with the chosen item's value.
    editor.replaceRange( itemValue, startRange, endRange );

    // Adjust the cursor position after insertion.
    editor.setSelection( { line: cursor.line, ch: cursor.ch + itemValue.length } );

    decls.setVisible( false ); // Hide the declarations UI.
    editor.focus();            // Return focus to the editor.
  });


  /**
   * Internal helper to add a trigger to the appropriate category.
   *
   * @param {KeyTrigger} trigger      - The trigger object to add.
   * @param {string} methsOrDecls     - Suffix string ('Decls' or 'Meths') to categorize the trigger.
   */
  function addTrigger( trigger, methsOrDecls )
  {
    // Determine trigger type, defaulting to 'up' if not specified.
    var type = trigger.type || 'up';

    // Check if the target trigger category exists and add the trigger.
    if ( triggers[ type + methsOrDecls ] )
    {
      triggers[ type + methsOrDecls ].push( trigger );
    }
  }


  /**
   * Adds a new trigger specifically for the declarations UI.
   *
   * @param {KeyTrigger} trigger - The trigger configuration.
   */
  function addDeclarationTrigger( trigger )
  {
    addTrigger( trigger, 'Decls' );
  }


  /**
   * Adds a new trigger specifically for the methods UI.
   *
   * @param {KeyTrigger} trigger - The trigger configuration.
   */
  function addMethodsTrigger( trigger )
  {
    addTrigger( trigger, 'Meths' );
  }


  /**
   * Sets the callback function to be executed when a declaration trigger fires.
   *
   * @param {function} callback - The function to call.
   */
  function onDeclaration( callback )
  {
    declarationsCallback = callback;
  }


  /**
   * Sets the callback function to be executed when a method trigger fires.
   *
   * @param {function} callback - The function to call.
   */
  function onMethod( callback )
  {
    methodsCallback = callback;
  }


  /**
   * Retrieves the text snippet from the editor that is currently being filtered
   * for auto-completion suggestions.
   * This text starts from the `autoCompleteStart.columnIndex` up to the current
   * cursor position.
   *
   * @returns {string} The filter text.
   */
  function getFilterText()
  {
    var cursor = editor.getCursor(); // Get current cursor position.
    var line   = editor.getLine( autoCompleteStart.lineIndex ); // Get the line where auto-completion started.

    // Extract the substring that represents the filter text.
    return line.substring( autoCompleteStart.columnIndex, cursor.ch );
  }


  // Initialize the editor with event listeners upon instantiation.
  setEditor( editor );


  // --- Public API for CodeMirrorIntellisense ---

  /**
   * Provides access to the declarations user interface component.
   * @returns {DeclarationsIntellisense} The declarations UI instance.
   * @function getDecls
   */
  this.getDecls = function() {
    return decls;
  };

  /**
   * Provides access to the methods user interface component.
   * @returns {MethodsIntellisense} The methods UI instance.
   * @function getMeths
   */
  this.getMeths = function() {
    return meths;
  };

  /**
   * Registers a new key trigger that, when activated, causes the declarations
   * suggestions list to appear.
   * @instance
   * @param {KeyTrigger} trigger - An object defining the key combination and behavior.
   * @function addDeclarationTrigger
   */
  this.addDeclarationTrigger = addDeclarationTrigger;

  /**
   * Registers a new key trigger that, when activated, causes the methods
   * suggestions list (e.g., function signatures) to appear.
   * @param {KeyTrigger} trigger - An object defining the key combination and behavior.
   * @function addMethodsTrigger
   */
  this.addMethodsTrigger = addMethodsTrigger;

  /**
   * Assigns a custom callback function that will be executed whenever
   * a declaration-related trigger is activated.
   * This allows external logic to provide declaration data.
   * @param {function} callback - The function to be called. It receives the trigger item as an argument.
   * @function onDeclaration
   */
  this.onDeclaration = onDeclaration;

  /**
   * Assigns a custom callback function that will be executed whenever
   * a method-related trigger is activated.
   * This allows external logic to provide method signature data.
   * @param {function} callback - The function to be called. It receives the trigger item as an argument.
   * @function onMethod
   */
  this.onMethod = onMethod;

  /**
   * Sets the array of method signatures or details to be displayed
   * by the methods user interface.
   * @param {string[]} data - An array of strings, each representing a method.
   * @function setMethods
   */
  this.setMethods = function( data ) {
    meths.setMethods( data );
  };

  /**
   * Sets the array of declaration items to be displayed by the declarations
   * user interface.
   * @param {DeclarationItem[]} data - An array of objects, each representing a declaration.
   * @function setDeclarations
   */
  this.setDeclarations = function( data ) {
    decls.setDeclarations( data );
  };

  /**
   * Explicitly sets the starting column index for filtering. This is useful
   * when auto-completion context needs to be manually adjusted.
   * @param {number} i - The column index (character position) from which filtering should start.
   * @function setStartColumnIndex
   */
  this.setStartColumnIndex = function( i ) {
    autoCompleteStart.columnIndex = i;
  };

  /**
   * Retrieves the current text that is being used as a filter
   * for auto-completion suggestions. This text is derived from
   * the editor content between the `autoCompleteStart.columnIndex`
   * and the current caret position.
   * @returns {string} The current filter text.
   * @function getFilterText
   */
  this.getFilterText = getFilterText;
};