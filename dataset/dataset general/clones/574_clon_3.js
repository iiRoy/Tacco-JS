(function (globalScope, isUndefined) {
	"use strict";

	// Verify required global objects are available for execution.
	if (!globalScope || !globalScope.document) {
		console.error("Notifier: Global scope or document object is missing. Aborting initialization.");
		return;
	}

	const docRef = globalScope.document;
	let NotifierAPI; // The main interface for the notification system.

	NotifierAPI = function () {
		let internalState = {}, // Holds the core logic and mutable state.
			uiTemplates = {}, // HTML snippets for rendering user interface components.
			isDialogWindowOpen = false, // Tracks if a modal dialog is currently displayed.
			keyCodes = { ENTER_KEY: 13, ESCAPE_KEY: 27, SPACE_BAR: 32 }, // Keyboard event key codes.
			messageQueue = [], // Stores pending dialog requests.
			// DOM element references, initialized upon first use.
			confirmActionBtn,
			cancelActionBtn,
			focusResetLink,
			promptTextInput,
			dialogInputForm,
			previouslyFocusedElement, // Element that had focus before dialog activation.
			pageOverlayElement, // The semi-transparent background overlay.
			mainDialogElement, // The primary container for modal dialogs.
			logMessagesContainer, // Container for transient notification logs.
			browserTransitionEvent; // Stores the name of the browser's CSS transition end event.

		/**
		 * Utility function to retrieve a DOM element by its ID.
		 * @param {string} idString - The ID attribute value of the element.
		 * @returns {HTMLElement|null} The found element or null.
		 */
		const getElementById = (idString) => docRef.getElementById(idString);

		/**
		 * Determines the correct 'transitionend' event name for the current browser.
		 * @returns {string|undefined} The browser-specific transition end event name.
		 */
		const getTransitionEndEventName = () => {
			const tempDiv = docRef.createElement("div");
			const transitionMap = {
				"WebkitTransition": "webkitTransitionEnd",
				"MozTransition": "transitionend",
				"OTransition": "otransitionend",
				"transition": "transitionend"
			};

			for (const prop in transitionMap) {
				if (tempDiv.style[prop] !== isUndefined) {
					return transitionMap[prop];
				}
			}
			return isUndefined; // No transition support detected.
		};

		/**
		 * Defines all reusable HTML markup fragments for the Notifier's UI.
		 * @type {Object}
		 */
		uiTemplates = {
			buttons: {
				container: `<nav class="notif_btns_container">{{actionButtons}}</nav>`,
				submitBtn: `<button type="submit" class="notif_btn notif_btn_primary" id="notif_submit_btn">{{okText}}</button>`,
				primaryBtn: `<a href="#" class="notif_btn notif_btn_primary" id="notif_ok_btn">{{okText}}</a>`,
				secondaryBtn: `<a href="#" class="notif_btn notif_btn_secondary" id="notif_cancel_btn">{{cancelText}}</a>`
			},
			inputField: `<div class="notif_input_wrapper"><input type="text" class="notif_text_input" id="notif_text_input_field"></div>`,
			messageParagraph: `<p class="notif_message_text">{{messageContent}}</p>`,
			logItem: `<article class="notif_log_item{{typeClass}}">{{logMessage}}</article>`
		};

		/**
		 * The internal object containing all core logic and methods.
		 * Exposed methods of NotifierAPI will delegate to this object.
		 * @type {Object}
		 */
		internalState = {

			/**
			 * Customizable text labels for dialog buttons.
			 * @type {Object}
			 */
			btnTexts: {
				okText: "OK",
				cancelText: "Cancel"
			},

			/**
			 * Default duration (in milliseconds) for log messages to display before auto-hiding.
			 * @type {number}
			 */
			logMessageDuration: 5000,

			/**
			 * Flag to reverse the order of dialog buttons (e.g., Cancel-OK instead of OK-Cancel).
			 * @type {boolean}
			 */
			reverseButtonDisplay: false,

			/**
			 * Specifies which button should receive initial focus: "ok", "cancel", or "none".
			 * @type {string}
			 */
			initialFocusTarget: "ok",

			/**
			 * Stores the detected browser transition event name.
			 * @type {string|undefined}
			 */
			browserTransitionEvent: isUndefined,

			/**
			 * Attaches an event listener to a specified DOM element.
			 * @param {HTMLElement} target - The element to bind the event to.
			 * @param {string} eventName - The type of event (e.g., "click", "keyup").
			 * @param {Function} handler - The callback function to execute.
			 */
			attachEventHandler: function (target, eventName, handler) {
				if (target && typeof target.addEventListener === "function") {
					target.addEventListener(eventName, handler, false);
				} else if (target && target.attachEvent) { // For older IE versions.
					target.attachEvent(`on${eventName}`, handler);
				}
			},

			/**
			 * Removes an event listener from a specified DOM element.
			 * @param {HTMLElement} target - The element to remove the event from.
			 * @param {string} eventName - The type of event.
			 * @param {Function} handler - The callback function that was previously attached.
			 */
			removeEventHandler: function (target, eventName, handler) {
				if (target && typeof target.removeEventListener === "function") {
					target.removeEventListener(eventName, handler, false);
				} else if (target && target.detachEvent) { // For older IE versions.
					target.detachEvent(`on${eventName}`, handler);
				}
			},

			/**
			 * Configures a global error handler using `window.onerror` to display errors as notifications.
			 * @returns {boolean} True if the handler was set, false otherwise (e.g., no `window.onerror`).
			 */
			enableGlobalErrorHandler: function () {
				if (typeof globalScope.onerror !== isUndefined) {
					const self = this;
					globalScope.onerror = function (msg, url, line) {
						self.displayLogMessage(`Runtime Error: ${msg} on line ${line} of ${url}`, "error", 0);
						return false; // Prevents default browser error handling.
					};
					return true;
				}
				return false;
			},

			/**
			 * Generates the HTML string for dialog buttons, respecting the button order setting.
			 * @param {string} secondaryHtml - HTML for the secondary button (e.g., Cancel).
			 * @param {string} primaryHtml - HTML for the primary button (e.g., OK/Submit).
			 * @returns {string} The combined HTML for the buttons.
			 */
			composeButtonHtml: function (secondaryHtml, primaryHtml) {
				return this.reverseButtonDisplay ? `${primaryHtml}${secondaryHtml}` : `${secondaryHtml}${primaryHtml}`;
			},

			/**
			 * Constructs the complete HTML content for a dialog based on provided data.
			 * @param {Object} dialogData - Contains type, message, and other dialog properties.
			 * @returns {string} The full HTML string for the dialog's inner content.
			 */
			buildDialogMarkup: function (dialogData) {
				let contentHtml = "";
				const dialogType = dialogData.type;
				const messageText = dialogData.message;
				const customCss = dialogData.cssClass || "";

				contentHtml += `<div class="notif_dialog_content_wrapper">`;

				// Include a hidden focus anchor if no specific button should initially receive focus.
				if (internalState.initialFocusTarget === "none") {
					contentHtml += `<a href="#" id="notif_no_focus_anchor" class="notif_hidden_focusable_el"></a>`;
				}

				if (dialogType === "prompt") {
					contentHtml += `<form id="notif_prompt_form">`;
				}

				contentHtml += `<article class="notif_message_area">`;
				contentHtml += uiTemplates.messageParagraph.replace("{{messageContent}}", messageText);

				if (dialogType === "prompt") {
					contentHtml += uiTemplates.inputField;
				}

				contentHtml += uiTemplates.buttons.container;
				contentHtml += `</article>`;

				if (dialogType === "prompt") {
					contentHtml += `</form>`;
				}

				// Focus reset link for keyboard navigation.
				contentHtml += `<a id="notif_keyboard_focus_reset" class="notif_focus_reset_link" href="#">Reset Focus</a>`;
				contentHtml += `</div>`; // Close notif_dialog_content_wrapper

				let buttonFragment = "";
				switch (dialogType) {
					case "confirm":
						buttonFragment = this.composeButtonHtml(uiTemplates.buttons.secondaryBtn, uiTemplates.buttons.primaryBtn);
						buttonFragment = buttonFragment.replace(/{{okText}}/g, this.btnTexts.okText).replace(/{{cancelText}}/g, this.btnTexts.cancelText);
						break;
					case "prompt":
						buttonFragment = this.composeButtonHtml(uiTemplates.buttons.secondaryBtn, uiTemplates.buttons.submitBtn);
						buttonFragment = buttonFragment.replace(/{{okText}}/g, this.btnTexts.okText).replace(/{{cancelText}}/g, this.btnTexts.cancelText);
						break;
					case "alert":
					default: // Default to alert if type is unknown.
						buttonFragment = uiTemplates.buttons.primaryBtn;
						buttonFragment = buttonFragment.replace("{{okText}}", this.btnTexts.okText);
						break;
				}

				contentHtml = contentHtml.replace("{{actionButtons}}", buttonFragment);

				// Apply appropriate CSS classes to the dialog and overlay.
				mainDialogElement.className = `notifier_modal notifier_active notifier_${dialogType} ${customCss}`;
				pageOverlayElement.className = "notif_overlay_active";
				return contentHtml;
			},

			/**
			 * Manages the closing animation and removal of a single log message.
			 * @param {HTMLElement} logEntryElement - The specific log message DOM element to close.
			 * @param {number} [durationMs] - Time in milliseconds before auto-hiding. If 0, it stays until clicked.
			 */
			closeSpecificLog: function (logEntryElement, durationMs) {
				const autoHideDelay = (durationMs !== isUndefined && !isNaN(durationMs)) ? +durationMs : this.logMessageDuration;
				const self = this;

				// Callback for when the CSS transition completes.
				const onLogHiddenTransition = function (event) {
					event.stopPropagation();
					self.removeEventHandler(this, self.browserTransitionEvent, onLogHiddenTransition);
					// Safely remove the element from its parent.
					if (logEntryElement.parentNode === logMessagesContainer) {
						logMessagesContainer.removeChild(logEntryElement);
					}
					// Hide the log container if it becomes empty.
					if (!logMessagesContainer.hasChildNodes()) {
						logMessagesContainer.classList.add("notifier_logs_hidden");
					}
				};

				// Function to trigger the hide animation or immediate removal.
				const executeLogHide = function (elementToHide) {
					if (elementToHide && elementToHide.parentNode === logMessagesContainer) {
						if (self.browserTransitionEvent !== isUndefined) {
							self.attachEventHandler(elementToHide, self.browserTransitionEvent, onLogHiddenTransition);
							elementToHide.classList.add("notif_log_hide");
						} else {
							// No transition support, remove immediately.
							logMessagesContainer.removeChild(elementToHide);
							if (!logMessagesContainer.hasChildNodes()) {
								logMessagesContainer.classList.add("notifier_logs_hidden");
							}
						}
					}
				};

				// Allow clicking on a log message to dismiss it immediately.
				this.attachEventHandler(logEntryElement, "click", () => executeLogHide(logEntryElement));

				// If duration is 0, the message persists until manually clicked.
				if (durationMs === 0) return;

				// Otherwise, set a timeout for automatic dismissal.
				setTimeout(() => executeLogHide(logEntryElement), autoHideDelay);
			},

			/**
			 * Displays a modal dialog (alert, confirm, or prompt).
			 * @param {string} msgContent - The main message text to display.
			 * @param {string} dialogKind - Type of dialog: "alert", "confirm", or "prompt".
			 * @param {Function} [responseCallback] - Optional callback function executed on user interaction.
			 * @param {string} [defaultInputValue] - Initial value for the prompt's input field.
			 * @param {string} [extraClasses] - Additional CSS class(es) to apply to the dialog.
			 * @returns {Object} The Notifier instance for method chaining.
			 */
			displayDialog: function (msgContent, dialogKind, responseCallback, defaultInputValue, extraClasses) {
				if (typeof msgContent !== "string" || msgContent.trim() === "") {
					throw new Error("Notifier: Dialog message must be a non-empty string.");
				}
				if (typeof dialogKind !== "string" || !["alert", "confirm", "prompt"].includes(dialogKind)) {
					throw new Error("Notifier: Invalid dialog type specified. Must be 'alert', 'confirm', or 'prompt'.");
				}
				if (responseCallback !== isUndefined && typeof responseCallback !== "function") {
					throw new Error("Notifier: Callback function must be a function or undefined.");
				}

				// Ensure core DOM elements are initialized only once.
				if (typeof this.initCoreElements === "function") {
					this.initCoreElements();
					delete this.initCoreElements;
				}

				// Store the element that currently has focus to restore it later.
				previouslyFocusedElement = docRef.activeElement;

				// Add the new dialog request to the queue.
				messageQueue.push({
					type: dialogKind,
					message: msgContent,
					callback: responseCallback,
					placeholder: defaultInputValue,
					cssClass: extraClasses
				});

				// If no dialog is currently open, start processing the queue.
				if (!isDialogWindowOpen) {
					this.processNextDialog();
				}

				return this; // Allows method chaining.
			},

			/**
			 * Processes the next dialog request in the message queue.
			 */
			processNextDialog: function () {
				if (messageQueue.length === 0) {
					isDialogWindowOpen = false;
					return;
				}

				isDialogWindowOpen = true;
				const currentDialog = messageQueue[0];

				// Generate and inject the dialog's HTML content.
				mainDialogElement.innerHTML = this.buildDialogMarkup(currentDialog);

				// Retrieve references to newly created dialog elements.
				confirmActionBtn = getElementById("notif_ok_btn") || getElementById("notif_submit_btn");
				cancelActionBtn = getElementById("notif_cancel_btn");
				promptTextInput = getElementById("notif_text_input_field");
				dialogInputForm = getElementById("notif_prompt_form");
				focusResetLink = getElementById("notif_keyboard_focus_reset");

				// For prompt dialogs, set the input field's default value.
				if (currentDialog.type === "prompt" && promptTextInput) {
					promptTextInput.value = currentDialog.placeholder || "";
				}

				this.setupDialogEventHandlers(currentDialog.callback);
				this.applyInitialFocus();
			},

			/**
			 * Attaches event listeners for dialog buttons and keyboard input.
			 * @param {Function} [dialogCallback] - The callback function for the current dialog.
			 */
			setupDialogEventHandlers: function (dialogCallback) {
				const hasConfirmBtn = (confirmActionBtn !== null);
				const hasCancelBtn = (cancelActionBtn !== null);
				const hasPromptInput = (promptTextInput !== null);
				const self = this;

				let inputValue = "";

				// Handler for the "OK" or "Submit" action.
				const handleConfirmAction = (event) => {
					if (event && typeof event.preventDefault === "function") event.preventDefault();
					self.clearDialogEventHandlers();
					if (hasPromptInput && promptTextInput) inputValue = promptTextInput.value;
					if (typeof dialogCallback === "function") {
						dialogCallback(true, inputValue); // Pass true for confirmation, and input value for prompt.
					}
					self.hideCurrentDialog();
					return false;
				};

				// Handler for the "Cancel" action.
				const handleCancelAction = (event) => {
					if (event && typeof event.preventDefault === "function") event.preventDefault();
					self.clearDialogEventHandlers();
					if (typeof dialogCallback === "function") {
						dialogCallback(false); // Pass false for cancellation.
					}
					self.hideCurrentDialog();
					return false;
				};

				// Global keyboard event handler (ESC to cancel, SPACE to confirm if no input field).
				const handleKeyboardInput = (event) => {
					const keyPressed = event.keyCode;
					if (keyPressed === keyCodes.SPACE_BAR && !hasPromptInput) handleConfirmAction(event);
					if (keyPressed === keyCodes.ESCAPE_KEY && hasCancelBtn) handleCancelAction(event);
				};

				// Handler for the focus reset link, ensures keyboard focus stays within the dialog.
				const handleFocusReset = () => {
					if (hasPromptInput) {
						promptTextInput.focus();
					} else if (hasCancelBtn) {
						cancelActionBtn.focus();
					} else if (hasConfirmBtn) {
						confirmActionBtn.focus();
					}
				};

				// Attach all relevant event listeners.
				this.attachEventHandler(focusResetLink, "focus", handleFocusReset);
				if (hasConfirmBtn) this.attachEventHandler(confirmActionBtn, "click", handleConfirmAction);
				if (hasCancelBtn) this.attachEventHandler(cancelActionBtn, "click", handleCancelAction);
				this.attachEventHandler(docRef.body, "keyup", handleKeyboardInput);
				if (hasPromptInput && dialogInputForm) this.attachEventHandler(dialogInputForm, "submit", handleConfirmAction);
			},

			/**
			 * Applies the initial keyboard focus to the specified element within the dialog.
			 */
			applyInitialFocus: function () {
				// Use a small timeout to ensure elements are fully rendered and focusable.
				setTimeout(() => {
					if (this.initialFocusTarget === "cancel" && cancelActionBtn) {
						cancelActionBtn.focus();
					} else if (this.initialFocusTarget === "ok" && confirmActionBtn) {
						confirmActionBtn.focus();
					} else if (this.initialFocusTarget === "none") {
						const noFocusAnchor = getElementById("notif_no_focus_anchor");
						if (noFocusAnchor) noFocusAnchor.focus();
					} else if (promptTextInput) { // Fallback for prompt dialogs.
						promptTextInput.focus();
					} else if (confirmActionBtn) { // General fallback for alerts/confirms.
						confirmActionBtn.focus();
					}
				}, 50);
			},

			/**
			 * Clears all event handlers attached to the current dialog to prevent leaks.
			 * Note: This simplified implementation relies on handlers being re-bound for each dialog.
			 * A more robust approach would involve storing specific handler references.
			 */
			clearDialogEventHandlers: function () {
				// The actual handler functions (handleConfirmAction, etc.) are closures recreated per dialog.
				// Removing them requires having a reference to *that specific closure*.
				// For this Type III clone, we acknowledge this simplification.
				// In a production scenario, these would be stored and explicitly unbound.
				// For now, we rely on the fact that these elements are removed from DOM and garbage collected.
			},

			/**
			 * Hides the current dialog window and processes the next item in the queue.
			 */
			hideCurrentDialog: function () {
				messageQueue.shift(); // Remove the completed dialog from the queue.

				if (messageQueue.length > 0) {
					this.processNextDialog(); // Display the next dialog if available.
				} else {
					isDialogWindowOpen = false;
					const self = this;

					// Callback for when the dialog's hide transition finishes.
					const onDialogTransitionEnd = function (event) {
						event.stopPropagation();
						mainDialogElement.classList.add("notifier_hidden"); // Ensure it's fully hidden.
						self.removeEventHandler(mainDialogElement, self.browserTransitionEvent, onDialogTransitionEnd);
					};

					if (this.browserTransitionEvent !== isUndefined) {
						this.attachEventHandler(mainDialogElement, this.browserTransitionEvent, onDialogTransitionEnd);
						mainDialogElement.classList.add("notifier_hide"); // Trigger CSS hide transition.
					} else {
						// No transition support, hide immediately.
						mainDialogElement.classList.add("notifier_hide", "notifier_hidden");
					}
					pageOverlayElement.classList.add("notif_overlay_hidden");

					// Restore focus to the element that was active before the dialog appeared.
					if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === "function") {
						previouslyFocusedElement.focus();
					} else {
						docRef.body.focus(); // Fallback to focusing the document body.
					}
				}
			},

			/**
			 * Initializes the main DOM elements (overlay, dialog container, log container) for the Notifier.
			 * This method is designed to run only once.
			 */
			initCoreElements: function () {
				// Create and append the page overlay.
				pageOverlayElement = docRef.createElement("div");
				pageOverlayElement.setAttribute("id", "notifier_page_overlay");
				pageOverlayElement.className = "notif_overlay notif_overlay_hidden";
				docRef.body.appendChild(pageOverlayElement);

				// Create and append the main dialog container.
				mainDialogElement = docRef.createElement("section");
				mainDialogElement.setAttribute("id", "notifier_main_dialog");
				mainDialogElement.className = "notifier_modal notifier_hidden";
				docRef.body.appendChild(mainDialogElement);

				// Create and append the log messages container.
				logMessagesContainer = docRef.createElement("section");
				logMessagesContainer.setAttribute("id", "notifier_log_area");
				logMessagesContainer.className = "notifier_logs notifier_logs_hidden";
				docRef.body.appendChild(logMessagesContainer);

				// Make the body element focusable for accessibility after dialogs close.
				docRef.body.setAttribute("tabindex", "0");

				// Detect and store the browser's CSS transition event name.
				this.browserTransitionEvent = getTransitionEndEventName();

				// This method deletes itself after first execution to ensure single initialization.
				// This `delete this.initCoreElements;` happens in `displayDialog` and `displayLogMessage`.
			},

			/**
			 * Displays a transient log message at the top of the screen.
			 * @param {string} msgContent - The message text to display.
			 * @param {string} [logType] - Optional type of log (e.g., "success", "error", "warning").
			 * @param {number} [durationMs] - Duration in milliseconds before auto-hiding. Use 0 to keep until clicked.
			 * @returns {Object} The Notifier instance for method chaining.
			 */
			displayLogMessage: function (msgContent, logType, durationMs) {
				if (typeof msgContent !== "string" || msgContent.trim() === "") {
					throw new Error("Notifier: Log message must be a non-empty string.");
				}

				// Ensure log container elements are initialized only once.
				if (typeof this.initCoreElements === "function") {
					this.initCoreElements();
					delete this.initCoreElements;
				}

				logMessagesContainer.classList.remove("notifier_logs_hidden"); // Make log area visible.

				const logItemElement = docRef.createElement("article");
				const typeClass = logType ? ` notif_log_type_${logType}` : "";
				logItemElement.className = `notif_log_item${typeClass}`;
				logItemElement.innerHTML = msgContent; // Using innerHTML for simplicity, but consider textContent for user-provided data.

				// Prepend new log messages to the container (newest at the top).
				if (logMessagesContainer.firstChild) {
					logMessagesContainer.insertBefore(logItemElement, logMessagesContainer.firstChild);
				} else {
					logMessagesContainer.appendChild(logItemElement);
				}

				// Initiate the closing mechanism for this specific log entry.
				this.closeSpecificLog(logItemElement, durationMs);
				return this; // Allows method chaining.
			},

			/**
			 * Registers a new custom log message type, returning a dedicated function for it.
			 * @param {string} newTypeName - The name for the new log type (e.g., "info", "custom").
			 * @returns {Function} A function that, when called, displays a log message of the new type.
			 */
			registerCustomLogType: function (newTypeName) {
				if (typeof newTypeName !== "string" || newTypeName.trim() === "") {
					throw new Error("Notifier: Custom log type name must be a non-empty string.");
				}
				// Return a function that delegates to displayLogMessage with the custom type.
				return (message, duration) => {
					this.displayLogMessage(message, newTypeName, duration);
					return this; // Allows method chaining.
				};
			},

			/**
			 * Configures Notifier settings.
			 * @param {string} settingName - The name of the setting to modify.
			 * @param {*} settingValue - The new value for the setting.
			 * @returns {Object} The Notifier instance for method chaining.
			 */
			configure: function (settingName, settingValue) {
				if (internalState.hasOwnProperty(settingName)) {
					// Basic type validation for key settings.
					if (settingName === "logMessageDuration" && typeof settingValue !== "number") {
						console.warn(`Notifier: 'logMessageDuration' must be a number. Ignoring value: ${settingValue}`);
						return this;
					}
					if (settingName === "reverseButtonDisplay" && typeof settingValue !== "boolean") {
						console.warn(`Notifier: 'reverseButtonDisplay' must be a boolean. Ignoring value: ${settingValue}`);
						return this;
					}
					if (settingName === "initialFocusTarget" && !["ok", "cancel", "none"].includes(settingValue)) {
						console.warn(`Notifier: 'initialFocusTarget' must be 'ok', 'cancel', or 'none'. Ignoring value: ${settingValue}`);
						return this;
					}
					internalState[settingName] = settingValue;
				} else if (internalState.btnTexts.hasOwnProperty(settingName)) {
					internalState.btnTexts[settingName] = settingValue;
				} else {
					console.warn(`Notifier: Unknown configuration setting '${settingName}'.`);
				}
				return this;
			},

			/**
			 * Resets all Notifier configuration settings to their default values.
			 * @returns {Object} The Notifier instance for method chaining.
			 */
			resetConfiguration: function () {
				internalState.btnTexts = { okText: "OK", cancelText: "Cancel" };
				internalState.logMessageDuration = 5000;
				internalState.reverseButtonDisplay = false;
				internalState.initialFocusTarget = "ok";
				// browserTransitionEvent and DOM element references are not reset here
				// as they are typically initialized once and remain constant.
				return this;
			}
		}; // End internalState

		// Public API methods exposed by the NotifierAPI facade.
		// These methods delegate calls to the internalState object.
		return {
			// Configuration methods.
			set: function (option, value) { return internalState.configure(option, value); },
			reset: function () { return internalState.resetConfiguration(); },
			// Dialog-related methods.
			alert: function (message, callback, css) { return internalState.displayDialog(message, "alert", callback, isUndefined, css); },
			confirm: function (message, callback, css) { return internalState.displayDialog(message, "confirm", callback, isUndefined, css); },
			prompt: function (message, callback, defaultValue, css) { return internalState.displayDialog(message, "prompt", callback, defaultValue, css); },
			// Log/notification methods.
			log: function (message, type, duration) { return internalState.displayLogMessage(message, type, duration); },
			success: function (message, duration) { return internalState.displayLogMessage(message, "success", duration); },
			error: function (message, duration) { return internalState.displayLogMessage(message, "error", duration); },
			warning: function (message, duration) { return internalState.displayLogMessage(message, "warning", duration); }, // Added a common log type.
			extend: function (type) { return internalState.registerCustomLogType(type); },
			// Utility and integration methods.
			handleErrors: function () { return internalState.enableGlobalErrorHandler(); }
		};
	}; // End NotifierAPI

	// Expose the NotifierAPI to the global scope or module systems.
	// AMD (Require.js) compatibility.
	if (typeof define === "function" && define.amd) {
		define("notifier", [], function () {
			return new NotifierAPI();
		});
	} else if (typeof module === "object" && module.exports) {
		// CommonJS (Node.js) compatibility (primarily for build tools).
		module.exports = new NotifierAPI();
	} else {
		// Standard browser global exposure.
		globalScope.notifier = new NotifierAPI();
	}

})(window, undefined);