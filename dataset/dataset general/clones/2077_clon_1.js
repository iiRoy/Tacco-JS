require.config(
  {
    /*
     * This configuration block ensures that
     * required scripts are always reloaded,
     * bypassing browser cache during development.
     */
    urlArgs : "bust=" + (new Date()).getTime()
  }
);


require([
  "jquery",
  "command",
  "editor",
  "connection"
], function(
  $,
  Command,
  Editor,
  Connection
) {
  // Initialize a debug flag. If true, the 'app' object will be exposed globally.
  var debug = true;

  // The main application object, will hold all core components.
  var app = {};


  /*
   * Store references to key DOM elements within the application.
   * This provides a centralized access point for UI components.
   */
  app.el = {
    status : $( "#status" ), // The status bar element.
    editor : $( "#editor" )[ 0 ] /* The actual DOM element for the editor,
                                   * required by CodeMirror (CM). */
  };


  // Initialize the editor component using its factory function.
  app.editor = Editor( app.el.editor, app.el.status );

  // Set the keymap for the editor to Vim-like controls.
  app.editor.setKeymap( "vim" );

  // Apply a specific theme to the editor for visual styling.
  app.editor.setTheme( "solarized light" );


  // Instantiate the command input component, linking it to the editor.
  app.command = new Command( { editor: app.editor } );

  // Render the command input and prepend its element to the main container.
  $( "#container" ).prepend( app.command.render().el );

  // Set focus to the command input field immediately.
  app.command.focus();

  // Attach an event listener for when a command is "sent" from the input.
  app.command.on( "send", function( cmd ) {
    /*
     * When a command is sent from the input,
     * forward it to the connection component.
     */
    app.conn.send( cmd );
  } );


  // Establish the connection component, passing the command object for interaction.
  app.conn = Connection( {
    command : app.command
  } );


  // If debug is explicitly true, expose the 'app' object globally for inspection.
  if ( debug !== undefined && debug ) {
    window.app = app;
  }


  // Dynamically load jqxcore, then jqxbuttons and jqxsplitter.
  require( [ "jqxcore" ], function() {
    require( [ "jqxbuttons", "jqxsplitter" ], function() {
      // Initialize the main container as a jqxSplitter for layout management.
      $( "#container" ).jqxSplitter( {
        width  : '100%',
        height : '100%'
      } );
    } );
  } );


  // Set up a global keydown event listener for application-wide shortcuts.
  document.addEventListener( "keydown", function( event ) {
    // Check if the pressed key is the spacebar (key code 32).
    if ( event.which === 32 ) {
      // Check if the Control key is also pressed.
      if ( event.ctrlKey ) {
        // If Control+Space is pressed:
        // Determine if the currently active element is the command bar.
        if ( document.activeElement === app.command.$el.find( ".bar" )[ 0 ] ) {
          // If focus is on the command bar, shift it to the editor.
          app.editor.focus();
          return; // Exit the event handler.
        }

        // If focus is not on the command bar, or if it's Ctrl+Space,
        // shift focus to the command input.
        app.command.focus();

        // Prevent the default browser action for Control+Space (e.g., scrolling).
        event.preventDefault();
      }
    }
  } );
} );