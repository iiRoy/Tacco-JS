/*
 * alertify - A highly customizable, unobtrusive JavaScript notification system.
 *
 * @author Fabien Doiron <fabien.doiron@gmail.com>
 * @copyright Fabien Doiron 2013
 * @license MIT <http://opensource.org/licenses/mit-license.php>
 * @link http://fabien-d.github.com/alertify.js/
 * @module alertify
 * @version 0.3.8
 *
 * This file contains the core logic for the alertify library.
 */

/*global define*/
// Self-executing anonymous function to encapsulate the library.
(function( global, undefined ) {
    "use strict"; // Enforce strict mode for cleaner code.

    // Local references to global objects for performance and minification.
    var document = global.document,
        Alertify; // Main Alertify constructor.

    // The Alertify constructor function.
    Alertify = function() {

        // Private variables for the Alertify instance.
        var _alertify = {},
            dialogs   = {},      // Object to hold HTML markup for dialog elements.
            isopen    = false,   // Flag to track if a dialog is currently open.
            keys      = { ENTER: 13, ESC: 27, SPACE: 32 }, // Key codes for keyboard interaction.
            queue     = [],      // Queue for managing multiple dialogs/notifications.
            $, btnCancel, btnOK, btnReset, btnFocus, elCallee, elCover, elDialog, elLog, form, input, getTransitionEvent; // Various DOM elements and utility function.

        /**
         * Standard markup pieces for dialogs and notifications.
         * These are templates that will be populated with content.
         * @type {Object}
         */
        dialogs = {
            buttons : {
                holder : "<nav class=\"alertify-buttons\">{{buttons}}</nav>",
                submit : "<button type=\"submit\" class=\"alertify-button alertify-button-ok\" id=\"alertify-ok\">{{ok}}</button>",
                ok     : "<a href=\"#\" class=\"alertify-button alertify-button-ok\" id=\"alertify-ok\">{{ok}}</a>",
                cancel : "<a href=\"#\" class=\"alertify-button alertify-button-cancel\" id=\"alertify-cancel\">{{cancel}}</a>"
            },
            input   : "<div class=\"alertify-text-wrapper\"><input type=\"text\" class=\"alertify-text\" id=\"alertify-text\"></div>",
            message : "<p class=\"alertify-message\">{{message}}</p>",
            log     : "<article class=\"alertify-log{{class}}\">{{message}}</article>"
        };

        /**
         * Determines the appropriate `transitionend` event name for the browser.
         * This is crucial for handling CSS transitions across different browser engines.
         * @return {String|undefined} The browser-specific transitionend event name or undefined if not supported.
         */
        getTransitionEvent = function() {
            var t,
                el = document.createElement("fakeelement"), // Create a dummy element to test styles.
                transitions = {
                    "WebkitTransition" : "webkitTransitionEnd", // Chrome, Safari
                    "MozTransition"    : "transitionend",       // Firefox
                    "OTransition"      : "otransitionend",      // Opera
                    "transition"       : "transitionend"        // Standard
                };

            // Iterate through known transition properties to find the supported one.
            for (t in transitions) {
                if (el.style[t] !== undefined) {
                    return transitions[t];
                }
            }
            return undefined; // No transition support found.
        };

        /**
         * A simple shorthand for `document.getElementById()`.
         * This utility function improves readability and reduces verbosity.
         *
         * @param  {String} id    The ID of the element to retrieve.
         * @return {Object|null}  The HTML element or null if not found.
         */
        $ = function(id) {
            return document.getElementById(id);
        };

        /**
         * The core Alertify object, containing configuration and methods.
         * @type {Object}
         */
        _alertify = {

            /**
             * Text labels used for buttons in dialogs.
             * These can be customized by the user.
             * @type {Object}
             */
            labels : {
                ok     : "OK",
                cancel : "Cancel"
            },

            /**
             * Default delay (in milliseconds) before a log message automatically hides.
             * @type {Number}
             */
            delay : 5000,

            /**
             * Flag to reverse the order of buttons (e.g., Cancel then OK).
             * @type {Boolean}
             */
            buttonReverse : false,

            /**
             * Specifies which button should receive focus by default.
             * Acceptable values: "ok", "cancel", or "none".
             * @type {String}
             */
            buttonFocus : "ok",

            /**
             * Stores the detected CSS `transitionend` event name.
             * Initialized upon the first dialog creation.
             * @type {String|undefined}
             */
            transition : undefined,

            /**
             * Attaches event listeners to the dialog buttons and document body.
             * Manages user interaction with the dialog.
             *
             * @param {Function} fn    [Optional] Callback function to execute on dialog closure.
             *
             * @return {undefined} No explicit return value.
             */
            addListeners : function(fn) {
                var hasOK     = (typeof btnOK     !== "undefined"), // Check if OK button exists.
                    hasCancel = (typeof btnCancel !== "undefined"), // Check if Cancel button exists.
                    hasInput  = (typeof input     !== "undefined"), // Check if input field exists.
                    val       = "", // Value from the input field (if present).
                    self      = this, // Reference to the _alertify object.
                    ok, cancel, common, key, reset; // Event handler functions.

                // Handler for the 'OK' button click or equivalent action.
                ok = function(event) {
                    if (typeof event.preventDefault !== "undefined") {
                        event.preventDefault(); // Prevent default browser action.
                    }
                    common(event); // Execute common cleanup.
                    if (typeof input !== "undefined") {
                        val = input.value; // Capture input value if available.
                    }
                    if (typeof fn === "function") {
                        if (typeof input !== "undefined") {
                            fn(true, val); // Call callback with success and input value.
                        } else {
                            fn(true); // Call callback with success.
                        }
                    }
                    return false; // Prevent further event propagation.
                };

                // Handler for the 'Cancel' button click or equivalent action.
                cancel = function(event) {
                    if (typeof event.preventDefault !== "undefined") {
                        event.preventDefault(); // Prevent default browser action.
                    }
                    common(event); // Execute common cleanup.
                    if (typeof fn === "function") {
                        fn(false); // Call callback with failure.
                    }
                    return false; // Prevent further event propagation.
                };

                // Common event handler for dialog closure (cleanup).
                common = function(event) {
                    self.hide(); // Hide the current dialog.
                    self.unbind(document.body, "keyup", key);         // Remove keyup listener from body.
                    self.unbind(btnReset,      "focus", reset);       // Remove focus listener from reset button.
                    if (hasInput)  self.unbind(form,    "submit", ok);   // Remove form submit listener.
                    if (hasOK)     self.unbind(btnOK,   "click",  ok);   // Remove OK button click listener.
                    if (hasCancel) self.unbind(btnCancel, "click",  cancel); // Remove Cancel button click listener.
                };

                // Keyup handler for keyboard shortcuts (ESC, SPACE).
                key = function(event) {
                    var keyCode = event.keyCode;
                    if (keyCode === keys.SPACE && !hasInput) {
                        ok(event); // If space pressed and no input field, trigger OK.
                    }
                    if (keyCode === keys.ESC && hasCancel) {
                        cancel(event); // If escape pressed and cancel button exists, trigger Cancel.
                    }
                };

                // Handler to reset focus to the first interactive element within the dialog.
                reset = function(event) {
                    if (hasInput) {
                        input.focus(); // Focus the input field.
                    } else if (hasCancel) {
                        btnCancel.focus(); // Focus the Cancel button.
                    } else {
                        btnOK.focus(); // Focus the OK button.
                    }
                };

                // Bind the reset focus link.
                // This is important for accessibility, ensuring keyboard navigation stays within the dialog.
                this.bind(btnReset, "focus", reset);

                // Bind click event for the OK button.
                if (hasOK) {
                    this.bind(btnOK, "click", ok);
                }

                // Bind click event for the Cancel button.
                if (hasCancel) {
                    this.bind(btnCancel, "click", cancel);
                }

                // Bind keyup event to the document body for global keyboard shortcuts.
                this.bind(document.body, "keyup", key);

                // If there's an input, bind the form's submit event.
                if (hasInput) {
                    this.bind(form, "submit", ok);
                }

                // If transitions are not supported, immediately set focus.
                if (typeof this.transition === "undefined") {
                    this.setFocus();
                }
            }, // End of addListeners method.

            /**
             * Attaches an event listener to an HTML element.
             * Provides cross-browser compatibility for event handling.
             *
             * @param  {Object}   el       The HTML element to bind the event to.
             * @param  {String}   event    The name of the event (e.g., "click", "keyup").
             * @param  {Function} fn       The callback function to execute when the event occurs.
             *
             * @return {undefined} No explicit return value.
             */
            bind : function(el, event, fn) {
                if (typeof el.addEventListener === "function") {
                    el.addEventListener(event, fn, false); // W3C standard.
                } else if (el.attachEvent) {
                    el.attachEvent("on" + event, fn); // IE proprietary method.
                }
            }, // End of bind method.

            /**
             * Configures Alertify to act as the global error handler using `window.onerror`.
             * This allows unhandled JavaScript errors to be displayed as Alertify notifications.
             *
             * @return {boolean} True if `window.onerror` was successfully overridden, false otherwise.
             */
            handleErrors : function() {
                if (typeof global.onerror !== "undefined") {
                    var self = this; // Capture 'this' for use within the onerror handler.
                    global.onerror = function(msg, url, line) {
                        // Display the error message using Alertify's error method.
                        self.error("[" + msg + " on line " + line + " of " + url + "]", 0);
                        return false; // Return false to prevent default browser error handling.
                    };
                    return true;
                } else {
                    return false; // window.onerror is not supported or accessible.
                }
            }, // End of handleErrors method.

            /**
             * Appends button HTML strings according to the `buttonReverse` setting.
             *
             * @param {String} secondary    The HTML string for the secondary button (e.g., Cancel).
             * @param {String} primary      The HTML string for the primary button (e.g., OK).
             *
             * @return {String}             The combined HTML string for the buttons.
             */
            appendButtons : function(secondary, primary) {
                // If buttonReverse is true, primary button comes first.
                return this.buttonReverse ? primary + secondary : secondary + primary;
            }, // End of appendButtons method.

            /**
             * Constructs the HTML markup for a dialog box based on the provided item.
             *
             * @param  {Object} item    The current item from the queue, containing dialog details.
             *
             * @return {String}         The complete HTML string representing the dialog box.
             */
            build : function(item) {
                var html    = "", // Accumulator for the dialog's HTML.
                    type    = item.type, // Type of dialog (alert, confirm, prompt).
                    message = item.message, // The main message content.
                    css     = item.cssClass || ""; // Optional custom CSS class.

                html += "<div class=\"alertify-dialog\">"; // Start of the main dialog container.

                // If buttonFocus is "none", add a hidden element to ensure focus can be trapped.
                if (_alertify.buttonFocus === "none") {
                    html += "<a href=\"#\" id=\"alertify-noneFocus\" class=\"alertify-hidden\"></a>";
                }

                // For 'prompt' dialogs, wrap content in a form.
                if (type === "prompt") {
                    html += "<form id=\"alertify-form\">";
                }

                html += "<article class=\"alertify-inner\">"; // Inner content wrapper.
                html += dialogs.message.replace("{{message}}", message); // Insert message.

                // If it's a prompt, include the input field markup.
                if (type === "prompt") {
                    html += dialogs.input;
                }

                html += dialogs.buttons.holder; // Placeholder for buttons.
                html += "</article>"; // Close inner content wrapper.

                if (type === "prompt") {
                    html += "</form>"; // Close form for prompt.
                }

                // Add a reset focus link for accessibility.
                html += "<a id=\"alertify-resetFocus\" class=\"alertify-resetFocus\" href=\"#\">Reset Focus</a>";
                html += "</div>"; // Close main dialog container.

                // Populate the button placeholders based on dialog type.
                switch (type) {
                    case "confirm":
                        html = html.replace("{{buttons}}", this.appendButtons(dialogs.buttons.cancel, dialogs.buttons.ok));
                        html = html.replace("{{ok}}", this.labels.ok).replace("{{cancel}}", this.labels.cancel);
                        break;
                    case "prompt":
                        html = html.replace("{{buttons}}", this.appendButtons(dialogs.buttons.cancel, dialogs.buttons.submit));
                        html = html.replace("{{ok}}", this.labels.ok).replace("{{cancel}}", this.labels.cancel);
                        break;
                    case "alert":
                        html = html.replace("{{buttons}}", dialogs.buttons.ok);
                        html = html.replace("{{ok}}", this.labels.ok);
                        break;
                    default:
                        // No specific buttons for other types (e.g., custom dialogs if extended).
                        break;
                }

                // Set the class names for the dialog and cover elements.
                elDialog.className = "alertify alertify-show alertify-" + type + " " + css;
                elCover.className  = "alertify-cover"; // Ensure cover is visible.
                return html; // Return the fully constructed HTML.
            }, // End of build method.

            /**
             * Closes a log message and handles its removal from the DOM.
             * Supports auto-hiding after a specified delay or manual closing on click.
             *
             * @param  {Object} elem    The HTML element of the log message to close.
             * @param  {Number} wait    [optional] Time (in ms) to wait before automatically hiding; 0 means never hide automatically.
             *
             * @return {undefined} No explicit return value.
             */
            close : function(elem, wait) {
                // Unary Plus operator: converts `wait` to a number, e.g., +"2" === 2.
                var timer = (wait && !isNaN(wait)) ? +wait : this.delay,
                    self  = this, // Store 'this' for use in nested functions.
                    hideElement, transitionDone; // Helper functions for closing.

                // Bind a click event to the log message to allow manual closing.
                this.bind(elem, "click", function() {
                    hideElement(elem); // Trigger the hide function on click.
                });

                // Callback function executed when CSS transition for hiding completes.
                transitionDone = function(event) {
                    event.stopPropagation(); // Prevent event bubbling.
                    // Unbind the transition event to prevent it from firing multiple times.
                    self.unbind(this, self.transition, transitionDone);
                    // Remove the log message element from the DOM.
                    elLog.removeChild(this);
                    // If no log messages remain, hide the log container.
                    if (!elLog.hasChildNodes()) {
                        elLog.className += " alertify-logs-hidden";
                    }
                };

                // Function to apply the hide class or immediately remove the element.
                hideElement = function(el) {
                    // Ensure the element still exists and is a child of the log container.
                    if (typeof el !== "undefined" && el.parentNode === elLog) {
                        // Check if CSS transitions are supported.
                        if (typeof self.transition !== "undefined") {
                            self.bind(el, self.transition, transitionDone); // Bind transition event.
                            el.className += " alertify-log-hide"; // Add class to trigger transition.
                        } else {
                            // If no transitions, remove immediately.
                            elLog.removeChild(el);
                            if (!elLog.hasChildNodes()) {
                                elLog.className += " alertify-logs-hidden";
                            }
                        }
                    }
                };

                // If 'wait' is 0, the message should never auto-close, only on click.
                if (wait === 0) {
                    return;
                }

                // Set a timeout to automatically hide the log message after `timer` milliseconds.
                setTimeout(function() {
                    hideElement(elem);
                }, timer);
            }, // End of close method.

            /**
             * Creates and queues a new dialog box (alert, confirm, or prompt).
             *
             * @param  {String}   message        The message content to display in the dialog.
             * @param  {String}   type           The type of dialog: "alert", "confirm", or "prompt".
             * @param  {Function} fn             [Optional] A callback function to be executed when the dialog is closed.
             * @param  {String}   placeholder    [Optional] Default value for the prompt input field.
             * @param  {String}   cssClass       [Optional] Custom CSS class(es) to apply to the dialog box.
             *
             * @return {Object}                    The Alertify object for chaining.
             * @throws {Error}                     If `message` or `type` are not strings, or `fn` is not a function (if provided).
             */
            dialog : function(message, type, fn, placeholder, cssClass) {
                // Store the currently active element to restore focus after dialog closes.
                elCallee = document.activeElement;

                // Recursive check to ensure dialog elements are initialized.
                // This might indicate a race condition if init() is not fully complete.
                var check = function() {
                    if (elDialog && elDialog.scrollTop !== null) {
                        return; // Dialog element is ready.
                    } else {
                        check(); // Recurse until ready (potentially blocking).
                    }
                };

                // Input validation for method parameters.
                if (typeof message !== "string") {
                    throw new Error("Alertify: 'message' must be a string.");
                }
                if (typeof type !== "string") {
                    throw new Error("Alertify: 'type' must be a string.");
                }
                if (typeof fn !== "undefined" && typeof fn !== "function") {
                    throw new Error("Alertify: 'fn' (callback) must be a function if provided.");
                }

                // Initialize Alertify's DOM elements if they haven't been created yet.
                if (typeof this.init === "function") {
                    this.init(); // Perform initialization.
                    check();     // Ensure elements are ready after init.
                }

                // Add the new dialog request to the queue.
                queue.push({
                    type: type,
                    message: message,
                    callback: fn,
                    placeholder: placeholder,
                    cssClass: cssClass
                });

                // If no dialog is currently open, set up the first one from the queue.
                if (!isopen) {
                    this.setup();
                }

                return this; // Allow method chaining.
            }, // End of dialog method.

            /**
             * Extends the `log` method to create custom notification types.
             * For example, `alertify.extend("success")` would allow `alertify.success("Yay!")`.
             *
             * @param  {String} type    The name of the custom log method to create.
             *
             * @return {Function}       A new function that acts as a shortcut for `alertify.log(message, type, wait)`.
             * @throws {Error}          If `type` is not a string.
             */
            extend : function(type) {
                if (typeof type !== "string") {
                    throw new Error("Alertify: 'extend' method must be called with a string parameter for the custom type name.");
                }
                // Return a new function that internally calls `log` with the custom type.
                return function(message, wait) {
                    this.log(message, type, wait);
                    return this; // Maintain chaining capability.
                };
            }, // End of extend method.

            /**
             * Hides the currently active dialog box and processes the next item in the queue.
             * Resets the UI state to its default.
             *
             * @return {undefined} No explicit return value.
             */
            hide : function() {
                var transitionDone, // Function to handle end of CSS transition.
                    self = this; // Store 'this' for use in nested functions.

                // Remove the currently displayed item from the front of the queue.
                queue.splice(0, 1);

                // If there are more items in the queue, immediately set up the next one.
                if (queue.length > 0) {
                    this.setup();
                } else {
                    // If the queue is empty, close the dialog and reset state.
                    isopen = false; // Mark that no dialog is currently open.

                    // Callback for when the dialog's hide transition finishes.
                    transitionDone = function(event) {
                        event.stopPropagation(); // Stop event propagation.
                        elDialog.className += " alertify-isHidden"; // Ensure it's fully hidden after transition.
                        // Unbind the transition event to prevent memory leaks or multiple calls.
                        self.unbind(elDialog, self.transition, transitionDone);
                    };

                    // Check for CSS transition support.
                    if (typeof this.transition !== "undefined") {
                        this.bind(elDialog, this.transition, transitionDone); // Bind transition event.
                        elDialog.className = "alertify alertify-hide alertify-hidden"; // Start hide transition.
                    } else {
                        // If no transition support, apply all hidden classes immediately.
                        elDialog.className = "alertify alertify-hide alertify-hidden alertify-isHidden";
                    }

                    // Hide the overlay cover.
                    elCover.className  = "alertify-cover alertify-cover-hidden";

                    // Restore focus to the element that was active before the dialog appeared.
                    elCallee.focus();
                }
            }, // End of hide method.

            /**
             * Initializes the core DOM elements for Alertify (cover, dialog container, log container).
             * This method is called once, on the first interaction with Alertify.
             *
             * @return {undefined} No explicit return value.
             */
            init : function() {
                // Ensure older browsers support HTML5 semantic tags by creating them.
                document.createElement("nav");
                document.createElement("article");
                document.createElement("section");

                // Create and append the overlay cover element.
                elCover = document.createElement("div");
                elCover.setAttribute("id", "alertify-cover");
                elCover.className = "alertify-cover alertify-cover-hidden"; // Initially hidden.
                document.body.appendChild(elCover);

                // Create and append the main dialog container element.
                elDialog = document.createElement("section");
                elDialog.setAttribute("id", "alertify");
                elDialog.className = "alertify alertify-hidden"; // Initially hidden.
                document.body.appendChild(elDialog);

                // Create and append the log messages container element.
                elLog = document.createElement("section");
                elLog.setAttribute("id", "alertify-logs");
                elLog.className = "alertify-logs alertify-logs-hidden"; // Initially hidden.
                document.body.appendChild(elLog);

                // Set a tabindex on the body to allow programmatic focus after dialog closure.
                document.body.setAttribute("tabindex", "0");

                // Detect and store the browser's specific transition event name.
                this.transition = getTransitionEvent();

                // Delete this `init` method to ensure it's only called once.
                delete this.init;
            }, // End of init method.

            /**
             * Displays a new log (toast) message.
             *
             * @param  {String} message    The message content to display.
             * @param  {String} type       [Optional] The type of log message (e.g., "success", "error"). This adds a class `alertify-log-{type}`.
             * @param  {Number} wait       [Optional] Time (in ms) before the message auto-hides. 0 means it stays until clicked.
             *
             * @return {Object}            The Alertify object for chaining.
             */
            log : function(message, type, wait) {
                // Recursive check to ensure the log element is initialized.
                var check = function() {
                    if (elLog && elLog.scrollTop !== null) {
                        return; // Log element is ready.
                    } else {
                        check(); // Recurse until ready.
                    }
                };

                // Initialize Alertify's DOM elements if not already done.
                if (typeof this.init === "function") {
                    this.init(); // Perform initialization.
                    check();     // Ensure elements are ready.
                }

                elLog.className = "alertify-logs"; // Make sure the log container is visible.
                this.notify(message, type, wait); // Delegate to the notify method.
                return this; // Allow method chaining.
            }, // End of log method.

            /**
             * Adds a new log message to the log container.
             *
             * If a `type` is provided, a class name `alertify-log-{type}` will be added to the message.
             * This enables custom styling for different notification types (e.g., success, error).
             *
             * @param  {String} message    The message content to display within the log notification.
             * @param  {String} type       [Optional] Specifies a type for the log message, affecting its CSS class.
             * @param  {Number} wait       [Optional] Duration (in milliseconds) before the log message automatically disappears.
             *                             If set to 0, the message will remain until manually clicked.
             */