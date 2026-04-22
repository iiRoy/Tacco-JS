(function() {
  'use strict';

  // Constants and configuration values for the preview rendering system.
  const PREVIEW_HASH_IDENTIFIER = '#__preview__';
  const DATA_URI_PROTOCOL = 'data:';
  const IFRAME_LOAD_EVENT = 'load';
  const INPUT_EVENT = 'input';
  const MESSAGE_EVENT = 'message';
  const DEFAULT_COOKIE_NAME = 'preview-width';
  const RESIZABLE_CLASS = 'resizable-viewer'; // Renamed from 'resizeable'
  const ACTIVE_CLASS = 'is-active';
  const PREVIEW_CONTAINER_CLASS = 'display-example'; // Renamed from 'bs-example'
  const PREVIEW_CODE_MIRROR_CLASS = 'preview-code-mirror'; // Renamed from 'preview-code'
  const TEXTAREA_TAG = 'textarea';
  const IFRAME_TAG = 'iframe';
  const DIV_TAG = 'div';
  const STYLE_TAG = 'style';
  const SCRIPT_TAG = 'script';
  const HEAD_TAG = 'head';
  const BODY_TAG = 'body';
  const HTML_TAG = 'html';
  const DEFAULT_PADDING_OFFSET = 30; // Offset for resizable element padding/margin

  // Utility collection for common array/node-list operations.
  const collectionUtils = {
    /**
     * Executes a callback for each item in a collection (array-like or array).
     * @param {ArrayLike<any>|Array<any>} collection The collection to iterate over.
     * @param {function(any, number, ArrayLike<any>|Array<any>): void} callback The function to execute for each item.
     */
    forEachItem: (collection, callback) => {
      Array.from(collection).forEach(callback);
    },

    /**
     * Transforms a collection into a new array by applying a function to each item.
     * @param {ArrayLike<any>|Array<any>} collection The collection to transform.
     * @param {function(any, number, ArrayLike<any>|Array<any>): any} transformer The function to apply.
     * @returns {Array<any>} A new array with transformed values.
     */
    mapItems: (collection, transformer) => {
      return Array.from(collection).map(transformer);
    },

    /**
     * Extracts a specific property value from each object in a collection.
     * @param {ArrayLike<Object>|Array<Object>} collection The collection of objects.
     * @param {string} propertyName The name of the property to extract.
     * @returns {Array<any>} An array of extracted property values.
     */
    extractProperty: (collection, propertyName) => {
      return collectionUtils.mapItems(collection, item => item[propertyName]);
    },

    /**
     * Calls a method on each object in a collection with optional arguments.
     * @param {ArrayLike<Object>|Array<Object>} collection The collection of objects.
     * @param {string|function} methodToInvoke The name of the method or the function itself.
     * @param {...any} methodArgs Arguments to pass to the method.
     * @returns {Array<any>} An array of results from the invoked method.
     */
    invokeMethod: (collection, methodToInvoke, ...methodArgs) => {
      const isFunction = typeof methodToInvoke === 'function';
      return collectionUtils.mapItems(collection, item => {
        const targetMethod = isFunction ? methodToInvoke : item[methodToInvoke];
        if (typeof targetMethod === 'function') {
          return targetMethod.apply(item, methodArgs);
        }
        return undefined; // Or throw an error, depending on desired behavior
      });
    },

    /**
     * Removes a specified CSS class from a collection of elements.
     * @param {ArrayLike<HTMLElement>|Array<HTMLElement>} elements The elements to modify.
     * @param {string} cssClass The CSS class to remove.
     */
    removeCssClass: (elements, cssClass) => {
      collectionUtils.forEachItem(elements, el => el.classList.remove(cssClass));
    },

    /**
     * Debounces a function call.
     * @param {function(...any): any} func The function to debounce.
     * @param {number} delay The debounce delay in milliseconds.
     * @returns {function(...any): void} The debounced function.
     */
    debounce: (func, delay) => {
      let timeout;
      return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
      };
    }
  };

  /**
   * Parses a key-value string (e.g., from cookies) into an object.
   * Format: `key1=value1; key2=value2`
   * @param {string} inputString The string to parse.
   * @returns {Object.<string, string>} An object containing the parsed key-value pairs.
   */
  const parseKeyValuePairs = (inputString) => {
    return inputString.split(';').reduce((accumulator, pair) => {
      const trimmedPair = pair.trim();
      if (trimmedPair) {
        const parts = trimmedPair.split('=');
        if (parts.length === 2) {
          accumulator[parts[0]] = parts[1];
        }
      }
      return accumulator;
    }, {});
  };

  /**
   * Dispatches a message to an iframe's content window.
   * @param {HTMLIFrameElement} targetFrame The target iframe element.
   * @param {Object} messagePayload The message object to send.
   */
  const dispatchFrameMessage = (targetFrame, messagePayload) => {
    if (targetFrame && targetFrame.contentWindow) {
      targetFrame.contentWindow.postMessage(messagePayload, '*');
    }
  };

  // --- Initial DOM element references ---
  const documentHead = document.head;
  const documentBody = document.body;

  // Retrieve preview-specific styles and scripts from the main document head.
  // These are intended to be injected into the iframes.
  const previewStylesContent = collectionUtils.extractProperty(
    documentHead.querySelectorAll(`${STYLE_TAG}[type="text/preview"]`),
    'innerHTML'
  ).join('');
  const previewScriptsContent = collectionUtils.extractProperty(
    documentHead.querySelectorAll(`${SCRIPT_TAG}[type="text/preview"]`),
    'innerHTML'
  ).join('');

  // Determine the base URL for iframe content, ensuring it includes our preview hash.
  const frameContentUrl = `${location.href.split('#')[0]}${PREVIEW_HASH_IDENTIFIER}`;

  // Global counter for unique iframe names.
  let frameIdentifierCounter = 0;

  /**
   * Checks if the browser treats data URIs as same-origin for iframe content.
   * This is crucial for security and content manipulation.
   * @returns {Promise<{sameOriginDataUri: boolean}>} A promise resolving to an object with the support status.
   */
  const checkDataUriSupport = () => {
    return new Promise(resolve => {
      const temporaryFrame = document.createElement(IFRAME_TAG);
      temporaryFrame.style.display = 'none'; // Keep it hidden
      temporaryFrame.src = `${DATA_URI_PROTOCOL}text/html,`; // Minimal data URI
      documentBody.appendChild(temporaryFrame);

      temporaryFrame.addEventListener(IFRAME_LOAD_EVENT, function() {
        let sameOriginDataUri = false;
        try {
          // Attempting to access contentDocument will throw if cross-origin.
          if (this.contentDocument) {
            sameOriginDataUri = true;
          }
        } catch (error) {
          // Access denied, so it's not same-origin.
          sameOriginDataUri = false;
        } finally {
          // Clean up the temporary iframe.
          this.parentNode.removeChild(this);
          resolve({ sameOriginDataUri });
        }
      });
    });
  };

  /**
   * Inserts an iframe preview for a given textarea element.
   * @param {HTMLTextAreaElement} sourceCodeArea The textarea containing the code to preview.
   * @param {{sameOriginDataUri: boolean}} featureSupport Object indicating browser feature support.
   */
  const embedPreviewFrame = (sourceCodeArea, featureSupport) => {
    if (!sourceCodeArea || !documentBody.contains(sourceCodeArea)) {
      console.warn('Cannot embed preview frame: sourceCodeArea is invalid or not in document.');
      return;
    }

    const containerElement = document.createElement(DIV_TAG);
    containerElement.className = PREVIEW_CONTAINER_CLASS;

    const resizableWrapper = document.createElement(DIV_TAG);
    resizableWrapper.className = RESIZABLE_CLASS;
    containerElement.appendChild(resizableWrapper);

    const targetIframe = document.createElement(IFRAME_TAG);
    targetIframe.setAttribute('scrolling', 'no');
    targetIframe.name = `previewFrame_${frameIdentifierCounter++}`; // Unique name for message targeting
    resizableWrapper.appendChild(targetIframe);

    /**
     * Handles the iframe load event, injecting content and styles/scripts.
     * @param {Event} event The load event object.
     */
    const handleFrameLoad = function(event) {
      const currentFrame = this; // 'this' refers to the iframe
      const iframeDocument = currentFrame.contentDocument;

      // Guard against recursive loading or data URI issues.
      if (!iframeDocument) {
        console.warn('Iframe document not accessible after load.', currentFrame);
        return;
      }

      // If browser doesn't support same-origin data URIs and we're loading the special URL,
      // or if we're loading the special URL regardless, inject the content.
      if (!featureSupport.sameOriginDataUri && currentFrame.src !== frameContentUrl) {
        // This branch implies a data URI was used but failed same-origin access, or an unexpected src.
        // For robustness, we might want to reload with previewUrl if data URI fails.
        // However, the current logic only handles the case where src is *not* previewUrl,
        // which means it's likely a data URI that didn't work.
        // Given the original code's intent, if `this.src` is *not* `previewUrl` and `!sameOriginDataUri`,
        // it means a data URI was attempted and failed. In this case, we just return.
        // If `this.src` *is* `previewUrl`, then we proceed to inject.
        // Let's refine this to be more explicit:
        if (currentFrame.src.startsWith(DATA_URI_PROTOCOL) && !featureSupport.sameOriginDataUri) {
          // Data URI was used, but not supported as same-origin. Nothing to do here for now.
          // The iframe will remain blank or show an error.
          return;
        }
      }

      // If the iframe's source is the special preview URL (meaning it's a blank page
      // that we will populate), or if data URI is supported, proceed with content injection.
      if (currentFrame.src === frameContentUrl || featureSupport.sameOriginDataUri) {
        let frameHtmlRoot = iframeDocument.createElement(HTML_TAG);
        let frameHead = iframeDocument.createElement(HEAD_TAG);
        let frameBody = iframeDocument.createElement(BODY_TAG);

        frameBody.innerHTML = sourceCodeArea.value || sourceCodeArea.textContent || ''; // Use .value for live changes, .textContent for initial.

        frameHtmlRoot.appendChild(frameHead);
        frameHtmlRoot.appendChild(frameBody);

        // Replace the existing document structure with our custom HTML.
        if (iframeDocument.documentElement) {
          iframeDocument.replaceChild(frameHtmlRoot, iframeDocument.documentElement);
        } else {
          // If documentElement is null (e.g., very early in load, or malformed doc),
          // append directly. This is a fallback and less ideal.
          iframeDocument.appendChild(frameHtmlRoot);
        }
      }

      // Inject common styles and scripts into the iframe's head, regardless of how content was loaded.
      const frameHeadElement = iframeDocument.getElementsByTagName(HEAD_TAG)[0];
      if (frameHeadElement) {
        const frameStyleElement = iframeDocument.createElement(STYLE_TAG);
        frameStyleElement.textContent = previewStylesContent;
        frameHeadElement.appendChild(frameStyleElement);

        const frameScriptElement = iframeDocument.createElement(SCRIPT_TAG);
        frameScriptElement.textContent = previewScriptsContent;
        frameHeadElement.appendChild(frameScriptElement);
      } else {
        console.warn('Could not find head element in iframe to inject styles/scripts.', currentFrame);
      }

      // Notify the parent frame about the new height after content injection.
      dispatchFrameMessage(currentFrame, { action: 'getHeight' });
    };

    targetIframe.addEventListener(IFRAME_LOAD_EVENT, handleFrameLoad);

    // Determine the iframe's initial source.
    let frameSource;
    if (!featureSupport.sameOriginDataUri) {
      // If data URIs aren't same-origin, we load a blank page on our domain
      // and then inject content via contentDocument.
      frameSource = frameContentUrl;
    } else {
      // If data URIs are same-origin, we can embed the entire HTML directly.
      // Make sure to encode the HTML properly.
      const htmlContent = `<!doctype html><html><head></head><body>${sourceCodeArea.textContent || ''}</body></html>`;
      frameSource = `${DATA_URI_PROTOCOL}text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;
    }
    targetIframe.setAttribute('src', frameSource);

    // Update iframe content dynamically when the textarea changes.
    const handleCodeInput = collectionUtils.debounce(function() {
      if (targetIframe.contentDocument && targetIframe.contentDocument.body) {
        targetIframe.contentDocument.body.innerHTML = this.value;
        dispatchFrameMessage(targetIframe, { action: 'getHeight' });
      } else {
        // If contentDocument is not ready or accessible, reload the iframe.
        // This can happen if the data URI support changed or frame was navigated away.
        targetIframe.src = frameSource; // Re-trigger the load process
      }
    }, 150); // Debounce to avoid excessive updates

    sourceCodeArea.addEventListener(INPUT_EVENT, handleCodeInput);

    // Insert the preview container before the source code textarea.
    sourceCodeArea.parentNode.insertBefore(containerElement, sourceCodeArea);
  };

  /**
   * Enables automatic resizing for a textarea based on its content.
   * @param {HTMLTextAreaElement} textareaElement The textarea to make auto-resizable.
   */
  const enableAutoTextareaResize = (textareaElement) => {
    if (!textareaElement || !documentBody.contains(textareaElement)) return;

    const heightMirror = document.createElement(DIV_TAG);
    heightMirror.className = PREVIEW_CODE_MIRROR_CLASS;
    // Position off-screen to calculate height without affecting layout.
    Object.assign(heightMirror.style, {
      position: 'absolute',
      top: '0',
      left: '-9999px',
      visibility: 'hidden', // Make it invisible
      whiteSpace: 'pre-wrap', // Preserve line breaks and spaces
      wordWrap: 'break-word', // Break long words
      boxSizing: window.getComputedStyle(textareaElement).boxSizing // Match textarea's box model
    });

    // Copy essential styles from the textarea to the mirror for accurate height calculation.
    const computedStyles = window.getComputedStyle(textareaElement);
    const stylePropertiesToCopy = [
      'width', 'padding', 'border', 'fontFamily', 'fontSize', 'lineHeight', 'fontWeight',
      'textTransform', 'letterSpacing'
    ];
    stylePropertiesToCopy.forEach(prop => {
      heightMirror.style[prop] = computedStyles[prop];
    });

    documentBody.appendChild(heightMirror);

    const maximumHeight = parseInt(computedStyles.getPropertyValue('max-height'), 10) || Infinity;
    const initialPadding = 2; // Account for borders/padding that might not be copied exactly.

    /**
     * Updates the textarea's height based on its content.
     */
    const adjustTextareaHeight = function() {
      heightMirror.textContent = this.value + '\n'; // Add newline to ensure cursor at bottom is included in height.
      let calculatedHeight = heightMirror.offsetHeight + initialPadding;

      if (calculatedHeight >= maximumHeight) {
        this.style.overflowY = 'auto'; // Enable scroll if content exceeds max height.
        this.style.height = `${maximumHeight}px`;
      } else {
        this.style.overflowY = 'hidden'; // Hide scrollbar if content fits.
        this.style.height = `${calculatedHeight}px`;
      }
    };

    const debouncedAdjust = collectionUtils.debounce(adjustTextareaHeight, 50);

    textareaElement.addEventListener(INPUT_EVENT, debouncedAdjust);
    // Initial adjustment on load.
    adjustTextareaHeight.call(textareaElement);

    // Clean up the mirror element if the textarea is removed (e.g., SPA navigation).
    // This is an added Type III enhancement for robustness.
    const observer = new MutationObserver((mutationsList, observer) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          if (Array.from(mutation.removedNodes).includes(textareaElement)) {
            heightMirror.remove();
            observer.disconnect();
            break;
          }
        }
      }
    });
    observer.observe(textareaElement.parentNode, { childList: true });
  };

  /**
   * Sets up resizing controls for preview iframes and handles message passing for height adjustments.
   */
  const setupFrameResizing = () => {
    const controlPanel = documentBody.querySelector('.settings');
    const resizableFrameWrappers = documentBody.getElementsByClassName(RESIZABLE_CLASS);

    // If no control panel or no resizable frames, abort.
    if (!controlPanel || resizableFrameWrappers.length === 0) {
      if (controlPanel) controlPanel.hidden = true; // Ensure hidden if not functional
      return;
    }

    controlPanel.hidden = false; // Make controls visible if they are functional.

    /**
     * Adjusts the width of all resizable preview frames.
     * @param {string|number} newWidth The desired width ('auto' or a pixel value).
     */
    const adjustFrameDimensions = (newWidth) => {
      document.cookie = `${DEFAULT_COOKIE_NAME}=${newWidth};path=/`; // Update cookie.

      collectionUtils.forEachItem(resizableFrameWrappers, (wrapper) => {
        let effectiveWidth = newWidth;
        if (newWidth === 'auto') {
          // If 'auto', take the width of the parent container.
          effectiveWidth = wrapper.parentNode.offsetWidth;
        }
        wrapper.style.width = `${effectiveWidth}px`;
        // Request height update from the iframe after width change.
        const targetFrame = wrapper.querySelector(IFRAME_TAG);
        if (targetFrame) {
          dispatchFrameMessage(targetFrame, { action: 'getHeight' });
        }
      });
    };

    // Apply stored width from cookie on initial load.
    const storedCookieData = parseKeyValuePairs(document.cookie);
    const storedWidth = storedCookieData[DEFAULT_COOKIE_NAME];
    if (storedWidth) {
      adjustFrameDimensions(storedWidth);
      // Update active button state.
      collectionUtils.removeCssClass(controlPanel.getElementsByClassName(ACTIVE_CLASS), ACTIVE_CLASS);
      const matchingButton = controlPanel.querySelector(`button[data-width="${storedWidth}"]`);
      if (matchingButton) {
        matchingButton.classList.add(ACTIVE_CLASS);
      }
    }

    // Listener for messages from iframes (e.g., requesting height adjustment).
    window.addEventListener(MESSAGE_EVENT, (messageEvent) => {
      // Basic validation for message source and data.
      if (!messageEvent.data || !messageEvent.source || typeof messageEvent.data !== 'object') {
        return;
      }

      const messagePayload = messageEvent.data;
      const sourceWindow = messageEvent.source;

      // Find the originating iframe element by its name.
      const originatingFrame = documentBody.querySelector(`${IFRAME_TAG}[name="${sourceWindow.name}"]`);

      // If a height is provided and the source iframe is found.
      if (messagePayload.height != null && originatingFrame) {
        // Update the parent wrapper's height to accommodate the iframe's content + padding.
        originatingFrame.parentNode.style.height = `${messagePayload.height + DEFAULT_PADDING_OFFSET}px`;
      }
    }, false);

    // Click handler for the resizing buttons in the control panel.
    controlPanel.addEventListener('click', (clickEvent) => {
      let targetButton = clickEvent.target;
      // Traverse up to find the button element if a child (like SVG icon) was clicked.
      while (targetButton && targetButton.tagName.toLowerCase() !== 'button' && targetButton !== controlPanel) {
        targetButton = targetButton.parentNode;
      }

      if (targetButton && targetButton.tagName.toLowerCase() === 'button') {
        clickEvent.preventDefault(); // Prevent default button behavior.

        // Deactivate all other buttons and activate the clicked one.
        collectionUtils.removeCssClass(controlPanel.getElementsByClassName(ACTIVE_CLASS), ACTIVE_CLASS);
        targetButton.classList.add(ACTIVE_CLASS);

        const newWidth = targetButton.dataset.width; // Get width from data attribute.
        adjustFrameDimensions(newWidth);
      }
    });
  };

  // --- Main Initialization Logic ---

  // Abort if rendering a preview page itself (to avoid recursive iframe loading),
  // or if it's a data URI (which might be the iframe content).
  // This check is performed early to prevent unnecessary execution.
  if (location.hash === PREVIEW_HASH_IDENTIFIER || location.protocol === DATA_URI_PROTOCOL) {
    return;
  }

  // Execute main logic once the DOM is fully loaded.
  document.addEventListener('DOMContentLoaded', async () => {
    // First, check browser capabilities for data URI handling.
    const supportFeatures = await checkDataUriSupport();

    // Loop through all textareas and set up their corresponding iframes and auto-resizing.
    const allCodeAreas = documentBody.getElementsByTagName(TEXTAREA_TAG);
    if (allCodeAreas.length > 0) {
      collectionUtils.forEachItem(allCodeAreas, (area) => {
        embedPreviewFrame(area, supportFeatures);
        enableAutoTextareaResize(area);
      });
      // After all iframes are potentially added, set up the resizing buttons.
      setupFrameResizing();
    }
  });

})();