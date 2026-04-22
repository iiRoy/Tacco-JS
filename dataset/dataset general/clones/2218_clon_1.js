var Livecoder = Livecoder || {}; // Initialize Livecoder namespace if it doesn't exist.


/*
 *  This section contains common JavaScript functionalities
 *  that are executed once the Document Object Model (DOM) is fully loaded.
 *  It includes UI interactions for user authentication and navigation.
 */
$(function() {

    var mouseout = true; // Flag to track mouse exit state for dropdown.

    // Configure mouse events for the sign-in area.
    $('#signin')
        .mouseover(function() {
            // When mouse hovers over '#signin', show the dropdown list.
            $('#signin_list').show();
            mouseout = false; // Reset mouseout flag, as mouse is now over.
        })
        .mouseout(function() {
            mouseout = true; // Set mouseout flag to true when mouse leaves.

            // Use a short delay to allow re-entry before hiding the list.
            setTimeout(function() {
                if (mouseout) {
                    // If the mouse is still out after the delay, hide the list.
                    $('#signin_list').hide();
                }
            }, 100); // 100 milliseconds delay.
        });


    // Attach click event handler to all elements with class 'menu_item'.
    $('.menu_item').click(function() {
        var menu = $(this).text(); // Get the text content of the clicked menu item.

        // Remove the 'selected' class from any currently selected div.
        $('div.selected').removeClass('selected');

        // Hide all elements with class 'menu_window'.
        $('div.menu_window').hide();

        // Show the specific menu window corresponding to the clicked item's text.
        $('#' + menu).show();

        // Add the 'selected' class to the currently clicked menu item.
        $(this).addClass('selected');

        // Special handling for the 'chat' menu item.
        if (menu === 'chat') {
            $('#message').focus(); // Set focus to the message input field.
        }
    });


    /*
     *  Hatena Bookmark Integration:
     *  Conditionally adds Hatena social sharing buttons if the browser's
     *  language setting indicates Japanese ('ja').
     */
    if (/ja/.test(navigator.language || navigator.userLanguage || navigator.browserLanguage)) {
        $('#socialbuttons').prepend($('<div>')
            .css({
                margin: '7px 7px 0 0' // Apply custom margin to the new div container.
            })
            .append('<a href="http://b.hatena.ne.jp/entry/http://livecoder.sugyan.com/" class="hatena-bookmark-button" data-hatena-bookmark-title="Livecoder" data-hatena-bookmark-layout="standard" title="このエントリーをはてなブックマークに追加"><img src="http://b.st-hatena.com/images/entry-button/button-only.gif" alt="このエントリーをはてなブックマークに追加" width="20" height="20" style="border: none;" /></a><script type="text/javascript" src="http://b.st-hatena.com/js/bookmark_button.js" charset="utf-8" async="async"></script>'));
    }

}); // End of jQuery DOM ready function.


// Livecoder.Util module: A simple utility class.
Livecoder.Util = (function() {

    function Util() {
        // Constructor for the Util class. Currently, it does nothing.
    }

    return Util; // Return the Util constructor function.

}()); // End of Livecoder.Util IIFE.


// Livecoder.Socket module: Handles WebSocket communication and UI updates.
Livecoder.Socket = (function() {

    // Socket constructor: Takes a socket instance as an argument.
    function Socket(socket) {
        this.socket = socket; // Store the provided socket connection.
    }

    /**
     *  Socket.prototype.use:
     *  Iterates through an array of method names and calls each method
     *  on the current Socket instance.
     *  @param {Array<string>} methods - An array of method names to execute.
     */
    Socket.prototype.use = function(methods) {
        var i;
        for (i = methods.length; i--;) {
            this[methods[i]](); // Call each method by its name.
        }
    };

    /**
     *  Socket.prototype.chat:
     *  Sets up a listener for 'message' events from the socket, specifically
     *  to handle and display chat and information messages.
     */
    Socket.prototype.chat = function() {
        this.socket.on('message', function(msg) {
            var data; // Variable to hold message data.

            // Process incoming chat messages.
            if (msg.chat) {
                data = msg.chat; // Extract chat data.
                $('#message_list').prepend( // Prepend new message to the list.
                    $('<dt>') // Create a definition term element.
                        .append($('<span>').addClass('name').text(data.user)) // Add user's name.
                        .append($('<span>').addClass('time').text(
                            new Date(data.date).toLocaleTimeString() // Add formatted timestamp.
                        ))
                        .after($('<dd>').text(data.message)) // Add message content as a definition description.
                );
            }

            // Process incoming information messages.
            if (msg.info) {
                data = msg.info; // Extract info data.
                var dt = $('<dt>').addClass('info') // Create <dt> for info message.
                    .append($('<span>').addClass('name').text(data.user))
                    .append($('<span>').addClass('time').text(
                        new Date(data.date).toLocaleTimeString()
                    ));
                var dd = $('<dd>').addClass('info').text(data.action + '.'); // Create <dd> for info action.
                $('#message_list').prepend(dt.after(dd)); // Prepend combined elements.
            }
        });
    };

    /**
     *  Socket.prototype.stat:
     *  Sets up a listener for 'message' events to update application statistics,
     *  such as viewer lists and livecoding status.
     */
    Socket.prototype.stat = function() {
        // Listen for 'message' events on the global socket object (not `this.socket` here, which is interesting).
        socket.on('message', function(msg) {
            // If the message does not contain 'stat' data, ignore it.
            if (!msg.stat) {
                return;
            }

            // --- Update Viewers List ---
            var viewers = []; // Array to hold viewer objects.
            var viewer, obj = msg.stat.viewers; // Get the viewers object.

            // Iterate over the viewers object to populate the array.
            for (viewer in obj) {
                if (obj.hasOwnProperty(viewer)) { // Ensure it's an own property.
                    viewers.push(msg.stat.viewers[viewer]);
                }
            }

            // Sort viewers by their 'start' time.
            var sorted = viewers.sort(function(a, b) {
                return a.start - b.start;
            });

            var ul = $('#viewers_list'); // Get the viewers list unordered element.
            ul.children().remove(); // Clear all existing list items.

            var i; // Loop counter.
            // Append sorted viewer names to the list.
            for (i = sorted.length; i--;) {
                ul.append($('<li>').text(sorted[i].name));
            }

            // Update the viewer count display.
            $('#viewers_count').empty()
                .append($('<span>').addClass('count').text(sorted.length))
                .append(' viewers');


            // --- Update Livecoding Status ---
            if (msg.stat.editing) {
                // If livecoding is active, display "livecoding now!".
                $('.status_line').html(
                    $('<span>').css({
                        'color': '#FFB0B0',      // Light red color.
                        'font-weight': 'bold'    // Bold text.
                    }).text('livecoding now!')
                        .after($('<span>').addClass('time').data(
                            'date', msg.stat.editing.start // Store start time for duration.
                        ))
                );
            } else {
                // If livecoding is not active, display "not livecoding now...".
                $('.status_line').html(
                    $('<span>').css({
                        'color': '#C0C0C0',      // Gray color.
                        'font-weight': 'normal'  // Normal text weight.
                    }).text('not livecoding now...')
                );
            }
        }); // End of socket.on('message') handler.


        // Function to periodically update the elapsed time displayed.
        var updateTime;
        updateTime = function() {
            $('.status_line .time').each(function(i, e) {
                // Calculate the duration in seconds since the 'date' was stored.
                var duration = Math.floor(
                    (new Date().getTime() - $(e).data('date')) / 1000
                );
                var m = Math.floor(duration / 60); // Calculate minutes.
                var s = duration % 60;             // Calculate remaining seconds.

                // Update the element's text with formatted MM:SS time.
                $(e).text(
                    (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s
                );
            });
            setTimeout(updateTime, 1000); // Schedule the next update in 1 second.
        };

        updateTime(); // Initial call to start the time update loop.
    };

    return Socket; // Return the Socket constructor function.

}()); // End of Livecoder.Socket IIFE.


// Livecoder.Editor module: Manages editor-specific functionalities.
Livecoder.Editor = (function() {

    // Editor constructor: Takes an editor instance (e.g., Orion editor).
    function Editor(editor) {
        this.editor = editor; // Store the editor instance.
    }

    /**
     *  Editor.prototype.use:
     *  Executes a list of specified methods on the current Editor instance.
     *  @param {Array<string>} methods - An array of method names to call.
     */
    Editor.prototype.use = function(methods) {
        var i;
        for (i = methods.length; i--;) {
            this[methods[i]](); // Call each method.
        }
    };

    /**
     *  Editor.prototype.menu:
     *  Implements menu navigation logic, including keyboard shortcuts
     *  for switching between editor tabs/menus.
     */
    Editor.prototype.menu = function() {
        var self = this; // Capture 'this' for use within nested functions.

        // Get menu items, reverse them, and convert to a plain array.
        var menus = $('.menu_item').toArray().reverse();
        var index = menus.length - 2; // Initialize menu index.

        // Function to navigate to the previous menu item.
        function menuPrevious() {
            index--;        // Decrement the index.
            changeMenu();   // Apply the menu change.
        }

        // Function to navigate to the next menu item.
        function menuNext() {
            index++;        // Increment the index.
            changeMenu();   // Apply the menu change.
        }

        // Core function to handle menu selection and UI updates.
        function changeMenu() {
            // Wrap around if index goes below zero.
            if (index < 0) {
                index = menus.length - 1;
            }
            // Wrap around if index goes beyond the array bounds.
            if (index === menus.length) {
                index = 0;
            }

            $(menus[index]).click(); // Simulate a click on the selected menu item.

            // If the selected item is not the editor tab and the editor is not readonly,
            // focus the editor after a minimal delay.
            if (index !== menus.length - 2 && (!self.editor.readonly)) {
                setTimeout(function() {
                    self.editor.focus(); // Set focus to the editor.
                }, 0); // Zero-delay timeout for async focus.
            }
        }

        // Register custom actions with the editor instance.
        this.editor.setAction('menuPrevious', menuPrevious);
        this.editor.setAction('menuNext', menuNext);

        // Set key bindings for menu navigation using Ctrl + '[' and Ctrl + ']'.
        // Key code 219 is '['. The Mac platform check adjusts for different key behavior.
        this.editor.setKeyBinding(
            new orion.textview.KeyBinding(219, navigator.platform.indexOf("Mac") === -1, false, false, true),
            'menuPrevious'
        );
        // Key code 221 is ']'.
        this.editor.setKeyBinding(
            new orion.textview.KeyBinding(221, navigator.platform.indexOf("Mac") === -1, false, false, true),
            'menuNext'
        );

        // Bind a global keydown event listener to the document for these shortcuts.
        $(document).bind('keydown', function(e) {
            if (e.ctrlKey) { // Check if the Control key is pressed.
                if (e.keyCode === 219) { // If Ctrl + '['
                    menuPrevious();
                }
                if (e.keyCode === 221) { // If Ctrl + ']'
                    menuNext();
                }
            }
        });
    };

    return Editor; // Return the Editor constructor function.

}()); // End of Livecoder.Editor IIFE.


/*
 *  The following code related to TextStyler and Scanner
 *  is based on the implementation found in the Eclipse Orion client editor.
 *
 *  Source: http://git.eclipse.org/c/e4/org.eclipse.orion.client.git/tree/bundles/org.eclipse.orion.client.editor/web/examples/textview/textStyler.js
 *  This particular version has been modified by sugyan for Livecoder.
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


// Livecoder.TextStyler module for syntax highlighting and text styling.
Livecoder.TextStyler = (function() {

    // --- Scanner Constants ---
    // Define numerical identifiers for different token types.
    var UNKNOWN     = 1; // Default or unrecognized token.
    var KEYWORD     = 2; // Reserved keyword.
    var STRING      = 3; // String literal.
    var COMMENT     = 4; // Code comment.
    var WHITE       = 5; // General whitespace (spaces, tabs, newlines).
    var WHITE_TAB   = 6; // Specifically a tab character.
    var WHITE_SPACE = 7; // Specifically a space character.


    // --- Styling Definitions ---
    // Define CSS class names to be applied for different token styles.
    var commentStyle   = { styleClass: "token_comment" };
    var stringStyle    = { styleClass: "token_string"  };
    var keywordStyle   = { styleClass: "token_keyword" };
    var caretLineStyle = { styleClass: "line_caret"    };


    // Inner Scanner class definition for tokenizing text.
    var Scanner = (function() {

        /**
         *  Scanner constructor.
         *  Initializes the scanner with a list of keywords and comment start delimiters.
         *  @param {Array<string>} keywords     - List of keywords to recognize.
         *  @param {Array<string>} commentStart - List of comment start delimiters (e.g., ["//", "#"]).
         */
        function Scanner(keywords, commentStart) {
            var i;
            this.keywords = keywords;       // Store the keywords array.
            this.commentStart = {};         // Initialize an object for quick comment start lookup.

            if (commentStart) {
                for (i = commentStart.length; i--;) {
                    this.commentStart[commentStart[i]] = true; // Map comment starts to true.
                }
            }

            this.setText(""); // Initialize the scanner with an empty text.
        }

        // Scanner prototype methods.
        Scanner.prototype = {

            /**
             *  getOffset: Returns the current absolute offset in the text being scanned.
             *  @returns {number} The current offset.
             */
            getOffset: function() {
                return this.offset;
            },

            /**
             *  getStartOffset: Returns the starting offset of the current token.
             *  @returns {number} The start offset of the token.
             */
            getStartOffset: function() {
                return this.startOffset;
            },

            /**
             *  getData: Retrieves the text content of the token that was just scanned.
             *  @returns {string} The text of the current token.
             */
            getData: function() {
                return this.text.substring(this.startOffset, this.offset);
            },

            /**
             *  getDataLength: Returns the length of the current token.
             *  @returns {number} The length of the current token.
             */
            getDataLength: function() {
                return this.offset - this.startOffset;
            },

            /**
             *  _read: Reads the next character from the text and increments the offset.
             *  @private
             *  @returns {number} The ASCII code of the character, or -1 if end of text.
             */
            _read: function() {
                if (this.offset < this.text.length) {
                    return this.text.charCodeAt(this.offset++);
                }
                return -1; // End of input.
            },

            /**
             *  _unread: Moves the scanner's offset back by one character.
             *  @private
             *  @param {number} c - The character code that was just read (ignored if -1).
             */
            _unread: function(c) {
                if (c !== -1) {
                    this.offset--;
                }
            },

            /**
             *  nextToken: Scans for and returns the type of the next token in the text.
             *  This is the core tokenizing logic.
             *  @returns {number|null} The token type constant (e.g., KEYWORD, STRING), or null if end of text.
             */
            nextToken: function() {
                this.startOffset = this.offset; // Mark the beginning of the new token.

                while (true) {
                    var c = this._read(); // Read the next character.

                    switch (c) {
                        case -1:
                            return null; // End of file.

                        case 47: // ASCII '/' - potential start of a comment (e.g., //) or operator.
                            if (this.commentStart["//"]) {
                                c = this._read();
                                if (c === 47) { // Found "//"
                                    while (true) {
                                        c = this._read();
                                        if ((c === -1) || (c === 10)) { // End of file or newline.
                                            this._unread(c);
                                            return COMMENT; // It's a line comment.
                                        }
                                    }
                                }
                                this._unread(c); // Not a line comment, put char back.
                                return UNKNOWN; // Treat '/' as unknown (e.g., division).
                            }
                            break;

                        case 35: // ASCII '#' - potential start of a comment (e.g., #).
                            if (this.commentStart["#"]) {
                                while (true) {
                                    c = this._read();
                                    if ((c === -1) || (c === 10)) { // End of file or newline.
                                        this._unread(c);
                                        return COMMENT; // It's a line comment.
                                    }
                                }
                            }
                            break;

                        case 39: // ASCII ''' - single quote, marks start of a string literal.
                            while (true) {
                                c = this._read();
                                switch (c) {
                                    case 39: // Closing single quote.
                                        return STRING;
                                    case -1: // End of file, unclosed string.
                                        this._unread(c);
                                        return STRING;
                                    case 92: // ASCII '\' - escape character.
                                        c = this._read(); // Read the escaped character.
                                        break;
                                }
                            }
                            // No break here, loop continues for next character in string.

                        case 34: // ASCII '"' - double quote, marks start of a string literal.
                            while (true) {
                                c = this._read();
                                switch (c) {
                                    case 34: // Closing double quote.
                                        return STRING;
                                    case -1: // End of file, unclosed string.
                                        this._unread(c);
                                        return STRING;
                                    case 92: // ASCII '\' - escape character.
                                        c = this._read(); // Read the escaped character.
                                        break;
                                }
                            }
                            // No break here, loop continues for next character in string.

                        case 32: // ASCII ' ' - space.
                        case 9:  // ASCII '\t' - tab.
                            do {
                                c = this._read(); // Consume all consecutive whitespace characters.
                            } while (c === 32 || c === 9);
                            this._unread(c); // Put back the non-whitespace character.
                            return WHITE; // Return whitespace token type.

                        default:
                            var i, isCSS = this.isCSS;
                            // Check for letters (a-z, A-Z), underscore, numbers, or hyphen (for CSS).
                            if ((97 <= c && c <= 122) || (65 <= c && c <= 90) || c === 95 || (48 <= c && c <= 57) || (0x2d === c && isCSS)) {
                                var off = this.offset - 1; // Start of the potential word/identifier.
                                do {
                                    c = this._read(); // Consume characters that form part of a word.
                                } while ((97 <= c && c <= 122) || (65 <= c && c <= 90) || c === 95 || (48 <= c && c <= 57) || (0x2d === c && isCSS));
                                this._unread(c); // Put back the non-word character.
                                var word = this.text.substring(off, this.offset); // Extract the word.

                                // TODO: This linear search for keywords can be slow for large keyword sets.
                                for (i = 0; i < this.keywords.length; i++) {
                                    if (this.keywords[i] === word) {
                                        return KEYWORD; // Found a keyword.
                                    }
                                }
                            }
                            return UNKNOWN; // Not recognized as any specific token type.
                    } // End of switch(c).
                } // End of while(true) loop.
            },

            /**
             *  setText: Sets the text content that the scanner will operate on.
             *  Resets the scanner's internal offsets.
             *  @param {string} text - The new text content.
             */
            setText: function(text) {
                this.text = text;
                this.offset = 0;      // Reset current reading offset.
                this.startOffset = 0; // Reset start of token offset.
            }

        }; // End of Scanner.prototype.

        return Scanner; // Return the Scanner constructor.

    }()); // End of Scanner IIFE.


    /**
     *  Styler constructor.
     *  Initializes the text styler with a view and sets up event listeners.
     *  @param {Object} view - The text view component to style.
     */
    function Styler(view) {
        this.commentOffset = 0;           // Offset for tracking comment parsing progress.
        this.commentOffsets = [];         // Array to store start/end offsets of block comments.
        this.highlightCaretLine = true;   // Flag to enable or disable highlighting of the caret's line.

        var keywords = [];                // Initialize an empty array for keywords.
        this.view = view;                 // Store the reference to the view.
        this._scanner = new Scanner(keywords); // Create a new scanner instance.

        // Register event listeners on the view for various events.
        view.addEventListener("Selection", this, this._onSelection);
        view.addEventListener("ModelChanged", this, this._onModelChanged);
        view.addEventListener("LineStyle", this, this._onLineStyle); // Note: _onLineStyle is not provided in the original code.

        view.redrawLines(); // Trigger an initial redraw of the lines.
    }

    // Styler prototype methods.
    Styler.prototype = {

        /**
         *  _onSelection: Event handler for 'Selection' events from the view.
         *  Handles updating line highlighting based on caret/selection changes.
         *  @private
         *  @param {Object} e - The selection event object.
         */
        _onSelection: function(e) {
            var oldSelection = e.oldValue; // Previous selection state.
            var newSelection = e.newValue; // Current selection state.
            var view = this.view;          // Reference to the view.
            var model = view.getModel();   // Reference to the text model.
            var lineIndex;                 // Variable to hold the line index.

            if (this.highlightCaretLine) {
                var oldLineIndex = model.getLineAtOffset(oldSelection.start); // Line of the old caret position.
                lineIndex = model.getLineAtOffset(newSelection.start);       // Line of the new caret position.
                var newEmpty = newSelection.start === newSelection.end;         // Is the new selection a caret (empty)?
                var oldEmpty = oldSelection.start === oldSelection.end;         // Was the old selection a caret?

                // Only redraw if the caret line changed, or if the selection state (empty/non-empty) changed.
                if (!(oldLineIndex === lineIndex && oldEmpty && newEmpty)) {
                    if (oldEmpty) {
                        view.redrawLines(oldLineIndex, oldLineIndex + 1); // Redraw the line where the caret *was*.
                    }
                    if ((oldLineIndex !== lineIndex || !oldEmpty) && newEmpty) {
                        view.redrawLines(lineIndex, lineIndex + 1);       // Redraw the line where the caret *is now*.
                    }
                }
            }
        },

        /**
         *  _onModelChanged: Event handler for 'ModelChanged' events from the view.
         *  Recalculates comment offsets and triggers redraws when text content changes.
         *  @private
         *  @param {Object} e - The model changed event object.
         */
        _onModelChanged: function(e) {
            var start            = e.start;            // Start offset of the change.
            var removedCharCount = e.removedCharCount; // Number of characters removed.
            var addedCharCount   = e.addedCharCount;   // Number of characters added.

            // Adjust matching bracket offsets if the change occurred before them.
            if (this._matchingBracket && start < this._matchingBracket) {
                this._matchingBracket += addedCharCount + removedCharCount;
            }
            if (this._currentBracket && start < this._currentBracket) {
                this._currentBracket += addedCharCount + removedCharCount;
            }

            // If the change starts beyond the current comment scan offset, no need to re-scan.
            if (start >= this.commentOffset) {
                return;
            }

            var model = this.view.getModel(); // Get the text model.

            // If comment start/end delimiters are not defined, exit.
            if (!(this.commentStart && this.commentEnd)) {
                return;
            }

            var commentCount = this.commentOffsets.length; // Current number of comment boundary offsets.
            // Calculate extra characters to consider for potential partial comment delimiters.
            var extra = Math.max(this.commentStart.length - 1, this.commentEnd.length - 1);

            // If there are no existing comments, initialize commentOffset and return.
            if (commentCount === 0) {
                this.commentOffset = Math.max(0, start - extra);
                return;
            }

            var charCount    = model.getCharCount(); // Total character count in the model.
            var oldCharCount = charCount - addedCharCount + removedCharCount; // Char count before the change.

            // Use binary search to find the affected comment boundary indices.
            var commentStart = this._binarySearch(this.commentOffsets, start, -1, commentCount);
            var end = start + removedCharCount;
            var commentEnd = this._binarySearch(this.commentOffsets, end, commentStart - 1, commentCount);

            var ts; // Temporary start offset for re-scanning.
            if (commentStart > 0) {
                ts = this.commentOffsets[--commentStart];
            } else {
                ts = Math.max(0, Math.min(this.commentOffsets[commentStart], start) - extra);
                --commentStart;
            }

            var te; // Temporary end offset for re-scanning.
            var redrawEnd = charCount; // The maximum offset to redraw.

            if (commentEnd + 1 < this.commentOffsets.length) {
                te = this.commentOffsets[++commentEnd];
                if (end > (te - this.commentEnd.length)) {
                    if (commentEnd + 2 < this.commentOffsets.length) {
                        commentEnd += 2;
                        te = this.commentOffsets[commentEnd];
                        redrawEnd = te + 1;
                        if (redrawEnd > start) {
                            redrawEnd += addedCharCount - removedCharCount;
                        }
                    } else {
                        te = Math.min(oldCharCount, end + extra);
                        this.commentOffset = te;
                    }
                }
            } else {
                te = Math.min(oldCharCount, end + extra);
                this.commentOffset = te;
                if (commentEnd > 0 && commentEnd === this.commentOffsets.length) {
                    commentEnd = this.commentOffsets.length - 1;
                }
            }

            // Adjust temporary start and end offsets based on character changes.
            if (ts > start) {
                ts += addedCharCount - removedCharCount;
            }
            if (te > start) {
                te += addedCharCount - removedCharCount;
            }

            // If the last comment offset matches the old character count, remove it.
            if (this.commentOffsets.length > 1 && this.commentOffsets[this.commentOffsets.length - 1] === oldCharCount) {
                this.commentOffsets.length--;
            }

            var offset = 0;       // Current offset within the 't' (text segment) for re-scanning.
            var newComments = []; // Array to store newly found comment boundary offsets.
            var t = model.getText(ts, te); // Get the text segment to re-scan.

            if (this.commentOffset < te) {
                this.commentOffset = te;
            }

            // Loop to re-scan the text segment for comment boundaries.
            while (offset < t.length) {
                // Determine if we are searching for a comment start or end.
                var begin = ((commentStart + 1 + newComments.length) & 1) === 0;
                var search = begin ? this.commentStart : this.commentEnd; // The delimiter to search for.
                var index = t.indexOf(search, offset); // Find the delimiter.

                if (index !== -1) {
                    // Push the absolute offset of the found delimiter.
                    newComments.push(ts + (begin ? index : index + search.length));
                } else {
                    break; // No more delimiters found in this segment.
                }
                offset = index + search.length; // Advance past the found delimiter.
            }

            // Determine if a redraw is necessary based on changes in comment boundaries.
            var redraw = (commentEnd - commentStart) !== newComments.length;
            if (!redraw) {
                var i; // Loop variable.
                for (i = 0; i < newComments.length; i++) {
                    offset = this.commentOffsets[commentStart + 1 + i];
                    if (offset > start) {
                        offset += addedCharCount - removedCharCount;
                    }
                    if (offset !== newComments[i]) {
                        redraw = true; // A boundary moved or changed, trigger redraw.
                        break;
                    }
                }
            }

            // Update the main commentOffsets array by removing old and inserting new boundaries.
            var k, args = [commentStart + 1, (commentEnd - commentStart)].concat(newComments);
            Array.prototype.splice.apply(this.commentOffsets, args);

            // Adjust offsets of subsequent comment boundaries.
            for (k = commentStart + 1 + newComments.length; k < this.commentOffsets.length; k++) {
                this.commentOffsets[k] += addedCharCount - removedCharCount;
            }

            // Ensure the commentOffsets array maintains proper pairing or ends with charCount.
            if ((this.commentOffsets.length & 1) === 1) {
                this.commentOffsets.push(charCount);
            }

            // If a redraw is needed, trigger it for the affected range.
            if (redraw) {
                this.view.redrawRange(start + addedCharCount, redrawEnd);
            }
        },