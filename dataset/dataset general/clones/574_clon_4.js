(function (globalScope) {
    "use strict";

    const documentObject = globalScope.document;

    // Main class representing the notification system
    class PopUp {
        constructor() {
            this.modalQueue = []; // Holds pending modal dialog requests
            this.currentModalPresenter = null; // Reference to the currently active modal handler
            this.activeElementBeforeModal = null; // Stores element that had focus before modal opened
            this.isModalActive = false; // Flag to indicate if a modal is currently displayed

            // DOM elements managed by this system
            this.overlayLayer = null;
            this.dialogBoxWrapper = null;
            this.notificationArea = null;

            // Key codes for keyboard interaction
            this.keyCodes = {
                ENTER_KEY: 13,
                ESCAPE_KEY: 27,
                SPACE_BAR: 32
            };

            // Customizable configuration settings
            this.config = {
                confirmButtonLabel: "Okay",
                cancelButtonLabel: "Dismiss",
                toastDisplayDuration: 5000, // in milliseconds
                reverseButtonOrder: false, // true to show primary button before secondary
                defaultButtonFocus: "confirm" // "confirm", "cancel", or "none"
            };

            this.transitionEventName = null; // Detected CSS transition end event name

            // Ensure initialization happens only once for this global system
            if (!PopUp.initialized) {
                this.setupRootElements();
                this.detectTransitionEvent();
                PopUp.initialized = true;
            }
        }

        // Creates and appends the main DOM elements for the UI components
        setupRootElements() {
            // Overlay backdrop for modals
            this.overlayLayer = documentObject.createElement("div");
            this.overlayLayer.id = "ui-overlay-backdrop";
            this.overlayLayer.className = "ui-overlay-backdrop ui-overlay-hidden";
            documentObject.body.appendChild(this.overlayLayer);

            // Container for dialogs (alert, confirm, prompt)
            this.dialogBoxWrapper = documentObject.createElement("section");
            this.dialogBoxWrapper.id = "ui-dialog-container";
            this.dialogBoxWrapper.className = "ui-dialog-container ui-dialog-hidden";
            documentObject.body.appendChild(this.dialogBoxWrapper);

            // Container for toast notifications (logs)
            this.notificationArea = documentObject.createElement("section");
            this.notificationArea.id = "ui-notification-zone";
            this.notificationArea.className = "ui-notification-zone ui-notification-zone-hidden";
            documentObject.body.appendChild(this.notificationArea);

            // Make body focusable to restore focus after modal closes
            documentObject.body.setAttribute("tabindex", "0");
        }

        // Detects the correct 'transitionend' event name for the browser
        detectTransitionEvent() {
            const tempElement = documentObject.createElement("div");
            const transitionMap = {
                "WebkitTransition": "webkitTransitionEnd",
                "MozTransition": "transitionend",
                "OTransition": "otransitionend",
                "transition": "transitionend"
            };

            for (const prop in transitionMap) {
                if (tempElement.style[prop] !== undefined) {
                    this.transitionEventName = transitionMap[prop];
                    return;
                }
            }
        }

        // Helper to attach event listeners
        attachDOMEvent(element, eventType, handler, useCapture = false) {
            if (element && typeof element.addEventListener === "function") {
                element.addEventListener(eventType, handler, useCapture);
            } else if (element && element.attachEvent) { // For older IE
                element.attachEvent("on" + eventType, handler);
            }
        }

        // Helper to detach event listeners
        detachDOMEvent(element, eventType, handler, useCapture = false) {
            if (element && typeof element.removeEventListener === "function") {
                element.removeEventListener(eventType, handler, useCapture);
            } else if (element && element.detachEvent) { // For older IE
                element.detachEvent("on" + eventType, handler);
            }
        }

        // Public method to display a modal dialog (alert, confirm, prompt)
        displayModal(kind, contentMessage, outcomeHandler, initialValue, customStyleClass) {
            if (typeof contentMessage !== "string") throw new Error("Content message must be a string.");
            if (typeof kind !== "string") throw new Error("Modal kind must be a string.");
            if (outcomeHandler && typeof outcomeHandler !== "function") throw new Error("Outcome handler must be a function.");

            this.activeElementBeforeModal = documentObject.activeElement; // Save current focus

            this.modalQueue.push({
                kind: kind,
                content: contentMessage,
                handler: outcomeHandler,
                defaultValue: initialValue,
                style: customStyleClass
            });

            if (!this.isModalActive) {
                this.processNextModal();
            }
            return this;
        }

        // Public method to display a toast notification (log)
        displayToast(contentMessage, styleType, duration) {
            if (!PopUp.initialized) { // Ensure root elements are set up if toast is first call
                this.setupRootElements();
                this.detectTransitionEvent();
                PopUp.initialized = true;
            }

            this.notificationArea.className = "ui-notification-zone"; // Make sure log area is visible
            this.createAndShowToast(contentMessage, styleType, duration);
            return this;
        }

        // Public method to add custom toast types
        addCustomToastType(typeName) {
            if (typeof typeName !== "string") throw new Error("Custom type name must be a string.");
            return (message, delayOverride) => {
                this.displayToast(message, typeName, delayOverride);
                return this;
            };
        }

        // Public method to catch global JavaScript errors
        interceptWindowErrors() {
            if (typeof globalScope.onerror !== "undefined") {
                const selfRef = this;
                globalScope.onerror = function (msg, url, line) {
                    selfRef.displayToast(`Error: [${msg} on line ${line} of ${url}]`, "error", 0);
                };
                return true;
            }
            return false;
        }

        // Public method to update configuration settings
        adjustSettings(options) {
            Object.assign(this.config, options);
            return this;
        }

        // Internal method to process the next modal in the queue
        processNextModal() {
            if (this.modalQueue.length === 0) {
                this.isModalActive = false;
                this.hideCurrentModal(); // Ensure cleanup if queue becomes empty
                return;
            }

            this.isModalActive = true;
            const currentItem = this.modalQueue[0]; // Peek at the first item

            const modalPresenter = new ModalPresenter(this, currentItem);
            this.currentModalPresenter = modalPresenter;

            this.dialogBoxWrapper.innerHTML = modalPresenter.buildLayout();
            this.dialogBoxWrapper.className = `ui-dialog-container ui-dialog-visible ui-dialog-${currentItem.kind} ${currentItem.style || ''}`;
            this.overlayLayer.className = "ui-overlay-backdrop"; // Show overlay

            modalPresenter.bindInteractionListeners();

            if (!this.transitionEventName) { // If no CSS transition support, set focus immediately
                modalPresenter.focusDefaultElement();
            }
        }

        // Internal method to hide the current modal and process the next one or restore focus
        hideCurrentModal() {
            const selfRef = this;

            // Unbind listeners for the current modal
            if (this.currentModalPresenter) {
                this.currentModalPresenter.unbindInteractionListeners();
                this.currentModalPresenter = null;
            }

            // Remove the completed modal from the queue
            if (this.modalQueue.length > 0) {
                this.modalQueue.shift();
            }

            if (this.modalQueue.length > 0) {
                // If there are more modals, process the next one
                this.processNextModal();
            } else {
                // No more modals, hide everything
                this.isModalActive = false;

                const onTransitionEnd = (event) => {
                    // Only react to transitions on the dialog box itself
                    if (event.target === selfRef.dialogBoxWrapper && (event.propertyName === 'opacity' || event.propertyName === 'transform')) {
                        event.stopPropagation();
                        selfRef.detachDOMEvent(selfRef.dialogBoxWrapper, selfRef.transitionEventName, onTransitionEnd);
                        selfRef.dialogBoxWrapper.className += " ui-dialog-invisible"; // Add final hidden state class
                    }
                };

                if (this.transitionEventName) {
                    this.attachDOMEvent(this.dialogBoxWrapper, this.transitionEventName, onTransitionEnd);
                    this.dialogBoxWrapper.className = "ui-dialog-container ui-dialog-hidden"; // Start hide transition
                } else {
                    this.dialogBoxWrapper.className = "ui-dialog-container ui-dialog-hidden ui-dialog-invisible"; // Directly hide if no transitions
                }
                this.overlayLayer.className = "ui-overlay-backdrop ui-overlay-hidden"; // Hide overlay
                this.activeElementBeforeModal.focus(); // Restore focus to original element
            }
        }

        // Internal method to create, display, and manage a single toast notification
        createAndShowToast(contentMessage, styleType, duration) {
            const toastElement = documentObject.createElement("article");
            toastElement.className = `ui-notification-item ui-notification-${styleType || 'default'}`;
            toastElement.innerHTML = contentMessage;

            this.notificationArea.insertBefore(toastElement, this.notificationArea.firstChild); // Newest toast on top

            const toastDuration = (duration === 0) ? 0 : (duration || this.config.toastDisplayDuration);
            const selfRef = this;

            const removeToast = (elementToRemove) => {
                const onToastTransitionEnd = (event) => {
                    // Only react to transitions on the toast item itself
                    if (event.target === elementToRemove && (event.propertyName === 'opacity' || event.propertyName === 'transform')) {
                        event.stopPropagation();
                        selfRef.detachDOMEvent(elementToRemove, selfRef.transitionEventName, onToastTransitionEnd);
                        if (elementToRemove.parentNode === selfRef.notificationArea) {
                            selfRef.notificationArea.removeChild(elementToRemove);
                            if (!selfRef.notificationArea.hasChildNodes()) {
                                selfRef.notificationArea.className += " ui-notification-zone-hidden"; // Hide container if empty
                            }
                        }
                    }
                };

                if (selfRef.transitionEventName) {
                    selfRef.attachDOMEvent(elementToRemove, selfRef.transitionEventName, onToastTransitionEnd);
                    elementToRemove.className += " ui-notification-item-hide"; // Start hide transition
                } else {
                    if (elementToRemove.parentNode === selfRef.notificationArea) {
                        selfRef.notificationArea.removeChild(elementToRemove);
                        if (!selfRef.notificationArea.hasChildNodes()) {
                            selfRef.notificationArea.className += " ui-notification-zone-hidden";
                        }
                    }
                }
            };

            // Allow clicking a toast to dismiss it immediately
            this.attachDOMEvent(toastElement, "click", () => removeToast(toastElement));

            // Auto-hide after duration, unless duration is 0 (never hide)
            if (toastDuration !== 0) {
                setTimeout(() => removeToast(toastElement), toastDuration);
            }
        }
    }

    // Helper class to encapsulate the rendering and interaction logic for a single modal dialog
    class ModalPresenter {
        constructor(parentNotifier, modalData) {
            this.parent = parentNotifier; // Reference to the main PopUp instance
            this.data = modalData; // Data for this specific modal

            // References to critical DOM elements within the modal
            this.confirmButton = null;
            this.cancelButton = null;
            this.textInput = null;
            this.modalForm = null;
            this.focusResetLink = null; // For cycling focus within the modal
            this.invisibleFocusHook = null; // For "none" focus option

            // Pre-bound event handlers to ensure 'this' context is correct
            this.okAction = this.handleOkAction.bind(this);
            this.cancelAction = this.handleCancelAction.bind(this);
            this.keyboardAction = this.handleKeyboardAction.bind(this);
            this.focusResetAction = this.handleFocusResetAction.bind(this);
            this.formSubmitAction = this.handleFormSubmitAction.bind(this);
            this.focusAfterTransitionHandler = this.focusAfterTransition.bind(this);
        }

        // Generates the HTML string for the modal dialog based on its type
        buildLayout() {
            const { kind, content, defaultValue } = this.data;
            const config = this.parent.config;

            let buttonMarkup = '';
            let inputMarkup = '';
            let formStart = '';
            let formEnd = '';

            // Add input field and form tags for 'prompt' type
            if (kind === "prompt") {
                inputMarkup = `<div class="ui-input-wrapper"><input type="text" class="ui-text-input" id="ui-text-field" value="${defaultValue || ''}"></div>`;
                formStart = '<form id="ui-modal-form">';
                formEnd = '</form>';
            }

            // Generate button HTML
            const confirmBtn = `<button type="${kind === 'prompt' ? 'submit' : 'button'}" class="ui-button ui-button-primary" id="ui-confirm-btn">${config.confirmButtonLabel}</button>`;
            const cancelBtn = `<button type="button" class="ui-button ui-button-secondary" id="ui-cancel-btn">${config.cancelButtonLabel}</button>`;

            if (kind === "confirm" || kind === "prompt") {
                buttonMarkup = config.reverseButtonOrder ? (confirmBtn + cancelBtn) : (cancelBtn + confirmBtn);
            } else if (kind === "alert") {
                buttonMarkup = confirmBtn;
            }

            // Add an invisible element for focus if 'none' is selected
            const focusHook = (config.defaultButtonFocus === "none") ? '<a href="#" id="ui-no-focus-hook" class="ui-hidden-element" aria-hidden="true"></a>' : '';

            // Assemble the full modal HTML using template literals
            return `
                <div class="ui-inner-dialog">
                    ${focusHook}
                    ${formStart}
                        <article class="ui-content-area">
                            <p class="ui-message-text">${content}</p>
                            ${inputMarkup}
                            <nav class="ui-button-strip">${buttonMarkup}</nav>
                        </article>
                    ${formEnd}
                    <a id="ui-focus-loop-anchor" class="ui-focus-loop-anchor" href="#" aria-hidden="true"></a>
                </div>
            `;
        }

        // Attaches all necessary event listeners to the modal's elements
        bindInteractionListeners() {
            // Get references to the dynamically created elements
            this.confirmButton = documentObject.getElementById("ui-confirm-btn");
            this.cancelButton = documentObject.getElementById("ui-cancel-btn");
            this.textInput = documentObject.getElementById("ui-text-field");
            this.modalForm = documentObject.getElementById("ui-modal-form");
            this.focusResetLink = documentObject.getElementById("ui-focus-loop-anchor");
            this.invisibleFocusHook = documentObject.getElementById("ui-no-focus-hook");

            // Attach event handlers
            if (this.confirmButton) {
                this.parent.attachDOMEvent(this.confirmButton, "click", this.okAction);
            }
            if (this.cancelButton) {
                this.parent.attachDOMEvent(this.cancelButton, "click", this.cancelAction);
            }
            if (this.modalForm) {
                this.parent.attachDOMEvent(this.modalForm, "submit", this.formSubmitAction);
            }

            this.parent.attachDOMEvent(documentObject.body, "keyup", this.keyboardAction);
            this.parent.attachDOMEvent(this.focusResetLink, "focus", this.focusResetAction);

            // If CSS transitions are active, wait for the dialog to become visible before setting focus
            if (this.parent.transitionEventName) {
                this.parent.attachDOMEvent(this.parent.dialogBoxWrapper, this.parent.transitionEventName, this.focusAfterTransitionHandler);
            } else {
                this.focusDefaultElement(); // Set focus immediately if no transitions
            }
        }

        // Detaches all event listeners for cleanup
        unbindInteractionListeners() {
            if (this.confirmButton) {
                this.parent.detachDOMEvent(this.confirmButton, "click", this.okAction);
            }
            if (this.cancelButton) {
                this.parent.detachDOMEvent(this.cancelButton, "click", this.cancelAction);
            }
            if (this.modalForm) {
                this.parent.detachDOMEvent(this.modalForm, "submit", this.formSubmitAction);
            }

            this.parent.detachDOMEvent(documentObject.body, "keyup", this.keyboardAction);
            this.parent.detachDOMEvent(this.focusResetLink, "focus", this.focusResetAction);

            if (this.parent.transitionEventName) {
                this.parent.detachDOMEvent(this.parent.dialogBoxWrapper, this.parent.transitionEventName, this.focusAfterTransitionHandler);
            }
        }

        // Handles setting focus once the dialog box has finished its opening transition
        focusAfterTransition(event) {
            // Ensure the event is from the dialog wrapper and relates to visibility
            if (event.target === this.parent.dialogBoxWrapper && (event.propertyName === 'opacity' || event.propertyName === 'transform')) {
                event.stopPropagation();
                this.parent.detachDOMEvent(this.parent.dialogBoxWrapper, this.parent.transitionEventName, this.focusAfterTransitionHandler);
                this.focusDefaultElement();
            }
        }

        // Sets the default focus based on modal type and configuration
        focusDefaultElement() {
            const config = this.parent.config;
            if (this.textInput) {
                this.textInput.focus();
                this.textInput.select(); // Select all text in prompt input
            } else if (config.defaultButtonFocus === "cancel" && this.cancelButton) {
                this.cancelButton.focus();
            } else if (config.defaultButtonFocus === "confirm" && this.confirmButton) {
                this.confirmButton.focus();
            } else if (this.invisibleFocusHook) {
                this.invisibleFocusHook.focus(); // Focus invisible element if no specific button is preferred
            }
        }

        // Handler for the "OK" or "Confirm" action
        handleOkAction(event) {
            if (event && typeof event.preventDefault === "function") event.preventDefault();
            const inputValue = this.textInput ? this.textInput.value : undefined;
            this.executeOutcome(true, inputValue);
        }

        // Handler for the "Cancel" or "Dismiss" action
        handleCancelAction(event) {
            if (event && typeof event.preventDefault === "function") event.preventDefault();
            this.executeOutcome(false);
        }

        // Handler for form submission (used for prompt dialogs)
        handleFormSubmitAction(event) {
            if (event && typeof event.preventDefault === "function") event.preventDefault();
            this.handleOkAction(null); // Trigger OK action
        }

        // Handler for keyboard events (ESC, Space)
        handleKeyboardAction(event) {
            const keyCode = event.keyCode;
            const { ENTER_KEY, ESCAPE_KEY, SPACE_BAR } = this.parent.keyCodes;

            if (keyCode === SPACE_BAR && !this.textInput) { // Space bar acts as OK if no input field
                this.handleOkAction(event);
            }
            if (keyCode === ESCAPE_KEY && (this.data.kind === "confirm" || this.data.kind === "prompt")) { // ESC acts as Cancel for confirm/prompt
                this.handleCancelAction(event);
            }
        }

        // Handler for the focus reset link, cycles focus back to the beginning of the modal
        handleFocusResetAction(event) {
            if (event && typeof event.preventDefault === "function") event.preventDefault();
            this.focusDefaultElement();
        }

        // Executes the modal's callback function and then hides the modal
        executeOutcome(success, value) {
            if (typeof this.data.handler === "function") {
                if (this.data.kind === "prompt") {
                    this.data.handler(success, value);
                } else {
                    this.data.handler(success);
                }
            }
            this.parent.hideCurrentModal();
        }
    }

    // Static property to track if PopUp has been initialized, preventing redundant DOM setup
    PopUp.initialized = false;

    // Create a single instance of our notification system
    const globalNotifier = new PopUp();

    // Expose the public API globally, matching the original's interface for functionality
    globalScope.utilityNotifier = {
        alert: (message, callback, cssClass) => globalNotifier.displayModal("alert", message, callback, undefined, cssClass),
        confirm: (message, callback, cssClass) => globalNotifier.displayModal("confirm", message, callback, undefined, cssClass),
        prompt: (message, callback, defaultValue, cssClass) => globalNotifier.displayModal("prompt", message, callback, defaultValue, cssClass),
        log: (message, type, duration) => globalNotifier.displayToast(message, type, duration),

        // Configuration methods, mapping to internal settings
        setLabels: (labels) => globalNotifier.adjustSettings({ confirmButtonLabel: labels.ok, cancelButtonLabel: labels.cancel }),
        setDelay: (delay) => globalNotifier.adjustSettings({ toastDisplayDuration: delay }),
        setButtonFocus: (focus) => globalNotifier.adjustSettings({ defaultButtonFocus: focus }),
        setButtonReverse: (reverse) => globalNotifier.adjustSettings({ reverseButtonOrder: reverse }),

        // Extension method for custom toast types
        extend: (typeName) => globalNotifier.addCustomToastType(typeName),
        // Global error handling
        handleErrors: () => globalNotifier.interceptWindowErrors(),

        // Exposing internal configuration for advanced users (similar to original)
        getSettings: () => ({ ...globalNotifier.config })
    };

}(this)); // 'this' refers to the global object (window in browsers)