var CodeStreamApp = CodeStreamApp || {}; // Main application namespace

// Initial document setup and event bindings
$(function () {
    var isUserMouseAway = true; // Flag to track mouse presence over the login panel
    var dropdownHideDelay = 150; // Milliseconds to wait before hiding dropdown

    // Helper function to handle delayed dropdown hiding
    function manageAuthDropdownVisibility() {
        if (isUserMouseAway) {
            $('#authOptionsDropdown').slideUp('fast'); // Use slideUp for a smoother hide
        }
    }

    // Attach event handlers for the user login panel
    $('#userLoginPanel')
        .on('mouseenter', function () { // Using 'mouseenter' instead of 'mouseover'
            $('#authOptionsDropdown').slideDown('fast'); // Use slideDown for a smoother show
            isUserMouseAway = false;
        })
        .on('mouseleave', function () { // Using 'mouseleave' instead of 'mouseout'
            isUserMouseAway = true;
            setTimeout(manageAuthDropdownVisibility, dropdownHideDelay);
        });

    // Handle clicks on navigation links (menu items)
    $('.nav_link_item').on('click', function (eventDetails) {
        eventDetails.preventDefault(); // Prevent default link behavior if applicable

        var targetSectionIdentifier = $(this).text().toLowerCase(); // Use lowercase for consistency
        var currentSelectionMarker = 'current_active_section'; // Class for active elements

        // Remove active class from previously selected navigation link
        $('div.' + currentSelectionMarker).removeClass(currentSelectionMarker);
        // Hide all content panels
        $('div.content_panel_view').hide();

        // Show the panel corresponding to the clicked navigation link
        $('#' + targetSectionIdentifier + '_view').show();
        // Add active class to the clicked navigation link
        $(this).addClass(currentSelectionMarker);

        // Special handling for the 'chat' section
        if (targetSectionIdentifier === 'messaging') {
            var chatInput = $('#chatInputBox');
            if (chatInput.length) { // Ensure the element exists
                chatInput.trigger('focus');
            }
        }
    });

    // Regional content integration (e.g., Japanese specific social buttons)
    var userLanguage = navigator.language || navigator.userLanguage || navigator.browserLanguage;
    var isJapaneseLocale = userLanguage && userLanguage.startsWith('ja'); // More robust check

    if (isJapaneseLocale) {
        var hatenaBookmarkScriptUrl = 'http://b.st-hatena.com/js/bookmark_button.js';
        var hatenaBookmarkLinkHtml = '<a href="http://b.hatena.ne.jp/entry/http://livecoder.sugyan.com/" class="hatena-bookmark-button" data-hatena-bookmark-title="CodeStreamApp" data-hatena-bookmark-layout="standard" title="このエントリーをはてなブックマークに追加"><img src="http://b.st-hatena.com/images/entry-button/button-only.gif" alt="このエントリーをはてなブックマークに追加" width="20" height="20" style="border: none;" /></a>';
        
        var bookmarkScriptElement = $('<script>')
            .attr({
                type: 'text/javascript',
                src: hatenaBookmarkScriptUrl,
                charset: 'utf-8',
                async: 'async'
            });

        var socialButtonWrapper = $('<div>')
            .css({
                margin: '7px 7px 0 0',
                display: 'inline-block' // Ensure it plays nice with other elements
            })
            .append(hatenaBookmarkLinkHtml)
            .append(bookmarkScriptElement);

        $('#shareToolsContainer').prepend(socialButtonWrapper);
    }
});

// Utility functions namespace
CodeStreamApp.Helpers = (function () {
    // Private constructor for the utility object
    function UtilityFunctions() {
        // No special initialization needed for this static-like class
    }

    // Example of a static utility method (can be added if needed)
    UtilityFunctions.formatDateForDisplay = function(timestamp) {
        if (!timestamp) { return 'N/A'; }
        var dateObj = new Date(timestamp);
        return dateObj.toLocaleTimeString() + ' ' + dateObj.toLocaleDateString();
    };

    return UtilityFunctions;
}());

// Network connection and real-time data handling
CodeStreamApp.ConnectionManager = (function () {
    // Constructor for the connection manager
    function StreamConnection(socketInstance) {
        if (!socketInstance) {
            console.error("StreamConnection: No socket instance provided.");
            return;
        }
        this.socketInstance = socketInstance;
        this.maxLogEntries = 100; // Limit for message list entries
    }

    // Method to register multiple protocol handlers (e.g., chat, stat)
    StreamConnection.prototype.registerHandlers = function (protocolHandlers) {
        if (!Array.isArray(protocolHandlers) || protocolHandlers.length === 0) {
            console.warn("No protocol handlers provided for registration.");
            return;
        }
        for (var h = 0; h < protocolHandlers.length; h++) {
            var handlerName = protocolHandlers[h];
            if (typeof this[handlerName] === 'function') {
                this[handlerName](); // Execute the handler method
            } else {
                console.warn("Attempted to register unknown handler: " + handlerName);
            }
        }
    };

    // Handles incoming chat messages
    StreamConnection.prototype.handleChatMessages = function () {
        var _thisManager = this; // Capture 'this' for use in callback

        this.socketInstance.on('dataPacket', function (incomingPacket) {
            if (!incomingPacket || (!incomingPacket.messageData && !incomingPacket.statusUpdate)) {
                return; // Guard clause for invalid packets
            }

            var communicationLog = $('#communicationLog');
            if (incomingPacket.messageData) {
                var messagePayload = incomingPacket.messageData;
                var userNameSpan = $('<span>').addClass('sender_name').text(messagePayload.user);
                var timestampSpan = $('<span>').addClass('message_time').text(
                    CodeStreamApp.Helpers.formatDateForDisplay(messagePayload.date) // Use helper
                );
                var messageContent = $('<p>').addClass('message_text').text(messagePayload.message);

                var messageEntry = $('<article>') // Use <article> for semantic grouping
                    .append($('<header>').append(userNameSpan).append(timestampSpan))
                    .append(messageContent);
                
                communicationLog.prepend(messageEntry); // Add to the top of the list
            }

            if (incomingPacket.statusUpdate) {
                var statusPayload = incomingPacket.statusUpdate;
                var statusUserNameSpan = $('<span>').addClass('info_user').text(statusPayload.user);
                var statusTimestampSpan = $('<span>').addClass('info_time').text(
                    CodeStreamApp.Helpers.formatDateForDisplay(statusPayload.date) // Use helper
                );
                var statusActionContent = $('<p>').addClass('info_action').text(statusPayload.action + '.');

                var statusEntry = $('<section>') // Use <section> for semantic grouping
                    .addClass('system_info_entry')
                    .append($('<header>').append(statusUserNameSpan).append(statusTimestampSpan))
                    .append(statusActionContent);

                communicationLog.prepend(statusEntry); // Add to the top of the list
            }
            
            // Trim old entries if exceeding maxLogEntries
            while (communicationLog.children().length > _thisManager.maxLogEntries) {
                communicationLog.children().last().remove();
            }
        });
    };

    // Handles incoming statistics and updates UI
    StreamConnection.prototype.updateStatistics = function () {
        var _thisManager = this; // Capture 'this' for use in callback
        var updateInterval = 1000; // Time in milliseconds to refresh duration displays

        this.socketInstance.on('dataPacket', function (incomingPacket) {
            if (!incomingPacket || !incomingPacket.statistics) { return; } // Guard clause

            var statsData = incomingPacket.statistics;

            // Process active participants (viewers)
            var activeParticipants = [];
            var participantMap = statsData.viewers || {};
            for (var participantId in participantMap) {
                if (Object.prototype.hasOwnProperty.call(participantMap, participantId)) {
                    activeParticipants.push(participantMap[participantId]);
                }
            }

            // Sort participants by their start time (oldest first)
            var sortedParticipants = activeParticipants.sort(function (pA, pB) {
                return pA.start - pB.start;
            });

            var participantListElement = $('#participantList'); // Renamed from viewers_list
            participantListElement.empty(); // Clear existing entries

            // Populate the participant list
            sortedParticipants.forEach(function(participant) { // Using forEach
                participantListElement.append($('<li>').text(participant.name));
            });

            // Update participant count display
            var participantCountDisplay = $('#participantCountDisplay');
            participantCountDisplay.empty()
                .append($('<span>').addClass('count_value').text(sortedParticipants.length))
                .append(' active viewers');

            // Update live coding status
            var codingActivityStatusLine = $('.coding_activity_status');
            var statusMessageSpan = $('<span>');
            var timeDisplaySpan = $('<span>').addClass('time_elapsed'); // Renamed from 'time'

            if (statsData.liveCodingStatus) {
                statusMessageSpan.css({
                    'color': '#FFB0B0',
                    'font-weight': 'bold'
                }).text('LIVE CODING IN PROGRESS!');
                timeDisplaySpan.data('start_timestamp', statsData.liveCodingStatus.start);
                codingActivityStatusLine.html(statusMessageSpan).append(timeDisplaySpan); // Reordered
            } else {
                statusMessageSpan.css({
                    'color': '#C0C0C0',
                    'font-weight': 'normal'
                }).text('No live coding currently active.');
                codingActivityStatusLine.html(statusMessageSpan);
            }
        });

        // Function to update elapsed time displays
        var refreshTimerDisplay = function () {
            $('.coding_activity_status .time_elapsed').each(function (idx, element) {
                var $el = $(element);
                var startTime = $el.data('start_timestamp');
                if (startTime) {
                    var currentTime = new Date().getTime();
                    var durationSeconds = Math.floor((currentTime - startTime) / 1000);

                    var minutes = Math.floor(durationSeconds / 60);
                    var seconds = durationSeconds % 60;

                    var formattedMinutes = (minutes < 10 ? '0' : '') + minutes;
                    var formattedSeconds = (seconds < 10 ? '0' : '') + seconds;

                    $el.text(' (' + formattedMinutes + ':' + formattedSeconds + ')'); // Added parentheses
                }
            });
            setTimeout(refreshTimerDisplay, updateInterval);
        };
        refreshTimerDisplay(); // Initial call to start the timer
    };
    
    // Additional method: Clear the communication log
    StreamConnection.prototype.clearCommunicationLog = function() {
        $('#communicationLog').empty();
        console.log("Communication log cleared.");
    };

    return StreamConnection;
}());

// Code editor interface and interaction logic
CodeStreamApp.CodeEditor = (function () {
    // Constructor for the code pane controller
    function CodePaneController(editorInstance) {
        if (!editorInstance) {
            console.error("CodePaneController: Editor instance not provided.");
            return;
        }
        this.codeMirrorInstance = editorInstance; // Assuming 'editorInstance' is a CodeMirror or similar object
        this.isReadOnlyMode = editorInstance.readonly || false; // Check for readonly property
    }

    // Method to apply various editor functionalities
    CodePaneController.prototype.applyFeatures = function (featureMethods) {
        if (!Array.isArray(featureMethods) || featureMethods.length === 0) {
            console.warn("No editor features specified for application.");
            return;
        }
        for (var j = 0; j < featureMethods.length; j++) {
            var methodName = featureMethods[j];
            if (typeof this[methodName] === 'function') {
                this[methodName](); // Execute the feature method
            } else {
                console.warn("Attempted to apply unknown editor feature: " + methodName);
            }
        }
    };

    // Sets up navigation between code editor tabs/panels
    CodePaneController.prototype.setupTabNavigation = function () {
        var _thisController = this; // Store 'this' for use in nested functions
        var navigationTabs = $('.nav_link_item').toArray(); // Get all navigation items
        var totalTabCount = navigationTabs.length;
        var currentTabIndex = totalTabCount - 2; // Initial tab index (e.g., assuming 'editor' is second to last)

        // Function to move to the previous tab
        function navigateTabBackward() {
            currentTabIndex--;
            updateActiveTab();
        }

        // Function to move to the next tab
        function navigateTabForward() {
            currentTabIndex++;
            updateActiveTab();
        }

        // Updates the UI to reflect the active tab
        function updateActiveTab() {
            // Wrap around logic for tab index
            if (currentTabIndex < 0) {
                currentTabIndex = totalTabCount - 1;
            } else if (currentTabIndex >= totalTabCount) { // Use >= for correct wrap-around
                currentTabIndex = 0;
            }

            // Simulate a click on the corresponding navigation item
            $(navigationTabs[currentTabIndex]).trigger('click');

            // If not the last tab (e.g., chat tab) and not in read-only mode, focus the editor
            var isEditorTab = (currentTabIndex !== totalTabCount - 1); // Assuming last tab is not editor
            if (isEditorTab && !_thisController.isReadOnlyMode) {
                // Use requestAnimationFrame for smoother focus if possible, otherwise setTimeout
                requestAnimationFrame(function () {
                    if (_thisController.codeMirrorInstance && typeof _thisController.codeMirrorInstance.focus === 'function') {
                        _thisController.codeMirrorInstance.focus();
                    }
                });
            }
        }

        // Register actions with the editor instance (assuming Orion editor API)
        if (this.codeMirrorInstance && typeof this.codeMirrorInstance.setAction === 'function') {
            this.codeMirrorInstance.setAction('previousPanel', navigateTabBackward);
            this.codeMirrorInstance.setAction('nextPanel', navigateTabForward);

            // Determine if the platform is Mac for keybinding adjustments
            var isMacPlatform = /Mac|iP(hone|od|ad)/.test(navigator.platform);

            // Assign key bindings: Ctrl + [ for previous, Ctrl + ] for next
            // Assuming EditorKeyBinder is a global or accessible class
            if (typeof EditorKeyBinder !== 'undefined') {
                 this.codeMirrorInstance.assignKeyCommand(
                    new EditorKeyBinder(219, !isMacPlatform, false, false, true), // Ctrl + [
                    'previousPanel'
                );
                this.codeMirrorInstance.assignKeyCommand(
                    new EditorKeyBinder(221, !isMacPlatform, false, false, true), // Ctrl + ]
                    'nextPanel'
                );
            } else {
                console.warn("EditorKeyBinder not found. Keybindings might not work as expected.");
            }
        } else {
            console.warn("Editor instance does not support 'setAction' or 'assignKeyCommand'.");
        }

        // Fallback or additional global keydown listener
        $(document).on('keydown', function (e) {
            // Only process if Ctrl key is pressed
            if (e.ctrlKey) {
                if (e.keyCode === 219) { // Ctrl + [
                    e.preventDefault(); // Prevent default browser action
                    navigateTabBackward();
                } else if (e.keyCode === 221) { // Ctrl + ]
                    e.preventDefault(); // Prevent default browser action
                    navigateTabForward();
                }
            }
        });
    };
    return CodePaneController;
}());

/*
  Original source: http://git.eclipse.org/c/e4/org.eclipse.orion.client.git/tree/bundles/org.eclipse.orion.client.editor/web/examples/textview/textStyler.js
  Customized for CodeStreamApp by sugyan and further modified for Type III cloning.
 */

/*******************************************************************************
 * Copyright (c) 2010, 2011 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License v1.0
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html).
 *
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/

CodeStreamApp.SyntaxHighlighter = (function () {
    // Token type constants for the scanner
    var TOKEN_TYPE_UNKNOWN = 1;
    var TOKEN_TYPE_KEYWORD = 2;
    var TOKEN_TYPE_STRING_LITERAL = 3;
    var TOKEN_TYPE_COMMENT_BLOCK = 4;
    var TOKEN_TYPE_WHITESPACE = 5;
    var TOKEN_TYPE_TAB_SPACE = 6;
    var TOKEN_TYPE_REGULAR_SPACE = 7;

    // Styling definitions for different token types
    var commentTokenStyle = { styleClass: "token_comment_style" };
    var stringLiteralTokenStyle = { styleClass: "token_string_style" };
    var keywordTokenStyle = { styleClass: "token_keyword_style" };
    var activeLineHighlightStyle = { styleClass: "line_caret_highlight" };

    // SourceCodeScanner: Responsible for breaking down text into tokens
    var SourceCodeScanner = (function () {
        function SourceCodeScanner(languageKeywords, commentDelimiters) {
            this.languageKeywords = languageKeywords || [];
            this.commentDelimiters = {}; // Store comment start patterns
            if (commentDelimiters) {
                for (var i = commentDelimiters.length - 1; i >= 0; i--) { // Changed loop direction
                    this.commentDelimiters[commentDelimiters[i]] = true;
                }
            }
            this.setSourceContent(""); // Initialize with empty content
        }

        // Helper to check if a character is alphanumeric or underscore
        function isAlphaNumericOrUnderscore(charCode) {
            return (charCode >= 97 && charCode <= 122) || // a-z
                   (charCode >= 65 && charCode <= 90) ||  // A-Z
                   (charCode >= 48 && charCode <= 57) ||  // 0-9
                   (charCode === 95);                     // _
        }

        SourceCodeScanner.prototype = {
            // Returns the current character offset
            getCurrentOffset: function () {
                return this.currentPosition;
            },
            // Returns the starting offset of the current token
            getTokenStartOffset: function () {
                return this.tokenStartPosition;
            },
            // Extracts the text of the current token
            extractTokenText: function () {
                return this.sourceContent.substring(this.tokenStartPosition, this.currentPosition);
            },
            // Returns the length of the current token
            getTokenLength: function () {
                return this.currentPosition - this.tokenStartPosition;
            },
            // Reads the next character from the source content
            readNextChar: function () {
                if (this.currentPosition < this.sourceContent.length) {
                    return this.sourceContent.charCodeAt(this.currentPosition++);
                }
                return -1; // End of stream marker
            },
            // Rewinds the character stream by one position
            rewindChar: function (charToUnread) {
                if (charToUnread !== -1) {
                    this.currentPosition--;
                }
            },
            // Determines and returns the next token type
            getNextToken: function () {
                this.tokenStartPosition = this.currentPosition;
                for (;;) { // Infinite loop, token type will break it
                    var charCode = this.readNextChar();
                    switch (charCode) {
                        case -1: // End of input
                            return null;
                        case 47: // SLASH -> potentially a comment
                            if (this.commentDelimiters["//"]) {
                                var nextChar = this.readNextChar();
                                if (nextChar === 47) { // Single-line comment //
                                    for (;;) {
                                        nextChar = this.readNextChar();
                                        if ((nextChar === -1) || (nextChar === 10)) { // EOF or newline
                                            this.rewindChar(nextChar);
                                            return TOKEN_TYPE_COMMENT_BLOCK;
                                        }
                                    }
                                }
                                this.rewindChar(nextChar); // Not a comment, rewind
                                return TOKEN_TYPE_UNKNOWN;
                            }
                            break; // If "//" is not a recognized comment, fall through
                        case 35: // HASH -> potentially a comment (e.g., Python, Ruby)
                            if (this.commentDelimiters["#"]) {
                                for (;;) {
                                    var followingChar = this.readNextChar();
                                    if ((followingChar === -1) || (followingChar === 10)) {
                                        this.rewindChar(followingChar);
                                        return TOKEN_TYPE_COMMENT_BLOCK;
                                    }
                                }
                            }
                            break;
                        case 39: // SINGLE QUOTE -> character literal or string
                            for (;;) {
                                var stringChar = this.readNextChar();
                                switch (stringChar) {
                                    case 39: // Closing single quote
                                        return TOKEN_TYPE_STRING_LITERAL;
                                    case -1: // EOF while in string
                                        this.rewindChar(stringChar);
                                        return TOKEN_TYPE_STRING_LITERAL;
                                    case 92: // BACKSLASH -> escape sequence
                                        this.readNextChar(); // Consume escaped char
                                        break;
                                    default:
                                        // Continue reading string content
                                }
                            }
                        case 34: // DOUBLE QUOTE -> string literal
                            for (;;) {
                                var stringCharDbl = this.readNextChar();
                                switch (stringCharDbl) {
                                    case 34: // Closing double quote
                                        return TOKEN_TYPE_STRING_LITERAL;
                                    case -1: // EOF while in string
                                        this.rewindChar(stringCharDbl);
                                        return TOKEN_TYPE_STRING_LITERAL;
                                    case 92: // BACKSLASH -> escape sequence
                                        this.readNextChar(); // Consume escaped char
                                        break;
                                    default:
                                        // Continue reading string content
                                }
                            }
                        case 32: // SPACE
                        case 9:  // TAB
                            do {
                                charCode = this.readNextChar();
                            } while (charCode === 32 || charCode === 9);
                            this.rewindChar(charCode);
                            return TOKEN_TYPE_WHITESPACE;
                        default:
                            var isCSSIdentifierChar = (charCode === 0x2d && this.isCSS); // Check for hyphen in CSS
                            if (isAlphaNumericOrUnderscore(charCode) || isCSSIdentifierChar) {
                                var currentWordStart = this.currentPosition - 1;
                                do {
                                    charCode = this.readNextChar();
                                } while (isAlphaNumericOrUnderscore(charCode) || (charCode === 0x2d && this.isCSS));
                                this.rewindChar(charCode);
                                var identifiedWord = this.sourceContent.substring(currentWordStart, this.currentPosition);

                                // Check if the identified word is a keyword
                                for (var k = 0; k < this.languageKeywords.length; k++) {
                                    if (this.languageKeywords[k] === identifiedWord) {
                                        return TOKEN_TYPE_KEYWORD;
                                    }
                                }
                            }
                            return TOKEN_TYPE_UNKNOWN; // If no other token type matched
                    }
                }
            },
            // Sets the source text for the scanner
            setSourceContent: function (textData) {
                this.sourceContent = textData;
                this.currentPosition = 0;
                this.tokenStartPosition = 0;
            }
        };
        return SourceCodeScanner;
    }());

    // HighlightStyler: Applies syntax highlighting based on scanner output
    function HighlightStyler(textViewInstance) {
        if (!textViewInstance) {
            console.error("HighlightStyler: TextView instance not provided.");
            return;
        }
        this.commentBlockOffset = 0; // Tracks the start of potential multi-line comments
        this.commentDelimiterPositions = []; // Stores start/end offsets of multi-line comments
        this.highlightCurrentLine = true; // Flag to enable/disable caret line highlighting

        var supportedKeywords = ["var", "function", "return", "if", "else", "for", "while", "do", "switch", "case", "break", "continue", "try", "catch", "finally", "new", "this", "delete", "typeof", "instanceof", "in", "void", "with", "debugger"]; // Common JS keywords
        var commentPatterns = ["//", "/*", "*/"]; // Example comment patterns

        this.textViewInstance = textViewInstance;
        this._contentScanner = new SourceCodeScanner(supportedKeywords, commentPatterns);

        // Bind event listeners to the textViewInstance
        this.textViewInstance.addEventListener("Selection", this, this.handleSelectionChange.bind(this)); // Bind 'this'
        this.textViewInstance.addEventListener("ModelChanged", this, this.handleModelUpdate.bind(this));
        this.textViewInstance.addEventListener("LineStyle", this, this.applyLineStyling.bind(this));

        this.textViewInstance.redrawLines(); // Trigger an initial redraw
    }

    HighlightStyler.prototype = {
        // Handles changes in the text selection
        handleSelectionChange: function (eventPayload) {
            var oldSelectionRange = eventPayload.oldValue;
            var newSelectionRange = eventPayload.newValue;
            var viewContext = this.textViewInstance;
            var documentModel = viewContext.getModel();
            var lineIndex;

            if (this.highlightCurrentLine) {
                var oldCaretLineIndex = documentModel.getLineAtOffset(oldSelectionRange.start);
                lineIndex = documentModel.getLineAtOffset(newSelectionRange.start);
                var isNewSelectionEmpty = newSelectionRange.start === newSelectionRange.end;
                var isOldSelectionEmpty = oldSelectionRange.start === oldSelectionRange.end;

                // Redraw lines only if caret line changes or selection state changes from non-empty to empty
                if (!(oldCaretLineIndex === lineIndex && isOldSelectionEmpty && isNewSelectionEmpty)) {
                    if (isOldSelectionEmpty) { // If old selection was just a caret, redraw its line
                        viewContext.redrawLines(oldCaretLineIndex, oldCaretLineIndex + 1);
                    }
                    if ((oldCaretLineIndex !== lineIndex || !isOldSelectionEmpty) && isNewSelectionEmpty) {
                        // If caret moved or selection became empty, redraw new caret line
                        viewContext.redrawLines(lineIndex, lineIndex + 1);
                    }
                }
            }
        },

        // Handles updates to the document model (text insertion/deletion)
        handleModelUpdate: function (eventPayload) {
            var changeStartOffset = eventPayload.start;
            var removedCharacterCount = eventPayload.removedCharCount;
            var addedCharacterCount = eventPayload.addedCharCount;

            // Adjust bracket tracking offsets if they are affected by the change
            if (this._matchedParenthesisPosition && changeStartOffset < this._matchedParenthesisPosition) {
                this._matchedParenthesisPosition += addedCharacterCount - removedCharacterCount;
            }
            if (this._cursorParenthesisPosition && changeStartOffset < this._cursorParenthesisPosition) {
                this._cursorParenthesisPosition += addedCharacterCount - removedCharacterCount;
            }

            // If change is beyond the known comment block offset, no need to re-evaluate comments
            if (changeStartOffset >= this.commentBlockOffset) { return; }

            var textDocumentModel = this.textViewInstance.getModel();

            // Ensure multi-line comment start/end patterns are defined
            if (!this._contentScanner.commentDelimiters["/*"] || !this._contentScanner.commentDelimiters["*/"]) {
                return; // No multi-line comment support, skip
            }

            var numCommentDelimiters = this.commentDelimiterPositions.length;
            var multiLineCommentStart = "/*"; // Specific multi-line comment start
            var multiLineCommentEnd = "*/";   // Specific multi-line comment end

            // Determine an 'extra' padding for searching around changes
            var delimiterPadding = Math.max(multiLineCommentStart.length - 1, multiLineCommentEnd.length - 1);

            if (numCommentDelimiters === 0) {
                this.commentBlockOffset = Math.max(0, changeStartOffset - delimiterPadding);
                return;
            }
            
            var totalCharCount = textDocumentModel.getCharCount();
            var oldTotalCharCount = totalCharCount - addedCharacterCount + removedCharacterCount;

            // Find the affected range of comment delimiters
            var startDelimiterIndex = this._binarySearch(this.commentDelimiterPositions, changeStartOffset, -1, numCommentDelimiters);
            var changeEndOffset = changeStartOffset + removedCharacterCount;
            var endDelimiterIndex = this._binarySearch(this.commentDelimiterPositions, changeEndOffset, startDelimiterIndex - 1, numCommentDelimiters);

            var tempStartOffset;
            if (startDelimiterIndex > 0) {
                tempStartOffset = this.commentDelimiterPositions[--startDelimiterIndex];
            } else {
                tempStartOffset = Math.max(0, Math.min(this.commentDelimiterPositions[startDelimiterIndex] || changeStartOffset, changeStartOffset) - delimiterPadding);
                --startDelimiterIndex; // Adjust index for splice
            }

            var tempEndOffset;
            var repaintEndOffset = totalCharCount;
            if (endDelimiterIndex + 1 < this.commentDelimiterPositions.length) {
                tempEndOffset = this.commentDelimiterPositions[++endDelimiterIndex];
                if (changeEndOffset > (tempEndOffset - multiLineCommentEnd.length)) {
                    if (endDelimiterIndex + 2 < this.commentDelimiterPositions.length) {
                        endDelimiterIndex += 2;
                        tempEndOffset = this.commentDelimiterPositions[endDelimiterIndex];
                        repaintEndOffset = tempEndOffset + 1;
                        if (repaintEndOffset > changeStartOffset) { repaintEndOffset += addedCharacterCount - removedCharacterCount; }
                    } else {
                        tempEndOffset = Math.min(oldTotalCharCount, changeEndOffset + delimiterPadding);
                        this.commentBlockOffset = tempEndOffset;
                    }
                }
            } else {
                tempEndOffset = Math.min(oldTotalCharCount, changeEndOffset + delimiterPadding);
                this.commentBlockOffset = tempEndOffset;
                if (endDelimiterIndex > 0 && endDelimiterIndex === this.commentDelimiterPositions.length) {
                    endDelimiterIndex = this.commentDelimiterPositions.length - 1;
                }
            }
            
            // Adjust offsets for character count changes
            if (tempStartOffset > changeStartOffset) { tempStartOffset += addedCharacterCount - removedCharacterCount; }
            if (tempEndOffset > changeStartOffset) { tempEndOffset += addedCharacterCount - removedCharacterCount; }

            // If the last delimiter was at the old total character count, it might be invalid now
            if (this.commentDelimiterPositions.length > 0 && this.commentDelimiterPositions[this.commentDelimiterPositions.length - 1] === oldTotalCharCount) {
                this.commentDelimiterPositions.length--;
            }

            var searchOffset = 0;
            var updatedDelimiterPositions = [];
            var textSnippet = textDocumentModel.getText(tempStartOffset, tempEndOffset);
            if (this.commentBlockOffset < tempEndOffset) { this.commentBlockOffset = tempEndOffset; }

            // Re-scan the affected text snippet for comment delimiters
            for (;;) {
                var isStartingDelimiter = ((startDelimiterIndex + 1 + updatedDelimiterPositions.length) & 1) === 0;
                var currentDelimiterPattern = isStartingDelimiter ? multiLineCommentStart : multiLineCommentEnd;
                var foundIndex = textSnippet.indexOf(currentDelimiterPattern, searchOffset);
                if (foundIndex !== -1) {
                    updatedDelimiterPositions.push(tempStartOffset + (isStartingDelimiter ? foundIndex : foundIndex + currentDelimiterPattern.length));
                } else {
                    break;
                }
                searchOffset = foundIndex + currentDelimiterPattern.length;
            }

            var needsRepaint = (endDelimiterIndex - startDelimiterIndex) !== updatedDelimiterPositions.length;
            if (!needsRepaint) {
                for (var loopCounter = 0; loopCounter < updatedDelimiterPositions.length; loopCounter++) {
                    var existingOffset = this.commentDelimiterPositions[startDelimiterIndex + 1 + loopCounter];
                    if (existingOffset > changeStartOffset) { existingOffset += addedCharacterCount - removedCharacterCount; }
                    if (existingOffset !== updatedDelimiterPositions[loopCounter]) {
                        needsRepaint = true;
                        break;
                    }
                }
            }
            
            // Update the commentDelimiterPositions array
            var spliceArguments = [startDelimiterIndex + 1, (endDelimiterIndex - startDelimiterIndex)];
            // Add new elements to spliceArguments
            for (var argIdx = 0; argIdx < updatedDelimiterPositions.length; argIdx++) {
                spliceArguments.push(updatedDelimiterPositions[argIdx]);
            }
            Array.prototype.splice.apply(this.commentDelimiterPositions, spliceArguments); // Use apply for dynamic arguments

            // Adjust subsequent comment delimiter positions
            for (var k = startDelimiterIndex + 1 + updatedDelimiterPositions.length; k < this.commentDelimiterPositions.length; k++) {
                this.commentDelimiterPositions[k] += addedCharacterCount - removedCharacterCount;
            }
            
            // Ensure the commentDelimiterPositions array is balanced (even number of delimiters)
            if ((this.commentDelimiterPositions.length & 1) === 1) {
                this.commentDelimiterPositions.push(totalCharCount); // Append end of document as a closing delimiter
            }
            
            if (needsRepaint) {
                this.textViewInstance.redrawRange(changeStartOffset + addedCharacterCount, repaintEndOffset);
            }
        },

        // Binary search for an offset in a sorted array
        _binarySearch: function (arr, offset, low, high) {
            var mid, val;
            while (low <= high) {
                mid = Math.floor((low + high) / 2);
                val = arr[mid];
                if (offset === val) { return mid; }
                if (offset < val) {
                    high = mid - 1;
                } else {
                    low = mid + 1;
                }
            }
            return low;
        },

        // Applies styling to lines based on token types
        applyLineStyling: function (lineStyleEvent) {
            var lineText = lineStyleEvent.lineText;
            var lineStartOffset = lineStyleEvent.lineStart;
            var styles = lineStyleEvent.styles;

            this._contentScanner.setSourceContent(lineText);
            var token;
            while ((token = this._contentScanner.getNextToken()) !== null) {
                var tokenLength = this._contentScanner.getTokenLength();
                if (tokenLength === 0) { continue; } // Skip empty tokens

                var styleToApply = null;
                switch (token) {
                    case TOKEN_TYPE_KEYWORD:
                        styleToApply = keywordTokenStyle;
                        break;
                    case TOKEN_TYPE_STRING_LITERAL:
                        styleToApply = stringLiteralTokenStyle;
                        break;
                    case TOKEN_TYPE_COMMENT_BLOCK:
                        styleToApply = commentTokenStyle;
                        break;
                    // No specific styles for UNKNOWN or WHITESPACE for now
                }
                if (styleToApply) {
                    styles.push({
                        start: this._contentScanner.getTokenStartOffset(),
                        end: this._contentScanner.getCurrentOffset(),
                        style: styleToApply
                    });
                }
            }

            // Apply caret line highlighting if enabled
            if (this.highlightCurrentLine) {
                var selection = this.textViewInstance.getSelection();
                if (selection.start === selection.end &&
                    lineStartOffset <= selection.start &&
                    selection.start < lineStartOffset + lineText.length) {
                    styles.push({
                        start: 0,
                        end: lineText.length,
                        style: activeLineHighlightStyle
                    });
                }
            }
        }
    };
    return HighlightStyler;
}());