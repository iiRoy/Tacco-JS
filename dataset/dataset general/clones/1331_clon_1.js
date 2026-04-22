/*******************************************************************************
 * This is a Type I clone of the original file.
 * Copyright (c) 2010, 2011 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *     This cloned version was generated for demonstration purposes.
 *******************************************************************************/
/*global eclipse:true orion:true define document window require*/
/*jslint devel:true, browser:true, forin:true*/


// This module provides the Orion Editor functionality,
// based on the embedded editor code example.

define ( [ 'require' , 'OrionEditorEmbedded/orionAssembly' , 'OrionEditorEmbedded/revisionByOrion' ] , 
function ( require, orion, RevisionControl ) {


  // The ErrorStyler handles syntax highlighting based on editor events.
  function ErrorStyler ( view ) {
    // Bind the event listener to the current instance.
    this._onLineStyle = this._onLineStyle.bind ( this ) ;
    
    // Attach the listener to the view's "LineStyle" event.
    view.addEventListener ( "LineStyle" , this._onLineStyle ) ;
  }
  
  
  ErrorStyler.prototype = {
    // This method is called when a line style event occurs.
    _onLineStyle : function ( e ) {
      // Calculate and set the ranges for styling.
      e.ranges = this._getStyles ( e.lineText , e.lineStart ) ;
      
      // The function must return.
      return ;
    } ,
    
    // Internal helper to determine styles for a given line of text.
    _getStyles : function ( text , start ) {
      // For now, it just logs and returns an empty array.
      // In a real implementation, this would contain logic to parse the text
      // and return style objects, e.g., for syntax highlighting errors.
      console.log ( "ErrorStyler called with start: " + start + ' text:' + text ) ;
      
      return [ ] ;
      // Example of how styles might be pushed:
      // styles.push ( { start: tokenStart, end: scanner.getOffset() + offset, style: style } ) ;
    }
  } ;


  // Define the stylesheets that need to be loaded into the editor's iframe.
  // These paths are relative to the client bundle.
  var stylesheets = 
  [
    "orion/textview/textview.css" , 
    "orion/textview/rulers.css" , 
    "examples/textview/textstyler.css" , 
    "examples/editor/htmlStyles.css"
  ] ;
  
  // The base path for Orion client bundles is 'orion.client/bundles/org.eclipse.orion.client.editor/web/'.
  // We need to adjust the paths to be relative to the 'require' context.
  stylesheets = stylesheets.map ( 
    function ( sheet ) {
      return require.toUrl ( "orion/" + "../" + sheet ) ;
    }
  ) ;
    
  
  // Dynamically load each stylesheet into the document's head.
  stylesheets.forEach ( 
    function loadCSS ( sheetURL ) {
      var elt = document.createElement ( 'link' ) ;
      elt.setAttribute ( 'rel' , 'stylesheet' ) ;
      elt.setAttribute ( 'type' , 'text/css' ) ;
      elt.setAttribute ( 'href' , sheetURL ) ;
      document.head.appendChild ( elt ) ;
    }
  ) ;
    
  
  // Factory function for creating a content assist component.
  var contentAssistFactory = function ( editor ) {
    var contentAssist = new orion.editor.ContentAssist ( editor , "contentassist" ) ;
    
    // Providers for different content types.
    var cssContentAssistProvider = new orion.editor.CssContentAssistProvider ( ) ;
    var jsContentAssistProvider = new orion.editor.JavaScriptContentAssistProvider ( ) ;
    
    // Add an event listener to dynamically set providers based on the content type.
    contentAssist.addEventListener ( "show" , 
      function ( ) {
		    if ( /\.css$/.test ( contentName ) ) {
			    contentAssist.setProviders ( [ cssContentAssistProvider ] ) ;
		    } else if ( /\.js$/.test ( contentName ) ) {
			    contentAssist.setProviders ( [ jsContentAssistProvider ] ) ;
		    }
	    }
    ) ;
    
    return contentAssist ;
  } ;
  
  
  // Function to handle saving the editor's content.
  function save ( editor ) {
    var url = editor.sourceName ;
    var src = editor.getContents ( ) ;
    
    // Use the RevisionControl service to save the content.
    RevisionControl.save ( url , src ) ;
    
    // Mark the editor as clean (not dirty) after saving.
    editor.setInput ( null , null , null , true ) ;
  }
  
  
  // Factory function for setting up key bindings in the editor.
  var keyBindingFactory = function ( editor , keyModeStack , undoStack , contentAssist ) {
    
    // Create keybindings for generic text editing actions.
    var genericBindings = new orion.editor.TextActions ( editor , undoStack ) ;
    keyModeStack.push ( genericBindings ) ;
    
    // Create keybindings specifically for source code editing.
    var codeBindings = new orion.editor.SourceCodeActions ( editor , undoStack , contentAssist ) ;
    keyModeStack.push ( codeBindings ) ;
    
    // Add a custom key binding for saving (Ctrl+S or Cmd+S).
    editor.getTextView ( ).setKeyBinding ( new orion.textview.KeyBinding ( "s" , true ) , "save" ) ;
    
    // Define the action to be performed when the 'save' key binding is triggered.
    editor.getTextView ( ).setAction ( "save" , 
      function ( ) {
        save ( editor ) ; // Call our custom save function.
        return true ; // Indicate that the action was handled.
      }
    ) ;
    
  } ;
    
  
  // A simple status reporter function for logging messages from the editor.
  var statusReporter = function ( message , isError ) {
    if ( isError ) {
      console.error ( "Orion editor ERROR:" + message ) ;
    } else {
      console.log ( "Orion editor: " + message ) ;
    }
  } ;
  
  
  // Instantiate the annotation factory.
  var annotationFactory = new orion.editor.AnnotationFactory ( ) ;
  
  
  // The main OrionEditor constructor.
  function OrionEditor ( editorElement ) {
    // Factory for creating the TextView component.
    var textViewFactory = function ( ) {
      return new orion.textview.TextView ( {
        parent : editorElement ,
        tabSize : 2 // Set default tab size to 2 spaces.
      } ) ;
    } ;

    // Configuration object for the Orion Editor.
    var config = {
      textViewFactory : textViewFactory ,
      undoStackFactory : new orion.editor.UndoFactory ( ) ,
      annotationFactory : annotationFactory ,
      lineNumberRulerFactory : new orion.editor.LineNumberRulerFactory ( ) ,
      contentAssistFactory : contentAssistFactory ,
      keyBindingFactory : keyBindingFactory , 
      statusReporter : statusReporter ,
      domNode : editorElement // The DOM element where the editor will be rendered.
    } ;
    
    // Call the base Orion Editor constructor with the configuration.
    orion.editor.Editor.call ( this , config ) ;
  }

  // Inherit prototypes from the base Orion Editor.
  OrionEditor.prototype = orion.editor.Editor.prototype ;

  // Return the constructed OrionEditor class.
  return OrionEditor ;

} ) ;