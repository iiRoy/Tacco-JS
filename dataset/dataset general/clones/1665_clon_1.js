/*
 *  Redactor Editor - Core Script
 *  Version: 7.6.3 (Stable Release)
 *  Last Updated: May 31, 2012
 *
 *  Project Homepage: http://redactorjs.com/
 *
 *  Copyright (c) 2009-2012, Imperavi Ltd.
 *  Licensed under the Creative Commons Attribution-NonCommercial 3.0 License.
 *  For commercial use, please obtain a commercial license from Imperavi Ltd.
 *
 *  Basic usage example: jQuery('#content').redactor();
 */


// Global toolbar configuration object. This can be extended by external toolbar definition files.
var RTOOLBAR = {};


// Self-executing anonymous function to encapsulate the Redactor plugin.
(function($) {

    // jQuery plugin definition for Redactor.
    // Attaches the Redactor editor to the selected DOM elements.
    jQuery.fn.redactor = function(option) {

        // Iterate over each selected element to initialize Redactor.
        return this.each(function() {

            var $this = $(this); // Cache the current jQuery element.

            // Retrieve existing Redactor instance data.
            var data = $this.data('redactor');

            // If no Redactor instance exists for this element, create a new one.
            if (!data) {
                $this.data('redactor', (data = new Redactor(this, option)));
            }

        }); // End of .each()

    }; // End of jQuery.fn.redactor


    // Redactor main constructor function.
    // Initializes the editor instance for a given element and options.
    var Redactor = function(element, options) {

        // Store the jQuery-wrapped DOM element that Redactor is initialized on.
        this.$el = $(element);

        // Merge default options with user-provided options and data attributes.
        // The Redactor options control various aspects of the editor's behavior and appearance.
        this.opts = $.extend({

            lang: 'en', // Language code for the editor.
            toolbar: 'default', // Specifies which toolbar configuration to use.

            load: true, // Whether to dynamically load language and toolbar files.

            path: false, // Base path to Redactor assets (CSS, JS, etc.). Will be auto-detected if false.
            css: 'style.css', // Stylesheet for the editor's content area.
            focus: true, // Whether to focus the editor on initialization.
            resize: true, // Enable or disable editor resizing.
            autoresize: false, // Automatically adjust editor height to content.
            fixed: false, // Fix the toolbar position when scrolling.

            autoformat: true, // Automatically format content (e.g., convert newlines to paragraphs).
            cleanUp: true, // Clean up pasted content.
            convertDivs: true, // Convert div elements to paragraphs on paste.
            removeClasses: true, // Remove classes from pasted content.
            removeStyles: false, // Remove inline styles from pasted content.
            convertLinks: true, // Convert plain text URLs to clickable links.

            handler: false, // URL for a backend handler to process content (e.g., for server-side cleanup).
            
            autosave: false, // URL for an autosave endpoint.
            interval: 60, // Autosave interval in seconds.

            imageGetJson: false, // URL to fetch a JSON list of available images (e.g., for an image gallery).

            imageUpload: false, // URL for image upload handler.
            linkFileUpload: false, // URL for link file upload handler.
            fileUpload: false, // URL for general file upload handler.

            visual: true, // Start the editor in visual mode (as opposed to code mode).
            fullscreen: false, // Start the editor in fullscreen mode.
            overlay: true, // Display a modal overlay when certain dialogs are open.

            // Default color palette for text and background colors.
            // These colors are displayed in the color picker dropdowns.
            colors: Array(
                '#ffffff', '#000000', '#eeece1', '#1f497d', '#4f81bd', '#c0504d', '#9bbb59', '#8064a2', '#4bacc6', '#f79646', '#ffff00',
                '#f2f2f2', '#7f7f7f', '#ddd9c3', '#c6d9f0', '#dbe5f1', '#f2dcdb', '#ebf1dd', '#e5e0ec', '#dbeef3', '#fdeada', '#fff2ca',
                '#d8d8d8', '#595959', '#c4bd97', '#8db3e2', '#b8cce4', '#e5b9b7', '#d7e3bc', '#ccc1d9', '#b7dde8', '#fbd5b5', '#ffe694',
                '#bfbfbf', '#3f3f3f', '#938953', '#548dd4', '#95b3d7', '#d99694', '#c3d69b', '#b2a2c7', '#b7dde8', '#fac08f', '#f2c314',
                '#a5a5a5', '#262626', '#494429', '#17365d', '#366092', '#953734', '#76923c', '#5f497a', '#92cddc', '#e36c09', '#c09100',
                '#7f7f7f', '#0c0c0c', '#1d1b10', '#0f243e', '#244061', '#632423', '#4f6128', '#3f3151', '#31859b', '#974806', '#7f6000'
            ),

            // Private internal HTML strings for empty content states.
            allEmptyHtml: '<p><br /></p>',
            mozillaEmptyHtml: '<p>&nbsp;</p>'


        }, options, this.$el.data()); // Merge in this order: defaults, explicit options, data-attributes.

        // Array to store references to dynamically created dropdown elements.
        this.dropdowns = [];

        // Call the initialization method to set up the editor.
        this.init();

    }; // End of Redactor constructor


    // Redactor prototype methods, defining the editor's functionality.
    Redactor.prototype = {

        // --- DYNAMIC FILE LOADING ---

        // Recursively loads files from an array.
        // Processes one file at a time, then calls itself for the next.
        _loadFile: function(file, array) {

            var item = array[0]; // Get the first item from the array.
            array.splice(0, 1); // Remove the first item from the array.

            var callback; // Declare callback variable.

            // If the item is a function, it's the final callback.
            if (typeof(item) == 'function') {
                callback = item;
            }
            // Otherwise, it's another file to load, so create a proxy for recursive call.
            else {
                callback = $.proxy(function() {
                    this._loadFile(item, array);
                }, this);
            }

            // Dynamically load the current file with the determined callback.
            this.dynamicallyLoad(file, callback);
        },


        // Initiates the loading of a series of files.
        // The last item in the array should typically be the final callback function.
        loadFiles: function(array) {

            var item = array[0]; // Get the first file/callback from the array.
            array.splice(0, 1); // Remove it from the array to process.

            this._loadFile(item, array); // Start the recursive loading process.
        },


        // Dynamically loads a JavaScript file by creating a script tag.
        dynamicallyLoad: function(url, callback) {

            var head = document.getElementsByTagName("head")[0]; // Get the document head element.
            var script = document.createElement("script"); // Create a new script element.
            script.src = url; // Set the script's source URL.

            var done = false; // Flag to prevent multiple executions of the callback.

            // Event handler for script loading completion across different browsers.
            script.onload = script.onreadystatechange = function() {

                // Check if the script is loaded and executed.
                if (!done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
                    done = true; // Mark as done.

                    if (callback) {
                        callback(); // Execute the provided callback function.
                    }

                    // Clean up event handlers to prevent memory leaks.
                    script.onload = script.onreadystatechange = null;
                }
            }; // End of script.onload/onreadystatechange

            head.appendChild(script); // Append the script to the document head to start loading.

        }, // End of dynamicallyLoad method


        // --- EDITOR INITIALIZATION ---

        // Main initialization method for the Redactor editor.
        init: function() {

            // Determine the base path for Redactor assets.
            this.getPath();

            // Check if dynamic loading of files is enabled in options.
            if (this.opts.load) {

                var files = []; // Array to hold files to be loaded.

                // Add language file to the list.
                files.push(this.opts.path + '/langs/' + this.opts.lang + '.js');

                // If a toolbar is specified, add its definition file.
                if (this.opts.toolbar !== false) {
                    files.push(this.opts.path + '/toolbars/' + this.opts.toolbar + '.js');
                }

                // Add the 'start' method as the final callback after all files are loaded.
                files.push($.proxy(this.start, this));

                // Begin loading the collected files.
                this.loadFiles(files);
            }
            // If dynamic loading is disabled, directly call the 'start' method.
            else {
                this.start();
            }


        }, // End of init method


        // Starts the Redactor editor after all dependencies are loaded.
        start: function() {

            // Capture the original height and width of the textarea element.
            this.height = this.$el.css('height');
            this.width = this.$el.css('width');

            // Construct the editor's DOM structure (container, iframe).
            this.build();

            // Retrieve the initial HTML content from the textarea.
            var html = this.$el.val();

            // Apply pre-formatting rules to the HTML content.
            html = this.preformater(html);

            // If auto-formatting is enabled, convert newlines to paragraphs.
            if (this.opts.autoformat) {
                html = this.paragraphy(html);
            }

            // Enable the editor and get a reference to the editable content area.
            this.$editor = this.enable(html);

            // Set up a click handler on the editor's document to ensure focus is maintained.
            $(this.doc).click($.proxy(function(e) {
                this.$editor.focus();
            }, this));

            // Set up paste event handler for content cleanup.
            $(this.doc).bind('paste', $.proxy(function(e) {

                // Use setTimeout to allow the browser's default paste action to complete.
                setTimeout($.proxy(function() {

                    // Insert a marker node to identify the end of the pasted content.
                    var node = $('<span id="pastemarkerend">&nbsp;</span>');
                    this.insertNodeAtCaret(node.get(0));

                    // Perform cleanup on the pasted content.
                    this.pasteCleanUp();

                }, this), 200); // Delay cleanup by 200ms.


            }, this)); // End of paste bind


            // Set up keypress event handler.
            $(this.doc).keypress($.proxy(function(e) {

                var key = e.keyCode || e.which; // Get the key code.

                // Special handling for Safari's Shift + Enter behavior.
                if (navigator.userAgent.indexOf('AppleWebKit') != -1) {
                    return this.safariShiftKeyEnter(e, key);
                }

            }, this)) // End of keypress bind

            // Set up keyup event handler.
            .keyup($.proxy(function(e) {

                var key = e.keyCode || e.which; // Get the key code.

                // If auto-formatting is enabled.
                if (this.opts.autoformat) {
                    // If the editor becomes empty after backspace or delete.
                    if (key == 8 || key == 46) {
                        return this.formatEmpty(e);
                    }

                    // Handle new line creation for paragraph formatting (Enter key without modifiers).
                    if (key == 13 && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
                        return this.formatNewLine(e);
                    }
                }
                // Uncomment for debugging key events:
                //console.log(e);

                // Synchronize the editor's content with the original textarea.
                this.syncCode();

            }, this)); // End of keyup bind

            // Build the editor toolbar.
            this.buildToolbar();

            // Initialize the resizer, or auto-resize observer if enabled.
            if (this.opts.autoresize === false) {
                this.buildResizer();
            } else {
                this.observeAutoResize();
            }

            // Set up keyboard shortcuts.
            this.shortcuts();

            // Initialize autosave functionality.
            this.autoSave();

            // Set up observers for editor elements (e.g., images).
            this.observeImages();

            // If fullscreen mode is enabled on start, activate it.
            if (this.opts.fullscreen) {
                this.opts.fullscreen = false; // Reset option to prevent re-triggering.
                this.fullscreen(); // Call the fullscreen method.
            }

            // If focus option is enabled, focus the editor.
            if (this.opts.focus) {
                this.focus();
            }

            // If fixed toolbar option is enabled, set up scroll observer.
            if (this.opts.fixed) {
                this.observeScroll(); // Initial check.
                $(document).scroll($.proxy(this.observeScroll, this)); // Bind to document scroll.
            }

        }, // End of start method


        // Configures keyboard shortcuts for common editor commands.
        shortcuts: function() {

            // Bind keydown event to the editor's document.
            $(this.doc).keydown($.proxy(function(e) {

                var key = e.keyCode || e.which; // Get the key code.

                // Check for Ctrl key combinations.
                if (e.ctrlKey) {
                    if (key == 90) {
                        this._shortcuts(e, 'undo');
                    } // Ctrl + z for undo.
                    else if (key == 90 && e.shiftKey) {
                        this._shortcuts(e, 'redo');
                    } // Ctrl + Shift + z for redo.
                    else if (key == 77) {
                        this._shortcuts(e, 'removeFormat');
                    } // Ctrl + m for remove format.
                    else if (key == 66) {
                        this._shortcuts(e, 'bold');
                    } // Ctrl + b for bold.
                    else if (key == 73) {
                        this._shortcuts(e, 'italic');
                    } // Ctrl + i for italic.
                    else if (key == 74) {
                        this._shortcuts(e, 'insertunorderedlist');
                    } // Ctrl + j for unordered list.
                    else if (key == 75) {
                        this._shortcuts(e, 'insertorderedlist');
                    } // Ctrl + k for ordered list.
                    else if (key == 76) {
                        this._shortcuts(e, 'superscript');
                    } // Ctrl + l for superscript.
                }

                // Check for Tab key combinations.
                if (!e.shiftKey && key == 9) {
                    this._shortcuts(e, 'indent');
                } // Tab for indent.
                else if (e.shiftKey && key == 9) {
                    this._shortcuts(e, 'outdent');
                } // Shift + Tab for outdent.

            }, this)); // End of keydown bind

        }, // End of shortcuts method


        // Internal helper for executing commands triggered by shortcuts.
        _shortcuts: function(e, cmd) {

            // Prevent default browser action for the shortcut key.
            if (e.preventDefault) {
                e.preventDefault();
            }

            // Execute the corresponding editor command.
            this.execCommand(cmd, null);

        }, // End of _shortcuts method


        // Determines the base path to Redactor's assets.
        // It tries to auto-detect the path if not explicitly set in options.
        getPath: function() {

            // If the path is already set in options, use it.
            if (this.opts.path !== false) {
                return this.opts.path;
            }

            // Iterate through all script tags in the document.
            $('script').each($.proxy(function(i, s) {

                // If a script tag has a 'src' attribute.
                if (s.src) {
                    // Regular expression to match 'redactor.js' or 'redactor.min.js'
                    // along with any optional query string.
                    var regexp = new RegExp(/\/redactor(\.min)?\.js(\?.*)?/);

                    // If the script's src matches the Redactor script pattern.
                    if (s.src.match(regexp)) {
                        // Extract the base path by removing the script filename.
                        this.opts.path = s.src.replace(regexp, '');
                    }
                }

            }, this)); // End of script.each

        }, // End of getPath method


        // Constructs the main editor DOM elements: a container box and an iframe.
        build: function() {

            // Create the main container div for the Redactor editor.
            this.$box = $('<div class="redactor_box"></div>');

            // Create the iframe that will house the editable content.
            // Set initial height and other attributes.
            this.$frame = $('<iframe frameborder="0" scrolling="auto" style="height: ' + this.height + ';" class="redactor_frame"></iframe>');

            // Set the original textarea's width to 100% and hide it.
            this.$el.css('width', '100%').hide();

            // Insert the container box after the original textarea,
            // then append the iframe and the hidden textarea to the box.
            this.$box.insertAfter(this.$el).append(this.$frame).append(this.$el);

        }, // End of build method


        // Writes content into the editor's iframe document.
        write: function(html) {

            this.doc.open(); // Open the document stream.
            this.doc.write(html); // Write the HTML content.
            this.doc.close(); // Close the document stream.

        }, // End of write method


        // Enables the editor by preparing the iframe document.
        enable: function(html) {

            // Get the document object of the iframe.
            this.doc = this.getDoc(this.$frame.get(0));

            // Proceed only if the iframe document is successfully retrieved.
            if (this.doc !== null) {
                // Set the HTML content of the iframe document.
                this.write(this.setDoc(html));

                // For Mozilla browsers, enable CSS usage in contentEditable mode.
                if ($.browser.mozilla) {
                    this.doc.execCommand("useCSS", false, true);
                }

                // Return the jQuery-wrapped editable content area within the iframe.
                return $(this.doc).find('#page');
            }
            // If document could not be retrieved, return false.
            else {
                return false;
            }

        }, // End of enable method


        // Generates the full HTML structure for the iframe document.
        setDoc: function(html) {

            var frameHtml = '<!DOCTYPE html>\n'; // Doctypoe declaration.
            frameHtml += '<html><head><link media="all" type="text/css" href="' + this.opts.path + '/css/' + this.opts.css + '" rel="stylesheet"></head>'; // Head with stylesheet link.
            frameHtml += '<body><div id="page" contenteditable="true">'; // Body with contenteditable div.
            frameHtml += html; // Insert the actual editor content.
            frameHtml += '</div></body></html>'; // Close tags.

            return frameHtml; // Return the complete iframe HTML.

        }, // End of setDoc method


        // Retrieves the document object from an iframe element,
        // handling cross-browser differences.
        getDoc: function(frame) {

            if (frame.contentDocument) {
                return frame.contentDocument;
            } // Standard compliant browsers.
            else if (frame.contentWindow && frame.contentWindow.document) {
                return frame.contentWindow.document;
            } // IE specific.
            else if (frame.document) {
                return frame.document;
            } // Older browsers.
            else {
                return null;
            } // If no document found.

        }, // End of getDoc method


        // Sets focus to the editor's content area.
        focus: function() {

            this.$editor.focus(); // Focus the contenteditable div.

        }, // End of focus method


        // Synchronizes the content from the editor's iframe back to the original textarea.
        syncCode: function() {

            // Get the HTML from the editor, apply formatting, and update the textarea.
            var html = this.formating(this.$editor.html());
            this.$el.val(html);

        }, // End of syncCode method


        // --- API FUNCTIONS ---

        // Sets the HTML content of the Redactor editor.
        setCode: function(html) {

            // Apply pre-formatting to the input HTML.
            html = this.preformater(html);

            // Set the editor's HTML and then focus it.
            this.$editor.html(html).focus();

            // Synchronize the updated code back to the original textarea.
            this.syncCode();

        }, // End of setCode method


        // Retrieves the current HTML content from the Redactor editor.
        getCode: function() {

            // Get HTML from the editor if it exists, otherwise from the original textarea.
            var html = this.$editor ? this.$editor.html() : this.$el.val();

            // Apply post-formatting (reformatting) to the HTML.
            html = this.reformater(html);

            return html; // Return the processed HTML.

        }, // End of getCode method


        // Inserts HTML content at the current caret position in the editor.
        insertHtml: function(html) {

            this.execCommand('inserthtml', html); // Use execCommand to insert HTML.

        }, // End of insertHtml method


        // Destroys the Redactor editor instance, reverting the textarea to its original state.
        destroy: function() {

            var html = this.getCode(); // Get the current editor content.

            // Insert the original textarea after the Redactor box and remove the box.
            this.$box.after(this.$el);
            this.$box.remove();

            // Restore the textarea's value and make it visible.
            this.$el.val(html).show();

            // Remove any dynamically created dropdowns associated with this instance.
            this.dropdowns.forEach(function(dropdown, i) {
                dropdown.remove();
                delete(this.dropdowns[i]); // Remove reference from array.
            }, this);

        }, // End of destroy method


        // Executes a server-side handler for additional content processing.
        handler: function() {

            // Make an AJAX POST request to the configured handler URL.
            $.ajax({
                url: this.opts.handler, // URL from options.
                type: 'post', // HTTP method.
                // Send the editor's content as 'redactor' parameter, URL-encoded.
                data: 'redactor=' + escape(encodeURIComponent(this.getCode())),
                success: $.proxy(function(data) {
                    // On success, update the editor with the response data.
                    this.setCode(data);
                    this.syncCode(); // Synchronize with textarea.

                }, this) // Ensure 'this' context for success callback.
            });

        }, // End of handler method

        // --- END API FUNCTIONS ---


        // --- OBSERVERS ---

        // Observes images within the editor for resizing capabilities.
        observeImages: function() {

            // For Mozilla, explicitly disable object resizing to prevent default browser behavior.
            if ($.browser.mozilla) {
                this.doc.execCommand("enableObjectResizing", false, "false");
            }

            // Iterate through all images in the editor's document.
            $(this.doc).find('img').attr('unselectable', 'on').each($.proxy(function(i, s) {
                this.resizeImage(s); // Apply custom image resizing logic.

            }, this)); // End of each image iteration.

        }, // End of observeImages method


        // Observes document scroll to fix the toolbar position.
        observeScroll: function() {

            var scrolltop = $(document).scrollTop(); // Current vertical scroll position of the document.
            var boxtop = this.$box.offset().top; // Top offset of the editor's main container box.

            // If the document has scrolled past the editor box.
            if (scrolltop > boxtop) {
                this.fixed = true; // Mark toolbar as fixed.
                // Apply fixed positioning to the toolbar.
                this.$toolbar.css({
                    position: 'fixed',
                    width: '100%'
                });
            }
            // If the document is scrolled above or at the editor box.
            else {
                this.fixed = false; // Mark toolbar as not fixed.
                // Revert toolbar to relative positioning.
                this.$toolbar.css({
                    position: 'relative',
                    width: 'auto'
                });
            }

        }, // End of observeScroll method


        // Sets up auto-resizing functionality for the editor.
        observeAutoResize: function() {

            // Set a minimum height for the editor based on the original textarea's height.
            this.$editor.css({
                'min-height': this.$el.height() + 'px'
            });

            // Configure iframe scrolling to handle content overflow without scrollbars by default.
            this.$frame.css({
                'overflow-x': 'auto',
                'overflow-y': 'hidden'
            });

            // Bind the setAutoSize method to the iframe's load event (for initial sizing).
            this.$frame.load($.proxy(this.setAutoSize, this));

            // Bind the setAutoSize method to keyup events in the editor (for dynamic sizing).
            $(this.doc).keyup($.proxy(this.setAutoSize, this));

        }, // End of observeAutoResize method


        // Adjusts the height of the editor's iframe to fit its content.
        setAutoSize: function() {

            // Set the iframe's height based on the editor's outer height, plus a small buffer.
            this.$frame.height(this.$editor.outerHeight(true) + 30);

        }, // End of setAutoSize method


        // --- EXECCOMMAND WRAPPER ---

        // Executes a document command within the editor's iframe.
        execCommand: function(cmd, param) {

            // Only execute if in visual mode and the document object is available.
            if (this.opts.visual && this.doc) {
                try {
                    // For Internet Explorer, ensure the editor has focus before executing commands.
                    if ($.browser.msie) {
                        this.focus();
                    }

                    // Special handling for 'inserthtml' command in IE.
                    if (cmd == 'inserthtml' && $.browser.msie) {
                        this.doc.selection.createRange().pasteHTML(param);
                    }
                    // Special handling for 'formatblock' command in IE.
                    else if (cmd == 'formatblock' && $.browser.msie) {
                        this.doc.execCommand(cmd, false, '<' + param + '>');
                    }
                    // General case for other commands and browsers.
                    else {
                        this.doc.execCommand(cmd, false, param);
                    }

                    // After command execution, synchronize the code and restore focus.
                    this.syncCode();
                    this.focus();
                } catch (e) {
                    // Catch any errors during command execution (e.g., unsupported commands).
                    // This block intentionally left empty as errors are often non-critical for basic commands.
                }

            } // End of visual mode check.

        }, // End of execCommand method


        // --- FORMAT NEW LINE HANDLING ---

        // Handles the 'Enter' key press to format new lines,
        // typically ensuring new paragraphs are created.
        formatNewLine: function(e) {

            var parent = this.getParentNode(); // Get the parent node of the current selection/caret.

            // Check if the parent node is a DIV with id 'page' (the main contenteditable div).
            if (parent.nodeName == 'DIV' && parent.id == 'page') {

                // Prevent the browser's default 'Enter' key behavior.
                if (e.preventDefault) {
                    e.preventDefault();
                }

                element = $(this.getCurrentNode()); // Get the current node where the caret is.

                // If the current element is an empty DIV or contains only a <br> tag.
                if (element.get(0).tagName == 'DIV' && (element.html() == '' || element.html() == '<br>')) {

                    // Create a new paragraph element and append the children of the current element.
                    newElement = $('<p>').append(element.clone().get(0).childNodes);

                    // Replace the DIV with the new P element.
                    element.replaceWith(newElement);

                    // Ensure the new paragraph contains a <br /> for proper cursor placement.
                    newElement.html('<br />');

                    // Set the focus to the newly created paragraph.
                    this.setFocusNode(newElement.get(0));

                    this.syncCode(); // Synchronize the content.
                    return false; // Prevent further default actions.
                }
                // If it's not an empty DIV, just synchronize the code.
                else {
                    this.syncCode();
                }

            } // End of parent node check.