/*
 *  gollum.editor.js
 *
 *  A jQuery plugin for creating the Gollum Editor instance.
 *
 *  How to use:
 *  Simply call $.GollumEditor(); once the DOM is ready.
 *
 */
( function( $ ) {

  // Default configuration options for the editor.
  var DefaultOptions = {
    MarkupType      :   'markdown',  // Default markup language
    EditorMode      :   'code',      // Editor mode (e.g., 'code', 'wysiwyg')
    NewFile         :   false,       // Is this a new file being edited?
    HasFunctionBar  :   true,        // Does the editor have a function bar?
    Debug           :   false,       // Enable or disable debug output
    NoDefinitionsFor:   []           // Markup types for which no definitions exist
  };


  var ActiveOptions = {}; // Stores the currently active options, merged with defaults.




  /**
   *  $.GollumEditor
   *
   *  Initializes the Gollum Editor. No parameters are strictly required;
   *  it can be run directly on DOM ready.
   *
   *  @param {Object} IncomingOptions Optional: An object to override default options.
   */
  $.GollumEditor = function( IncomingOptions ) {

    // Merge default options with any provided incoming options.
    ActiveOptions = $.extend( DefaultOptions, IncomingOptions );
    debug( 'GollumEditor: Initializing and loading...' ); // Log initialization.


    // Check if the basic editor markup is present in the DOM.
    if ( EditorHas.baseEditorMarkup() ) {

      // If a title field is displayed (e.g., for new files).
      if ( EditorHas.titleDisplayed() ) {
        $( '#gollum-editor-title-field' ).addClass( 'active' ); // Mark title field as active.
      }


      // If the edit summary markup is available.
      if ( EditorHas.editSummaryMarkup() ) {
        // Add placeholder functionality to the edit summary input.
        $.GollumEditor.Placeholder.add( $( '#gollum-editor-edit-summary input' ) );

        // Attach a submit handler to the editor form.
        $( '#gollum-editor form[name="gollum-editor"]' ).submit( function( e ) {
          e.preventDefault(); // Prevent default form submission.
          $.GollumEditor.Placeholder.clearAll(); // Clear all placeholders before submission.
          debug( 'GollumEditor: Form is submitting.' ); // Log submission.
          $( this ).unbind( 'submit' ); // Unbind this handler to allow normal submission.
          $( this ).submit(); // Re-submit the form normally.
        } );
      }


      // If there are collapsible input sections (e.g., sidebar, footer).
      if ( EditorHas.collapsibleInputs() ) {
        // Attach click handlers to the toggle buttons for collapsible sections.
        $( '#gollum-editor .collapsed a.button, ' +
           '#gollum-editor .expanded a.button' ).click( function( e ) {
          e.preventDefault(); // Stop the default link behavior.
          $( this ).parent().toggleClass( 'expanded' ); // Toggle 'expanded' class on parent.
          $( this ).parent().toggleClass( 'collapsed' ); // Toggle 'collapsed' class on parent.
        } );
      }


      // If the editor has a preview button.
      if ( EditorHas.previewButton() ) {
        var formAction; // Declare a variable, though it's not used immediately.

        // Attach a click handler to the preview button.
        $( '#gollum-editor #gollum-editor-preview' ).click( function() {
          // Temporarily modify the form to submit to a new target window for preview.

          var oldAction = $( '#gollum-editor form' ).attr( 'action' ); // Store original form action.
          var $form = $( $( '#gollum-editor form' ).get( 0 ) ); // Get the form as a jQuery object.
          $form.attr( 'action', this.href || '/preview' ); // Set form action to preview URL.
          $form.attr( 'target', '_blank' ); // Open preview in a new tab/window.
          $form.submit(); // Submit the form for preview.


          // Restore the form's original attributes.
          $form.attr( 'action', oldAction ); // Revert action.
          $form.removeAttr( 'target' ); // Remove target attribute.
          return false; // Prevent default link behavior.
        } );
      } // End of preview button check.


      // Initialize the function bar by loading the appropriate language definitions.
      if ( EditorHas.functionBar() ) {

        var htmlSetMarkupLang =
          $( '#gollum-editor-body' ).attr( 'data-markup-lang' ); // Get markup language from data attribute.

        // If a markup language is specified in HTML, override the default.
        if ( htmlSetMarkupLang ) {
          ActiveOptions.MarkupType = htmlSetMarkupLang;
        }

        // Load the language definition based on the active markup type.
        LanguageDefinition.setActiveLanguage( ActiveOptions.MarkupType );

        // If a format selector is present, initialize it.
        if ( EditorHas.formatSelector() ) {
          FormatSelector.init(
            $( '#gollum-editor-format-selector select' ) ); // Initialize with the select element.
        }

        // If help sections are available, hide them initially and remove 'jaws' class.
        if ( EditorHas.help() ) {
          $( '#gollum-editor-help' ).hide(); // Hide the help section.
          $( '#gollum-editor-help' ).removeClass( 'jaws' ); // Remove 'jaws' class (accessibility-related?).
        }

      } // End of EditorHas.functionBar check.
      // Commented out closing tag for EditorHas.functionBar.
    } // End of EditorHas.baseEditorMarkup check.
    // Commented out closing tag for EditorHas.baseEditorMarkup.
  }; // End of $.GollumEditor function.



  /**
   *  $.GollumEditor.defineLanguage
   *
   *  Registers a set of language actions that Gollum can utilize.
   *  This is primarily used by the language definition files located in the 'langs/' directory.
   *
   *  @param {string} language_name  The unique name of the language (e.g., 'markdown', 'textile').
   *  @param {object} languageObject An object containing the definitions for this language.
   */
  $.GollumEditor.defineLanguage = function( language_name, languageObject ) {
    // Ensure the provided languageObject is indeed an object.
    if ( typeof languageObject == 'object' ) {
      LanguageDefinition.define( language_name, languageObject ); // Define the language.
    } else {
      debug( 'GollumEditor.defineLanguage: The definition for ' + language_name +
             ' is not a valid object.' ); // Log an error if not an object.
    }
  }; // End of $.GollumEditor.defineLanguage.


  /**
   *  debug
   *
   *  Outputs debug information to the browser's console.log.
   *  This function only operates if the `Debug` option is enabled in `ActiveOptions`.
   *
   *  @param  {*}  m  Any data type you wish to output to the console.
   *  @return {void}
   */
  var debug = function( m ) {
    // Check if debugging is enabled and if the console object exists.
    if ( ActiveOptions.Debug &&
         typeof console != 'undefined' ) {
      console.log( m ); // Print the message to the console.
    }
  }; // End of debug function.



  /**
   *  LanguageDefinition
   *
   *  Handles the management and loading of language definition files.
   *  These definitions are crucial for the editor's functionality.
   */
  var LanguageDefinition = {

    _ACTIVE_LANG: '',    // Stores the name of the currently active language.
    _LOADED_LANGS: [],   // An array of names of languages that have been loaded.
    _LANG: {},           // An object holding all loaded language definition objects, keyed by name.

    /**
     *  Defines a new language and stores its definition.
     *
     *  @param {string} name             The name of the language (e.g., 'markdown').
     *  @param {object} definitionObject The object containing the language's definitions.
     */
    define: function( name, definitionObject ) {
      LanguageDefinition._ACTIVE_LANG = name; // Set this language as the active one.
      LanguageDefinition._LOADED_LANGS.push( name ); // Add to the list of loaded languages.

      // If a global WikiLanguage object exists, extend the definition with it.
      if ( typeof $.GollumEditor.WikiLanguage == 'object' ) {
        var definition = {}; // Create an empty object for merging.
        $.extend( definition, $.GollumEditor.WikiLanguage, definitionObject ); // Merge WikiLanguage and specific definition.
        LanguageDefinition._LANG[name] = definition; // Store the merged definition.
      } else {
        LanguageDefinition._LANG[name] = definitionObject; // Store the definition directly.
      }
    },


    /**
     *  Retrieves the name of the currently active language.
     *
     *  @return {string} The name of the active language.
     */
    getActiveLanguage: function() {
      return LanguageDefinition._ACTIVE_LANG;
    },


    /**
     *  Sets the active language. If the language is not yet loaded, it attempts to load it.
     *
     *  @param {string} name The name of the language to set as active.
     */
    setActiveLanguage: function( name ) {
      // Check if the language definition is not already loaded.
      if ( !LanguageDefinition.isLoadedFor( name ) ) {
        LanguageDefinition._ACTIVE_LANG = null; // Temporarily unset active language.

        // Attempt to load the language definition asynchronously.
        LanguageDefinition.loadFor( name, function( xhr, t ) {
          // If loading fails.
          if ( t != 'success' ) {
            debug( 'LanguageDefinition: Failed to load language definition for ' + name );
            // Fallback: Define an empty object for the language to prevent further errors.
            LanguageDefinition.define( name, {} );
          }

          // Update features that depend on the language definition being loaded.
          if ( EditorHas.functionBar() ) {
            FunctionBar.refresh(); // Refresh the function bar buttons.
          }

          // If the language is valid and a format selector exists, update its selection.
          if ( LanguageDefinition.isValid() && EditorHas.formatSelector() ) {
            FormatSelector.updateSelected();
          }

        } ); // End of loadFor callback.
      } else {
        // If the language is already loaded, just set it as active and refresh the function bar.
        LanguageDefinition._ACTIVE_LANG = name;
        FunctionBar.refresh();
      }
    },


    /**
     *  Retrieves a specific definition object for a given attribute of a language.
     *
     *  @param  {string} attr           The attribute name (e.g., 'bold', 'italic').
     *  @param  {string} specified_lang Optional: The specific language to query.
     *                                   If not provided, the active language is used.
     *  @return {object|null} The definition object if found, otherwise null.
     */
    getDefinitionFor: function( attr, specified_lang ) {
      // Use the active language if no specific language is provided.
      if ( !specified_lang ) {
        specified_lang = LanguageDefinition._ACTIVE_LANG;
      }

      // Check if the language is loaded and the attribute exists and is an object.
      if ( LanguageDefinition.isLoadedFor( specified_lang ) &&
           LanguageDefinition._LANG[specified_lang][attr] &&
           typeof LanguageDefinition._LANG[specified_lang][attr] == 'object' ) {
        return LanguageDefinition._LANG[specified_lang][attr]; // Return the definition object.
      }

      return null; // Return null if the definition is not found.
    },


    /**
     *  loadFor
     *  Asynchronously loads a language definition file for the specified markup.
     *  These definition files are essential for the code editor's functionality.
     *
     *  @param  {string}   markup_name  The name of the markup language to load.
     *  @param  {function} on_complete  A callback function to execute once loading is complete.
     *  @return {void}
     */
    loadFor: function( markup_name, on_complete ) {
      // First, check the definition blacklist to prevent loading non-existent files.
      if ( ActiveOptions.NoDefinitionsFor.length ) {
        for ( var i = 0; i < ActiveOptions.NoDefinitionsFor.length; i++ ) {
          if ( markup_name == ActiveOptions.NoDefinitionsFor[i] ) {
            // If the markup is blacklisted, call the complete callback with an error status.
            if ( typeof on_complete == 'function' ) {
              on_complete( null, 'error' );
              return; // Exit the function.
            }
          }
        }
      }

      // Attempt to load the language definition script.
      var script_uri = '/assets/langs/' + markup_name + '.js'; // Construct the script URI.
      $.ajax( {
                url: script_uri,       // URL of the script.
                dataType: 'script',    // Expect a JavaScript file.
                complete: function( xhr, textStatus ) {
                  // Execute the provided callback function upon completion.
                  if ( typeof on_complete == 'function' ) {
                    on_complete( xhr, textStatus );
                  }
                }
            } );
    },


    /**
     *  isLoadedFor
     *  Determines if a definition file has already been loaded for a given markup language.
     *
     *  @param  {string}  markup_name  The name of the markup language to check.
     *  @return {boolean} True if the language is loaded, false otherwise.
     */
    isLoadedFor: function( markup_name ) {
      // If no languages have been loaded yet, return false immediately.
      if ( LanguageDefinition._LOADED_LANGS.length === 0 ) {
        return false;
      }

      // Iterate through the list of loaded languages.
      for ( var i = 0; i < LanguageDefinition._LOADED_LANGS.length; i++ ) {
        if ( LanguageDefinition._LOADED_LANGS[i] == markup_name ) {
          return true; // Found a match, language is loaded.
        }
      }
      return false; // No match found, language is not loaded.
    },

    /**
     *  isValid
     *  Checks if the currently active language definition is valid.
     *
     *  @return {boolean} True if the active language is set and its definition is an object.
     */
    isValid: function() {
      return ( LanguageDefinition._ACTIVE_LANG &&
               typeof LanguageDefinition._LANG[LanguageDefinition._ACTIVE_LANG] ==
               'object' );
    }

  }; // End of LanguageDefinition object.


  /**
   *  EditorHas
   *
   *  A collection of utility functions to check for the presence and operational status
   *  of various features within the Gollum Editor.
   */
  var EditorHas = {


    /**
     *  EditorHas.baseEditorMarkup
     *  Checks if the fundamental HTML structure for the editor is present.
     *
     *  @return {boolean} True if both '#gollum-editor' and '#gollum-editor-body' elements exist.
     */
    baseEditorMarkup: function() {
      return ( $( '#gollum-editor' ).length &&
               $( '#gollum-editor-body' ).length );
    },


    /**
     *  EditorHas.collapsibleInputs
     *  Determines if the editor contains any collapsible input sections.
     *  These are typically used for areas like sidebars or footers.
     *
     *  @return {boolean} True if any elements with '.collapsed' or '.expanded' classes within
     *                     '#gollum-editor' are found.
     */
    collapsibleInputs: function() {
      return $( '#gollum-editor .collapsed, #gollum-editor .expanded' ).length;
    },


    /**
     *  EditorHas.formatSelector
     *  Checks for the presence of a format selector, which allows users to switch
     *  between different markup language types (e.g., Markdown, Textile).
     *
     *  @return {boolean} True if a 'select' element within '#gollum-editor-format-selector' exists.
     */
    formatSelector: function() {
      return $( '#gollum-editor-format-selector select' ).length;
    },


    /**
     *  EditorHas.functionBar
     *  Verifies if the Function Bar markup is present and enabled by options.
     *
     *  @return {boolean} True if 'HasFunctionBar' is true in ActiveOptions and
     *                     '#gollum-editor-function-bar' exists.
     */
    functionBar: function() {
      return ( ActiveOptions.HasFunctionBar &&
               $( '#gollum-editor-function-bar' ).length );
    },


    /**
     *  EditorHas.ff4Environment
     *  Detects if the user's browser is a Firefox 4.0 Beta environment.
     *  (This might be an older check, potentially for specific browser quirks.)
     *
     *  @return {boolean} True if the user agent string matches "Firefox/4.0b".
     */
    ff4Environment: function() {
      var ua = new RegExp( /Firefox\/4.0b/ ); // Regular expression to match.
      return ( ua.test( navigator.userAgent ) ); // Test against the user agent string.
    },


    /**
     *  EditorHas.editSummaryMarkup
     *  Checks if the editor includes a summary field, commonly used for commit messages
     *  in systems like Gollum.
     *
     *  @return {boolean} True if an input field with the ID 'gollum-editor-message-field' exists.
     */
    editSummaryMarkup: function() {
      return ( $( 'input#gollum-editor-message-field' ).length > 0 );
    },


    /**
     *  EditorHas.help
     *  Determines if the editor contains the inline help sections.
     *
     *  @return {boolean} True if both '#gollum-editor #gollum-editor-help' and
     *                     '#gollum-editor #function-help' elements are present.
     */
    help: function() {
      return ( $( '#gollum-editor #gollum-editor-help' ).length &&
               $( '#gollum-editor #function-help' ).length );
    },


    /**
     *  EditorHas.previewButton
     *  Checks for the existence of a preview button within the editor interface.
     *
     *  @return {boolean} True if an element with the ID 'gollum-editor-preview' inside
     *                     '#gollum-editor' exists.
     */
    previewButton: function() {
      return ( $( '#gollum-editor #gollum-editor-preview' ).length );
    },


    /**
     *  EditorHas.titleDisplayed
     *  Indicates whether a title field is currently being displayed in the editor.
     *  This is typically true when editing a new file.
     *
     *  @return {boolean} True if 'NewFile' is set to true in ActiveOptions.
     */
    titleDisplayed: function() {
      return ( ActiveOptions.NewFile );
    }

  }; // End of EditorHas object.


  /**
   *  FunctionBar
   *
   *  Encapsulates functionality related to the editor's function bar,
   *  which contains buttons for various text formatting actions.
   */
  var FunctionBar = {

      isActive: false, // Tracks whether the function bar is currently active.


      /**
       *  FunctionBar.activate
       *  Activates the function bar, attaching click event handlers to its buttons
       *  and making the bar visible and interactive.
       *
       */
      activate: function() {
        debug( 'FunctionBar: Activating function bar.' ); // Log activation.

        // Iterate through all function buttons in the bar.
        $( '#gollum-editor-function-bar a.function-button' ).each( function() {
          // Check if a language definition exists for this button's ID.
          if ( LanguageDefinition.getDefinitionFor( $( this ).attr( 'id' ) ) ) {
            $( this ).click( FunctionBar.evtFunctionButtonClick ); // Attach click handler.
            $( this ).removeClass( 'disabled' ); // Enable the button.
          }
          // If no definition exists and it's not the 'function-help' button, disable it.
          else if ( $( this ).attr( 'id' ) != 'function-help' ) {
            $( this ).addClass( 'disabled' ); // Disable the button.
          }
        } );

        // Add 'active' class to the function bar to visually indicate its state.
        $( '#gollum-editor-function-bar' ).addClass( 'active' );
        FunctionBar.isActive = true; // Set internal flag to true.
      },


      /**
       *  FunctionBar.deactivate
       *  Deactivates the function bar, removing all click event handlers
       *  and visually marking it as inactive.
       */
      deactivate: function() {
        $( '#gollum-editor-function-bar a.function-button' ).unbind( 'click' ); // Remove click handlers.
        $( '#gollum-editor-function-bar' ).removeClass( 'active' ); // Remove 'active' class.
        FunctionBar.isActive = false; // Set internal flag to false.
      },


      /**
       *  FunctionBar.evtFunctionButtonClick
       *  Event handler for clicks on function buttons. It prevents the default
       *  action and executes the corresponding language-specific action.
       *
       *  @param {jQuery.Event} e The jQuery event object for the click event.
       */
      evtFunctionButtonClick: function( e ) {
        e.preventDefault(); // Prevent the default action (e.g., navigating to #).
        // Get the language definition for the clicked button's ID.
        var def = LanguageDefinition.getDefinitionFor( $( this ).attr( 'id' ) );
        if ( typeof def == 'object' ) {
          FunctionBar.executeAction( def ); // Execute the defined action.
        }
      },


      /**
       *  FunctionBar.executeAction
       *  Executes a language-specific action based on the provided definition object.
       *  This involves retrieving selected text, applying transformations, and updating the editor.
       *
       *  @param {object} definitionObject The definition object for the action to be executed.
       */
      executeAction: function( definitionObject ) {
        // Get the entire text content from the editor body textarea.
        var txt = $( '#gollum-editor-body' ).val();
        // Note: The comment 'hmm, I'm not sure this will work in a textarea' indicates a potential concern.
        var selPos = FunctionBar
                      .getFieldSelectionPosition( $( '#gollum-editor-body' ) ); // Get selection start/end.
        var selText = FunctionBar.getFieldSelection( $( '#gollum-editor-body' ) ); // Get the selected text.
        var repText = selText; // Initialize replacement text with selected text.
        var reselect = true; // Flag to indicate if text should be re-selected after replacement.
        var cursor = null; // Variable to store new cursor position.

        // If a custom 'exec' function is defined, run it directly.
        if ( definitionObject.exec &&
             typeof definitionObject.exec == 'function' ) {
          definitionObject.exec( txt, selText, $( '#gollum-editor-body' ) ); // Call the exec function.
          return; // Exit, as exec function handles everything.
        }

        // If 'search' and 'replace' properties exist, perform a search/replace operation.
        var searchExp = /([^\n]+)/gi; // Default search expression: matches non-newline characters.
        if ( definitionObject.search &&
             typeof definitionObject.search == 'object' ) {
          debug( 'FunctionBar: Replacing default search Regex.' ); // Log regex replacement.
          searchExp = null; // Clear default regex.
          searchExp = new RegExp( definitionObject.search ); // Create new regex from definition.
          debug( searchExp ); // Log the new regex.
        }
        debug( 'FunctionBar: repText is "' + repText + '"' ); // Log the initial replacement text.

        // Perform the text replacement if 'replace' is defined.
        if ( definitionObject.replace &&
             typeof definitionObject.replace == 'string' ) {
          debug( 'FunctionBar: Running replacement - using "' + definitionObject.replace + '"' ); // Log replacement string.
          var rt = definitionObject.replace; // Store replacement string.
          repText = repText.replace( searchExp, rt ); // Apply the replacement.
          // Remove any remaining backreferences (e.g., $1, $2) from the replaced text.
          repText = repText.replace( /\$[\d]/g, '' );