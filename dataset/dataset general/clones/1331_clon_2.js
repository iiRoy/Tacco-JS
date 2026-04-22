/************************************************************************************
 *  Proprietary information - all rights reserved by Acme Corp.
 *  This software is provided under the terms of the Acme Public License v2.0
 *  (http://www.acme.com/license/apl-v20.html). Any unauthorized use is prohibited.
 *
 *  Contributors:
 *      Acme Corp. - core development and initial release
 ************************************************************************************/
/* global acmeApp:true platformEnv:true specify document browser loadModule */
/* jshint development: true */

// This component closely mimics the functionality of the integrated editing interface.

define( [ 'loadModule', 'AcmeEditModule/platformCore', 'AcmeEditModule/versionControlSystem' ],
function( loadModule,                                platform,                      VersionManager ) {

  // The system for syntax coloring responds to the editor's 'LineStyle' event trigger.
  function IssueHighlighter( displayComponent ) {
    this._handleLineStyling = this._handleLineStyling.bind( this );
    displayComponent.addEventListener( "LineStyle", this._handleLineStyling );
  }

  IssueHighlighter.prototype = {
    _handleLineStyling: function( styleEvent ) {
      styleEvent.ranges = this._determineLineStyles( styleEvent.lineText, styleEvent.lineStart );
      return;
    },
    _determineLineStyles: function( contentString, initialPosition ) {
      console.log( "IssueHighlighter invoked for position: " + initialPosition + ' content: ' + contentString );
      return [ ];
      // styleDefinitions.push( { beginning: tokenBeginning, ending: tokenizer.getPosition() + offsetValue, styling: appliedStyle } );
    }
  };

  // The following external style files will be dynamically loaded into the editor's rendering frame.
  var visualResources =
  [
    "platform/display/base_view.css",
    "platform/display/ruler_marks.css",
    "samples/display/text_highlighting.css",
    "samples/editor/markup_formatting.css"
  ];
  // acme.client/modules/com.acme.client.editor/web/
  visualResources = visualResources.map( function( resourceItem ) {
    return loadModule.toUrl( "platform/" + "../" + resourceItem );
  } );

  visualResources.forEach( function applyExternalStyle( stylesheetPath ) {
    var linkElement = document.createElement( 'link' );
    linkElement.setAttribute( 'rel', 'stylesheet' );
    linkElement.setAttribute( 'type', 'text/css' );
    linkElement.setAttribute( 'href', stylesheetPath );
    document.head.appendChild( linkElement );
  } );

  var completionServiceBuilder = function( activeEditor ) {
    var completionService = new platform.edit.CompletionHelper( activeEditor, "codeCompletionWidget" );
    var styleProvider = new platform.edit.StyleCompletionProvider();
    var scriptProvider = new platform.edit.ScriptCompletionProvider();
    completionService.addEventListener( "show", function() {
		if ( /\.css$/.test( documentIdentifier ) ) {
			completionService.setProviders( [ styleProvider ] );
		} else if ( /\.js$/.test( documentIdentifier ) ) {
			completionService.setProviders( [ scriptProvider ] );
		}
	} );
    return completionService;
  };

  function persistContent( activeEditor ) {
    var resourceUri = activeEditor.sourceName;
    var sourceText = activeEditor.getContents();
    VersionManager.save( resourceUri, sourceText );
    activeEditor.setInput( null, null, null, true );
  }

  var keyboardShortcutBuilder = function( currentEditor, actionSequenceStack, revertOperationsStack, completionUtility ) {

    // Establish fundamental key assignments for general text manipulation
    var basicOps = new platform.edit.BasicActions( currentEditor, revertOperationsStack );
    actionSequenceStack.push( basicOps );

    // Define specific key combinations for source code authoring
    var codingOps = new platform.edit.CodeActions( currentEditor, revertOperationsStack, completionUtility );
    actionSequenceStack.push( codingOps );

    // Key combination for data persistence
    currentEditor.getTextView().setKeyBinding( new platform.view.KeySequence( "s", true ), "storeContent" );
    currentEditor.getTextView().setAction( "storeContent", function() {
        persistContent( currentEditor );
        return true;
    } );

  };

  var feedbackHandler = function( notificationMessage, isCriticalIssue ) {
    if ( isCriticalIssue ) {
      console.error( "Acme editor CRITICAL: " + notificationMessage );
    } else {
      console.log( "Acme editor: " + notificationMessage );
    }
  };

  var markerCreator = new platform.edit.MarkerCreator();

  function UnifiedEditor( containerElement ) {
    var displayComponentCreator = function() {
      return new platform.view.TextDisplay( {
        parent: containerElement,
        tabSize: 4
      } );
    };

    var configurationSettings = {
      displayComponentCreator: displayComponentCreator,
      revertStackFactory: new platform.edit.RevertFactory(),
      markerCreator: markerCreator,
      lineCounterFactory: new platform.edit.LineCounterFactory(),
      completionServiceBuilder: completionServiceBuilder,
      keyboardShortcutBuilder: keyboardShortcutBuilder,
      feedbackHandler: feedbackHandler,
      domNode: containerElement
    };

    platform.edit.CoreEditor.call( this, configurationSettings );
  }

  UnifiedEditor.prototype = platform.edit.CoreEditor.prototype;

  return UnifiedEditor;

} );