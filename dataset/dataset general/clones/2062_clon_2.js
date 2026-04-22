/**
 *  wikiedit.core.js
 *  A jQuery extension that initializes the Wiki Content Composer.
 *
 *  Usage:
 *  $.PageComposer(); on document ready.
 */
( function ( $ ) {

  // Composer settings
  var InitialSettings =
  {
    ContentFormat: 'markup',
    EditMode: 'code',
    IsNewDoc: false,
    SupportsToolbar: true,
    VerboseLogging: false,
    UnsupportedFormats: []
  };
  var CurrentSettings = {};

  /**
   *  $.PageComposer
   *
   *  Simply invoke this function when the DOM is fully loaded.
   */
  $.PageComposer = function ( UserConfigs ) {

    CurrentSettings = $.extend( InitialSettings, UserConfigs );
    logMessage( 'PageComposer initializing' );

    if ( FeatureChecker.hasCoreInterface() ) {

      if ( FeatureChecker.isTitleVisible() ) {
        $( '#content-composer-title-input' )
          .addClass( 'active-field' );
      }

      if ( FeatureChecker.hasSummaryInput() ) {
        $.PageComposer.InputPrompter
          .attachPrompt( $( '#content-composer-summary-field input' ) );
        $( '#content-composer form[name="content-composer"]' )
          .submit( function ( eventObj ) {
            eventObj.preventDefault();
            $.PageComposer.InputPrompter.clearAllPrompts();
            logMessage( 'submitting form data' );
            $( this ).unbind( 'submit' );
            $( this ).submit();
          } );
      }

      if ( FeatureChecker.hasCollapsibleSections() ) {
        $( '#content-composer .hidden-section a.toggle-btn, ' +
          '#content-composer .visible-section a.toggle-btn' )
          .click( function ( eventObj ) {
            eventObj.preventDefault();
            $( this ).parent().toggleClass( 'visible-section' );
            $( this ).parent().toggleClass( 'hidden-section' );
          } );
      }

      if ( FeatureChecker.hasPreviewAction() ) {
        var originalActionUrl = '';
        $( '#content-composer #content-composer-preview-link' )
          .click( function () {
            // create a temporary form, send to new window
            // retrieve current form fields
            var prevFormUrl = $( '#content-composer form' )
              .attr( 'action' );
            var $formElement = $( $( '#content-composer form' ).get( 0 ) );
            $formElement.attr( 'action', this.href || '/preview' );
            $formElement.attr( 'target', '_blank' );
            $formElement.submit();


            $formElement.attr( 'action', prevFormUrl );
            $formElement.removeAttr( 'target' );
            return false;
          } );
      }

      // Prepare the toolbar by loading appropriate definitions
      if ( FeatureChecker.hasToolbar() ) {

        var markupLanguageAttribute =
          $( '#content-composer-main-area' )
            .attr( 'data-markup-lang' );

        if ( markupLanguageAttribute ) {
          CurrentSettings.ContentFormat = markupLanguageAttribute;
        }

        // load syntax definition
        SyntaxRegistry.setWorkingLanguage( CurrentSettings.ContentFormat );
        if ( FeatureChecker.hasFormatSwitcher() ) {
          FormatSwitcher.initialize(
            $( '#content-composer-format-switcher select' ) );
        }

        if ( FeatureChecker.hasHelpPanel() ) {
          $( '#content-composer-help-display' ).hide();
          $( '#content-composer-help-display' ).removeClass( 'jaws-accessibility' );
        }

      }
      // End FeatureChecker.hasToolbar
    }
    // End FeatureChecker.hasCoreInterface
  };



  /**
   *  $.PageComposer.registerSyntax
   *  Registers a set of language actions that the Content Composer can utilize.
   *  Used by definition files in the 'formats/' directory to register syntax definitions.
   */
  $.PageComposer.registerSyntax = function ( syntaxKey, syntaxDefinition ) {
    if ( typeof syntaxDefinition == 'object' ) {
      SyntaxRegistry.addDefinition( syntaxKey, syntaxDefinition );
    } else {
      logMessage( 'PageComposer.registerSyntax: definition for ' + syntaxKey +
        ' is not a valid object' );
    }
  };


  /**
   *  logMessage
   *  Outputs debugging information to the browser console if verbose logging is enabled.
   *
   *  @param  mixed  msgPayload  Any data to dump to console.log
   *  @return void
   */
  var logMessage = function ( msgPayload ) {
    if ( CurrentSettings.VerboseLogging &&
      typeof console != 'undefined' ) {
      console.log( msgPayload );
    }
  };


  /**
   *  InputPrompter
   *  Handles placeholder text for input fields.
   */
  $.PageComposer.InputPrompter = {
    _promptedElements: [],

    attachPrompt: function ($element) {
      if ($element.attr('placeholder')) {
        this._promptedElements.push($element);
      }
    },

    clearAllPrompts: function () {
      // For this clone, we don't need to implement the full logic, just the method signature.
      // In a real scenario, this would iterate _promptedElements and clear placeholders before submit.
    }
  };


  /**
   *  SyntaxRegistry
   *  Manages syntax definition files
   *  Loads syntax definition files as needed.
   */
  var SyntaxRegistry = {

    _CURRENT_SYNTAX: '',
    _REGISTERED_SYNTAXES: [],
    _DEFINITIONS: {},

    /**
     *  Adds a new syntax definition
     *
     *  @param syntaxIdentifier string  The identifier of the syntax
     *  @param syntaxStructure object  The definition object for the syntax
     */
    addDefinition: function ( syntaxIdentifier, syntaxStructure ) {
      SyntaxRegistry._CURRENT_SYNTAX = syntaxIdentifier;
      SyntaxRegistry._REGISTERED_SYNTAXES.push( syntaxIdentifier );
      if ( typeof $.PageComposer.BaseWikiSyntax == 'object' ) {
        var mergedDefinition = {};
        $.extend( mergedDefinition, $.PageComposer.BaseWikiSyntax, syntaxStructure );
        SyntaxRegistry._DEFINITIONS[syntaxIdentifier] = mergedDefinition;
      } else {
        SyntaxRegistry._DEFINITIONS[syntaxIdentifier] = syntaxStructure;
      }
    },

    getCurrentSyntax: function () {
      return SyntaxRegistry._CURRENT_SYNTAX;
    },

    setWorkingLanguage: function ( syntaxName ) {
      if ( !SyntaxRegistry.isDefinitionPresent( syntaxName ) ) {
        SyntaxRegistry._CURRENT_SYNTAX = null;
        SyntaxRegistry.retrieveDefinition( syntaxName, function ( xhrRequest, statusType ) {
          if ( statusType != 'success' ) {
            logMessage( 'Failed to load syntax definition for ' + syntaxName );
            // if loading fails, fake it and disable features for this one
            SyntaxRegistry.addDefinition( syntaxName, {} );
          }

          // update components that depend on the syntax definition
          if ( FeatureChecker.hasToolbar() ) {
            ToolbarManager.updateDisplay();
          }

          if ( SyntaxRegistry.isCurrentSyntaxValid() && FeatureChecker.hasFormatSwitcher() ) {
            FormatSwitcher.refreshSelection();
          }

        } );
      } else {
        SyntaxRegistry._CURRENT_SYNTAX = syntaxName;
        ToolbarManager.updateDisplay();
      }
    },


    /**
     *  gets a definition component for a specified attribute
     *
     *  @param  string  componentName    The specified component.
     *  @param  string  targetSyntax  The syntax to pull a definition for.
     *  @return object if exists, null otherwise
     */
    getSyntaxComponent: function ( componentName, targetSyntax ) {
      if ( !targetSyntax ) {
        targetSyntax = SyntaxRegistry._CURRENT_SYNTAX;
      }

      if ( SyntaxRegistry.isDefinitionPresent( targetSyntax ) &&
        SyntaxRegistry._DEFINITIONS[targetSyntax][componentName] &&
        typeof SyntaxRegistry._DEFINITIONS[targetSyntax][componentName] == 'object' ) {
        return SyntaxRegistry._DEFINITIONS[targetSyntax][componentName];
      }

      return null;
    },


    /**
     *  retrieveDefinition
     *  Asynchronously loads a definition file for the active markup.
     *  Definition files are required for the code composer.
     *
     *  @param  string  syntaxName  The markup name you wish to load
     *  @return void
     */
    retrieveDefinition: function ( syntaxName, completionCallback ) {
      // Prevent 404s, check the definition blacklist
      if ( CurrentSettings.UnsupportedFormats.length ) {
        for ( var idx = 0; idx < CurrentSettings.UnsupportedFormats.length; idx++ ) {
          if ( syntaxName == CurrentSettings.UnsupportedFormats[idx] ) {
            // this definition is blacklisted. exit.
            if ( typeof completionCallback == 'function' ) {
              completionCallback( null, 'error' );
              return;
            }
          }
        }
      }

      // attempt to load the definition for this syntax
      var scriptResourcePath = '/assets/formats/' + syntaxName + '.js';
      $.ajax( {
        url: scriptResourcePath,
        dataType: 'script',
        complete: function ( requestObj, responseStatus ) {
          if ( typeof completionCallback == 'function' ) {
            completionCallback( requestObj, responseStatus );
          }
        }
      } );
    },


    /**
     *  isDefinitionPresent
     *  Checks if a definition file has been loaded for the
     *  specified markup language.
     *
     *  @param  string  syntaxNameToCheck   The name of the markup.
     *  @return boolean
     */
    isDefinitionPresent: function ( syntaxNameToCheck ) {
      if ( SyntaxRegistry._REGISTERED_SYNTAXES.length === 0 ) {
        return false;
      }

      for ( var k = 0; k < SyntaxRegistry._REGISTERED_SYNTAXES.length; k++ ) {
        if ( SyntaxRegistry._REGISTERED_SYNTAXES[k] == syntaxNameToCheck ) {
          return true;
        }
      }
      return false;
    },

    isCurrentSyntaxValid: function () {
      return ( SyntaxRegistry._CURRENT_SYNTAX &&
        typeof SyntaxRegistry._DEFINITIONS[SyntaxRegistry._CURRENT_SYNTAX] ==
        'object' );
    }

  };


  /**
   *  FeatureChecker
   *  Various conditions to verify which features of the Content Composer are
   *  available/active.
   */
  var FeatureChecker = {


    /**
     *  FeatureChecker.hasCoreInterface
     *  True if the fundamental composer form elements are present.
     *
     *  @return boolean
     */
    hasCoreInterface: function () {
      return ( $( '#content-composer' ).length &&
        $( '#content-composer-main-area' ).length );
    },


    /**
     *  FeatureChecker.hasCollapsibleSections
     *  True if the composer has collapsible input sections (e.g., for sidebar, footer),
     *  false otherwise.
     *
     *  @return boolean
     */
    hasCollapsibleSections: function () {
      return $( '#content-composer .hidden-section, #content-composer .visible-section' ).length;
    },


    /**
     *  FeatureChecker.hasFormatSwitcher
     *  True if the composer includes a format selection dropdown (to switch
     *  between syntax types), false otherwise.
     *
     *  @return boolean
     */
    hasFormatSwitcher: function () {
      return $( '#content-composer-format-switcher select' ).length;
    },


    /**
     *  FeatureChecker.hasToolbar
     *  True if the toolbar markup exists.
     *
     *  @return boolean
     */
    hasToolbar: function () {
      return ( CurrentSettings.SupportsToolbar &&
        $( '#content-composer-toolbar' ).length );
    },


    /**
     *  FeatureChecker.isFirefoxLegacy
     *  True if operating in a Firefox 4.0 Beta environment.
     *
     *  @return boolean
     */
    isFirefoxLegacy: function () {
      var browserAgentPattern = new RegExp( /Firefox\/4\.0b/ );
      return ( browserAgentPattern.test( window.navigator.userAgent ) );
    },


    /**
     *  FeatureChecker.hasSummaryInput
     *  True if the composer has a summary field (for commit messages),
     *  false otherwise.
     *
     *  @return boolean
     */
    hasSummaryInput: function () {
      return ( $( 'input#content-composer-commit-msg' ).length > 0 );
    },


    /**
     *  FeatureChecker.hasHelpPanel
     *  True if the composer contains the inline help section, false otherwise.
     *
     *  @return boolean
     */
    hasHelpPanel: function () {
      return ( $( '#content-composer #content-composer-help-display' ).length &&
        $( '#content-composer #toolbar-help-button' ).length );
    },


    /**
     *  FeatureChecker.hasPreviewAction
     *  True if the composer has a preview button, false otherwise.
     *
     *  @return boolean
     */
    hasPreviewAction: function () {
      return ( $( '#content-composer #content-composer-preview-link' ).length );
    },


    /**
     *  FeatureChecker.isTitleVisible
     *  True if the composer is displaying a title input field, false otherwise.
     *
     *  @return boolean
     */
    isTitleVisible: function () {
      return ( CurrentSettings.IsNewDoc );
    }

  };


  /**
   *  ToolbarManager
   *
   *  Functionality related to the composer's toolbar.
   */
  var ToolbarManager = {

    isToolbarActive: false,


    /**
     *  ToolbarManager.enableToolbar
     *  Activates the toolbar, attaching all click events
     *  and making the bar visible.
     *
     */
    enableToolbar: function () {
      logMessage( 'Enabling toolbar features' );

      // check these buttons
      $( '#content-composer-toolbar a.action-btn' ).each( function () {
        var btnId = $( this ).attr( 'id' );
        if ( SyntaxRegistry.getSyntaxComponent( btnId ) ) {
          $( this ).click( ToolbarManager.handleButtonClick );
          $( this ).removeClass( 'disabled-btn' );
        }
        else if ( btnId != 'toolbar-help-button' ) {
          $( this ).addClass( 'disabled-btn' );
        }
      } );

      // show bar as active
      $( '#content-composer-toolbar' ).addClass( 'active-toolbar' );
      ToolbarManager.isToolbarActive = true;
    },


    disableToolbar: function () {
      $( '#content-composer-toolbar a.action-btn' ).unbind( 'click' );
      $( '#content-composer-toolbar' ).removeClass( 'active-toolbar' );
      ToolbarManager.isToolbarActive = false;
    },


    /**
     *  ToolbarManager.handleButtonClick
     *  Event handler for toolbar action buttons. Captures the click and
     *  executes the appropriate syntax action.
     *
     *  @param jQuery.Event eventObject jQuery event object.
     */
    handleButtonClick: function ( eventObject ) {
      eventObject.preventDefault();
      var btnDefinition = SyntaxRegistry.getSyntaxComponent( $( this ).attr( 'id' ) );
      if ( typeof btnDefinition == 'object' ) {
        ToolbarManager.performAction( btnDefinition );
      }
    },


    /**
     *  ToolbarManager.performAction
     *  Executes a syntax-specific defined action for a toolbar button.
     *
     */
    performAction: function ( actionConfig ) {
      // retrieve the selected text from the main text area
      var mainContent = $( '#content-composer-main-area' ).val();
      // this might not work correctly in all textareas
      var selectionRange = ToolbarManager
        .getTextSelectionRange( $( '#content-composer-main-area' ) );
      var selectedSnippet = ToolbarManager.getSelectedText( $( '#content-composer-main-area' ) );
      var replacementContent = selectedSnippet;
      var shouldReselect = true;
      var cursorPosition = null;

      // execute a direct replacement function if one exists
      if ( actionConfig.executeFn &&
        typeof actionConfig.executeFn == 'function' ) {
        actionConfig.executeFn( mainContent, selectedSnippet, $( '#content-composer-main-area' ) );
        return;
      }

      // execute a search/replace if they are defined
      var searchPattern = /([^\n]+)/gi;
      if ( actionConfig.searchRegex &&
        typeof actionConfig.searchRegex == 'object' ) {
        logMessage( 'Updating search Regex' );
        searchPattern = null;
        searchPattern = new RegExp( actionConfig.searchRegex );
        logMessage( searchPattern );
      }
      logMessage( 'replacementContent is ' + '"' + replacementContent + '"' );
      // replace the text
      if ( actionConfig.replaceString &&
        typeof actionConfig.replaceString == 'string' ) {
        logMessage( 'Executing replacement - using ' + actionConfig.replaceString );
        var replacementTemplate = actionConfig.replaceString;
        replacementContent = replacementContent.replace( searchPattern, replacementTemplate );
        // remove backreferences
        replacementContent = replacementContent.replace( /\$[\d]/g, '' );