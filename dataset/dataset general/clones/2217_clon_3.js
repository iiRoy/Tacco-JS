((globalScope, currentDocument) => {
  "use strict"; // Enforce strict mode for cleaner code.

  // --- Global State and Configuration Constants ---

  /**
   * @type {boolean} A dynamic flag that tracks if the keyboard Shift key is currently depressed.
   */
  let isModifierKeyActive = false;

  /**
   * @type {Readonly<object>} Immutable object containing key codes for keyboard events.
   * Using 'which' property for broader browser compatibility, while 'keyCode' is also common.
   */
  const KEYBOARD_EVENT_CODES = Object.freeze({
    SPACEBAR_KEY: 32,
    SHIFT_MODIFIER: 16
  });

  /**
   * @type {string[]} An array of textual cues or keywords that signify a "next" page,
   * dynamically retrieved from the browser extension's background script.
   */
  let nextContentSearchTerms = [];

  /**
   * @type {Readonly<string[]>} A predefined, immutable list of default terms used to identify
   * navigation links, serving as a fallback if custom terms are unavailable or as a supplement.
   * This constant was not present in the original code and is added for robustness.
   */
  const DEFAULT_NAVIGATION_PATTERNS = Object.freeze([
    "next", "continue", "forward", "more", "»", "›", "→"
  ]);

  // --- Browser Extension Communication Logic ---

  // Attempt to access the appropriate browser extension API (e.g., Chrome or standard WebExtensions).
  // This introduces a guard for environments where the API might not exist.
  const extensionMessagingAPI = globalScope.chrome?.extension || globalScope.browser?.runtime;

  if (extensionMessagingAPI && typeof extensionMessagingAPI.sendMessage === 'function') {
    extensionMessagingAPI.sendMessage({ command: "fetchNextPageKeywords" }, (responsePayload) => {
      // Validate the received response to ensure it contains expected data.
      if (responsePayload && typeof responsePayload.keywordList === 'string') {
        // Modern string processing to parse keywords: split by newline, trim whitespace, and filter out empty entries.
        nextContentSearchTerms = responsePayload.keywordList
          .split('\n')
          .map(term => term.trim()) // Sanitize each term by removing leading/trailing whitespace.
          .filter(term => term.length > 0); // Exclude any empty strings resulting from parsing.
      } else {
        console.warn("No valid navigation keywords received from extension; falling back to default terms.");
        nextContentSearchTerms = [...DEFAULT_NAVIGATION_PATTERNS]; // Use spread to create a mutable copy.
      }
    });
  } else {
    console.warn("Browser extension messaging API not found or sendMessage method unavailable. Using default terms for content navigation.");
    nextContentSearchTerms = [...DEFAULT_NAVIGATION_PATTERNS]; // Fallback if API is not accessible.
  }

  // --- Core Utility Functions ---

  /**
   * Determines if the currently focused DOM element is an interactive input control
   * where text input is expected (e.g., text fields, text areas, or editable content).
   * This acts as an early exit condition to prevent unintended navigation while typing.
   * @param {Element | null} activeDomElement The element currently in focus.
   * @returns {boolean} True if the active element is an input-type element, otherwise false.
   */
  const isInputOrTextAreaActive = (activeDomElement) => {
    // Return false immediately if no element is active or if it's not a standard DOM element.
    if (!activeDomElement || typeof activeDomElement.matches !== 'function') {
      return false;
    }
    // Use the `matches` method for a more robust and flexible check compared to `tagName`.
    return activeDomElement.matches('input:not([type="button"]):not([type="submit"]):not([type="reset"]), textarea, [contenteditable="true"]');
  };

  /**
   * Verifies if the browser window has been scrolled to the very bottom of the document.
   * This is a prerequisite for triggering page navigation via keyboard, ensuring all content
   * has been viewed.
   * @returns {boolean} True if the page is at or near the bottom, otherwise false.
   */
  const hasPageReachedBottom = () => {
    // Calculate current vertical scroll position, accounting for cross-browser differences.
    const currentScrollYOffset = globalScope.scrollY || currentDocument.documentElement.scrollTop || currentDocument.body.scrollTop;
    // Determine the total scrollable height of the document.
    const totalContentHeight = currentDocument.documentElement.scrollHeight;
    // Ascertain the height of the visible viewport.
    const viewportVisibleHeight = globalScope.innerHeight || currentDocument.documentElement.clientHeight || currentDocument.body.clientHeight;

    // Introduce a small tolerance for floating point arithmetic or minor browser rendering differences.
    const bottomScrollThreshold = 5; // Pixels
    return (currentScrollYOffset + viewportVisibleHeight + bottomScrollThreshold) >= totalContentHeight;
  };

  /**
   * Evaluates if a given HTML element (typically an `<a>` or `<link>` tag)
   * is a suitable candidate for "next page" navigation.
   * @param {HTMLElement} candidateElement The DOM element to inspect.
   * @returns {boolean} True if the element is identified as a navigation link, otherwise false.
   */
  const isNextPageNavigationLink = (candidateElement) => {
    // Ensure the element is valid and has the `getAttribute` method.
    if (!candidateElement || typeof candidateElement.getAttribute !== 'function') {
      return false;
    }

    // First, check the 'rel' attribute, commonly used in `<link>` tags for semantic navigation.
    const relationAttributeValue = candidateElement.getAttribute("rel");
    if (relationAttributeValue && relationAttributeValue.toLowerCase() === "next") {
      return true;
    }

    // For `<a>` (anchor) tags, examine their text content against known navigation phrases.
    if (candidateElement.tagName === 'A' && candidateElement.textContent) {
      // Combine both extension-provided and default navigation terms for a comprehensive check.
      const allPossibleNavigationTerms = [...nextContentSearchTerms, ...DEFAULT_NAVIGATION_PATTERNS];
      const elementTextNormalized = candidateElement.textContent.toLowerCase();

      // Use `Array.prototype.some` for an efficient check: return true if any term is found.
      return allPossibleNavigationTerms.some(term => elementTextNormalized.includes(term.toLowerCase()));
    }

    return false; // If no conditions met, it's not a navigation link.
  };

  /**
   * Initiates navigation to the next logical page by locating and activating
   * the first appropriate "next" link element found within the document.
   */
  const proceedToNextDocument = () => {
    // Query for all potential link elements that could lead to the next page.
    // This combines the search for `<a>` and `<link>` tags into a single, efficient query.
    const potentialNavigationElements = currentDocument.querySelectorAll('a[href], link[rel="next"]');

    // Iterate through the collected elements.
    for (const element of potentialNavigationElements) {
      const destinationHref = element.getAttribute('href');
      // Ensure the element actually has a valid `href` attribute to navigate to.
      if (!destinationHref) {
        continue; // Skip elements without a destination URL.
      }

      // If the element is identified as a navigation link, perform the redirection.
      if (isNextPageNavigationLink(element)) {
        globalScope.location.href = destinationHref;
        return; // Exit function immediately after the first successful navigation.
      }
    }
  };

  // --- Event Handling Functions ---

  /**
   * Callback function for the `keydown` event listener.
   * Manages keyboard input to trigger page navigation.
   * @param {KeyboardEvent} keyEvent The keyboard event object.
   */
  const handleKeyboardPress = (keyEvent) => {
    const currentlyFocusedElement = currentDocument.activeElement;

    // Prevent navigation if the user is currently typing in an input field.
    if (isInputOrTextAreaActive(currentlyFocusedElement)) {
      return;
    }

    // Prevent navigation if the page has not been fully scrolled to the bottom.
    if (!hasPageReachedBottom()) {
      return;
    }

    // Utilize a switch statement to handle different key presses.
    switch (keyEvent.which) { // `keyEvent.which` is used for key code compatibility.
      case KEYBOARD_EVENT_CODES.SPACEBAR_KEY:
        // Only trigger navigation if the Shift key is not held down simultaneously.
        if (!isModifierKeyActive) {
          proceedToNextDocument();
        }
        break;
      case KEYBOARD_EVENT_CODES.SHIFT_MODIFIER:
        isModifierKeyActive = true;
        break;
      // No default case is necessary as other keys do not perform actions here.
    }
  };

  /**
   * Callback function for the `keyup` event listener.
   * Resets the modifier key state when a key is released.
   * @param {KeyboardEvent} keyEvent The keyboard event object.
   */
  const handleKeyboardRelease = (keyEvent) => {
    const currentlyFocusedElement = currentDocument.activeElement;

    // Prevent state changes if the user is typing in an input field.
    if (isInputOrTextAreaActive(currentlyFocusedElement)) {
      return;
    }

    // Update the state of the Shift modifier key upon its release.
    if (keyEvent.which === KEYBOARD_EVENT_CODES.SHIFT_MODIFIER) {
      isModifierKeyActive = false;
    }
  };

  // --- Event Listener Registration ---

  // Attach the event handlers to the document for global keyboard event capture.
  currentDocument.addEventListener("keydown", handleKeyboardPress);
  currentDocument.addEventListener("keyup", handleKeyboardRelease);

})(window, document); // Pass `window` and `document` explicitly to the IIFE for clarity and encapsulation.