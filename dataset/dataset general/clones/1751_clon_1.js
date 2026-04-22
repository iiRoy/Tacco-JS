// This file requires Markdown.Converter.js to function correctly.
// It's a key dependency for the Markdown editor.

( function ( ) {

  var util = { } ,
    position = { } ,
    ui = { } ,
    doc = window . document ,
    re = window . RegExp ,
    nav = window . navigator ,
    SETTINGS = {
      lineLength: 72
    } ,

  // User agent sniffing for browser compatibility workarounds.
  // This helps identify specific browser versions to apply fixes.
    uaSniffed = {
      isIE: /msie/ . test ( nav . userAgent . toLowerCase ( ) ) ,
      isIE_5or6: /msie 6/ . test ( nav . userAgent . toLowerCase ( ) ) || /msie 5/ . test ( nav . userAgent . toLowerCase ( ) ) ,
      isOpera: /opera/ . test ( nav . userAgent . toLowerCase ( ) )
    } ;


  // *******************************************************************
  //  CONFIGURATION SECTION: USER-MODIFIABLE SETTINGS
  //
  //  The following variables define default texts and titles for the
  //  Markdown editor's UI elements. Adjust these as needed for
  //  localization or custom behavior.
  // *******************************************************************

  var linkDialogText = "<p><b>Insert Hyperlink</b></p><p>http://example.com/ \"optional title\"</p>";
  var imageDialogText = "<p><b>Insert Image</b></p><p>http://example.com/images/diagram.jpg \"optional title\"<br><br>Need <a href='http://www.google.com/search?q=free+image+hosting' target='_blank'>free image hosting?</a></p>";

  // Default placeholder text for link and image input fields.
  var imageDefaultText = "http://";
  var linkDefaultText = "http://";

  // Tooltip for the help button.
  var defaultHelpHoverTitle = "Markdown Editing Help";

  // *******************************************************************
  //  END OF CONFIGURATION SECTION
  // *******************************************************************

  // The 'help' parameter, if provided, should contain:
  // - 'handler': The function to execute when the help button is clicked.
  // - 'title' (optional): The tooltip text for the help button. Defaults to 'defaultHelpHoverTitle'.
  // If 'help' is omitted, no help button will be rendered in the UI.
  //
  // The Markdown.Editor object provides the following public methods:
  // - getConverter(): Returns the Markdown converter instance used by this editor.
  // - run(): Initializes and starts the editor. This should be called once all necessary plugins have been registered. Subsequent calls are ignored.
  // - refreshPreview(): Manually triggers an update of the preview pane. This method is only available after run() has been invoked.
  Markdown . Editor = function ( markdownConverter , idPostfix , help ) {

    idPostfix = idPostfix || "" ;

    var hooks = this . hooks = new Markdown . HookCollection ( ) ;
    // Registering no-op hooks for extensibility.
    hooks . addNoop ( "onPreviewRefresh" ) ;       // Invoked after the preview content has been updated. No arguments.
    hooks . addNoop ( "postBlockquoteCreation" ) ; // Called after a blockquote has been created, with the user's selection. Expected to return the final text to be inserted.
    hooks . addFalse ( "insertImageDialog" ) ;     /* This hook is called with a single argument: a callback function.
                                                  * The callback expects the URL of the chosen image. If the application
                                                  * provides its own image insertion dialog, this hook should return 'true',
                                                  * and the callback must be invoked with the selected image URL (or 'null' if cancelled).
                                                  * If this hook returns 'false', the editor's default image dialog will be used.
                                                  */

    this . getConverter = function ( ) {
      return markdownConverter ;
    } ;

    var that = this ,
      panels ;

    this . run = function ( ) {
      // Prevent re-initialization if already running.
      if ( panels )
        return ; // Editor is already initialized.

      panels = new PanelCollection ( idPostfix ) ;
      var commandManager = new CommandManager ( hooks ) ;
      var previewManager = new PreviewManager ( markdownConverter , panels , function ( ) {
        hooks . onPreviewRefresh ( ) ;
      } ) ;
      var undoManager , uiManager ;

      // Initialize UndoManager unless explicitly disabled via URL parameter.
      if ( ! / \?noundo / . test ( doc . location . href ) ) {
        undoManager = new UndoManager ( function ( ) {
          previewManager . refresh ( ) ;
          if ( uiManager ) // uiManager might not be available during the very first call.
            uiManager . setUndoRedoButtonStates ( ) ;
        } , panels ) ;
      }

      uiManager = new UIManager ( idPostfix , panels , undoManager , previewManager , commandManager , help ) ;
      uiManager . setUndoRedoButtonStates ( ) ;

      // Assign the refresh function to the public interface.
      var forceRefresh = that . refreshPreview = function ( ) {
        previewManager . refresh ( true ) ;
      } ;

      // Perform an initial refresh of the preview.
      forceRefresh ( ) ;
    } ;

  } ;

  // Chunks object: Manages text segments (before, selection, after) within the editor.
  // 'before': Text preceding the current selection.
  // 'after': Text following the current selection.
  function Chunks ( ) {
    // Constructor for Chunks. No initial properties set here.
  }

  // Locates and extracts start/end tags from the before/selection/after regions.
  // startRegex: Regular expression to identify the start tag.
  // endRegex: Regular expression to identify the end tag.
  Chunks . prototype . findTags = function ( startRegex , endRegex ) {

    var chunkObj = this ;
    var regex ;

    if ( startRegex ) {

      regex = util . extendRegExp ( startRegex , "" , "$" ) ;

      this . before = this . before . replace ( regex ,
        function ( match ) {
          chunkObj . startTag = chunkObj . startTag + match ;
          return "" ;
        } ) ;

      regex = util . extendRegExp ( startRegex , "^" , "" ) ;

      this . selection = this . selection . replace ( regex ,
        function ( match ) {
          chunkObj . startTag = chunkObj . startTag + match ;
          return "" ;
        } ) ;
    }

    if ( endRegex ) {

      regex = util . extendRegExp ( endRegex , "" , "$" ) ;

      this . selection = this . selection . replace ( regex ,
        function ( match ) {
          chunkObj . endTag = match + chunkObj . endTag ;
          return "" ;
        } ) ;

      regex = util . extendRegExp ( endRegex , "^" , "" ) ;

      this . after = this . after . replace ( regex ,
        function ( match ) {
          chunkObj . endTag = match + chunkObj . endTag ;
          return "" ;
        } ) ;
    }
  } ;

  // Trims leading/trailing whitespace from the selection.
  // If 'remove' is false, whitespace is moved to 'before'/'after'.
  // If 'remove' is true, whitespace is discarded.
  Chunks . prototype . trimWhitespace = function ( remove ) {
    var beforeReplacer , afterReplacer , that = this ;
    if ( remove ) {
      beforeReplacer = afterReplacer = "" ;
    } else {
      beforeReplacer = function ( s ) {
        that . before += s ;
        return "" ;
      } ;
      afterReplacer = function ( s ) {
        that . after = s + that . after ;
        return "" ;
      } ;
    }

    this . selection = this . selection . replace ( /^(\s*)/ , beforeReplacer ) . replace ( /(\s*)$/ , afterReplacer ) ;
  } ;


  Chunks . prototype . skipLines = function ( nLinesBefore , nLinesAfter , findExtraNewlines ) {

    // Default values for line skipping.
    if ( nLinesBefore === undefined ) {
      nLinesBefore = 1 ;
    }

    if ( nLinesAfter === undefined ) {
      nLinesAfter = 1 ;
    }

    nLinesBefore ++ ;
    nLinesAfter ++ ;

    var regexText ;
    var replacementText ;

    // This is a workaround for a specific Chrome bug related to blockquotes.
    // Reference: http://meta.stackoverflow.com/questions/63307/blockquote-glitch-in-editor-in-chrome-6-and-7/65985#65985
    if ( navigator . userAgent . match ( /Chrome/ ) ) {
      "X" . match ( / ( ) . / ) ;
    }

    this . selection = this . selection . replace ( / ( ^ \n* ) / , "" ) ;

    this . startTag = this . startTag + re . $1 ;

    this . selection = this . selection . replace ( / ( \n* $ ) / , "" ) ;
    this . endTag = this . endTag + re . $1 ;
    this . startTag = this . startTag . replace ( / ( ^ \n* ) / , "" ) ;
    this . before = this . before + re . $1 ;
    this . endTag = this . endTag . replace ( / ( \n* $ ) / , "" ) ;
    this . after = this . after + re . $1 ;

    if ( this . before ) {

      regexText = replacementText = "" ;

      while ( nLinesBefore -- ) {
        regexText += "\\n?" ;
        replacementText += "\n" ;
      }

      if ( findExtraNewlines ) {
        regexText = "\\n*" ;
      }
      this . before = this . before . replace ( new re ( regexText + "$" , "" ) , replacementText ) ;
    }

    if ( this . after ) {

      regexText = replacementText = "" ;

      while ( nLinesAfter -- ) {
        regexText += "\\n?" ;
        replacementText += "\n" ;
      }
      if ( findExtraNewlines ) {
        regexText = "\\n*" ;
      }

      this . after = this . after . replace ( new re ( regexText , "" ) , replacementText ) ;
    }
  } ;

  // End of Chunks object definition.

  // PanelCollection: Gathers and caches references to key DOM elements of the editor.
  // This avoids repeated DOM traversals for performance.
  // It also contains special handling for IE's selection issues with CSS sprite buttons.
  // IE (versions 6, 7, 8) tends to lose textarea selection when a button is clicked.
  // The workaround involves caching the selection on 'mousedown' and restoring it if needed.
  // This issue is specific to button clicks in IE; keyboard shortcuts are unaffected.
  function PanelCollection ( postfix ) {
    this . buttonBar = doc . getElementById ( "wmd-button-bar" + postfix ) ;
    this . preview = doc . getElementById ( "wmd-preview" + postfix ) ;
    this . input = doc . getElementById ( "wmd-input" + postfix ) ;
    this . generatedHtml = doc . getElementById ( "wmd-html" + postfix ) ;
  }

  // Utility function: Checks if a DOM element is currently visible.
  // Visibility is determined by checking the 'display' CSS property.
  util . isVisible = function ( elem ) {

    if ( window . getComputedStyle ) {
      // Modern browsers use getComputedStyle.
      return window . getComputedStyle ( elem , null ) . getPropertyValue ( "display" ) !== "none" ;
    }
    else if ( elem . currentStyle ) {
      // IE-specific property for current style.
      return elem . currentStyle [ "display" ] !== "none" ;
    }
  } ;


  // Utility function: Attaches an event listener to a DOM element.
  // Cross-browser compatible for IE and other browsers.
  util . addEvent = function ( elem , event , listener ) {
    if ( elem . attachEvent ) {
      // For Internet Explorer, 'on' prefix is required.
      elem . attachEvent ( "on" + event , listener ) ;
    }
    else {
      // For other browsers using standard event model.
      elem . addEventListener ( event , listener , false ) ;
    }
  } ;


  // Utility function: Removes an event listener from a DOM element.
  // Provides cross-browser compatibility.
  util . removeEvent = function ( elem , event , listener ) {
    if ( elem . detachEvent ) {
      // IE-specific event detachment.
      elem . detachEvent ( "on" + event , listener ) ;
    }
    else {
      // Standard event detachment for other browsers.
      elem . removeEventListener ( event , listener , false ) ;
    }
  } ;

  // Utility function: Normalizes end-of-line characters in a string.
  // Converts Windows-style (\r\n) and classic Mac-style (\r) newlines to Unix-style (\n).
  util . fixEolChars = function ( text ) {
    text = text . replace ( / \r \n / g , "\n" ) ;
    text = text . replace ( / \r / g , "\n" ) ;
    return text ;
  } ;

  // Utility function: Extends a regular expression with prefixed and suffixed strings.
  // Creates a new RegExp object based on an existing one, adding 'pre' to the start
  // and 'post' to the end of its pattern. The original regex flags are preserved.
  // 'regex': The base RegExp object.
  // 'pre': String to prepend to the regex pattern.
  // 'post': String to append to the regex pattern.
  util . extendRegExp = function ( regex , pre , post ) {

    if ( pre === null || pre === undefined ) {
      pre = "" ;
    }
    if ( post === null || post === undefined ) {
      post = "" ;
    }

    var pattern = regex . toString ( ) ;
    var flags ;

    // Extract flags and remove them from the pattern string.
    pattern = pattern . replace ( / \/ ( [ gim ]* ) $ / , function ( wholeMatch , flagsPart ) {
      flags = flagsPart ;
      return "" ;
    } ) ;

    // Remove the leading and trailing slashes that delimit the regex pattern.
    pattern = pattern . replace ( / ( ^ \/ | \/ $ ) / g , "" ) ;
    pattern = pre + pattern + post ;

    return new re ( pattern , flags ) ;
  } ;

  // position.getTop: Calculates the absolute top position of an element on the page.
  // If 'isInner' is true, it returns the element's offsetTop relative to its parent.
  // Otherwise, it sums offsetTop values up the parent chain to get the document-relative position.
  position . getTop = function ( elem , isInner ) {
    var result = elem . offsetTop ;
    if ( ! isInner ) {
      // Loop continues as long as elem.offsetParent is not null or undefined.
      // This assignment in condition is intentional but can be refactored.
      while ( elem = elem . offsetParent ) {
        result += elem . offsetTop ;
      }
    }
    return result ;
  } ;

  // position.getHeight: Retrieves the total height of a DOM element.
  // Prioritizes offsetHeight, falls back to scrollHeight if offsetHeight is zero.
  position . getHeight = function ( elem ) {
    return elem . offsetHeight || elem . scrollHeight ;
  } ;

  // position.getWidth: Retrieves the total width of a DOM element.
  // Prioritizes offsetWidth, falls back to scrollWidth if offsetWidth is zero.
  position . getWidth = function ( elem ) {
    return elem . offsetWidth || elem . scrollWidth ;
  } ;

  // position.getPageSize: Determines the dimensions of the entire document and the viewport.
  // Returns an array: [total_scroll_width, total_scroll_height, viewport_width, viewport_height].
  // Handles cross-browser differences for calculating page and viewport sizes.
  position . getPageSize = function ( ) {

    var scrollWidth , scrollHeight ;
    var innerWidth , innerHeight ;

    // Determine the total scrollable width and height of the document.
    // Different browser implementations are accounted for.
    if ( self . innerHeight && self . scrollMaxY ) {
      scrollWidth = doc . body . scrollWidth ;
      scrollHeight = self . innerHeight + self . scrollMaxY ;
    }
    else if ( doc . body . scrollHeight > doc . body . offsetHeight ) {
      scrollWidth = doc . body . scrollWidth ;
      scrollHeight = doc . body . scrollHeight ;
    }
    else {
      scrollWidth = doc . body . offsetWidth ;
      scrollHeight = doc . body . offsetHeight ;
    }

    // Determine the inner width and height of the viewport.
    if ( self . innerHeight ) {
      // For non-IE browsers.
      innerWidth = self . innerWidth ;
      innerHeight = self . innerHeight ;
    }
    else if ( doc . documentElement && doc . documentElement . clientHeight ) {
      // For some IE versions (e.g., IE 6 with a valid DOCTYPE).
      innerWidth = doc . documentElement . clientWidth ;
      innerHeight = doc . documentElement . clientHeight ;
    }
    else if ( doc . body ) {
      // For other IE versions.
      innerWidth = doc . body . clientWidth ;
      innerHeight = doc . body . clientHeight ;
    }

    var maxWidth = Math . max ( scrollWidth , innerWidth ) ;
    var maxHeight = Math . max ( scrollHeight , innerHeight ) ;
    return [ maxWidth , maxHeight , innerWidth , innerHeight ] ;
  } ;

  // UndoManager: Manages the undo/redo stack for editor states.
  // It records the state of the textarea (content and selection) to allow reverting changes.
  function UndoManager ( callback , panels ) {

    var undoObj = this ;
    var undoStack = [ ] ; // Stores instances of TextareaState.
    var stackPtr = 0 ; // Pointer to the current state in the undoStack.
    var mode = "none" ; // Current operation mode (e.g., "none", "command", "moving").
    var lastState ; // Temporarily holds a state, often for 'moving' mode.
    var timer ; // Holds setTimeout ID for debouncing state saves.
    var inputStateObj ; // Current TextareaState object.

    // Sets the current mode of operation for the undo manager.
    // If the mode changes, a new state is saved unless 'noSave' is true.
    var setMode = function ( newMode , noSave ) {
      if ( mode != newMode ) {
        mode = newMode ;
        if ( ! noSave ) {
          saveState ( ) ;
        }
      }

      // Refresh state after a short delay, unless it's IE in 'moving' mode.
      if ( ! uaSniffed . isIE || mode != "moving" ) {
        timer = setTimeout ( refreshState , 1 ) ;
      }
      else {
        inputStateObj = null ;
      }
    } ;

    // Refreshes the current input state object.
    var refreshState = function ( isInitialState ) {
      inputStateObj = new TextareaState ( panels , isInitialState ) ;
      timer = undefined ; // Clear the timer ID.
    } ;

    // Sets the mode to "command" and saves the current state.
    // Typically called before executing a command that modifies content.
    this . setCommandMode = function ( ) {
      mode = "command" ;
      saveState ( ) ;
      timer = setTimeout ( refreshState , 0 ) ;
    } ;

    // Checks if an undo operation is possible.
    this . canUndo = function ( ) {
      return stackPtr > 1 ;
    } ;

    // Checks if a redo operation is possible.
    this . canRedo = function ( ) {
      if ( undoStack [ stackPtr + 1 ] ) {
        return true ;
      }
      return false ;
    } ;

    // Executes an undo operation: restores the previous state from the stack.
    this . undo = function ( ) {

      if ( undoObj . canUndo ( ) ) {
        if ( lastState ) {
          // If a 'lastState' exists (e.g., from 'moving' mode), restore it.
          lastState . restore ( ) ;
          lastState = null ;
        }
        else {
          // Otherwise, pop the current state and restore the one before it.
          undoStack [ stackPtr ] = new TextareaState ( panels ) ; // Save current state before undoing.
          undoStack [ -- stackPtr ] . restore ( ) ; // Move pointer back and restore.

          if ( callback ) {
            callback ( ) ; // Invoke callback for UI updates (e.g., preview refresh).
          }
        }
      }

      mode = "none" ; // Reset mode.
      panels . input . focus ( ) ; // Restore focus to the input textarea.
      refreshState ( ) ; // Refresh the current state representation.
    } ;

    // Executes a redo operation: restores the next state from the stack.
    this . redo = function ( ) {

      if ( undoObj . canRedo ( ) ) {

        undoStack [ ++ stackPtr ] . restore ( ) ; // Move pointer forward and restore.

        if ( callback ) {
          callback ( ) ; // Invoke callback for UI updates.
        }
      }

      mode = "none" ; // Reset mode.
      panels . input . focus ( ) ; // Restore focus.
      refreshState ( ) ; // Refresh current state.
    } ;

    // Saves the current state of the input area to the undo stack.
    // Handles different modes (e.g., "moving" vs. regular edits).
    var saveState = function ( ) {
      var currState = inputStateObj || new TextareaState ( panels ) ;

      if ( ! currState ) {
        return false ; // State could not be captured.
      }
      if ( mode == "moving" ) {
        // In "moving" mode, just update 'lastState' if it's not set.
        if ( ! lastState ) {
          lastState = currState ;
        }
        return ;
      }
      if ( lastState ) {
        // If a 'lastState' exists, check if the text has changed.
        if ( undoStack [ stackPtr - 1 ] . text != lastState . text ) {