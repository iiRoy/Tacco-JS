(function(WebToolsKit) {

  /**
   * Generates a universally unique identifier (UUID) string, approximating RFC 4122 version 4.
   * This method relies on random number generation and is not cryptographically secure.
   * @returns {string} A new UUID string.
   */
  WebToolsKit.prototype.generateUniqueIdString = function() {
    // Define the standard UUID pattern template.
    const uuidPattern = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";

    // Select a source for random entropy. crypto.getRandomValues is preferred for better randomness.
    const entropySource = typeof crypto !== 'undefined' && crypto.getRandomValues ?
      (buffer) => crypto.getRandomValues(buffer)[0] :
      () => Math.random() * 0x100000000; // Fallback to Math.random

    // Replace placeholders in the pattern with random hex digits.
    return uuidPattern.replace(/[xy]/g, (placeholderChar) => {
      // Generate a random 4-bit number.
      const randomValue = Math.floor(entropySource() % 16);

      // Adjust the value for 'y' placeholders according to UUID v4 rules (bits 6 and 7 are 01).
      const finalValue = (placeholderChar === 'x') ?
        randomValue :
        (randomValue & 0x3 | 0x8); // y = [8, 9, a, b]

      // Convert the hexadecimal digit to a string.
      return finalValue.toString(16);
    });
  };

  /**
   * Attempts to retrieve the currently executing script element.
   * Prioritizes document.currentScript for modern browsers, falls back to
   * finding the last script tag in the document.
   * @returns {HTMLScriptElement|null} The script element, or null if not found or environment is not a browser.
   */
  WebToolsKit.prototype.retrieveCurrentScript = function() {
    // Ensure we are in a browser environment with a document object.
    if (typeof document === 'undefined' || !document) {
      console.warn("retrieveCurrentScript: Document object not available.");
      return null;
    }

    // Modern browsers provide a direct way to get the current script.
    if (document.currentScript) {
      return document.currentScript;
    }

    // Fallback for older browsers: find the last script tag.
    const allScripts = document.getElementsByTagName('script');
    if (allScripts && allScripts.length > 0) {
      return allScripts[allScripts.length - 1];
    }

    // No script found.
    return null;
  };

  /**
   * Inserts a new DOM node immediately after a specified reference node.
   * @param {Node} referenceElement - The node after which to insert the new node.
   * @param {Node} newNodeToInsert - The node to be inserted.
   * @returns {Node|undefined} The inserted node, or undefined if insertion failed.
   */
  WebToolsKit.prototype.insertNodeAfterElement = function(referenceElement, newNodeToInsert) {
    // Validate inputs to ensure they are actual DOM nodes.
    if (!(referenceElement instanceof Node) || !(newNodeToInsert instanceof Node)) {
      console.error("insertNodeAfterElement: Both referenceElement and newNodeToInsert must be valid DOM Node objects.");
      return undefined;
    }

    const parentContainer = referenceElement.parentNode;

    // A node must have a parent to have a sibling.
    if (!parentContainer) {
      console.warn("insertNodeAfterElement: Reference element has no parent node, cannot insert.");
      return undefined;
    }

    try {
      // Use insertBefore with the next sibling to achieve "insert after".
      return parentContainer.insertBefore(newNodeToInsert, referenceElement.nextSibling);
    } catch (domError) {
      console.error("insertNodeAfterElement: Failed to insert node.", domError);
      return undefined;
    }
  };

  /**
   * Checks if a given DOM element has a specific CSS class.
   * Utilizes classList.contains for modern browsers, falls back to regex for older ones.
   * @param {HTMLElement} targetElement - The element to check.
   * @param {string} classNameToFind - The class name to search for.
   * @returns {boolean} True if the element has the class, false otherwise.
   */
  WebToolsKit.prototype.elementContainsClass = function(targetElement, classNameToFind) {
    // Input validation: ensure it's an element and a non-empty string class name.
    if (!targetElement || typeof classNameToFind !== 'string' || classNameToFind.trim() === '') {
      return false;
    }

    // Prefer classList API for efficiency and modern browser support.
    if (targetElement.classList) {
      return targetElement.classList.contains(classNameToFind);
    }

    // Fallback for older browsers: use regular expressions on className string.
    // Ensure the class name is treated as a whole word to prevent partial matches.
    const classRegex = new RegExp(`(^|\\s)${classNameToFind}(\\s|$)`);
    return classRegex.test(targetElement.className);
  };

  /**
   * Adds a CSS class to a specified DOM element if it doesn't already exist.
   * Leverages classList.add for modern browsers, falls back to string manipulation.
   * @param {HTMLElement} targetElement - The element to modify.
   * @param {string} classToAdd - The CSS class name to add.
   */
  WebToolsKit.prototype.appendElementClass = function(targetElement, classToAdd) {
    // Basic validation for element and class name.
    if (!targetElement || typeof classToAdd !== 'string' || classToAdd.trim() === '') {
      console.warn("appendElementClass: Invalid targetElement or classToAdd provided.");
      return;
    }

    // Use classList.add for direct manipulation if available.
    if (targetElement.classList) {
      targetElement.classList.add(classToAdd);
      return;
    }

    // Fallback: Manually check and append if classList is not supported.
    if (!this.elementContainsClass(targetElement, classToAdd)) {
      // Prepend a space if there are existing classes, to avoid concatenation issues.
      targetElement.className = targetElement.className ?
        `${targetElement.className} ${classToAdd}` :
        classToAdd;
    }
  };

  /**
   * Removes a specific CSS class from a DOM element.
   * Utilizes classList.remove for modern browsers, falls back to regex-based string replacement.
   * @param {HTMLElement} targetElement - The element from which to remove the class.
   * @param {string} classToRemove - The CSS class name to remove.
   */
  WebToolsKit.prototype.removeElementClass = function(targetElement, classToRemove) {
    // Basic validation for element and class name.
    if (!targetElement || typeof classToRemove !== 'string' || classToRemove.trim() === '') {
      console.warn("removeElementClass: Invalid targetElement or classToRemove provided.");
      return;
    }

    // Use classList.remove for direct manipulation if available.
    if (targetElement.classList) {
      targetElement.classList.remove(classToRemove);
      return;
    }

    // Fallback: Manually remove using regex if classList is not supported.
    if (this.elementContainsClass(targetElement, classToRemove)) {
      // Create a regex to match the class name with surrounding spaces (or start/end of string).
      const classRemovalRegex = new RegExp(`(^|\\s)${classToRemove}(\\s|$)`, 'g');
      // Replace the class and then clean up any extra leading/trailing spaces.
      let updatedClassName = targetElement.className.replace(classRemovalRegex, ' ').trim();
      targetElement.className = updatedClassName;
    }
  };

  /**
   * Dispatches a custom DOM event on a specified target element.
   * Prioritizes the CustomEvent constructor, falls back to document.createEvent.
   * @param {string} eventName - The name of the event to dispatch.
   * @param {EventTarget} eventTarget - The DOM element or object on which to dispatch the event.
   * @param {object} [eventData={}] - Optional data to attach to the event (becomes event.detail).
   * @returns {boolean} True if the event was successfully dispatched, false otherwise.
   */
  WebToolsKit.prototype.emitCustomDomEvent = function(eventName, eventTarget, eventData = {}) {
    // Validate event name and target.
    if (typeof eventName !== 'string' || eventName.trim() === '') {
      console.error("emitCustomDomEvent: Event name must be a non-empty string.");
      return false;
    }
    if (!eventTarget || typeof eventTarget.dispatchEvent !== 'function') {
      console.error("emitCustomDomEvent: Invalid event target provided; must have a dispatchEvent method.");
      return false;
    }

    let customEventInstance;
    const eventOptions = {
      bubbles: true, // Event will bubble up through the DOM.
      cancelable: true, // Event can be canceled.
      detail: eventData // Custom data attached to the event.
    };

    // Prefer modern CustomEvent constructor.
    if (typeof CustomEvent === 'function') {
      customEventInstance = new CustomEvent(eventName, eventOptions);
    } else if (typeof document !== 'undefined' && document.createEvent) {
      // Fallback for older browsers using document.createEvent.
      customEventInstance = document.createEvent("CustomEvent");
      customEventInstance.initCustomEvent(eventName, eventOptions.bubbles, eventOptions.cancelable, eventOptions.detail);
    } else {
      console.error("emitCustomDomEvent: No suitable event creation mechanism found in this environment.");
      return false;
    }

    try {
      // Dispatch the event on the specified target.
      eventTarget.dispatchEvent(customEventInstance);
      return true;
    } catch (e) {
      console.error(`emitCustomDomEvent: Error dispatching event '${eventName}':`, e);
      return false;
    }
  };


  /**
   * Performs an asynchronous POST request to a given URL, sending JSON data.
   * Uses the modern Fetch API and returns a Promise.
   * @param {string} requestUrl - The URL to which the request is sent.
   * @param {object} [payloadData={}] - The JavaScript object to send as JSON in the request body.
   * @param {function(object): void} successCallback - Callback function for successful responses.
   * @param {function(Error): void} [errorCallback] - Optional callback function for errors.
   * @returns {Promise<object|void>} A Promise that resolves with the parsed JSON response, or rejects on error.
   */
  WebToolsKit.prototype.performJsonPostRequest = async function(requestUrl, payloadData = {}, successCallback, errorCallback) {
    // Validate essential parameters.
    if (typeof requestUrl !== 'string' || requestUrl.trim() === '') {
      const err = new Error("performJsonPostRequest: 'requestUrl' must be a non-empty string.");
      errorCallback && errorCallback(err);
      return Promise.reject(err);
    }
    if (typeof successCallback !== 'function') {
      const err = new Error("performJsonPostRequest: 'successCallback' must be a function.");
      errorCallback && errorCallback(err);
      return Promise.reject(err);
    }

    try {
      // Configure the Fetch API request.
      const fetchOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json' // Indicate that we prefer JSON response
        },
        body: JSON.stringify(payloadData) // Convert payload to JSON string.
      };

      // Perform the fetch request.
      const response = await fetch(requestUrl, fetchOptions);

      // Check if the response status indicates success (2xx range).
      if (!response.ok) {
        let errorDetails = `HTTP error! Status: ${response.status} - ${response.statusText}`;
        try {
          const errorResponse = await response.json();
          errorDetails += ` | Details: ${JSON.stringify(errorResponse)}`;
        } catch (jsonError) {
          // If response is not JSON, just use the status text.
        }
        const httpError = new Error(errorDetails);
        console.error("performJsonPostRequest: Server responded with an error:", httpError);
        errorCallback && errorCallback(httpError);
        return Promise.reject(httpError);
      }

      // Parse the JSON response.
      const responsePayload = await response.json();

      // Invoke the success callback with the parsed data.
      successCallback(responsePayload);
      return Promise.resolve(responsePayload);

    } catch (networkError) {
      // Handle network errors (e.g., DNS issues, no internet connection).
      console.error("performJsonPostRequest: Network or unexpected error during POST request:", networkError);
      errorCallback && errorCallback(networkError);
      return Promise.reject(networkError);
    }
  };

}(WebToolsKit));