////////////////////////////////////
//
// Dynamic Suggestion Component
// Modernized version. © 2024 AI Code Generator.
//
////////////////////////////////////
((globalWindow, currentDocument, undefinedAlias) => {
	"use strict";

	// --- Core Utility Functions (Modernized & Renamed) ---

	/**
	 * Simple DOM element selector.
	 * @param {string} selector - CSS selector.
	 * @returns {Element|null} The first matching element.
	 */
	const findElement = (selector) => currentDocument.querySelector(selector);

	/**
	 * Binds a function to a specific context.
	 * @param {Function} func - The function to bind.
	 * @param {object} context - The context (this) to bind to.
	 * @returns {Function} The bound function.
	 */
	const bindContext = (func, context) => func.bind(context);

	/**
	 * Attaches an event listener to an element.
	 * @param {Element} target - The DOM element.
	 * @param {string} eventType - The event name (e.g., "click").
	 * @param {Function} handler - The event handler function.
	 * @param {boolean} [useCapture=false] - Whether to use capture phase.
	 */
	const attachEventHandler = (target, eventType, handler, useCapture = false) => {
		target.addEventListener(eventType, handler, useCapture);
	};

	/**
	 * Removes an event listener from an element.
	 * @param {Element} target - The DOM element.
	 * @param {string} eventType - The event name.
	 * @param {Function} handler - The event handler function.
	 * @param {boolean} [useCapture=false] - Whether to use capture phase.
	 */
	const detachEventHandler = (target, eventType, handler, useCapture = false) => {
		target.removeEventListener(eventType, handler, useCapture);
	};

	/**
	 * Prevents default action and stops event propagation.
	 * @param {Event} evt - The event object.
	 * @returns {boolean} Always false.
	 */
	const suppressEvent = (evt) => {
		evt.preventDefault();
		evt.stopPropagation();
		return false;
	};

	/**
	 * Detects if the browser supports the <datalist> element.
	 * @type {boolean}
	 */
	const isDatalistSupported = (() => {
		const testInput = currentDocument.createElement("input");
		return "list" in testInput;
	})();

	/**
	 * Parses an XML string into a DOM Document.
	 * @param {string} xmlString - The XML content as a string.
	 * @returns {Document} The parsed XML document.
	 */
	const parseXmlContent = (xmlString) => {
		const parser = new DOMParser();
		return parser.parseFromString(xmlString, "application/xml");
	};

	/**
	 * Represents the prototype for the SuggestiveInput component.
	 * @type {object}
	 */
	let SuggestiveInputPrototype;

	/**
	 * The main SuggestiveInput constructor.
	 * Provides autocomplete functionality for input fields.
	 * @param {Element|string} inputSource - The input element or its ID.
	 * @param {object} componentConfig - Configuration options.
	 */
	const SuggestiveInput = function(inputSource, componentConfig) {
		const targetElement = (typeof inputSource === "string") ? findElement(inputSource) : inputSource;

		if (!targetElement) {
			console.warn("SuggestiveInput: Target element not found.", inputSource);
			return; // Exit if no valid element is provided
		}

		if (targetElement.tagName?.toLowerCase() !== "input") {
			console.warn("SuggestiveInput: Target element must be an <input> tag.", targetElement);
			return; // Exit if not an input field
		}

		this.inputField = targetElement;
		this.checkInputBound = bindContext(this.evaluateInputEntry, this);
		this.resultsCache = new Map(); // Using Map for better performance and API
		this.displayContainer = null;
		this.debounceTimeoutId = null;
		this.inputHasFocus = false;
		this.activeSuggestionIndex = -1;
		this.lastKnownInputValue = "";
		this.lastOnInputValue = null;
		this.visibleSuggestions = [];
		this.throttleCounter = 0; // Renamed from 'throttle'
		this.isTouchDevice = (globalWindow.ontouchstart !== undefinedAlias);
		this.availableItems = [];

		this.applyConfiguration(componentConfig);
		this.initializeComponent();
	};

	// --- Prototype Methods Setup ---
	SuggestiveInputPrototype = SuggestiveInput.prototype;

	/**
	 * Placeholder function for no-op callbacks.
	 */
	SuggestiveInputPrototype.noop = () => {};

	/**
	 * Applies configuration settings to the component instance.
	 * @param {object} userSettings - User-provided settings.
	 */
	SuggestiveInputPrototype.applyConfiguration = function(userSettings) {
		// Define default settings
		const defaultSettings = {
			useNativeDatalist: true,
			verticalOffset: 0,
			horizontalOffset: 0,
			maxDisplayChoices: 6,
			highlightTextColor: "#ffffff",
			highlightBackgroundColor: "#3399ff",
			sourceDataType: "", // "array", "dom", "xml"
			sourceDataPayload: "",
			onEntryChange: this.noop,
			onEntryDelayMs: 0
		};

		// Merge user settings with defaults
		this.settings = { ...defaultSettings, ...userSettings };
	};

	/**
	 * Initializes the component by fetching data and attaching event listeners.
	 */
	SuggestiveInputPrototype.initializeComponent = function() {
		const dataType = this.settings.sourceDataType;
		const inputField = this.inputField;

		// Populate available items based on source type
		switch (dataType) {
			case "array":
				this.availableItems = [...(this.settings.sourceDataPayload || [])];
				break;
			case "dom":
				this.availableItems = this.fetchFromDOM();
				break;
			case "xml":
				this.availableItems = this.retrieveFromXML();
				break;
			default:
				this.availableItems = [];
				break;
		}

		// Handle native datalist integration
		if (isDatalistSupported && this.settings.useNativeDatalist) {
			if (this.settings.onEntryChange !== this.noop) {
				attachEventHandler(inputField, "input", this.checkInputBound);
			}
			return this.configureNativeList();
		}

		// If not using native datalist, ensure any existing one is removed
		const currentListId = inputField.getAttribute("list");
		if (isDatalistSupported && currentListId) {
			const existingDatalist = findElement(`#${currentListId}`);
			existingDatalist?.parentNode?.removeChild(existingDatalist);
			inputField.removeAttribute("list");
		}

		// Attach custom behavior listeners
		const boundHandleFocus = bindContext(this.handleFocusChange, this);
		attachEventHandler(inputField, "focus", boundHandleFocus);
		attachEventHandler(inputField, "blur", boundHandleFocus);

		// Trigger focus handler if element is already focused on init
		if (currentDocument.activeElement === inputField) {
			boundHandleFocus({ type: "focus" });
		}
	};

	/**
	 * Extracts values from a DOM element specified by the 'list' attribute.
	 * @returns {Array<string>} An array of option values.
	 */
	SuggestiveInputPrototype.fetchFromDOM = function() {
		const listId = this.inputField.getAttribute("list");
		const listElement = listId ? findElement(`#${listId}`) : null;
		const options = listElement?.querySelectorAll("option") || [];
		return Array.from(options)
			.map(opt => opt.value)
			.filter(value => value !== undefinedAlias && value !== null); // Ensure value exists
	};

	/**
	 * Extracts values from an XML source payload.
	 * @returns {Array<string>} An array of option values.
	 */
	SuggestiveInputPrototype.retrieveFromXML = function() {
		const xmlDoc = parseXmlContent(this.settings.sourceDataPayload);
		const datalistNode = xmlDoc.querySelector("datalist");
		if (!datalistNode) return [];

		const optionNodes = datalistNode.querySelectorAll("option");
		return Array.from(optionNodes)
			.map(node => node.getAttribute("value"))
			.filter(value => value !== null); // Ensure value attribute exists
	};

	/**
	 * Manages the native <datalist> element for the input field.
	 * Creates it if it doesn't exist, or updates its content.
	 */
	SuggestiveInputPrototype.configureNativeList = function() {
		let currentListId = this.inputField.getAttribute("list");
		let datalistElement = this.displayContainer = (currentListId && findElement(`#${currentListId}`));

		if (!datalistElement) {
			datalistElement = this.displayContainer = currentDocument.createElement("datalist");
			datalistElement.id = `datalist-${Math.random().toString(36).substring(2, 11)}`; // Unique ID
			this.inputField.parentNode.insertBefore(datalistElement, this.inputField.nextSibling); // Insert after input
			this.inputField.setAttribute("list", datalistElement.id);
		}

		// Update datalist content if not 'dom' source, or if it was just created
		if (this.settings.sourceDataType !== "dom" || !currentListId) {
			datalistElement.innerHTML = this.buildDatalistContent();
		}
	};

	/**
	 * Generates the HTML string for <option> elements within a <datalist>.
	 * @returns {string} HTML string.
	 */
	SuggestiveInputPrototype.buildDatalistContent = function() {
		if (!this.availableItems.length) {
			return "";
		}
		// Map values to option tags, then join them
		return this.availableItems
			.map(item => `<option value="${item.replace(/"/g, '&quot;')}"></option>`)
			.join("");
	};

	/**
	 * Handles focus and blur events on the input field.
	 * @param {Event} evt - The event object.
	 */
	SuggestiveInputPrototype.handleFocusChange = function(evt) {
		const isFocus = (evt?.type || "").toLowerCase() === "focus";
		this.inputHasFocus = isFocus;

		if (isFocus) {
			// If not using native datalist and no custom container exists, create it
			if (!this.settings.useNativeDatalist && !this.displayContainer) {
				this.lastKnownInputValue = this.inputField.value; // Store initial value on focus
				this.renderDisplayBox();
				this.attachInputEventHandlers(evt);
			}
		} else if (this.visibleSuggestions.length > 0) {
			// If blur and suggestions are visible, clear them (unless it's a click on a suggestion)
			// A small delay is needed to allow click events on suggestions to register first
			globalWindow.setTimeout(() => {
				if (!this.inputHasFocus) { // Re-check focus after delay
					this.hideSuggestions();
				}
			}, 150); // Short delay
		}
	};

	/**
	 * Creates and initializes the custom suggestion display container.
	 */
	SuggestiveInputPrototype.renderDisplayBox = function() {
		const inputField = this.inputField;
		const wrapperDiv = currentDocument.createElement("div");
		const containerDiv = (this.displayContainer = currentDocument.createElement("div"));

		// Determine input field's display style
		let inputComputedDisplay = "block"; // Default
		try {
			const computedStyle = globalWindow.getComputedStyle(inputField, null);
			inputComputedDisplay = computedStyle.getPropertyValue("display");
		} catch (e) {
			// Fallback for older browsers or specific environments
			if (inputField.currentStyle) {
				inputComputedDisplay = inputField.currentStyle.display;
			}
		}

		// Configure the suggestion container
		containerDiv.className = "suggest-component__container"; // Use CSS class for styling
		containerDiv.style.minWidth = `${inputField.offsetWidth}px`;
		containerDiv.style.marginLeft = `${this.settings.horizontalOffset}px`;
		containerDiv.style.marginTop = `${inputField.offsetHeight + this.settings.verticalOffset}px`;

		// Attach interaction events based on device type
		if (this.isTouchDevice) {
			attachEventHandler(containerDiv, "touchstart", bindContext(this.activateSuggestion, this));
			attachEventHandler(containerDiv, "touchend", bindContext(this.confirmSelection, this));
		} else {
			attachEventHandler(containerDiv, "mousemove", bindContext(this.activateSuggestion, this));
			// Prevent input blur when clicking on container
			attachEventHandler(containerDiv, "mousedown", suppressEvent);
			attachEventHandler(containerDiv, "mouseup", bindContext(this.confirmSelection, this));
		}

		// Configure wrapper and insert into DOM
		wrapperDiv.className = "suggest-component__wrapper";
		wrapperDiv.style.display = inputComputedDisplay; // Match input display
		wrapperDiv.appendChild(containerDiv);
		inputField.parentNode.insertBefore(wrapperDiv, inputField.nextSibling);
	};

	/**
	 * Attaches input and keyboard listeners to the input field.
	 */
	SuggestiveInputPrototype.attachInputEventHandlers = function() {
		const inputField = this.inputField;

		// Monitor text field value changes
		// Using 'input' event for modern browsers
		attachEventHandler(inputField, "input", this.checkInputBound);

		// Handle key presses for navigation and selection
		attachEventHandler(inputField, "keydown", bindContext(this.processKeyPress, this));
	};

	/**
	 * Evaluates the input field's value for changes and triggers matching.
	 * @param {Event} [evt] - The event object (optional).
	 */
	SuggestiveInputPrototype.evaluateInputEntry = function(evt) {
		const currentInputValue = this.inputField.value;
		const previousEntry = this.lastKnownInputValue;
		const delay = this.settings.onEntryDelayMs;

		if (currentInputValue !== previousEntry) {
			this.findMatchingSuggestions(currentInputValue);

			// Handle delayed or instant onInput callback
			if (delay > 0) {
				if (this.lastOnInputValue === null) {
					this.lastOnInputValue = previousEntry;
				}
				globalWindow.clearTimeout(this.debounceTimeoutId); // Clear any existing timer
				this.debounceTimeoutId = globalWindow.setTimeout(bindContext(() => {
					this.settings.onEntryChange.apply(this, [currentInputValue, this.lastOnInputValue]);
					this.lastOnInputValue = null;
				}, this), delay);
			} else {
				this.settings.onEntryChange.apply(this, [currentInputValue, previousEntry]);
			}
			this.lastKnownInputValue = currentInputValue;
		}
	};

	/**
	 * Finds and displays suggestions matching the input value.
	 * @param {string} currentVal - The current value of the input field.
	 */
	SuggestiveInputPrototype.findMatchingSuggestions = function(currentVal) {
		// If using native datalist, this method is not responsible for display
		if (isDatalistSupported && this.settings.useNativeDatalist) {
			return;
		}

		let matchingResults;

		if (currentVal) {
			// Check cache first
			if (this.resultsCache.has(currentVal)) {
				matchingResults = this.resultsCache.get(currentVal);
			} else {
				// Escape special regex characters for safe pattern matching
				const escapedVal = currentVal.replace(/[-.*+?^${}()|[\]\\]/g, "\\$&");
				const matchRegex = new RegExp(`^(${escapedVal}.*)$`, "i"); // Case-insensitive, starts with

				// Sort available items once for consistent results, then filter
				const sortedItems = [...this.availableItems].sort();
				matchingResults = sortedItems
					.filter(item => matchRegex.test(item) && item !== currentVal)
					.slice(0, this.settings.maxDisplayChoices);

				this.resultsCache.set(currentVal, matchingResults); // Cache results
			}
		}

		if (matchingResults?.length) {
			this.displaySuggestions(matchingResults);
		} else {
			this.hideSuggestions();
		}
	};

	/**
	 * Handles keyboard events for navigation and selection within suggestions.
	 * @param {KeyboardEvent} evt - The keyboard event object.
	 */
	SuggestiveInputPrototype.processKeyPress = function(evt) {
		const keyCode = evt.which || evt.keyCode;
		const isActionKey = [9, 13, 27, 38, 40].includes(keyCode); // TAB, ENTER, ESC, UP, DOWN

		if (!isActionKey) return;

		const numVisibleSuggestions = this.visibleSuggestions.length;

		if (keyCode === 9 || keyCode === 13) { // TAB or ENTER
			if (this.activeSuggestionIndex > -1) {
				this.confirmSelection(evt);
			} else if (keyCode === 13 && globalWindow.opera) {
				// Opera bug workaround (sometimes needs a tick to clear)
				globalWindow.setTimeout(bindContext(this.hideSuggestions, this), 0);
			} else {
				this.hideSuggestions();
			}
		} else if (keyCode === 27) { // ESC
			this.hideSuggestions();
		} else { // UP or DOWN arrow keys
			if (numVisibleSuggestions > 0) {
				let newIndex = this.activeSuggestionIndex;
				if (keyCode === 38) { // UP arrow
					newIndex = (newIndex <= 0) ? numVisibleSuggestions - 1 : newIndex - 1;
				} else { // DOWN arrow
					newIndex = (newIndex >= numVisibleSuggestions - 1) ? 0 : newIndex + 1;
				}
				this.setActiveSuggestionIndex(newIndex);
			} else {
				this.evaluateInputEntry(evt); // If no suggestions, re-evaluate input
			}
		}
		// Prevent default browser behavior for handled keys
		suppressEvent(evt);
	};

	/**
	 * Displays the given array of suggestions in the custom container.
	 * @param {Array<string>} suggestions - The list of matching suggestion strings.
	 */
	SuggestiveInputPrototype.displaySuggestions = function(suggestions) {
		if (!this.displayContainer) return;

		const sanitizedSuggestions = suggestions.map(s => s.replace(/</g, "&lt;").replace(/>/g, "&gt;"));
		const listItemsHtml = sanitizedSuggestions
			.map((item, idx) => `<li data-suggestion-idx="${idx}" class="suggest-component__item">${item}</li>`)
			.join("");

		this.activeSuggestionIndex = -1;
		this.visibleSuggestions = [...suggestions]; // Copy array
		this.displayContainer.innerHTML = `<ul class="suggest-component__list">${listItemsHtml}</ul>`;
	};

	/**
	 * Handles mousemove or touchstart events to highlight suggestions.
	 * @param {Event} evt - The event object.
	 */
	SuggestiveInputPrototype.activateSuggestion = function(evt) {
		// Throttle mousemove events to avoid excessive DOM updates
		if (!this.isTouchDevice && (++this.throttleCounter % 2 !== 0)) {
			return;
		}

		const eventTarget = evt.target || evt.srcElement;
		let currentElement = eventTarget;

		// Traverse up the DOM to find the suggestion item or the container itself
		while (currentElement && currentElement !== this.displayContainer &&
			!currentElement.classList.contains("suggest-component__item")) {
			currentElement = currentElement.parentNode;
		}

		if (currentElement && currentElement.classList.contains("suggest-component__item")) {
			const indexStr = currentElement.getAttribute("data-suggestion-idx");
			const suggestionIndex = parseInt(indexStr, 10);
			if (!isNaN(suggestionIndex) && suggestionIndex > -1) {
				this.setActiveSuggestionIndex(suggestionIndex);
			}
		}
	};

	/**
	 * Sets the currently highlighted suggestion by index.
	 * Applies/removes highlight CSS classes.
	 * @param {number} newIndex - The index of the suggestion to highlight.
	 */
	SuggestiveInputPrototype.setActiveSuggestionIndex = function(newIndex) {
		const currentActiveIdx = this.activeSuggestionIndex;
		const numSuggestions = this.visibleSuggestions.length;

		// Ensure index is within bounds
		newIndex = Math.max(-1, Math.min(newIndex, numSuggestions - 1));

		if (newIndex === currentActiveIdx) return; // No change needed

		const suggestionItems = this.displayContainer?.querySelector(".suggest-component__list")?.children;
		if (!suggestionItems) return;

		// Remove highlight from previously active item
		if (currentActiveIdx > -1 && suggestionItems[currentActiveIdx]) {
			suggestionItems[currentActiveIdx].classList.remove("suggest-component__item--active");
			// Restore original styles if using inline, otherwise CSS handles it
		}

		// Apply highlight to the new active item
		if (newIndex > -1 && suggestionItems[newIndex]) {
			const activeItem = suggestionItems[newIndex];
			activeItem.classList.add("suggest-component__item--active");
			// Apply inline styles for specific colors if configured
			activeItem.style.color = this.settings.highlightTextColor;
			activeItem.style.backgroundColor = this.settings.highlightBackgroundColor;

			// Optional: Scroll into view
			activeItem.scrollIntoView({ block: "nearest", inline: "nearest" });
		}

		this.activeSuggestionIndex = newIndex;
	};

	/**
	 * Selects the currently highlighted suggestion and updates the input field.
	 * @param {Event} evt - The event object.
	 */
	SuggestiveInputPrototype.confirmSelection = function(evt) {
		const eventType = (evt?.type || "").toLowerCase();
		const shouldReturnFocus = (eventType !== "keydown" || (evt.which || evt.keyCode) !== 9); // Not TAB key

		// If mouse/touch event, ensure we select the clicked item if it's different
		if (eventType.includes("mouse") || eventType.includes("touch")) {
			const eventTarget = evt.target || evt.srcElement;
			if (eventTarget.classList.contains("suggest-component__item")) {
				const clickedIndex = parseInt(eventTarget.getAttribute("data-suggestion-idx"), 10);
				if (!isNaN(clickedIndex) && clickedIndex > -1) {
					this.activeSuggestionIndex = clickedIndex;
				}
			}
		}

		if (this.activeSuggestionIndex > -1 && this.activeSuggestionIndex < this.visibleSuggestions.length) {
			this.inputField.value = this.visibleSuggestions[this.activeSuggestionIndex];
			this.hideSuggestions();
		}

		if (shouldReturnFocus) {
			this.inputField.focus();
			return suppressEvent(evt);
		}
	};

	/**
	 * Clears and hides the suggestion display.
	 */
	SuggestiveInputPrototype.hideSuggestions = function() {
		this.activeSuggestionIndex = -1;
		this.lastKnownInputValue = ""; // Reset last value to re-trigger check on next input
		this.visibleSuggestions = [];
		if (this.displayContainer) {
			this.displayContainer.innerHTML = "";
		}
	};

	/**
	 * Adds new values to the component's available items.
	 * @param {Array<string>} newItems - An array of items to add.
	 */
	SuggestiveInputPrototype.appendItems = function(newItems) {
		if (!Array.isArray(newItems) || newItems.length === 0) {
			return;
		}

		let itemsAddedCount = 0;
		const currentItems = this.availableItems;
		const currentItemSet = new Set(currentItems); // Use Set for efficient lookup

		for (const item of newItems) {
			if (item && !currentItemSet.has(item)) {
				currentItems.push(item);
				currentItemSet.add(item); // Update set
				itemsAddedCount++;
			}
		}

		if (itemsAddedCount > 0) {
			this.updateComponent();
		}
	};

	/**
	 * Removes specified values from the component's available items.
	 * @param {Array<string>} itemsToRemove - An array of items to remove.
	 */
	SuggestiveInputPrototype.excludeItems = function(itemsToRemove) {
		if (!Array.isArray(itemsToRemove) || itemsToRemove.length === 0) {
			return;
		}

		const initialLength = this.availableItems.length;
		const removeSet = new Set(itemsToRemove);

		this.availableItems = this.availableItems.filter(item => !removeSet.has(item));

		if (this.availableItems.length < initialLength) {
			this.updateComponent();
		}
	};

	/**
	 * Refreshes the component's internal state and display.
	 * Clears cache, re-generates datalist or re-matches input.
	 */
	SuggestiveInputPrototype.updateComponent = function() {
		this.resultsCache.clear(); // Clear all cached results

		if (isDatalistSupported && this.settings.useNativeDatalist) {
			// If native datalist, regenerate its content
			if (this.displayContainer) {
				this.displayContainer.innerHTML = this.buildDatalistContent();
			} else {
				this.configureNativeList(); // Re-create if somehow lost
			}
		} else if (this.activeSuggestionIndex === -1 && this.inputField.value) {
			// If custom display and no selection, re-match current input
			this.findMatchingSuggestions(this.inputField.value);
		}
	};

	/**
	 * Cleans up event listeners and removes DOM elements when the component is no longer needed.
	 */
	SuggestiveInputPrototype.destroy = function() {
		const inputField = this.inputField;

		// Detach primary event handlers
		detachEventHandler(inputField, "focus", bindContext(this.handleFocusChange, this));
		detachEventHandler(inputField, "blur", bindContext(this.handleFocusChange, this));
		detachEventHandler(inputField, "input", this.checkInputBound);
		detachEventHandler(inputField, "keydown", bindContext(this.processKeyPress, this));

		// Clean up custom display container if it exists
		if (this.displayContainer && !this.settings.useNativeDatalist) {
			detachEventHandler(this.displayContainer, "mousemove", bindContext(this.activateSuggestion, this));
			detachEventHandler(this.displayContainer, "mousedown", suppressEvent);
			detachEventHandler(this.displayContainer, "mouseup", bindContext(this.confirmSelection, this));
			detachEventHandler(this.displayContainer, "touchstart", bindContext(this.activateSuggestion, this));
			detachEventHandler(this.displayContainer, "touchend", bindContext(this.confirmSelection, this));

			// Remove the wrapper and container from the DOM
			const wrapper = this.displayContainer.parentNode;
			if (wrapper && wrapper.parentNode) {
				wrapper.parentNode.removeChild(wrapper);
			}
		}

		// Clear any pending timers
		globalWindow.clearTimeout(this.debounceTimeoutId);

		// Remove datalist attribute if it was managed by this component
		if (isDatalistSupported && this.settings.useNativeDatalist) {
			const currentListId = inputField.getAttribute("list");
			if (currentListId && currentListId.startsWith("datalist-")) { // Only remove if component created it
				const existingDatalist = findElement(`#${currentListId}`);
				existingDatalist?.parentNode?.removeChild(existingDatalist);
				inputField.removeAttribute("list");
			}
		}

		// Nullify references to prevent memory leaks
		this.inputField = null;
		this.displayContainer = null;
		this.resultsCache.clear();
		this.visibleSuggestions = [];
		this.availableItems = [];
		this.checkInputBound = null;
		this.settings = null;
	};


	// Expose the component globally
	globalWindow.SuggestiveInput = SuggestiveInput;

})(window, document);