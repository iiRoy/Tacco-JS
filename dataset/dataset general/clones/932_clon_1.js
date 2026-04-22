/*
 * plugin.js - Core functionality for the Emmet-like TinyMCE plugin.
 *
 * This file is part of the TinyMCE Emmet Integration.
 *
 * Copyright information: Moxiecode Systems AB.
 * Licensing details: Released under the LGPL License.
 *
 * For full license text, please visit: http://www.tinymce.com/license
 * For contributions and development guidelines, see: http://www.tinymce.com/contributing
 *
 * Version: 1.0.0
 * Author: TinyMCE Team
 */

// Ensure tinymce global is available for plugin registration.
/* global tinymce:true */
tinymce.PluginManager.add( 'emmet',
  function ( editor ) {

    // Enforce strict mode for better error handling and cleaner code.
    'use strict';

    // Define the valid modes in which this plugin's functionality should be active.
    editor.validModes = [ 'css', 'htmlmixed', 'javascript', 'xml' ];


    /**
     * Opens the custom HTML source editor dialog.
     * This function is triggered by various UI elements like buttons and menu items.
     */
    function showSourceEditor() {

      editor.windowManager.open( {
        // Dialog title displayed to the user.
        title: "HTML Editor",

        // Dynamic width, defaulting to 600px if not specified in editor parameters.
        width: editor.getParam( "code_dialog_width", 600 ),

        // Dynamic height, defaulting to 500px if not specified in editor parameters.
        height: editor.getParam( "code_dialog_height", 500 ),

        // The URL to the HTML file that contains the editor interface.
        url: 'editor.html',

        // Configuration for the buttons displayed at the bottom of the dialog.
        buttons: [
          {
            // Text for the primary action button.
            text: 'Ok',
            // Designates this as the primary button for visual styling.
            subtype: 'primary',
            // Action to perform when clicked: close the dialog.
            onclick: 'close'
          },
          {
            // Text for the secondary action button.
            text: 'Close',
            // Action to perform when clicked: close the dialog.
            onclick: 'close'
          }
        ]
      } );
    }

    // Register an event handler for the editor's 'init' event.
    // This ensures the shortcut is added once the editor is fully initialized.
    editor.on( 'init', function() {
      // Add a keyboard shortcut to quickly open the source editor.
      editor.addShortcut( 'Ctrl+Alt+E', '', showSourceEditor );
    } );

    // Register a button for the TinyMCE toolbar.
    editor.addButton( 'code_emmet', {
      // Icon to display on the button.
      icon: 'code',
      // Tooltip text shown on hover.
      tooltip: 'HTML Editor',
      // Function to execute when the button is clicked.
      onclick: showSourceEditor
    } );

    // Register a menu item under the 'tools' context.
    editor.addMenuItem( 'code_emmet', {
      // Icon to display next to the menu item.
      icon: 'code',
      // Text for the menu item.
      text: 'HTML Editor',
      // Context in which the menu item should appear (e.g., 'tools', 'view').
      context: 'tools',
      // Function to execute when the menu item is clicked.
      onclick: showSourceEditor
    } );

  }
);