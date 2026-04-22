(function() {
  // A custom, minimal DOM manipulation and event utility
  const elementEngine = (function() {
    let eventCache = {}; // Stores event listener references for potential removal
    let eventIdCounter = 0;

    function makeElement(tag, properties = {}) {
      const el = document.createElement(tag);
      for (const propKey in properties) {
        if (propKey === 'children') {
          properties[propKey].forEach(child => el.appendChild(child));
        } else if (propKey === 'style') {
          Object.assign(el.style, properties[propKey]);
        } else if (propKey === 'dataset') {
          Object.assign(el.dataset, properties[propKey]);
        } else if (propKey === 'className') {
          el.className = properties[propKey];
        } else if (propKey === 'textContent' || propKey === 'innerHTML') {
          el[propKey] = properties[propKey];
        } else {
          el.setAttribute(propKey, properties[propKey]);
        }
      }
      return el;
    }

    function locateElement(selector, root = document) {
      return root.querySelector(selector);
    }

    function addClassToElement(el, cls) {
      if (el && cls) el.classList.add(cls);
      return el;
    }

    function removeClassFromElement(el, cls) {
      if (el && cls) el.classList.remove(cls);
      return el;
    }

    function attachEvent(el, eventType, handler) {
      if (!el) return null;
      const id = `ee_evt_${eventIdCounter++}`;
      const wrappedHandler = function(event) { handler.call(el, event); };
      eventCache[id] = { el, eventType, handler: wrappedHandler };
      el.addEventListener(eventType, wrappedHandler);
      return id;
    }

    function detachEvent(id) {
      const entry = eventCache[id];
      if (entry) {
        entry.el.removeEventListener(entry.eventType, entry.handler);
        delete eventCache[id];
      }
    }

    return {
      create: makeElement,
      find: locateElement,
      addClass: addClassToElement,
      removeClass: removeClassFromElement,
      on: attachEvent,
      off: detachEvent
    };
  })();

  // A utility for loading external resources
  const externalResourceLoader = (function() {
    function loadScriptAsPromise(sourcePath) {
      return new Promise((resolve, reject) => {
        const scriptNode = elementEngine.create('script', { src: sourcePath, type: 'text/javascript', async: true });
        scriptNode.onload = () => {
          scriptNode.onload = null;
          scriptNode.onerror = null;
          resolve();
        };
        scriptNode.onerror = (err) => {
          scriptNode.onload = null;
          scriptNode.onerror = null;
          reject(new Error(`Failed to fetch script: ${sourcePath}. ${err.message}`));
        };
        elementEngine.find('head').appendChild(scriptNode);
      });
    }

    function loadStyleAsPromise(stylePath) {
      return new Promise((resolve, reject) => {
        const linkNode = elementEngine.create('link', { href: stylePath, rel: 'stylesheet', type: 'text/css' });
        // Link's onload is not universally reliable. Use a timeout as a fallback.
        let isLoaded = false;
        linkNode.onload = () => { isLoaded = true; resolve(); };
        linkNode.onerror = () => { isLoaded = true; reject(new Error(`Failed to load style: ${stylePath}`)); };
        elementEngine.find('head').appendChild(linkNode);

        setTimeout(() => {
          if (!isLoaded) {
            // Assume loaded or silently failed, proceed to avoid blocking.
            resolve();
          }
        }, 3000);
      });
    }

    return {
      script: loadScriptAsPromise,
      style: loadStyleAsPromise
    };
  })();

  // Global configuration and constants for the application
  const globalConfig = {
    serviceHost: 'http://localhost:8080',
    defaultButtonCaption: 'This text is configurable'
  };

  // Ensure a unique global namespace for our application
  if (!window.ApplicationFramework) window.ApplicationFramework = {};

  // The core component class
  class InteractiveDisplayUnit {
    constructor(setupOptions) {
      this._componentOptions = setupOptions || {};
      this._componentOptions.buttonCaption = this._componentOptions.buttonCaption || globalConfig.defaultButtonCaption;
      this._targetAreaSelector = '.component-mount-point'; // The new name for the container selector
      this._rootElement = null; // Reference to the DOM element where the component lives
      this._actionButton = null;
      this._textInput = null;
      this._statusDisplay = null;
      this._jsonpSequence = 0; // Counter for unique JSONP callback names
      this._pendingJsonp = null; // To manage cleanup of current JSONP call

      this._initializeComponent();
    }

    async _initializeComponent() {
      // Load necessary stylesheets concurrently
      await Promise.all([
        externalResourceLoader.style(`${globalConfig.serviceHost}/vendor/cleanslate.css`),
        externalResourceLoader.style(`${globalConfig.serviceHost}/widget.css`)
      ]).catch(e => console.error("Error loading stylesheets:", e));

      // Conditionally load JSON polyfill if the browser doesn't support it natively
      if (typeof window.JSON === 'undefined' || typeof window.JSON.parse === 'undefined') {
        console.warn("JSON API missing, loading polyfill.");
        await externalResourceLoader.script(`${globalConfig.serviceHost}/vendor/json2.js`)
          .catch(e => console.error("Error loading json2.js:", e));
      }

      // Wait for the DOM to be fully loaded before rendering the UI
      document.addEventListener('DOMContentLoaded', () => this._activateComponent());
    }

    _activateComponent() {
      this._rootElement = elementEngine.find(this._targetAreaSelector);
      if (!this._rootElement) {
        this._rootElement = elementEngine.create('div', { className: this._targetAreaSelector.substring(1) });
        elementEngine.find('body').appendChild(this._rootElement);
      }
      elementEngine.addClass(this._rootElement, 'cleanslate'); // Apply base styling

      this._buildUserInterface();
    }

    _buildUserInterface() {
      this._textInput = elementEngine.create('input', {
        type: 'text',
        id: 'user_entry_field',
        placeholder: 'Input your message here'
      });

      this._actionButton = elementEngine.create('button', {
        textContent: this._componentOptions.buttonCaption
      });

      this._rootElement.appendChild(this._textInput);
      this._rootElement.appendChild(this._actionButton);

      elementEngine.on(this._actionButton, 'click', this._triggerUserAction.bind(this));
    }

    _triggerUserAction() {
      this._actionButton.setAttribute('disabled', 'true'); // Disable button during request

      const currentWebpageUrl = encodeURIComponent(window.location.href);
      const enteredText = encodeURIComponent(this._textInput.value);

      const uniqueCallbackIdentifier = `ApplicationFramework_jsonp_callback_${this._jsonpSequence++}_${Date.now()}`;
      const jsonpRequestUrl = `${globalConfig.serviceHost}/widget_submit.php?install_url=${currentWebpageUrl}&text=${enteredText}&callback=${uniqueCallbackIdentifier}`;

      const jsonpScript = elementEngine.create('script', { src: jsonpRequestUrl, type: 'text/javascript' });
      elementEngine.find('head').appendChild(jsonpScript);

      this._pendingJsonp = { scriptNode: jsonpScript, callbackName: uniqueCallbackIdentifier };

      window[uniqueCallbackIdentifier] = (responsePayload) => {
        this._handleServiceResponse(responsePayload);
        this._cleanUpJsonp(uniqueCallbackIdentifier, jsonpScript);
      };

      // Implement a timeout for the JSONP request
      setTimeout(() => {
        if (window[uniqueCallbackIdentifier]) {
          console.warn(`JSONP call for ${uniqueCallbackIdentifier} timed out.`);
          this._cleanUpJsonp(uniqueCallbackIdentifier, jsonpScript);
          this._actionButton.removeAttribute('disabled');
          this._presentStatus("Service did not respond within the expected timeframe.");
        }
      }, 12000); // 12 second timeout
    }

    _handleServiceResponse(dataPacket) {
      if (this._actionButton) {
        this._actionButton.removeAttribute('disabled'); // Re-enable button
      }
      const fullStatusMessage = `${dataPacket.message}. Your IP address is ${dataPacket.ip}. The host website is ${dataPacket.site}. User Agent string: ${dataPacket.ua}`;
      this._presentStatus(fullStatusMessage);
    }

    _presentStatus(displayContent) {
      if (!this._statusDisplay) {
        this._statusDisplay = elementEngine.find('.status-message-area', this._rootElement);
        if (!this._statusDisplay) {
          this._statusDisplay = elementEngine.create('p', { className: 'status-message-area' });
          this._rootElement.appendChild(this._statusDisplay);
        }
      }
      this._statusDisplay.textContent = displayContent; // Use textContent to prevent XSS
    }

    _cleanUpJsonp(callbackReference, scriptNodeReference) {
      if (window[callbackReference]) {
        try {
          delete window[callbackReference];
        } catch (e) {
          window[callbackReference] = undefined; // Fallback for older JS engines
        }
      }
      if (scriptNodeReference && scriptNodeReference.parentNode) {
        scriptNodeReference.parentNode.removeChild(scriptNodeReference);
      }
      if (this._pendingJsonp && this._pendingJsonp.callbackName === callbackReference) {
        this._pendingJsonp = null;
      }
    }
  }

  // Expose the new component class to the global namespace
  window.ApplicationFramework.InteractiveDisplayUnit = InteractiveDisplayUnit;

  // Automatically instantiate the component on page load
  new InteractiveDisplayUnit();

})();