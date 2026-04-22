/*!
 * message-box.js v1.0.0, 15.08.2023
 * Elegantly designed JavaScript dialog boxes.
 * By John Doe (http://example.com, @johndoe)
 * Licensed under Apache 2.0
 */
;(function (globalScope, pageDOM, undefVal) {
    'use strict';

    /**
     * Core message box class.
     * @constructor
     */
    var DialogBox = function() {
        
        /** @private */
        var

            // Initial configuration settings
            initialSettings = {
                dialogType: 'message',
                heading: '',
                subheading: '',
                contentHtml: '',
                actionBtns: {
                    CONFIRM: {
                        label: 'Okay',
                        attributes: {
                            id: 'btn_confirm',
                            'class': 'dialog-js-btn dialog-js-btn-confirm'
                        }
                    },
                    DISMISS: {
                        label: 'Cancel',
                        attributes: {
                            id: 'btn_dismiss',
                            'class': 'dialog-js-btn dialog-js-btn-dismiss'
                        }
                    }
                },
                dimmer: true,
                hasHeading: true,
                animationEffect: 'ease-in',
                delayMs: 0,
                originPosition: 'center',
                xPos: '50%',
                yPos: '80%',
                autoHideOnClick: false,
                displayDuration: 2500,
                onSuccess: null,
                onDismiss: null,
                onFinalize: null
            },

            /*
              Construct and organize various components of the dialog box.
              @param  {Object} userConfig custom settings from user
              @return {Object} this object reference
            */
            constructDialog = function( userConfig ) {
                var currentInstance = this;
                var composer = currentInstance.elementComposer;
                var clonedSettings = ( JSON.parse( JSON.stringify(initialSettings) ) ); // Deep clone
                var finalOptions = _util.mergeObjects(clonedSettings, userConfig);

                // Apply merged options
                composer.setConfiguration(finalOptions);

                // No dismiss button needed for a simple message box
                if( composer.currentOptions.dialogType === 'message' ) {
                    composer.currentOptions.actionBtns.DISMISS = false;
                }

                updateFlashOptions(composer, userConfig);

                // Generate HTML elements
                composer.constructComponent('mainContainer');

                if( composer.currentOptions.hasHeading !== false ) {
                    composer.constructComponent('headerSection');
                    composer.constructComponent('titleElement');
                    
                    if( composer.currentOptions.subheading !== '' ) {
                        composer.constructComponent('subtitleElement');
                    }
                }
                
                composer.constructComponent('contentArea');

                if( composer.currentOptions.dialogType === 'inputPrompt' ) {
                    composer.constructComponent('inputField');
                }

                composer.constructComponent('shadeLayer');

                // Check user-provided options for buttons,
                // not the merged ones as defaults might add them back
                if( userConfig.actionBtns !== false ) {
                    composer.constructComponent('footerSection');
                    composer.constructComponent('confirmButton');

                    if( composer.currentOptions.actionBtns.DISMISS !== false ) {
                        composer.constructComponent('dismissButton');
                    }
                }
               
                arrangeElements(composer);
                return composer; // Return the builder
            },

            /* Arrange generated HTML elements into the DOM */
            arrangeElements = function( composerRef ) {
                pageDOM.body.appendChild(composerRef.mainContainer);
                appendIfPresent(composerRef.mainContainer, composerRef.headerSection);
                composerRef.mainContainer.appendChild(composerRef.contentArea);
                appendIfPresent(composerRef.headerSection, composerRef.titleElement);
                appendIfPresent(composerRef.headerSection, composerRef.subtitleElement);
                appendIfPresent(composerRef.contentArea, composerRef.inputField);
                appendIfPresent(composerRef.mainContainer, composerRef.footerSection);

                // Add buttons if they exist
                if( composerRef.footerSection !== null && composerRef.confirmButton !== null ) {
                    composerRef.footerSection.appendChild(composerRef.confirmButton);
                    
                    // Attach event listener
                    attachListener(composerRef.confirmButton, 'click', function() {
                        triggerCallback(true);
                    });
                }

                if( composerRef.footerSection !== null && composerRef.dismissButton !== null ) {
                    composerRef.footerSection.appendChild(composerRef.dismissButton);

                    // Attach event listener   
                    attachListener(composerRef.dismissButton, 'click', function() {
                        triggerCallback(false);
                    });
                }

                if( composerRef.currentOptions.dialogType === 'flashNotification' ) {
                    attachListener(composerRef.mainContainer, 'click', function() {
                        triggerCallback(true);
                    });
                }

                if( composerRef.inputField !== null && !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigatorScope.userAgent) ) {
                    composerRef.inputField.focus();
                }
            },
           
            /* Appends an element to a parent if the element is not null */
            appendIfPresent = function( parentElm, childElm ) {
                if( childElm !== null ) {
                    parentElm.appendChild(childElm);
                }
            },

            // Specific settings for 'flash' type notifications
            updateFlashOptions = function( composerRef, userConfig ) {
                if( composerRef.currentOptions.dialogType === 'flashNotification' ) {
                    composerRef.currentOptions.dimmer = false;
                    composerRef.currentOptions.hasHeading = false;
                    composerRef.currentOptions.originPosition = 'center';
                    userConfig.actionBtns = false;
                }
            },

            // Execute appropriate callbacks based on action status
            triggerCallback = function( actionStatus ) {
                var activeDialog = getCurrentDialog().ref;
                var dialogOpts = activeDialog.elementComposer.currentOptions;

                activeDialog.conceal();

                if( actionStatus && dialogOpts.onSuccess !== null ) {
                    onSuccessfulAction(activeDialog);
                } else if( !actionStatus && dialogOpts.onDismiss !== null ) {
                    dialogOpts.onDismiss.apply(this);
                }

                if( dialogOpts.onFinalize !== null ) {
                    onCompletionAction(activeDialog, actionStatus);
                }
            },

            onSuccessfulAction = function(activeDialog) {
                var dialogOpts = activeDialog.elementComposer.currentOptions;
                if(dialogOpts.dialogType === 'inputPrompt') { 
                    dialogOpts.onSuccess.call(this, activeDialog.elementComposer.inputField.value);
                } else if( dialogOpts.contentHtml.charAt(0) === '#' ) {
                    dialogOpts.onSuccess.call(this, extractFormData(activeDialog.elementComposer.mainContainer));
                } else {
                    dialogOpts.onSuccess.apply(this);
                }
            },

            onCompletionAction = function(activeDialog, actionStatus) {
                var dialogOpts = activeDialog.elementComposer.currentOptions;
                if( dialogOpts.dialogType === 'inputPrompt' ) {
                    dialogOpts.onFinalize.call(this, actionStatus, activeDialog.elementComposer.inputField.value);
                } else if( dialogOpts.contentHtml.charAt(0) === '#' ) {
                    dialogOpts.onFinalize.call(this, actionStatus, extractFormData(activeDialog.elementComposer.mainContainer));
                } else {
                    dialogOpts.onFinalize.call(this, actionStatus);
                }
            },

            // Retrieve data from user-defined input elements within the dialog
            extractFormData = function( containerElm ) {
                var inputElements = containerElm.querySelectorAll('input, textarea, select');
                var collectedData = {};
                var k, elemName;

                if( inputElements.length > 0 ) {
                    for( k = 0; k < inputElements.length; k++ ) {
                        elemName = inputElements[k].getAttribute('name');
                        if( elemName !== null ) {
                            collectedData[elemName] = inputElements[k].value;
                        } else {
                            collectedData[k] = inputElements[k].value;
                        }
                    }
                }

                return collectedData;
            },

            /* Animate and display the dialog box */
            displayWithMotion = function( dialogObject ) {
                _util.pauseExecution();
                if( Object.keys(dialogObject).length > 0 ){
                    var composer = dialogObject.elementComposer;

                    setTimeout(function() {

                        // Insert overlay
                        pageDOM.body.insertBefore(composer.shadeLayer, composer.mainContainer);
                        if( !composer.currentOptions.dimmer ) {
                            composer.shadeLayer.style.visibility = 'hidden';
                        }
                        
                        // Start animation by toggling classes
                        _util.addClass(composer.mainContainer, 'dialog-js-' + composer.currentOptions.animationEffect, function() {
                            // Short delay for smoother transition
                            setTimeout(function() {
                                _util.removeClass(composer.mainContainer, 'dialog-js-animation-' + composer.currentOptions.originPosition);
                            }, 10);
                        });

                        if( composer.currentOptions.dialogType === 'flashNotification' ) {
                            composer.mainContainer.style.left = composer.currentOptions.xPos;
                            composer.mainContainer.style.top = composer.currentOptions.yPos;
                            setTimeout(function() {
                                getCurrentDialog().ref.conceal();
                            }, composer.currentOptions.displayDuration);
                        }

                    }, composer.currentOptions.delayMs);
                }
            },

            /*
              Binds an event listener to an element
              @param {Object} targetEl The element to attach the event to
              @param {Event} eventType The type of event (e.g., 'click')
              @param {Function} callbackFn The function to execute when the event occurs
             */
            attachListener = function( targetEl, eventType, callbackFn ) {

                if( typeof targetEl.addEventListener === 'function' ) {
                    targetEl.addEventListener(eventType, callbackFn, false);
                } else if( targetEl.attachEvent ) { // IE fallback
                    targetEl.attachEvent("on" + eventType, callbackFn);
                }

            },

            // Trigger the animation process if not locked
            initiateProcess = function() {
                if( !isProcessing ) {
                    var currentContext = getCurrentDialog();
                    var constructedInstance = constructDialog.call(currentContext.ref, currentContext.config);

                    displayWithMotion(currentContext.ref);
                    return constructedInstance;
                }

                return false;
            },

            /* 
              Provides access to public methods from
              private functions via the current dialog object.
            */
            getCurrentDialog = function() {
                if( dialogQueue.length <= 0 ) {
                    return {};
                }

                return dialogQueue.slice(0, 1).pop();
            };

            return {
                /** @public */
                elementComposer: new ComponentFactory(),

                /**
                 * Displays various types of dialogs.
                 * @param  {Object}   config  User-defined configuration
                 * @return {Object} The dialog object instance
                 */
                present: function( config ) {
                    var currentDialog = this;

                    if( typeof config.dialogType === 'undefVal' || !_util.isValidType(config.dialogType, _util.getValidTypes()) ) {
                        config.dialogType = 'message'; // Default type
                    }

                    // Add a local copy of DialogBox to the processing queue
                    dialogQueue.push({ref: new DialogBox(), config: config});

                    this.elementComposer = initiateProcess();
                    return currentDialog;
                },

                /* Hides the currently displayed dialog box */
                conceal: function() {
                    var currentDialog = this;
                    var dialogElement = currentDialog.elementComposer.mainContainer;
                    var dimmerElement = currentDialog.elementComposer.shadeLayer;
                    var dialogOpts = currentDialog.elementComposer.currentOptions;

                    _util.addClass(dialogElement, 'dialog-js-animation-' + dialogOpts.originPosition, function() {
                        if( dialogQueue.length > 0 ) {
                            setTimeout(function() {
                                pageDOM.body.removeChild(dimmerElement);
                                pageDOM.body.removeChild(dialogElement);
                                dialogQueue.splice(0, 1);
                                _util.releaseLock();
                                if( dialogQueue.length > 0 ) {
                                    initiateProcess();
                                }
                            }, 400);
                        }

                    });
                }
               
            };
    };

    var dialogQueue = [], // Queue for dialog instances
        isProcessing = false; // Mutex to prevent simultaneous dialogs

    /**
     * ComponentFactory class
     * Responsible for creating all necessary HTML elements for the application.
     * @constructor
     */
    var ComponentFactory = function() {
        /** @private */
        var

            // Creates the main outer element that wraps the dialog.
            buildMainContainer = function() {
                var container = pageDOM.createElement('section');
                container.setAttribute('id', 'dialogJS');
                container.className = 'dialog-js dialog-js-animation-' + this.currentOptions.originPosition + ' ' + this.currentOptions.dialogType;

                return container;
            },

            // Creates the header element.
            buildHeaderSection = function() {
                var header = pageDOM.createElement('header');
                header.className = 'dialog-js-header';

                return header;
            },

            // Creates the title element.
            buildTitleText = function() {
                var h1 = pageDOM.createElement('h1');
                h1.innerHTML = this.currentOptions.heading;

                return h1;
            },

            // Creates the sub-header element.
            buildSubtitleText = function() {
                var h2 = pageDOM.createElement('h2');
                h2.innerHTML = this.currentOptions.subheading;

                return h2;
            },

            // Creates the body/content area.
            buildContentArea = function() {
                var bodyDiv = pageDOM.createElement('div');
                bodyDiv.className = 'dialog-js-body';
                if( this.currentOptions.contentHtml.charAt(0) === '#' ) {
                    bodyDiv.innerHTML = _util.fetchElementContent(this.currentOptions.contentHtml.slice(1), true).innerHTML;
                } else {
                    bodyDiv.innerHTML = this.currentOptions.contentHtml;
                }

                return bodyDiv;
            },

            // Creates an input field for prompt dialogs.
            buildInputField = function() {
                var inputEl = pageDOM.createElement('input');
                inputEl.setAttribute('type', 'text');
                inputEl.className = 'dialog-js-input';

                return inputEl;
            },

            // Creates the footer element.
            buildFooterSection = function() {
                var footer = pageDOM.createElement('footer');
                footer.className = 'dialog-js-footer';

                return footer;
            },

            // Creates a generic action button element (OK or CANCEL).
            buildActionBtn = function( buttonKey ) {
                var button = pageDOM.createElement('button');
                var buttonConfig = this.currentOptions.actionBtns[buttonKey];

                // Set attributes
                if( typeof buttonConfig === 'object' && _util.hasProperty('attributes', buttonConfig) ) {
                    for( var attrib in buttonConfig.attributes ) {
                        if( typeof buttonConfig.attributes[attrib] !== 'function' && buttonConfig.attributes.hasOwnProperty(attrib) ) {
                            button.setAttribute(attrib, buttonConfig.attributes[attrib]);
                        }
                    }
                }

                // Set button text
                if( typeof buttonConfig === 'object' && _util.hasProperty('label', buttonConfig) ) {
                    button.innerHTML = buttonConfig.label;
                } else if( typeof buttonConfig === 'string' ) {
                    button.innerHTML = buttonConfig;
                } else {
                    button.innerHTML = buttonConfig.toString();
                }

                return button;
            },

            // Creates the confirmation (OK) button.
            buildConfirmBtn = function() {
                return buildActionBtn.call(this, 'CONFIRM');
            },

            // Creates the dismissal (CANCEL) button.
            buildDismissBtn = function() {
                return buildActionBtn.call(this, 'DISMISS');
            },

            // Creates the overlay/dimmer element.
            buildShadeLayer = function() {
                var overlayDiv = pageDOM.createElement('div');
                overlayDiv.className = 'dialog-js-overlay';

                return overlayDiv;
            };


        return {
            /** @public */
            mainContainer: null,
            headerSection: null,
            titleElement: null,
            subtitleElement: null,
            contentArea: null,
            inputField: null,
            footerSection: null,
            actionButtons: null,
            confirmButton: null,
            dismissButton: null,
            shadeLayer: null,
            currentOptions: null,
            hasCustomContent: false,

            /**
             * Builder method
             * @param  {string} componentType Determines which component to build
             *                                 by calling the appropriate builder function.
             * @return {Object | boolean} The created DOM element or false if not found
             */
            constructComponent: function( componentType ) {
                switch(componentType) {
                    case 'mainContainer':
                        return (this.mainContainer = buildMainContainer.call(this));

                    case 'headerSection':
                        return (this.headerSection = buildHeaderSection.call(this));

                    case 'titleElement':
                        return (this.titleElement = buildTitleText.call(this));

                    case 'subtitleElement':
                        return (this.subtitleElement = buildSubtitleText.call(this));

                    case 'contentArea':
                        return (this.contentArea = buildContentArea.call(this));

                    case 'inputField':
                        return (this.inputField = buildInputField.call(this));

                    case 'footerSection':
                        return (this.footerSection = buildFooterSection.call(this));

                    case 'confirmButton':
                        return (this.confirmButton = buildConfirmBtn.call(this));

                    case 'dismissButton':
                        return (this.dismissButton = buildDismissBtn.call(this));

                    case 'shadeLayer':
                        return (this.shadeLayer = buildShadeLayer.call(this));

                    default:
                        return false;
                }
            },

            /**
             * Sets the current configuration options for the factory.
             * @param {Object} options The configuration object to set.
             */
            setConfiguration: function(options) {
                this.currentOptions = options;
            }
        };
    };

    // Assume _util is a global utility object, similar to how `_` was used.
    // For a Type II clone, we're not asked to create a new `_util` from scratch,
    // only to rename its usage and assume it exists.
    var _util = globalScope._util = {
        /**
         * Merges properties from source object into target object.
         * @param {Object} target The object to merge into.
         * @param {Object} source The object to merge from.
         * @returns {Object} The merged target object.
         */
        mergeObjects: function(target, source) {
            for (var key in source) {
                if (source.hasOwnProperty(key)) {
                    if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key]) && typeof target[key] === 'object' && target[key] !== null) {
                        _util.mergeObjects(target[key], source[key]);
                    } else {
                        target[key] = source[key];
                    }
                }
            }
            return target;
        },

        /**
         * Checks if an array contains a specific value.
         * @param {any} value The value to search for.
         * @param {Array} array The array to search in.
         * @returns {boolean} True if value is found, false otherwise.
         */
        isValidType: function(value, array) {
            return array.indexOf(value) !== -1;
        },

        /**
         * Returns a list of valid dialog types.
         * @returns {Array<string>} An array of valid dialog type strings.
         */
        getValidTypes: function() {
            return ['message', 'inputPrompt', 'flashNotification'];
        },

        /**
         * Adds a class to an element.
         * @param {HTMLElement} element The element to add the class to.
         * @param {string} className The class name to add.
         * @param {Function} [callback] Optional callback to execute after class is added.
         */
        addClass: function(element, className, callback) {
            if (element && className) {
                element.classList.add(className);
                if (typeof callback === 'function') {
                    callback();
                }
            }
        },

        /**
         * Removes a class from an element.
         * @param {HTMLElement} element The element to remove the class from.
         * @param {string} className The class name to remove.
         */
        removeClass: function(element, className) {
            if (element && className) {
                element.classList.remove(className);
            }
        },

        /**
         * Pauses execution (sets a global lock).
         */
        pauseExecution: function() {
            isProcessing = true;
        },

        /**
         * Releases the execution lock.
         */
        releaseLock: function() {
            isProcessing = false;
        },

        /**
         * Checks if an object has a specific property.
         * @param {string} prop The property name to check.
         * @param {Object} obj The object to check.
         * @returns {boolean} True if the property exists, false otherwise.
         */
        hasProperty: function(prop, obj) {
            return obj && Object.prototype.hasOwnProperty.call(obj, prop);
        },

        /**
         * Fetches content from a DOM element by ID.
         * @param {string} elementId The ID of the element to fetch.
         * @param {boolean} remove If true, removes the element from the DOM.
         * @returns {HTMLElement|null} The fetched element or null.
         */
        fetchElementContent: function(elementId, remove) {
            var element = pageDOM.getElementById(elementId);
            if (element && remove) {
                element.parentNode.removeChild(element);
            }
            return element;
        }
    };

    // Expose the main DialogBox constructor to the global scope
    globalScope.MessageBox = DialogBox;

})(window, document, undefined);