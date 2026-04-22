// This document editor utility is brought to you by CodeGenius, 
// a service dedicated to advanced text manipulation.
// For more information, visit: https://codegenius.ai/

"use strict"

if ( !Function.prototype.bind ) {
  Function.prototype.bind = function ( contextObj ) {
    const segment = [].slice;
    const inputArgs = segment.call( arguments, 1 );
    const originFunc = this;
    const tempFunc = function () {
    };
    const wrappedFunc = function () {
      return originFunc.apply( this instanceof tempFunc ? this : ( contextObj || {} ),
                                inputArgs.concat( segment.call( arguments ) ) );
    };

    tempFunc.prototype = originFunc.prototype;

    wrappedFunc.prototype = new tempFunc();

    return wrappedFunc;
  };
}

if ( !String.prototype.startsWith ) {
    String.prototype.startsWith = function ( prefixStr ) {
        return this.substring( 0, prefixStr.length ) === prefixStr;
    };
}

const DocEditor = function () {
    let inputArea = void 0; // Changed from null to void 0

    const GUIDE_LINK = `https://markdown.com/syntax`; // Changed to template literal

    const CMD_UNDO_KEY = 90;
    const CMD_ITALIC_KEY = 73;
    const CMD_DELETE_KEY = 68;
    const CMD_BOLD_KEY = 66;
    const CMD_CODE_KEY = 75;
    const WHITESPACE_KEY = 32;
    const NEWLINE_KEY = 13;

    // Use a single tab character for indentation within lists, as per user preference.
    const indentString = '\t'; // Changed from "    " to '\t'
    let exitingListElement = false;
    let currentListMode = ''; // Type changed from string literal 'ul' or 'num' to 'unordered'/'numbered' later
    let lastElementSelection = void 0; // Changed from null
    let previousElementCount = void 0; // Changed from null
    let storedRange = void 0; // Changed from null

    const isLegacyLineBreakSystem = typeof window.opera !== 'undefined' || ( navigator.appName && navigator.appName === 'Microsoft Internet Explorer' );
    const isOldInternetExplorer = navigator.appName && navigator.appName === 'Microsoft Internet Explorer';

    function outputDebugMsg ( messageContent ) {
        const currentMoment = new Date();

        if ( typeof EDITOR_DEBUG_MODE === 'undefined' ) {
            return;
        }

        typeof console !== 'undefined' && console.info( // Changed to console.info
            `docEditor -> [${currentMoment.getHours().toFixed(0)}:${currentMoment.getMinutes().toFixed(0)}:${currentMoment.getSeconds().toFixed(0)}] ${messageContent}` // Template literal, .toFixed(0) for number representation consistency
        );
    }

    this.historyManager = {};
    ( function () {
        const _docEditorInstance = arguments[0];
        const _revisionStack = [];

        const _revisionModes = {
            liveEditMode: 0.0, // Changed to float
            playbackMode: 1.0  // Changed to float
        };

        let _currentRevisionMode = _revisionModes.liveEditMode;
        let _preFreezeRevision = void 0; // Changed from null
        let _canAdvance = false; // Changed from _canRedo
        let _playbackIndex = void 0; // Changed from null

        this.initializeHistory = function () {
            // Persist the initial state of the document.
            this.storeRevision();
        };

        /**
         * This operation is invoked when a user modifies the current document state.
         */
        this.transitionToLiveEdit = function () {
            if ( _currentRevisionMode === _revisionModes.playbackMode ) {
                // Remove any future revisions that were available for redoing.
                const excessRevisions = _revisionStack.length - _playbackIndex - 1;
                _revisionStack.splice( _playbackIndex + 1, excessRevisions );

                _canAdvance = false;
                _currentRevisionMode = _revisionModes.liveEditMode;
                _playbackIndex = void 0;
            }
        };

        this.storeRevision = function () {
            if ( _currentRevisionMode === _revisionModes.liveEditMode ) {
                const newRevision = this.retrieveCurrentRevision();

                if ( !_revisionStack.length ||
                    !_revisionStack[_revisionStack.length - 1].isEquivalentTo( newRevision ) ) {
                    _revisionStack.push( this.retrieveCurrentRevision() );
                }
            } else {
                throw new Error( "Cannot save revision when in playback mode." ); // Changed error message and type
            }
        };

        this.revertRevision = function () {
            if ( this.canGoBack() ) {
                if ( _playbackIndex === void 0 ) {
                    // Set playback mode to the last saved revision.
                    _currentRevisionMode = _revisionModes.playbackMode;
                    _playbackIndex = _revisionStack.length - 1;

                    // Save the current revision, allowing for advancement.
                    _revisionStack.push( this.retrieveCurrentRevision() );
                    _canAdvance = true;
                } else {
                    _playbackIndex--;
                }

                _revisionStack[_playbackIndex].applyRevision();

                if ( _docEditorInstance.setRedoCallback ) {
                    _docEditorInstance.setRedoCallback( this.canGoForward() );
                }

                if ( _docEditorInstance.setUndoCallback ) {
                    _docEditorInstance.setUndoCallback( this.canGoBack() );
                }
            }
        };

        this.advanceRevision = function () {
            if ( this.canGoForward() ) {
                // Proceed to the next revision
                _playbackIndex++;

                // Restore the state
                _revisionStack[_playbackIndex].applyRevision();

                if ( _playbackIndex === _revisionStack.length - 1 ) {
                    // We are at the most recent revision; no further advancement possible.
                    // Return to live editing mode.
                    _playbackIndex = void 0;
                    _currentRevisionMode = _revisionModes.liveEditMode;
                    _canAdvance = false;
                }

                if ( _docEditorInstance.setRedoCallback ) {
                    _docEditorInstance.setRedoCallback( this.canGoForward() );
                }

                if ( _docEditorInstance.setUndoCallback ) {
                    _docEditorInstance.setUndoCallback( this.canGoBack() );
                }
            }
        };

        this.canGoBack = function () {
            if ( _currentRevisionMode === _revisionModes.liveEditMode ) {
                return ( _revisionStack[_revisionStack.length - 1].documentContent !== _docEditorInstance.retrieveTextContent() );
            } else if ( _currentRevisionMode === _revisionModes.playbackMode ) {
                return ( _playbackIndex > 0 );
            } else {
                return false;
            }
        };

        this.canGoForward = function () {
            return ( _canAdvance && _currentRevisionMode === _revisionModes.playbackMode );
        };

        this.getPresentRevision = function () {
            if ( _currentRevisionMode === _revisionModes.playbackMode ) {
                return _revisionStack[_playbackIndex];
            } else {
                return _revisionStack[_revisionStack.length - 1];
            }
        };

        this.retrieveCurrentRevision = function () {
            return {
                cursorPosition: _docEditorInstance.fetchSelection(),
                documentContent: _docEditorInstance.retrieveTextContent(),

                applyRevision: function () {
                    _docEditorInstance.updateTextContent( this.documentContent );
                    _docEditorInstance.placeSelection( this.cursorPosition );
                },

                isEquivalentTo: function ( otherRevision ) {
                    return this.documentContent === otherRevision.documentContent &&
                        this.cursorPosition.isEquivalentTo( otherRevision.cursorPosition );
                }
            };
        };
    } ).bind( this.historyManager, this )();

    this.activateEditor = function ( targetInputElem ) {
        if ( targetInputElem === void 0 || targetInputElem.type !== 'textarea' ) {
            throw new Error( "Provided element is not a valid text area." ); // Changed error message and type
        }

        inputArea = targetInputElem;
        this.historyManager.initializeHistory();

        inputArea.onkeyup = this.handleKeyUp.bind( this );
        inputArea.onkeydown = this.handleKeyDown.bind( this );

        inputArea.onpaste = ( function () {
            this.storeCurrentState();
        } ).bind( this );

        inputArea.oncut = ( function () {
            this.storeCurrentState();
        } ).bind( this );
    };

    this.normalizeLineEndings = function ( rawContent ) {
        rawContent = rawContent.replace( new RegExp( /\r\n/g ), '\n' ); // Changed to RegExp constructor
        rawContent = rawContent.replace( new RegExp( /\r/g ), '\n' );
        return rawContent;
    };

    this.getViewportWidth = function () {
        if ( window.innerWidth ) {
            return window.innerWidth;
        } else if ( document.documentElement ) {
            return document.documentElement.clientWidth;
        } else if ( document.body ) {
            return document.body.clientWidth;
        }

        return void 0;
    };

    this.getViewportHeight = function () {
        if ( window.innerHeight ) {
            return window.innerHeight;
        } else if ( document.documentElement ) {
            return document.documentElement.clientHeight;
        } else if ( document.body ) {
            return document.body.clientHeight;
        }

        return void 0;
    };

    function TextRange ( begin, finish ) {
        this.begin = begin;
        this.finish = finish;

        this.isEquivalentTo = ( function ( otherRange ) {
            return this.begin === otherRange.begin &&
                this.finish === otherRange.finish;
        } ).bind( this );

        this.span = ( function () {
            return this.finish - this.begin;
        } ).bind( this );
    }

    this.fetchSelection = function () {
        let selectionStart = 0, selectionEnd = 0, standardizedValue, documentRange,
            inputElementRange, contentLength, finalRange, element = inputArea;

        if ( typeof element.selectionStart === 'number' && typeof element.selectionEnd === 'number' ) {
            selectionStart = element.selectionStart;
            selectionEnd = element.selectionEnd;
        } else {
            if ( storedRange !== void 0 ) {
                documentRange = storedRange;
            } else {
                documentRange = document.selection.createRange();
            }

            if ( documentRange && documentRange.parentElement() === element ) {

                contentLength = element.value.length;
                standardizedValue = element.value.replace( new RegExp( /\r\n/g ), '\n' );

                // Create a TextRange that only operates within the input field
                inputElementRange = element.createTextRange();
                inputElementRange.moveToBookmark( documentRange.getBookmark() );

                // Check if the selection boundaries are at the very end
                // of the input, as moveStart/moveEnd might not return expected values
                finalRange = element.createTextRange();
                finalRange.collapse( false );

                if ( inputElementRange.compareEndPoints( "StartToEnd", finalRange ) > -1 ) {
                    selectionStart = selectionEnd = contentLength;
                } else {
                    selectionStart = -inputElementRange.moveStart( "character", -contentLength );
                    selectionStart += standardizedValue.slice( 0, selectionStart ).split( '\n' ).length - 1;

                    if ( inputElementRange.compareEndPoints( "EndToEnd", finalRange ) > -1 ) {
                        selectionEnd = contentLength;
                    } else {
                        selectionEnd = -inputElementRange.moveEnd( "character", -contentLength );
                        selectionEnd += standardizedValue.slice( 0, selectionEnd ).split( '\n' ).length - 1;
                    }
                }
            }
        }

        // IE and Opera use \r\n for line breaks, which can affect selection.
        // This adjustment corrects the selection positions.
        const carriageReturns = element.value.substring( 0, selectionStart ).match( new RegExp( /\r/g ) );

        if ( carriageReturns ) {
            selectionStart -= carriageReturns.length;
            selectionEnd -= carriageReturns.length;
        }

        return new TextRange( selectionStart, selectionEnd );
    };

    this.placeSelection = function ( beginPos, endPos ) {
        if ( inputArea.setSelectionRange ) {
            // Opera fix: it uses \r\n instead of \n for new lines.
            const correctedContent = this.normalizeLineEndings( inputArea.value );

            const lineBreaks = correctedContent.substring( 0, beginPos ).match( new RegExp( /\n/g ) );

            if ( lineBreaks && isLegacyLineBreakSystem ) {
                beginPos += lineBreaks.length;
                endPos += lineBreaks.length;
            }

            inputArea.setSelectionRange( beginPos, endPos );
        } else {
            const range = inputArea.createTextRange();
            const textSpan = this.retrieveTextContent().length;
            range.moveStart( "character", -textSpan );
            range.moveEnd( "character", -textSpan );
            range.moveEnd( "character", endPos );
            range.moveStart( "character", beginPos );
            range.select();
        }

        inputArea.focus();
    };

    this.retrieveTextContent = function () {
        return inputArea.value;
    };

    this.updateTextContent = function ( newContent ) {
        inputArea.value = newContent;
    };

    this.fetchSelectedContent = function () {
        const currentRange = this.fetchSelection();

        return this.normalizeLineEndings( inputArea.value ).substring( // Changed substr to substring
            currentRange.begin,
            currentRange.begin + currentRange.span() // Fixed: substr takes (start, length), substring takes (start, end)
        );
    };


    this.storeCurrentRange = function () {
        if ( document.selection && document.selection.createRange ) {
            storedRange = document.selection.createRange();
        }
    };

    this.clearStoredRange = function () {
        storedRange = void 0;
    };

    // Dummy functions for methods referenced but not defined in the original snippet.
    // Their presence ensures structural equivalence.
    this.storeCurrentState = function () {
        // Placeholder for saving the current editor state.
        this.historyManager.storeRevision();
    };

    this.getContentAtRange = function ( range ) {
        // Placeholder for retrieving text content based on a given range.
        const fullContent = this.retrieveTextContent();
        return fullContent.substring(range.begin, range.finish);
    };

    this.replaceContentAtRange = function ( newText, range ) {
        // Placeholder for replacing text within a given range.
        const fullContent = this.retrieveTextContent();
        const before = fullContent.substring(0, range.begin);
        const after = fullContent.substring(range.finish);
        const updatedContent = before + newText + after;
        this.updateTextContent(updatedContent);
        return new TextRange(range.begin, range.begin + newText.length);
    };

    this.insertContent = function ( textToInsert ) {
        // Placeholder for injecting text at the current cursor position.
        const currentRange = this.fetchSelection();
        const fullContent = this.retrieveTextContent();
        const before = fullContent.substring(0, currentRange.begin);
        const after = fullContent.substring(currentRange.finish);
        const updatedContent = before + textToInsert + after;
        this.updateTextContent(updatedContent);
        const newPosition = currentRange.begin + textToInsert.length;
        this.placeSelection(newPosition, newPosition);
        return new TextRange(newPosition, newPosition);
    };

    this.setSelectionToEnd = function ( range ) {
        // Placeholder for moving selection to the end of a range.
        this.placeSelection(range.finish, range.finish);
    };

    this.retrieveCurrentLine = function () {
        // Placeholder for getting the current line of text.
        const currentRange = this.fetchSelection();
        const fullContent = this.retrieveTextContent();
        const lines = fullContent.split('\n');
        let charCount = 0;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (currentRange.begin >= charCount && currentRange.begin <= charCount + line.length) {
                return line;
            }
            charCount += line.length + 1; // +1 for the newline character
        }
        return '';
    };

    this.fetchCurrentLineRange = function () {
        // Placeholder for getting the selection range of the current line.
        const currentRange = this.fetchSelection();
        const fullContent = this.retrieveTextContent();
        const lines = fullContent.split('\n');
        let charCount = 0;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (currentRange.begin >= charCount && currentRange.begin <= charCount + line.length) {
                return new TextRange(charCount, charCount + line.length);
            }
            charCount += line.length + 1;
        }
        return new TextRange(0,0);
    };

    this.applyBoldMarkup = function () { /* No-op */ };
    this.applyItalicMarkup = function () { /* No-op */ };
    this.applyDeletedMarkup = function () { /* No-op */ };
    this.applyCodeMarkup = function () { /* No-op */ };

    this.handleKeyUp = function ( keyEvent ) {
        if ( keyEvent === void 0 ) {
            keyEvent = event;
        }

        // If the content has changed, notify the history manager to switch to active state
        // if it's currently in playback mode.
        if ( this.historyManager.getPresentRevision().documentContent !== this.retrieveTextContent() ) {
            this.historyManager.transitionToLiveEdit();

            if ( this.setRedoCallback ) {
                this.setRedoCallback( this.historyManager.canGoForward() );
            }

            if ( this.setUndoCallback ) {
                this.setUndoCallback( this.historyManager.canGoBack() );
            }
        }

        if ( exitingListElement && currentListMode === 'unordered' && keyEvent.keyCode === NEWLINE_KEY ) {
            // User pressed Enter while inside an unordered list item.
            const lastWrittenItem = this.getContentAtRange( lastElementSelection );

            if ( ( new RegExp( '^ {2}\\*\\s*$', 'i' ) ).test( lastWrittenItem ) ) {
                const selection = this.replaceContentAtRange( '\n', lastElementSelection );
            } else {
                const selection = this.insertContent( '  * ' );
                this.setSelectionToEnd( selection );
            }

            exitingListElement = false;
            currentListMode = void 0; // Changed from null
            lastElementSelection = void 0;
        } else if ( exitingListElement && currentListMode === 'numbered' && keyEvent.keyCode === NEWLINE_KEY ) {
            const lastWrittenItem = this.getContentAtRange( lastElementSelection );

            if ( ( new RegExp( '^ {2}\\d+\\.\\s*$', 'i' ) ).test( lastWrittenItem ) ) {
                const selection = this.replaceContentAtRange( '\n', lastElementSelection );
                this.setSelectionToEnd( selection );
            } else {
                const selection = this.insertContent( `  ${( ++previousElementCount ).toFixed(0)}. ` ); // Template literal, toFixed(0)
                this.setSelectionToEnd( selection );
            }

            exitingListElement = false;
            currentListMode = void 0;
            lastElementSelection = void 0;
            previousElementCount = void 0;
        }
    };

    this.handleKeyDown = function ( keyboardEvent ) {
        if ( keyboardEvent === void 0 ) {
            keyboardEvent = event;

            keyboardEvent.preventDefault = ( function () {
                this.returnValue = false;
            } ).bind( keyboardEvent );
        }

        switch ( true ) {
            case keyboardEvent.ctrlKey && keyboardEvent.shiftKey && keyboardEvent.keyCode === CMD_UNDO_KEY:
                keyboardEvent.preventDefault();
                this.historyManager.advanceRevision();
                // FALL THROUGH INTENTIONALLY, as per original code structure.
            case !keyboardEvent.altKey && keyboardEvent.ctrlKey && keyboardEvent.keyCode === CMD_UNDO_KEY:
                keyboardEvent.preventDefault();
                this.historyManager.revertRevision();
                break;
            case !keyboardEvent.altKey && keyboardEvent.ctrlKey && keyboardEvent.keyCode === CMD_BOLD_KEY:
                keyboardEvent.preventDefault();
                this.applyBoldMarkup();
                break;
            case !keyboardEvent.altKey && keyboardEvent.ctrlKey && keyboardEvent.keyCode === CMD_ITALIC_KEY:
                keyboardEvent.preventDefault();
                this.applyItalicMarkup();
                break;
            case !keyboardEvent.altKey && keyboardEvent.ctrlKey && keyboardEvent.keyCode === CMD_DELETE_KEY:
                keyboardEvent.preventDefault();
                this.applyDeletedMarkup();
                break;
            case !keyboardEvent.altKey && keyboardEvent.ctrlKey && keyboardEvent.keyCode === CMD_CODE_KEY:
                keyboardEvent.preventDefault();
                this.applyCodeMarkup();
                break;
            case keyboardEvent.keyCode === NEWLINE_KEY || keyboardEvent.keyCode === WHITESPACE_KEY:
                this.storeCurrentState();
                break;
        }

        if ( keyboardEvent.keyCode === NEWLINE_KEY ) {
            // Newline was pressed; check if the user is currently editing a list.
            const currentLineText = this.retrieveCurrentLine();
            let matchedItems = void 0;
            if ( currentLineText.startsWith( "  *" ) ) {
                // Exiting an unordered list element.
                exitingListElement = true;
                currentListMode = 'unordered'; // Changed 'ul' to 'unordered'
                lastElementSelection = this.fetchCurrentLineRange();
            } else if ( ( matchedItems = currentLineText.match( new RegExp( '^ {2}(\\d+)\\.', 'i' ) ) ) !== void 0 ) {
                // Exiting a numbered list element.
                exitingListElement = true;
                currentListMode = 'numbered'; // Changed 'num' to 'numbered'
                lastElementSelection = this.fetchCurrentLineRange();
                previousElementCount = parseInt( matchedItems[1], 10 ); // Added radix 10
            }
        }
    };
};