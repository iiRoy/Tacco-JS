// This file requires Markdown.Converter.js to function correctly.

(function () {

    var util = {},
        position = {},
        ui = {},
        doc = window.document,
        re = window.RegExp, // Reference to the global RegExp object
        nav = window.navigator, // Reference to the global Navigator object
        SETTINGS = { lineLength: 72 }, // Application-wide settings

        // Used to work around some browser bugs where we can't use feature testing.
        uaSniffed = {
            isIE: /msie/.test(nav.userAgent.toLowerCase()),
            isIE_5or6: /msie 6/.test(nav.userAgent.toLowerCase()) || /msie 5/.test(nav.userAgent.toLowerCase()),
            isOpera: /opera/.test(nav.userAgent.toLowerCase())
        };


    // -------------------------------------------------------------------
    //  YOUR CHANGES GO HERE
    //
    // I've tried to localize the things you are likely to change to
    // this area.
    // -------------------------------------------------------------------

    // The text that appears on the upper part of the dialog box when
    // entering links. This is a user-configurable message.
    var linkDialogText = "<p><b>Insert Hyperlink</b></p><p>http://example.com/ \"optional title\"</p>";
    var imageDialogText = "<p><b>Insert Image</b></p><p>http://example.com/images/diagram.jpg \"optional title\"<br><br>Need <a href='http://www.google.com/search?q=free+image+hosting' target='_blank'>free image hosting?</a></p>";

    // The default text that appears in the dialog input box when entering
    // links. This provides a helpful placeholder for the user.
    var imageDefaultText = "http://";
    var linkDefaultText = "http://";

    var defaultHelpHoverTitle = "Markdown Editing Help"; // Default tooltip for the help button.

    // -------------------------------------------------------------------
    //  END OF YOUR CHANGES
    // -------------------------------------------------------------------

    // help, if given, should have a property "handler", the click handler for the help button,
    // and can have an optional property "title" for the button's tooltip (defaults to "Markdown Editing Help").
    // If help isn't given, no help button is created.
    //
    // The constructed editor object has the methods:
    // - getConverter() returns the markdown converter object that was passed to the constructor
    // - run() actually starts the editor; should be called after all necessary plugins are registered. Calling this more than once is a no-op.
    // - refreshPreview() forces the preview to be updated. This method is only available after run() was called.
    Markdown.Editor = function (markdownConverter, idPostfix, help) {

        idPostfix = idPostfix || ""; // Ensure idPostfix is a string, defaulting to empty.

        var hooks = this.hooks = new Markdown.HookCollection();
        hooks.addNoop("onPreviewRefresh");       // called with no arguments after the preview has been refreshed
        hooks.addNoop("postBlockquoteCreation"); // called with the user's selection *after* the blockquote was created; should return the actual to-be-inserted text
        hooks.addFalse("insertImageDialog");     /* called with one parameter: a callback to be called with the URL of the image. If the application creates
                                                  * its own image insertion dialog, this hook should return true, and the callback should be called with the chosen
                                                  * image url (or null if the user cancelled). If this hook returns false, the default dialog will be used.
                                                  */

        this.getConverter = function () { return markdownConverter; } // Public method to access the converter.

        var that = this, // Cache 'this' for use in inner functions.
            panels;      // Will hold references to UI panels.

        this.run = function () {
            if (panels) // Check if the editor has already been initialized.
                return; // If so, do nothing.

            panels = new PanelCollection(idPostfix); // Initialize UI panels.
            var commandManager = new CommandManager(hooks); // Manages editor commands.
            var previewManager = new PreviewManager(markdownConverter, panels, function () { hooks.onPreviewRefresh(); }); // Handles preview updates.
            var undoManager, uiManager; // Declare managers.

            // Only enable undo/redo if not explicitly disabled via URL parameter.
            if (!/\?noundo/.test(doc.location.href)) {
                undoManager = new UndoManager(function () {
                    previewManager.refresh(); // Refresh preview after undo/redo.
                    if (uiManager) // Check if uiManager is available (it won't be on the first call).
                        uiManager.setUndoRedoButtonStates(); // Update button states.
                }, panels);
                this.textOperation = function (f) {
                    undoManager.setCommandMode(); // Signal to undo manager that a command is starting.
                    f(); // Execute the text operation.
                    that.refreshPreview(); // Refresh the preview after the operation.
                }
            }

            uiManager = new UIManager(idPostfix, panels, undoManager, previewManager, commandManager, help); // Initialize UI manager.
            uiManager.setUndoRedoButtonStates(); // Set initial button states.

            var forceRefresh = that.refreshPreview = function () { previewManager.refresh(true); }; // Expose refreshPreview method.

            forceRefresh(); // Perform an initial refresh of the preview.
        };

    }

    // before: contains all the text in the input box BEFORE the selection.
    // after: contains all the text in the input box AFTER the selection.
    function Chunks() { } // Constructor for the Chunks object.

    // startRegex: a regular expression to find the start tag
    // endRegex: a regular expresssion to find the end tag
    Chunks.prototype.findTags = function (startRegex, endRegex) {

        var chunkObj = this; // Cache 'this' for use in callback functions.
        var regex;           // Declare regex variable.

        if (startRegex) {

            regex = util.extendRegExp(startRegex, "", "$"); // Extend regex to match at the end.

            this.before = this.before.replace(regex,
                function (match) {
                    chunkObj.startTag = chunkObj.startTag + match; // Prepend matched tag to startTag.
                    return ""; // Remove matched tag from 'before'.
                });

            regex = util.extendRegExp(startRegex, "^", ""); // Extend regex to match at the beginning.

            this.selection = this.selection.replace(regex,
                function (match) {
                    chunkObj.startTag = chunkObj.startTag + match; // Prepend matched tag to startTag.
                    return ""; // Remove matched tag from 'selection'.
                });
        }

        if (endRegex) {

            regex = util.extendRegExp(endRegex, "", "$"); // Extend regex to match at the end.

            this.selection = this.selection.replace(regex,
                function (match) {
                    chunkObj.endTag = match + chunkObj.endTag; // Append matched tag to endTag.
                    return ""; // Remove matched tag from 'selection'.
                });

            regex = util.extendRegExp(endRegex, "^", ""); // Extend regex to match at the beginning.

            this.after = this.after.replace(regex,
                function (match) {
                    chunkObj.endTag = match + chunkObj.endTag; // Append matched tag to endTag.
                    return ""; // Remove matched tag from 'after'.
                });
        }
    };

    // If remove is false, the whitespace is transferred
    // to the before/after regions.
    //
    // If remove is true, the whitespace disappears.
    Chunks.prototype.trimWhitespace = function (remove) {
        var beforeReplacer, afterReplacer, that = this; // Declare replacer functions and cache 'this'.
        if (remove) {
            beforeReplacer = afterReplacer = ""; // If removing, replace with empty string.
        } else {
            beforeReplacer = function (s) { that.before += s; return ""; } // Transfer leading whitespace to 'before'.
            afterReplacer = function (s) { that.after = s + that.after; return ""; } // Transfer trailing whitespace to 'after'.
        }

        this.selection = this.selection.replace(/^(\s*)/, beforeReplacer).replace(/(\s*)$/, afterReplacer); // Apply replacements.
    };


    Chunks.prototype.skipLines = function (nLinesBefore, nLinesAfter, findExtraNewlines) {

        if (nLinesBefore === undefined) {
            nLinesBefore = 1; // Default to 1 line before.
        }

        if (nLinesAfter === undefined) {
            nLinesAfter = 1; // Default to 1 line after.
        }

        nLinesBefore++; // Increment to account for the line itself.
        nLinesAfter++;  // Increment to account for the line itself.

        var regexText;       // Will hold the regex pattern string.
        var replacementText; // Will hold the replacement string.

        // chrome bug ... documented at: http://meta.stackoverflow.com/questions/63307/blockquote-glitch-in-editor-in-chrome-6-and-7/65985#65985
        // This is a known workaround for a Chrome regex bug.
        if (navigator.userAgent.match(/Chrome/)) {
            "X".match(/()./);
        }

        this.selection = this.selection.replace(/(^\n*)/, ""); // Remove leading newlines from selection.

        this.startTag = this.startTag + re.$1; // Add removed newlines to startTag.

        this.selection = this.selection.replace(/(\n*$)/, ""); // Remove trailing newlines from selection.
        this.endTag = this.endTag + re.$1; // Add removed newlines to endTag.
        this.startTag = this.startTag.replace(/(^\n*)/, ""); // Remove leading newlines from startTag.
        this.before = this.before + re.$1; // Add removed newlines to before.
        this.endTag = this.endTag.replace(/(\n*$)/, ""); // Remove trailing newlines from endTag.
        this.after = this.after + re.$1; // Add removed newlines to after.

        if (this.before) {

            regexText = replacementText = ""; // Initialize.

            while (nLinesBefore--) {
                regexText += "\\n?";     // Match optional newline.
                replacementText += "\n"; // Add required newline for replacement.
            }

            if (findExtraNewlines) {
                regexText = "\\n*"; // Match any number of newlines.
            }
            this.before = this.before.replace(new re(regexText + "$", ""), replacementText); // Apply replacement to 'before'.
        }

        if (this.after) {

            regexText = replacementText = ""; // Initialize.

            while (nLinesAfter--) {
                regexText += "\\n?";     // Match optional newline.
                replacementText += "\n"; // Add required newline for replacement.
            }
            if (findExtraNewlines) {
                regexText = "\\n*"; // Match any number of newlines.
            }

            this.after = this.after.replace(new re(regexText, ""), replacementText); // Apply replacement to 'after'.
        }
    };

    // end of Chunks

    // A collection of the important regions on the page.
    // Cached so we don't have to keep traversing the DOM.
    // Also holds ieCachedRange and ieCachedScrollTop, where necessary; working around
    // this issue:
    // Internet explorer has problems with CSS sprite buttons that use HTML
    // lists.  When you click on the background image "button", IE will
    // select the non-existent link text and discard the selection in the
    // textarea.  The solution to this is to cache the textarea selection
    // on the button's mousedown event and set a flag.  In the part of the
    // code where we need to grab the selection, we check for the flag
    // and, if it's set, use the cached area instead of querying the
    // textarea.
    //
    // This ONLY affects Internet Explorer (tested on versions 6, 7
    // and 8) and ONLY on button clicks.  Keyboard shortcuts work
    // normally since the focus never leaves the textarea.
    function PanelCollection(postfix) {
        this.buttonBar = doc.getElementById("wmd-button-bar" + postfix); // Reference to the button bar element.
        this.preview = doc.getElementById("wmd-preview" + postfix);     // Reference to the preview area element.
        this.input = doc.getElementById("wmd-input" + postfix);       // Reference to the input textarea element.
    };

    // Returns true if the DOM element is visible, false if it's hidden.
    // Checks if display is anything other than none.
    util.isVisible = function (elem) {

        if (window.getComputedStyle) {
            // Most browsers (modern, standards-compliant)
            return window.getComputedStyle(elem, null).getPropertyValue("display") !== "none";
        }
        else if (elem.currentStyle) {
            // IE (legacy)
            return elem.currentStyle["display"] !== "none";
        }
        return false; // Default to false if neither method applies.
    };


    // Adds a listener callback to a DOM element which is fired on a specified
    // event. Provides cross-browser compatibility for event handling.
    util.addEvent = function (elem, event, listener) {
        if (elem.attachEvent) {
            // IE only.  The "on" prefix is mandatory for attachEvent.
            elem.attachEvent("on" + event, listener);
        }
        else {
            // Other browsers (standards-compliant).
            elem.addEventListener(event, listener, false);
        }
    };


    // Removes a listener callback from a DOM element which is fired on a specified
    // event. Provides cross-browser compatibility for event handling.
    util.removeEvent = function (elem, event, listener) {
        if (elem.detachEvent) {
            // IE only. The "on" prefix is mandatory for detachEvent.
            elem.detachEvent("on" + event, listener);
        }
        else {
            // Other browsers.
            elem.removeEventListener(event, listener, false);
        }
    };

    // Converts \r\n and \r to \n for consistent newline handling.
    util.fixEolChars = function (text) {
        text = text.replace(/\r\n/g, "\n"); // Replace Windows newlines.
        text = text.replace(/\r/g, "\n");   // Replace old Mac newlines.
        return text;
    };

    // Extends a regular expression.  Returns a new RegExp
    // using pre + regex + post as the expression.
    // Used in a few functions where we have a base
    // expression and we want to pre- or append some
    // conditions to it (e.g. adding "$" to the end).
    // The flags are unchanged.
    //
    // regex is a RegExp, pre and post are strings.
    util.extendRegExp = function (regex, pre, post) {

        if (pre === null || pre === undefined) {
            pre = ""; // Default pre to empty string.
        }
        if (post === null || post === undefined) {
            post = ""; // Default post to empty string.
        }

        var pattern = regex.toString(); // Get string representation of the regex.
        var flags;                      // To store regex flags.

        // Replace the flags with empty space and store them.
        pattern = pattern.replace(/\/([gim]*)$/, function (wholeMatch, flagsPart) {
            flags = flagsPart; // Capture the flags.
            return "";         // Remove flags from the pattern string.
        });

        // Remove the slash delimiters on the regular expression.
        pattern = pattern.replace(/(^\/|\/$)/g, "");
        pattern = pre + pattern + post; // Construct the new pattern.

        return new re(pattern, flags); // Create and return new RegExp object.
    }

    // UNFINISHED
    // The assignment in the while loop makes jslint cranky.
    // I'll change it to a better loop later.
    position.getTop = function (elem, isInner) {
        var result = elem.offsetTop; // Initial offset from its parent.
        if (!isInner) {
            // Loop up the DOM tree to sum all offsetTops for absolute position.
            while (elem = elem.offsetParent) { // JSLint will complain about this assignment.
                result += elem.offsetTop;
            }
        }
        return result;
    };

    position.getHeight = function (elem) {
        return elem.offsetHeight || elem.scrollHeight; // Get height, preferring offsetHeight.
    };

    position.getWidth = function (elem) {
        return elem.offsetWidth || elem.scrollWidth; // Get width, preferring offsetWidth.
    };

    position.getPageSize = function () {

        var scrollWidth, scrollHeight; // Variables for scroll dimensions.
        var innerWidth, innerHeight;   // Variables for inner window dimensions.

        // It's not very clear which blocks work with which browsers.
        // This block attempts to get the document scroll dimensions.
        if (self.innerHeight && self.scrollMaxY) {
            scrollWidth = doc.body.scrollWidth;
            scrollHeight = self.innerHeight + self.scrollMaxY;
        }
        else if (doc.body.scrollHeight > doc.body.offsetHeight) {
            scrollWidth = doc.body.scrollWidth;
            scrollHeight = doc.body.scrollHeight;
        }
        else {
            scrollWidth = doc.body.offsetWidth;
            scrollHeight = doc.body.offsetHeight;
        }

        // This block attempts to get the viewport dimensions.
        if (self.innerHeight) {
            // Non-IE browser (modern browsers).
            innerWidth = self.innerWidth;
            innerHeight = self.innerHeight;
        }
        else if (doc.documentElement && doc.documentElement.clientHeight) {
            // Some versions of IE (IE 6 w/ a DOCTYPE declaration).
            innerWidth = doc.documentElement.clientWidth;
            innerHeight = doc.documentElement.clientHeight;
        }
        else if (doc.body) {
            // Other versions of IE.
            innerWidth = doc.body.clientWidth;
            innerHeight = doc.body.clientHeight;
        }

        var maxWidth = Math.max(scrollWidth, innerWidth);   // Determine maximum width.
        var maxHeight = Math.max(scrollHeight, innerHeight); // Determine maximum height.
        return [maxWidth, maxHeight, innerWidth, innerHeight]; // Return all calculated values.
    };

    // Handles pushing and popping TextareaStates for undo/redo commands.
    // I should rename the stack variables to list.
    function UndoManager(callback, panels) {

        var undoObj = this;       // Cache 'this' for use in inner functions.
        var undoStack = [];       // A stack to store undo states.
        var stackPtr = 0;         // The index of the current state in the stack.
        var mode = "none";        // Current operation mode ("none", "moving", "command").
        var lastState;            // Stores the last state for certain operations.
        var timer;                // The setTimeout handle for cancelling the timer.
        var inputStateObj;        // Holds the current textarea state.

        // Set the mode for later logic steps.
        var setMode = function (newMode, noSave) {
            if (mode != newMode) {
                mode = newMode;
                if (!noSave) {
                    saveState(); // Save state if not explicitly told not to.
                }
            }

            if (!uaSniffed.isIE || mode != "moving") {
                timer = setTimeout(refreshState, 1); // Refresh state after a short delay.
            }
            else {
                inputStateObj = null; // Clear input state for IE "moving" mode.
            }
        };

        // Refreshes the current textarea state.
        var refreshState = function (isInitialState) {
            inputStateObj = new TextareaState(panels, isInitialState); // Create a new state object.
            timer = undefined; // Clear the timer handle.
        };

        // Sets the undo manager to command mode, saving the current state.
        this.setCommandMode = function () {
            mode = "command";
            saveState(); // Save the state before the command executes.
            timer = setTimeout(refreshState, 0); // Refresh state asynchronously.
        };

        // Checks if an undo operation is possible.
        this.canUndo = function () {
            return stackPtr > 1; // Can undo if there's more than one state in the stack.
        };

        // Checks if a redo operation is possible.
        this.canRedo = function () {
            if (undoStack[stackPtr + 1]) {
                return true; // Can redo if there's a state after the current pointer.
            }
            return false;
        };

        // Removes the last state and restores it.
        this.undo = function () {

            if (undoObj.canUndo()) {
                if (lastState) {
                    // What about setting state -1 to null or checking for undefined?
                    lastState.restore(); // Restore the cached last state.
                    lastState = null;    // Clear the cached state.
                }
                else {
                    undoStack[stackPtr] = new TextareaState(panels); // Save current state before undoing.
                    undoStack[--stackPtr].restore();                 // Move pointer back and restore.

                    if (callback) {
                        callback(); // Execute callback if provided.
                    }
                }
            }

            mode = "none";         // Reset mode.
            panels.input.focus();  // Restore focus to the input.
            refreshState();        // Refresh the current state.
        };

        // Redo an action.
        this.redo = function () {

            if (undoObj.canRedo()) {

                undoStack[++stackPtr].restore(); // Move pointer forward and restore.

                if (callback) {
                    callback(); // Execute callback if provided.
                }
            }

            mode = "none";         // Reset mode.
            panels.input.focus();  // Restore focus to the input.
            refreshState();        // Refresh the current state.
        };

        // Push the input area state to the stack.
        var saveState = function () {
            var currState = inputStateObj || new TextareaState(panels); // Get current state, or create a new one.

            if (!currState) {
                return false; // If no state, cannot save.
            }
            if (mode == "moving") {
                if (!lastState) {
                    lastState = currState; // Cache the current state if in "moving" mode.