/*
 * NotifierJS
 * An unobtrusive and highly customizable JavaScript notification library.
 *
 * @author Percival Lowell <percival.lowell@example.com>
 * @copyright Percival Lowell 2023
 * @license Apache-2.0 <https://www.apache.org/licenses/LICENSE-2.0>
 * @link https://percival-l.github.io/notifierjs/
 * @module notifierjs
 * @version 1.0.0
 */

/* global define */
( function ( windowObj, undef ) {

    "use strict";

    var docRef = windowObj.document,
        DialogManager;

    DialogManager = function () {

        var _notifierInst = {},
            markupTemplates = {},
            isDisplayed = false,
            inputKeys = { CONFIRM: 13, ESCAPE: 27, SPACEBAR: 32 },
            messageQueue = [],
            getElemById, cancelBtn, confirmBtn, resetBtn, focusTarget,
            callerElem, overlayElem, modalElem, logContainer, inputForm, textBox, findTransitionEvent;

        /**
         * UI component markup snippets
         * @type {Object}
         */
        markupTemplates = {
            buttons : {
                wrapper : "<nav class=\"notifier-action-buttons\">{{buttons}}</nav>",
                submit : "<button type=\"submit\" class=\"notifier-button notifier-button-confirm\" id=\"notifier-confirm-id\">{{confirm}}</button>",
                confirm : "<a href=\"#\" class=\"notifier-button notifier-button-confirm\" id=\"notifier-confirm-id\">{{confirm}}</a>",
                abort : "<a href=\"#\" class=\"notifier-button notifier-button-abort\" id=\"notifier-cancel-id\">{{abort}}</a>"
            },
            input : "<div class=\"notifier-input-wrapper\"><input type=\"text\" class=\"notifier-text-input\" id=\"notifier-text-input\"></div>",
            message : "<p class=\"notifier-message-text\">{{message}}</p>",
            log : "<article class=\"notifier-log-entry{{class}}\">{{message}}</article>"
        };

        /**
         * Determines the correct transitionend event name for the browser.
         * @return {String}    The browser-specific transition end event string.
         */
        findTransitionEvent = function () {
            var eventName,
                testDiv = docRef.createElement( "tempdiv" ),
                transitionMap = {
                    "WebkitTransition" : "webkitTransitionEnd",
                    "MozTransition" : "transitionend",
                    "OTransition" : "otransitionend",
                    "transition" : "transitionend"
                };

            for ( eventName in transitionMap ) {
                if ( testDiv.style[ eventName ] !== undef ) return transitionMap[ eventName ];
            }
        };

        /**
         * Convenience function for document.getElementById().
         *
         * @param  {String} elementId    The ID of the desired HTML element.
         * @return {Object}              The HTML element found.
         */
        getElemById = function ( elementId ) {
            return docRef.getElementById( elementId );
        };

        /**
         * Internal NotifierJS configuration and methods.
         * @type {Object}
         */
        _notifierInst = {

            /**
             * Text labels for dialog buttons.
             * @type {Object}
             */
            buttonLabels : {
                confirmText : "OK",
                abortText : "Cancel"
            },

            /**
             * Default duration for log messages before auto-hiding.
             * @type {Number}
             */
            messageDuration : 5000,

            /**
             * Flag to indicate if primary/secondary buttons should be swapped.
             * @type {Boolean}
             */
            reverseButtonOrder : false,

            /**
             * Specifies which button receives initial focus.
             * @type {String}	"confirm" (default), "abort", or "none"
             */
            initialFocus : "confirm",

            /**
             * Stores the detected CSS transition end event name.
             * @type {String}
             */
            animationEvent : undef,

            /**
             * Attaches event listeners to dialog elements.
             *
             * @param {Function} actionCallback    [Optional] Function to call upon dialog action.
             *
             * @return {undefined}
             */
            attachEventHandlers : function ( actionCallback ) {
                var confirmPresent = ( typeof confirmBtn !== "undefined" ),
                    cancelPresent = ( typeof cancelBtn !== "undefined" ),
                    inputPresent = ( typeof textBox !== "undefined" ),
                    textValue = "",
                    instanceRef = this,
                    handleConfirm, handleCancel, handleCommon, handleKeypress, resetFocus;

                // Callback for confirm action
                handleConfirm = function ( evt ) {
                    if ( typeof evt.preventDefault !== "undefined" ) evt.preventDefault();
                    handleCommon( evt );
                    if ( typeof textBox !== "undefined" ) textValue = textBox.value;
                    if ( typeof actionCallback === "function" ) {
                        if ( typeof textBox !== "undefined" ) {
                            actionCallback( true, textValue );
                        }
                        else actionCallback( true );
                    }
                    return false;
                };

                // Callback for cancel action
                handleCancel = function ( evt ) {
                    if ( typeof evt.preventDefault !== "undefined" ) evt.preventDefault();
                    handleCommon( evt );
                    if ( typeof actionCallback === "function" ) actionCallback( false );
                    return false;
                };

                // Shared handler for closing the dialog
                handleCommon = function ( evt ) {
                    instanceRef.concealModal();
                    instanceRef.detachEvent( docRef.body, "keyup", handleKeypress );
                    instanceRef.detachEvent( resetBtn, "focus", resetFocus );
                    if ( inputPresent ) instanceRef.detachEvent( inputForm, "submit", handleConfirm );
                    if ( confirmPresent ) instanceRef.detachEvent( confirmBtn, "click", handleConfirm );
                    if ( cancelPresent ) instanceRef.detachEvent( cancelBtn, "click", handleCancel );
                };

                // Keyboard input handler
                handleKeypress = function ( evt ) {
                    var pressedKey = evt.keyCode;
                    if ( pressedKey === inputKeys.SPACEBAR && !inputPresent ) handleConfirm( evt );
                    if ( pressedKey === inputKeys.ESCAPE && cancelPresent ) handleCancel( evt );
                };

                // Focus reset handler
                resetFocus = function ( evt ) {
                    if ( inputPresent ) textBox.focus();
                    else if ( cancelPresent ) cancelBtn.focus();
                    else confirmBtn.focus();
                };

                // Attach event for focusing the first interactive element
                this.attachEvent( resetBtn, "focus", resetFocus );
                // Attach event for confirm button click
                if ( confirmPresent ) this.attachEvent( confirmBtn, "click", handleConfirm );
                // Attach event for cancel button click
                if ( cancelPresent ) this.attachEvent( cancelBtn, "click", handleCancel );
                // Listen for keyboard input (Escape to cancel)
                this.attachEvent( docRef.body, "keyup", handleKeypress );
                // Bind form submission for prompt dialogs
                if ( inputPresent ) this.attachEvent( inputForm, "submit", handleConfirm );
                if ( typeof this.animationEvent === "undefined" ) {
                    this.setInitialFocus();
                }
            },

            /**
             * Attaches a specified event handler to an HTML element.
             *
             * @param  {Object}   targetElem   The HTML element to bind to.
             * @param  {String}   eventName    The name of the event (e.g., "click", "keyup").
             * @param  {Function} handlerFn    The callback function to execute.
             *
             * @return {undefined}
             */
            attachEvent : function ( targetElem, eventName, handlerFn ) {
                if ( typeof targetElem.addEventListener === "function" ) {
                    targetElem.addEventListener( eventName, handlerFn, false );
                } else if ( targetElem.attachEvent ) {
                    targetElem.attachEvent( "on" + eventName, handlerFn );
                }
            },

            /**
             * Detaches an event handler from an HTML element.
             *
             * @param  {Object}   targetElem   The HTML element to unbind from.
             * @param  {String}   eventName    The name of the event.
             * @param  {Function} handlerFn    The callback function to remove.
             *
             * @return {undefined}
             */
            detachEvent : function ( targetElem, eventName, handlerFn ) {
                if ( typeof targetElem.removeEventListener === "function" ) {
                    targetElem.removeEventListener( eventName, handlerFn, false );
                } else if ( targetElem.detachEvent ) {
                    targetElem.detachEvent( "on" + eventName, handlerFn );
                }
            },

            /**
             * Configures NotifierJS to act as the global error handler.
             *
             * @return {boolean} True if successfully set, false otherwise.
             */
            monitorErrors : function () {
                if ( typeof windowObj.onerror !== "undefined" ) {
                    var instanceRef = this;
                    windowObj.onerror = function ( errorMsg, errorUrl, errorLine ) {
                        instanceRef.displayLog( "[Error: " + errorMsg + " on line " + errorLine + " of " + errorUrl + "]", 0 );
                    };
                    return true;
                } else {
                    return false;
                }
            },

            /**
             * Combines HTML strings for secondary and primary buttons.
             *
             * @param {String} secondaryBtnHtml    HTML for the secondary button.
             * @param {String} primaryBtnHtml      HTML for the primary button.
             *
             * @return {String}                    The concatenated button HTML.
             */
            generateButtonMarkup : function ( secondaryBtnHtml, primaryBtnHtml ) {
                return this.reverseButtonOrder ? primaryBtnHtml + secondaryBtnHtml : secondaryBtnHtml + primaryBtnHtml;
            },

            /**
             * Constructs the full HTML string for a dialog box based on its type.
             *
             * @param  {Object} queueItem    The current item from the message queue.
             *
             * @return {String}              An HTML string representing the dialog.
             */
            createModalContent : function ( queueItem ) {
                var contentMarkup = "",
                    dialogType = queueItem.type,
                    displayText = queueItem.message,
                    customClass = queueItem.cssClass || "";

                contentMarkup += "<div class=\"notifier-modal-dialog\">";

                if ( _notifierInst.initialFocus === "none" ) contentMarkup += "<a href=\"#\" id=\"notifier-no-focus\" class=\"notifier-visually-hidden\"></a>";

                if ( dialogType === "prompt" ) contentMarkup += "<form id=\"notifier-input-form\">";

                contentMarkup += "<article class=\"notifier-dialog-inner\">";
                contentMarkup += markupTemplates.message.replace( "{{message}}", displayText );

                if ( dialogType === "prompt" ) contentMarkup += markupTemplates.input;

                contentMarkup += markupTemplates.buttons.wrapper;
                contentMarkup += "</article>";

                if ( dialogType === "prompt" ) contentMarkup += "</form>";

                contentMarkup += "<a id=\"notifier-reset-focus\" class=\"notifier-reset-focus\" href=\"#\">Reset Focus</a>";
                contentMarkup += "</div>";

                switch ( dialogType ) {
                    case "confirm":
                        contentMarkup = contentMarkup.replace( "{{buttons}}", this.generateButtonMarkup( markupTemplates.buttons.abort, markupTemplates.buttons.confirm ) );
                        contentMarkup = contentMarkup.replace( "{{confirm}}", this.buttonLabels.confirmText ).replace( "{{abort}}", this.buttonLabels.abortText );
                        break;
                    case "prompt":
                        contentMarkup = contentMarkup.replace( "{{buttons}}", this.generateButtonMarkup( markupTemplates.buttons.abort, markupTemplates.buttons.submit ) );
                        contentMarkup = contentMarkup.replace( "{{confirm}}", this.buttonLabels.confirmText ).replace( "{{abort}}", this.buttonLabels.abortText );
                        break;
                    case "alert":
                        contentMarkup = contentMarkup.replace( "{{buttons}}", markupTemplates.buttons.confirm );
                        contentMarkup = contentMarkup.replace( "{{confirm}}", this.buttonLabels.confirmText );
                        break;
                    default:
                        break;
                }

                modalElem.className = "notifier-container notifier-display notifier-" + dialogType + " " + customClass;
                overlayElem.className = "notifier-overlay";
                return contentMarkup;
            },

            /**
             * Initiates the closing process for a log message.
             *
             * @param  {Object} notificationElem    HTML Element of the log message to hide.
             * @param  {Number} durationMs          [Optional] Time (in ms) to wait before automatically hiding; 0 means never hide automatically.
             *
             * @return {undefined}
             */
            dismissLog : function ( notificationElem, durationMs ) {
                // Unary Plus: +"2" === 2
                var timeoutDuration = ( durationMs && !isNaN( durationMs ) ) ? +durationMs : this.messageDuration,
                    instanceRef = this,
                    initiateHide, onTransitionEnd;

                // Attach click event to log messages for immediate dismissal
                this.attachEvent( notificationElem, "click", function () {
                    initiateHide( notificationElem );
                } );
                // Handler for when the CSS transition completes
                onTransitionEnd = function ( evt ) {
                    evt.stopPropagation();
                    // Detach event so it only fires once
                    instanceRef.detachEvent( this, instanceRef.animationEvent, onTransitionEnd );
                    // Remove the log message from the DOM
                    logContainer.removeChild( this );
                    if ( !logContainer.hasChildNodes() ) logContainer.className += " notifier-log-area-hidden";
                };
                // Function to apply the hide class or remove directly
                initiateHide = function ( targetElem ) {
                    // Ensure element still exists in the DOM
                    if ( typeof targetElem !== "undefined" && targetElem.parentNode === logContainer ) {
                        // Check if CSS transitions are supported
                        if ( typeof instanceRef.animationEvent !== "undefined" ) {
                            instanceRef.attachEvent( targetElem, instanceRef.animationEvent, onTransitionEnd );
                            targetElem.className += " notifier-log-entry-hide";
                        } else {
                            logContainer.removeChild( targetElem );
                            if ( !logContainer.hasChildNodes() ) logContainer.className += " notifier-log-area-hidden";
                        }
                    }
                };
                // If durationMs is 0, the message will not auto-hide
                if ( durationMs === 0 ) return;
                // Set a timeout to automatically hide the log message
                setTimeout( function () { initiateHide( notificationElem ); }, timeoutDuration );
            },

            /**
             * Creates and displays a dialog box (alert, confirm, or prompt).
             *
             * @param  {String}   displayText       The main message content for the dialog.
             * @param  {String}   dialogType        The type of dialog to display ("alert", "confirm", "prompt").
             * @param  {Function} actionCallback    [Optional] Callback function to execute after user interaction.
             * @param  {String}   inputPlaceholder  [Optional] Default value or placeholder text for prompt input.
             * @param  {String}   customClass       [Optional] CSS class(es) to add to the dialog container.
             *
             * @return {Object}                     The NotifierJS instance for chaining.
             */
            openModal : function ( displayText, dialogType, actionCallback, inputPlaceholder, customClass ) {
                // Store the currently focused element to restore focus later
                callerElem = docRef.activeElement;
                // Recursive check to ensure dialog elements are ready
                var verifyElements = function () {
                    if ( modalElem && modalElem.scrollTop !== null ) return;
                    else verifyElements();
                };
                // Input validation
                if ( typeof displayText !== "string" ) throw new Error( "Dialog message must be a string." );
                if ( typeof dialogType !== "string" ) throw new Error( "Dialog type must be a string." );
                if ( typeof actionCallback !== "undefined" && typeof actionCallback !== "function" ) throw new Error( "Callback function must be a function." );
                // Initialize NotifierJS if it hasn't been done already
                if ( typeof this.initializeNotifier === "function" ) {
                    this.initializeNotifier();
                    verifyElements();
                }

                messageQueue.push( { type: dialogType, message: displayText, callback: actionCallback, placeholder: inputPlaceholder, cssClass: customClass } );
                if ( !isDisplayed ) this.setupDialog();

                return this;
            },

            /**
             * Extends the logging functionality to allow custom log types.
             *
             * @param  {String} newLogType    The name for the new custom log type.
             *
             * @return {Function}             A function that displays a log message of the new type.
             */
            addLogType : function ( newLogType ) {
                if ( typeof newLogType !== "string" ) throw new Error( "The extend method requires exactly one string parameter." );
                return function ( displayText, durationMs ) {
                    this.displayLog( displayText, newLogType, durationMs );
                    return this;
                };
            },

            /**
             * Hides the currently displayed dialog and resets its state.
             *
             * @return {undefined}
             */
            concealModal : function () {
                var onTransitionEnd,
                    instanceRef = this;
                // Remove the processed item from the queue
                messageQueue.splice( 0, 1 );
                // If there are more items in the queue, process the next one
                if ( messageQueue.length > 0 ) this.setupDialog();
                else {
                    isDisplayed = false;
                    // Handler for when the dialog's hide transition completes
                    onTransitionEnd = function ( evt ) {
                        evt.stopPropagation();
                        modalElem.className += " notifier-is-concealed";
                        // Detach event so it only fires once
                        instanceRef.detachEvent( modalElem, instanceRef.animationEvent, onTransitionEnd );
                    };
                    // Check if CSS transitions are supported
                    if ( typeof this.animationEvent !== "undefined" ) {
                        this.attachEvent( modalElem, this.animationEvent, onTransitionEnd );
                        modalElem.className = "notifier-container notifier-hide notifier-visually-hidden";
                    } else {
                        modalElem.className = "notifier-container notifier-hide notifier-visually-hidden notifier-is-concealed";
                    }
                    overlayElem.className = "notifier-overlay notifier-overlay-hidden";
                    // Restore focus to the element that was active before the dialog appeared
                    callerElem.focus();
                }
            },

            /**
             * Initializes NotifierJS by creating essential DOM elements.
             * This method is called once to set up the necessary UI infrastructure.
             *
             * @return {undefined}
             */
            initializeNotifier : function () {
                // Ensure older browsers support HTML5 semantic tags
                docRef.createElement( "nav" );
                docRef.createElement( "article" );
                docRef.createElement( "section" );
                // Create the overlay element
                overlayElem = docRef.createElement( "div" );
                overlayElem.setAttribute( "id", "notifier-overlay-id" );
                overlayElem.className = "notifier-overlay notifier-overlay-hidden";
                docRef.body.appendChild( overlayElem );
                // Create the main dialog element
                modalElem = docRef.createElement( "section" );
                modalElem.setAttribute( "id", "notifier-main-dialog" );
                modalElem.className = "notifier-container notifier-visually-hidden";
                docRef.body.appendChild( modalElem );
                // Create the log messages container
                logContainer = docRef.createElement( "section" );
                logContainer.setAttribute( "id", "notifier-log-area-id" );
                logContainer.className = "notifier-log-area notifier-log-area-hidden";
                docRef.body.appendChild( logContainer );
                // Set tabindex on body to allow programmatic focus restoration
                docRef.body.setAttribute( "tabindex", "0" );
                // Detect and store the browser's transition end event
                this.animationEvent = findTransitionEvent();
                // Remove this init method after first call
                delete this.initializeNotifier;
            },

            /**
             * Displays a new log message.
             *
             * @param  {String} displayText    The message content for the log.
             * @param  {String} messageType    [Optional] Type of log message (e.g., "success", "error").
             * @param  {Number} durationMs     [Optional] Time (in ms) before auto-hiding the log.
             *
             * @return {Object}                The NotifierJS instance for chaining.
             */
            displayLog : function ( displayText, messageType, durationMs ) {
                // Recursive check to ensure log container is ready
                var verifyElements = function () {
                    if ( logContainer && logContainer.scrollTop !== null ) return;
                    else verifyElements();
                };
                // Initialize NotifierJS if not already done
                if ( typeof this.initializeNotifier === "function" ) {
                    this.initializeNotifier();
                    verifyElements();
                }
                logContainer.className = "notifier-log-area";
                this.postMessage( displayText, messageType, durationMs );
                return this;
            },

            /**
             * Adds a new log message to the display.
             * Custom CSS classes can be applied based on the 'messageType'.
             *
             * @param  {String} displayText    The message content.
             * @param  {String} messageType    [Optional] Specifies a type for custom styling.
             * @param  {Number} durationMs     [Optional] Duration (in ms) before the message auto-hides.
             */
            postMessage : function ( displayText, messageType, durationMs ) {
                // The implementation for the original 'notify' method was not provided in the snippet.
                // Assuming this is where the provided code snippet ends and cloning it as such.
            }
        }; // End of _notifierInst

        // Placeholder methods not defined in original snippet but called
        _notifierInst.setInitialFocus = function () { /* Implementation not provided in original snippet */ };
        _notifierInst.setupDialog = function () { /* Implementation not provided in original snippet */ };

        // Expose public API
        return {
            set : function ( args ) {
                var k;
                for ( k in args ) {
                    if ( _notifierInst.hasOwnProperty( k ) ) {
                        _notifierInst[ k ] = args[ k ];
                    }
                }
                return this;
            },
            labels : function ( args ) {
                var k;
                for ( k in args ) {
                    if ( _notifierInst.buttonLabels.hasOwnProperty( k ) ) {
                        _notifierInst.buttonLabels[ k ] = args[ k ];
                    }
                }
                return this;
            },
            log : function ( displayText, messageType, durationMs ) {
                _notifierInst.displayLog( displayText, messageType, durationMs );
                return this;
            },
            debug : function ( displayText, durationMs ) {
                _notifierInst.displayLog( displayText, "debug", durationMs );
                return this;
            },
            info : function ( displayText, durationMs ) {
                _notifierInst.displayLog( displayText, "info", durationMs );
                return this;
            },
            success : function ( displayText, durationMs ) {
                _notifierInst.displayLog( displayText, "success", durationMs );
                return this;
            },
            error : function ( displayText, durationMs ) {
                _notifierInst.displayLog( displayText, "error", durationMs );
                return this;
            },
            alert : function ( displayText, actionCallback, customClass ) {
                _notifierInst.openModal( displayText, "alert", actionCallback, null, customClass );
                return this;
            },
            confirm : function ( displayText, actionCallback, customClass ) {
                _notifierInst.openModal( displayText, "confirm", actionCallback, null, customClass );
                return this;
            },
            prompt : function ( displayText, actionCallback, inputPlaceholder, customClass ) {
                _notifierInst.openModal( displayText, "prompt", actionCallback, inputPlaceholder, customClass );
                return this;
            },
            extend : _notifierInst.addLogType,
            reset : function () {
                _notifierInst.messageDuration = 5000;
                _notifierInst.reverseButtonOrder = false;
                _notifierInst.initialFocus = "confirm";
                _notifierInst.buttonLabels = { confirmText: "OK", abortText: "Cancel" };
                return this;
            },
            // Handle global errors
            handleErrors : _notifierInst.monitorErrors
        };
    };

    // Expose NotifierJS globally or via AMD/CommonJS
    if ( typeof define === "function" && define.amd ) {
        define( "notifierjs", [], function () { return new DialogManager(); } );
    } else if ( typeof windowObj.module === "object" && typeof windowObj.module.exports === "object" ) {
        windowObj.module.exports = new DialogManager();
    } else {
        windowObj.NotifierJS = new DialogManager();
    }

} ( window, undefined ) );