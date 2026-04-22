// Requires SyntaxProcessor.Transformer.js for operations

( function ( ) {

  var helpRoutines = { }
    , coordSystem = { }
    , visuals = { }
    , currDoc = window.document
    , regexConst = window.RegExp
    , browserAgent = window.navigator
    , CONFIG_OPTS = { maxLineChars: 72 }

  // Detects specific browser characteristics to work around known issues.
    , browserChecks = {
        is_MS_Browser: /msie/.test( browserAgent.userAgent.toLowerCase( ) ),
        is_Old_MS_Browser: /msie 6/.test( browserAgent.userAgent.toLowerCase( ) ) || /msie 5/.test( browserAgent.userAgent.toLowerCase( ) ),
        is_Opera_Browser: /opera/.test( browserAgent.userAgent.toLowerCase( ) )
    };

  // -------------------------------------------------------------------
  // CONFIGURATION VALUES
  //
  // These settings are frequently adjusted for deployment.
  // -------------------------------------------------------------------

  // Content for the hyperlink insertion dialog header.
  var hyperlinkPromptContent = "<p><b>Embed Web Link</b></p><p>https://example.org/ \"optional description\"</p>";
  var graphicPromptContent = "<p><b>Embed Picture</b></p><p>https://example.org/images/photo.png \"optional description\"<br><br>Need <a href='https://www.bing.com/search?q=free+image+hosting' target='_blank'>complimentary image hosting?</a></p>";

  // Default text for input fields in dialogs.
  var graphicBaseURL = "https://";
  var hyperlinkBaseURL = "https://";

  var standardAssistanceTip = "Advanced Text Editing Aid";

  // -------------------------------------------------------------------
  // END OF CONFIGURATION
  // -------------------------------------------------------------------

  // `supportInfo` (if provided) should contain a `handler` method for button clicks
  // and an optional `title` for the tooltip (defaults to `standardAssistanceTip`).
  // No support button is created if `supportInfo` is absent.
  //
  // The initialized composer object offers:
  // - `retrieveTransformer()`: Returns the syntax transformer instance.
  // - `initiate()`: Starts the editor. Should be called after all plugins are registered. Subsequent calls are ignored.
  // - `compelUpdate()`: Forces the preview to refresh. Available only after `initiate()` is called.
  Markdown.Composer = function ( syntaxTransformer, identifierSuffix, supportInfo ) {

    identifierSuffix = identifierSuffix || "";

    var actionHandlers = this.actionHandlers = new Markdown.ActionHookSet( );
    actionHandlers.registerNullOp( "onDisplayUpdate" );       // Invoked without arguments after preview refresh.
    actionHandlers.registerNullOp( "afterBlockQuoteGen" );    // Called with user's selection *after* blockquote creation; should return the actual text to insert.
    actionHandlers.registerFalseReturn( "triggerGraphicInsertDialog" ); /* Called with a callback function for the image URL.
                                                                           * If app provides its own dialog, hook should return true and call callback with chosen URL (or null).
                                                                           * If false, default dialog is used.
                                                                           */

    this.retrieveTransformer = function ( ) {
      return syntaxTransformer;
    };

    var selfRef = this
      , controlPanels;

    this.initiate = function ( ) {
      if ( controlPanels )
        return; // Already operational

      controlPanels = new InterfacePanelSet( identifierSuffix );
      var actionController = new CommandController( actionHandlers );
      var displayMonitor = new DisplayMonitor( syntaxTransformer, controlPanels, function ( ) { actionHandlers.onDisplayUpdate( ); } );
      var historyManager, interfaceController;

      if ( !/\?noundo/.test( currDoc.location.href ) ) {
        historyManager = new HistoryTracker( function ( ) {
          displayMonitor.updateView( );
          if ( interfaceController ) // Not available on the first invocation.
            interfaceController.setHistoryButtonStatus( );
        }, controlPanels );
      }

      interfaceController = new InterfaceController( identifierSuffix, controlPanels, historyManager, displayMonitor, actionController, supportInfo );
      interfaceController.setHistoryButtonStatus( );

      var compelUpdate = selfRef.compelUpdate = function ( ) {
        displayMonitor.updateView( true );
      };

      compelUpdate( );
    };

  };

  // precedingContent: text before the selection.
  // succeedingContent: text after the selection.
  function TextSegment ( ) { }

  // beginPattern: regex to find the start tag.
  // endPattern: regex to find the end tag.
  TextSegment.prototype.findMarkers = function ( beginPattern, endPattern ) {

    var segmentInstance = this;
    var currentPattern;

    if ( beginPattern ) {

      currentPattern = helpRoutines.augmentPattern( beginPattern, "", "$" );

      this.precedingContent = this.precedingContent.replace( currentPattern,
        function ( match ) {
          segmentInstance.openingMarker = segmentInstance.openingMarker + match;
          return "";
        });

      currentPattern = helpRoutines.augmentPattern( beginPattern, "^", "" );

      this.chosenText = this.chosenText.replace( currentPattern,
        function ( match ) {
          segmentInstance.openingMarker = segmentInstance.openingMarker + match;
          return "";
        });
    }

    if ( endPattern ) {

      currentPattern = helpRoutines.augmentPattern( endPattern, "", "$" );

      this.chosenText = this.chosenText.replace( currentPattern,
        function ( match ) {
          segmentInstance.closingMarker = match + segmentInstance.closingMarker;
          return "";
        });

      currentPattern = helpRoutines.augmentPattern( endPattern, "^", "" );

      this.succeedingContent = this.succeedingContent.replace( currentPattern,
        function ( match ) {
          segmentInstance.closingMarker = match + segmentInstance.closingMarker;
          return "";
        });
    }
  };

  // If `shouldRemove` is false, whitespace moves to adjacent regions.
  // If `shouldRemove` is true, whitespace is discarded.
  TextSegment.prototype.adjustBoundWhitespace = function ( shouldRemove ) {
    var preProcessor, postProcessor, thisSegment = this;
    if ( shouldRemove ) {
      preProcessor = postProcessor = "";
    } else {
      preProcessor = function ( s ) {
        thisSegment.precedingContent += s;
        return "";
      };
      postProcessor = function ( s ) {
        thisSegment.succeedingContent = s + thisSegment.succeedingContent;
        return "";
      };
    }

    this.chosenText = this.chosenText.replace( /^(\s*)/, preProcessor ).replace( /(\s*)$/, postProcessor );
  };


  TextSegment.prototype.advanceOrRetreatLines = function ( linesToSkipBefore, linesToSkipAfter, searchForExtraBreaks ) {

    if ( linesToSkipBefore === undefined ) {
      linesToSkipBefore = 1;
    }

    if ( linesToSkipAfter === undefined ) {
      linesToSkipAfter = 1;
    }

    linesToSkipBefore++;
    linesToSkipAfter++;

    var patternString;
    var insertString;

    // Chrome bug workaround: http://meta.stackoverflow.com/questions/63307/blockquote-glitch-in-editor-in-chrome-6-and-7/65985#65985
    if ( browserAgent.userAgent.match( /Chrome/ ) ) {
      "X".match( /()./ );
    }

    this.chosenText = this.chosenText.replace( /(^\n*)/, "" );

    this.openingMarker = this.openingMarker + regexConst.$1;

    this.chosenText = this.chosenText.replace( /(\n*$)/, "" );
    this.closingMarker = this.closingMarker + regexConst.$1;
    this.openingMarker = this.openingMarker.replace( /(^\n*)/, "" );
    this.precedingContent = this.precedingContent + regexConst.$1;
    this.closingMarker = this.closingMarker.replace( /(\n*$)/, "" );
    this.succeedingContent = this.succeedingContent + regexConst.$1;

    if ( this.precedingContent ) {

      patternString = insertString = "";

      while ( linesToSkipBefore-- ) {
        patternString += "\\n?";
        insertString += "\n";
      }

      if ( searchForExtraBreaks ) {
        patternString = "\\n*";
      }
      this.precedingContent = this.precedingContent.replace( new regexConst( patternString + "$", "" ), insertString );
    }

    if ( this.succeedingContent ) {

      patternString = insertString = "";

      while ( linesToSkipAfter-- ) {
        patternString += "\\n?";
        insertString += "\n";
      }
      if ( searchForExtraBreaks ) {
        patternString = "\\n*";
      }

      this.succeedingContent = this.succeedingContent.replace( new regexConst( patternString, "" ), insertString );
    }
  };

  // End of TextSegment functionality.

  // A collection of key UI elements.
  // Stored to avoid repeated DOM lookups.
  // Also holds `ieCachedRange` and `ieCachedScrollTop` for IE-specific issues.
  // Problem: IE (6, 7, 8) loses textarea selection on button clicks using CSS sprites.
  // Solution: Cache selection on button mousedown and use cached data if flag is set.
  // This only impacts IE and button clicks; keyboard shortcuts function normally.
  function InterfacePanelSet ( elementSuffix ) {
    this.actionButtonContainer = currDoc.getElementById( "wmd-button-bar" + elementSuffix );
    this.displayArea = currDoc.getElementById( "wmd-preview" + elementSuffix );
    this.textAreaInput = currDoc.getElementById( "wmd-input" + elementSuffix );
    this.renderedOutput = currDoc.getElementById( "wmd-html" + elementSuffix );
  }

  // Determines if a DOM element is visible (display not 'none').
  helpRoutines.checkVisibility = function ( elementItem ) {

    if ( window.getComputedStyle ) {
      // Modern browsers
      return window.getComputedStyle( elementItem, null ).getPropertyValue( "display" ) !== "none";
    }
    else if ( elementItem.currentStyle ) {
      // Older IE versions
      return elementItem.currentDisplayProperty[ "display" ] !== "none";
    }
  };


  // Attaches an event listener to a DOM element.
  helpRoutines.attachEventHandler = function ( elementItem, eventName, eventCallback ) {
    if ( elementItem.attachEvent ) {
      // IE specific (requires "on" prefix).
      elementItem.attachEvent( "on" + eventName, eventCallback );
    }
    else {
      // Other browsers.
      elementItem.addEventListener( eventName, eventCallback, false );
    }
  };


  // Removes an event listener from a DOM element.
  helpRoutines.detachEventHandler = function ( elementItem, eventName, eventCallback ) {
    if ( elementItem.detachEvent ) {
      // IE specific.
      elementItem.detachEvent( "on" + eventName, eventCallback );
    }
    else {
      // Other browsers.
      elementItem.removeEventListener( eventName, eventCallback, false );
    }
  };

  // Converts Windows/Mac line endings to Unix style.
  helpRoutines.normalizeLineEndings = function ( inputText ) {
    inputText = inputText.replace( /\r\n/g, "\n" );
    inputText = inputText.replace( /\r/g, "\n" );
    return inputText;
  };

  // Extends a regular expression by adding prefix/suffix strings.
  // Returns a new RegExp object.
  // Useful for dynamically modifying patterns (e.g., adding `$` to the end).
  // Flags remain unchanged.
  //
  // `basePattern` is a RegExp, `prefixStr` and `suffixStr` are strings.
  helpRoutines.augmentPattern = function ( basePattern, prefixStr, suffixStr ) {

    if ( prefixStr === null || prefixStr === undefined ) {
      prefixStr = "";
    }
    if ( suffixStr === null || suffixStr === undefined ) {
      suffixStr = "";
    }

    var regexPattern = basePattern.toString( );
    var patternFlags;

    // Extract flags and remove them from pattern string.
    regexPattern = regexPattern.replace( /\/([gim]*)$/, function ( fullMatch, capturedFlags ) {
      patternFlags = capturedFlags;
      return "";
    });

    // Remove pattern delimiters.
    regexPattern = regexPattern.replace( /(^\/|\/$)/g, "" );
    regexPattern = prefixStr + regexPattern + suffixStr;

    return new regexConst( regexPattern, patternFlags );
  };

  // NOT YET COMPLETE
  // The assignment within the loop is a JSLint concern.
  // Will be refactored later.
  coordSystem.retrieveTopCoord = function ( targetElement, isInternalOffset ) {
    var computedOffset = targetElement.offsetTop;
    if ( !isInternalOffset ) {
      while ( ( targetElement = targetElement.offsetParent ) ) {
        computedOffset += targetElement.offsetTop;
      }
    }
    return computedOffset;
  };

  coordSystem.fetchHeight = function ( targetElement ) {
    return targetElement.offsetHeight || targetElement.scrollHeight;
  };

  coordSystem.fetchWidth = function ( targetElement ) {
    return targetElement.offsetWidth || targetElement.scrollWidth;
  };

  coordSystem.obtainViewportDimensions = function ( ) {

    var documentScrollWidth, documentScrollHeight;
    var viewportInnerWidth, viewportInnerHeight;

    // Browser compatibility varies for these properties.
    if ( window.innerHeight && window.scrollMaxY ) {
      documentScrollWidth = currDoc.body.scrollWidth;
      documentScrollHeight = window.innerHeight + window.scrollMaxY;
    }
    else if ( currDoc.body.scrollHeight > currDoc.body.offsetHeight ) {
      documentScrollWidth = currDoc.body.scrollWidth;
      documentScrollHeight = currDoc.body.scrollHeight;
    }
    else {
      documentScrollWidth = currDoc.body.offsetWidth;
      documentScrollHeight = currDoc.body.offsetHeight;
    }

    if ( window.innerHeight ) {
      // Non-IE browsers
      viewportInnerWidth = window.innerWidth;
      viewportInnerHeight = window.innerHeight;
    }
    else if ( currDoc.documentElement && currDoc.documentElement.clientHeight ) {
      // Some IE versions (e.g., IE 6 with DOCTYPE)
      viewportInnerWidth = currDoc.documentElement.clientWidth;
      viewportInnerHeight = currDoc.documentElement.clientHeight;
    }
    else if ( currDoc.body ) {
      // Other IE versions
      viewportInnerWidth = currDoc.body.clientWidth;
      viewportInnerHeight = currDoc.body.clientHeight;
    }

    var overallWidth = Math.max( documentScrollWidth, viewportInnerWidth );
    var overallHeight = Math.max( documentScrollHeight, viewportInnerHeight );
    return [ overallWidth, overallHeight, viewportInnerWidth, viewportInnerHeight ];
  };

  // Manages text area states for undo/redo functionality.
  // The stack variables might need renaming.
  function HistoryTracker ( changeNotifier, interfaceElements ) {

    var trackerInstance = this;
    var revisionStack = []; // Stack of editor states.
    var stackIndex = 0; // Current position in the state stack.
    var operationMode = "none";
    var previousState; // The last saved state.
    var debounceTimer; // Timeout handle for state saving.
    var currentInputSnapshot;

    // Sets the operational mode for subsequent logic.
    var configureMode = function ( desiredMode, skipSave ) {
      if ( operationMode != desiredMode ) {
        operationMode = desiredMode;
        if ( !skipSave ) {
          captureCurrentState( );
        }
      }

      if ( !browserChecks.is_MS_Browser || operationMode != "moving" ) {
        debounceTimer = setTimeout( updateSnapshot, 1 );
      }
      else {
        currentInputSnapshot = null;
      }
    };

    var updateSnapshot = function ( isFirstSnapshot ) {
      currentInputSnapshot = new InputAreaState( interfaceElements, isFirstSnapshot );
      debounceTimer = undefined;
    };

    this.enterCommandPhase = function ( ) {
      operationMode = "command";
      captureCurrentState( );
      debounceTimer = setTimeout( updateSnapshot, 0 );
    };

    this.canRevert = function ( ) {
      return stackIndex > 1;
    };

    this.canAdvance = function ( ) {
      if ( revisionStack[ stackIndex + 1 ] ) {
        return true;
      }
      return false;
    };

    // Restores the previous state, effectively undoing an action.
    this.revertAction = function ( ) {

      if ( trackerInstance.canRevert( ) ) {
        if ( previousState ) {
          // Consider handling state -1 or undefined scenarios.
          previousState.restoreSnapshot( );
          previousState = null;
        }
        else {
          revisionStack[ stackIndex ] = new InputAreaState( interfaceElements );
          revisionStack[ --stackIndex ].restoreSnapshot( );

          if ( changeNotifier ) {
            changeNotifier( );
          }
        }
      }

      operationMode = "none";
      interfaceElements.textAreaInput.focus( );
      updateSnapshot( );
    };

    // Reapplies an undone action.
    this.advanceAction = function ( ) {

      if ( trackerInstance.canAdvance( ) ) {

        revisionStack[ ++stackIndex ].restoreSnapshot( );

        if ( changeNotifier ) {
          changeNotifier( );
        }
      }

      operationMode = "none";
      interfaceElements.textAreaInput.focus( );
      updateSnapshot( );
    };

    // Adds the current input area state to the stack.
    var captureCurrentState = function ( ) {
      var currentState = currentInputSnapshot || new InputAreaState( interfaceElements );

      if ( !currentState ) {
        return false;
      }
      if ( operationMode == "moving" ) {
        if ( !previousState ) {
          previousState = currentState;
        }
        return;
      }
      if ( previousState ) {
        if ( revisionStack[ stackIndex - 1 ].content != previousState.content ) {