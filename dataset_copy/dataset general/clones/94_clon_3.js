(function() {
  "use strict";

  // A utility function to convert CSS property names from kebab-case to camelCase.
  // This helps in accessing JavaScript style properties from CSS names.
  var _cssPropToCamel = function() {
    var hyphenMatcher = /\-([a-z])/g; // Regex to find hyphens followed by a lowercase letter
    var uppercaseReplacer = function(match, charGroup) {
      return charGroup.toUpperCase(); // Convert the letter after hyphen to uppercase
    };
    return function(propStr) {
      if (!propStr || typeof propStr !== "string") {
        return ""; // Return empty string for invalid input
      }
      return propStr.replace(hyphenMatcher, uppercaseReplacer);
    };
  }();

  // Retrieves the computed style value for a given element and property.
  // Handles cross-browser differences for computed styles and current styles.
  var _obtainElementStyle = function(domElement, styleProperty) {
    var computedValue, camelCaseProp;
    if (!domElement || !styleProperty) {
      return null;
    }

    // Modern browsers use window.getComputedStyle
    if (window.getComputedStyle) {
      var computedStyle = window.getComputedStyle(domElement, null);
      if (computedStyle) {
        computedValue = computedStyle.getPropertyValue(styleProperty);
      }
    } else if (domElement.currentStyle) { // IE < 9 uses currentStyle
      camelCaseProp = _cssPropToCamel(styleProperty);
      computedValue = domElement.currentStyle[camelCaseProp];
    } else { // Fallback to inline style
      camelCaseProp = _cssPropToCamel(styleProperty);
      computedValue = domElement.style[camelCaseProp];
    }

    // Special handling for the 'cursor' property to ensure 'pointer' is returned for clickable elements
    if (styleProperty === "cursor" && (!computedValue || computedValue === "auto")) {
      var elementTag = domElement.tagName.toLowerCase();
      var interactiveTags = { "a": true, "button": true }; // Common tags that imply pointer cursor
      if (interactiveTags[elementTag]) {
        return "pointer";
      }
    }
    return computedValue;
  };

  // Handles the mouseover event on an element, setting it as the current target for the clipboard.
  var _handleMouseHover = function(eventObj) {
    var activeClipboardInstance = ClipboardManager.prototype._activeInstance;
    if (!activeClipboardInstance) {
      return; // No active instance, do nothing
    }

    var eventToUse = eventObj || window.event; // Normalize event object
    var eventTarget;

    // Determine the event target element
    if (this !== window) {
      eventTarget = this;
    } else if (eventToUse && eventToUse.target) {
      eventTarget = eventToUse.target;
    } else if (eventToUse && eventToUse.srcElement) {
      eventTarget = eventToUse.srcElement;
    }

    // Only proceed if a valid target is found
    if (eventTarget) {
      activeClipboardInstance.activateTarget(eventTarget);
    }
  };

  // Attaches an event listener to a DOM element, handling cross-browser differences.
  var _attachDomEvent = function(targetElement, eventType, handlerFunction) {
    if (!targetElement || !eventType || !handlerFunction) {
      return false; // Invalid input
    }
    if (targetElement.addEventListener) {
      targetElement.addEventListener(eventType, handlerFunction, false);
    } else if (targetElement.attachEvent) {
      targetElement.attachEvent("on" + eventType, handlerFunction);
    } else {
      return false; // Could not attach event
    }
    return true;
  };

  // Removes an event listener from a DOM element, handling cross-browser differences.
  var _detachDomEvent = function(targetElement, eventType, handlerFunction) {
    if (!targetElement || !eventType || !handlerFunction) {
      return false; // Invalid input
    }
    if (targetElement.removeEventListener) {
      targetElement.removeEventListener(eventType, handlerFunction, false);
    } else if (targetElement.detachEvent) {
      targetElement.detachEvent("on" + eventType, handlerFunction);
    } else {
      return false; // Could not detach event
    }
    return true;
  };

  // Adds one or more CSS classes to a DOM element.
  var _applyCssClasses = function(domElement, classNamesToAdd) {
    if (!domElement || domElement.nodeType !== 1) {
      return domElement; // Not a valid element
    }
    if (!classNamesToAdd || typeof classNamesToAdd !== "string" || classNamesToAdd.trim() === "") {
      return domElement; // No classes to add
    }

    var classArray = classNamesToAdd.trim().split(/\s+/);
    var currentClass = " " + domElement.className + " ";
    var newClass = domElement.className;

    for (var k = 0, len = classArray.length; k < len; k++) {
      var className = classArray[k];
      if (currentClass.indexOf(" " + className + " ") === -1) {
        newClass += (newClass ? " " : "") + className;
      }
    }
    domElement.className = newClass.trim();
    return domElement;
  };

  // Removes one or more CSS classes from a DOM element.
  var _stripCssClasses = function(domElement, classNamesToRemove) {
    if (!domElement || domElement.nodeType !== 1 || !domElement.className) {
      return domElement; // Not a valid element or no classes to remove
    }

    var currentClasses = domElement.className.trim();
    if (!currentClasses) {
      return domElement;
    }

    if (!classNamesToRemove || typeof classNamesToRemove !== "string") {
      // If no specific classes are provided, clear all classes
      domElement.className = "";
      return domElement;
    }

    var classArray = classNamesToRemove.trim().split(/\s+/);
    var updatedClasses = " " + currentClasses.replace(/[\n\t]/g, " ") + " "; // Normalize whitespace

    for (var m = 0, count = classArray.length; m < count; m++) {
      var className = classArray[m];
      updatedClasses = updatedClasses.replace(" " + className + " ", " ");
    }
    domElement.className = updatedClasses.trim();
    return domElement;
  };

  // Calculates the browser's zoom factor.
  var _determineBrowserZoom = function() {
    var bodyRect, bodyPhysicalWidth, bodyLogicalWidth, currentZoom = 1.0;
    if (typeof document.body.getBoundingClientRect === "function") {
      bodyRect = document.body.getBoundingClientRect();
      bodyPhysicalWidth = bodyRect.right - bodyRect.left;
      bodyLogicalWidth = document.body.offsetWidth;
      if (bodyLogicalWidth > 0) { // Avoid division by zero
        currentZoom = parseFloat((bodyPhysicalWidth / bodyLogicalWidth).toFixed(2));
      }
    }
    return currentZoom;
  };

  // Gets the absolute position and dimensions of a DOM element relative to the document.
  var _getElementAbsolutePosition = function(targetElement) {
    var elementInfo = {
      left: 0,
      top: 0,
      width: 0,
      height: 0,
      zIndex: 999999999 // Default high z-index
    };
    if (!targetElement || !targetElement.getBoundingClientRect) {
      return elementInfo; // Return default if element is invalid
    }

    var zIndexStyle = _obtainElementStyle(targetElement, "z-index");
    if (zIndexStyle && zIndexStyle !== "auto") {
      elementInfo.zIndex = parseInt(zIndexStyle, 10);
    }

    var boundingBox = targetElement.getBoundingClientRect();
    var scrollXOffset, scrollYOffset, zoomLevel;

    // Determine scroll offsets, accounting for browser differences and zoom
    if (typeof window.pageXOffset === "number" && typeof window.pageYOffset === "number") {
      scrollXOffset = window.pageXOffset;
      scrollYOffset = window.pageYOffset;
    } else {
      zoomLevel = _determineBrowserZoom();
      scrollXOffset = Math.round(document.documentElement.scrollLeft / zoomLevel);
      scrollYOffset = Math.round(document.documentElement.scrollTop / zoomLevel);
    }

    var docClientLeft = document.documentElement.clientLeft || 0;
    var docClientTop = document.documentElement.clientTop || 0;

    elementInfo.left = boundingBox.left + scrollXOffset - docClientLeft;
    elementInfo.top = boundingBox.top + scrollYOffset - docClientTop;
    elementInfo.width = "width" in boundingBox ? boundingBox.width : boundingBox.right - boundingBox.left;
    elementInfo.height = "height" in boundingBox ? boundingBox.height : boundingBox.bottom - boundingBox.top;

    return elementInfo;
  };

  // Generates a cache-busting string for URLs.
  var _createCacheBuster = function(resourcePath) {
    var activeClient = ClipboardManager.prototype._activeInstance;
    if (activeClient && activeClient.options.useNoCache === true) {
      var separator = resourcePath.indexOf("?") >= 0 ? "&" : "?";
      return separator + "nocache=" + new Date().getTime();
    } else {
      return "";
    }
  };

  // Formats options into a URL-encoded query string for FlashVars.
  var _generateFlashVars = function(configOptions) {
    var paramStrings = [];
    if (!configOptions) {
      return "";
    }

    // Handle trusted domains
    if (configOptions.trustedDomains) {
      var domainsList;
      if (typeof configOptions.trustedDomains === "string" && configOptions.trustedDomains.length > 0) {
        domainsList = [ configOptions.trustedDomains ];
      } else if (Array.isArray(configOptions.trustedDomains) && configOptions.trustedDomains.length > 0) {
        domainsList = configOptions.trustedDomains;
      }
      if (domainsList && domainsList.length > 0) {
        paramStrings.push("trustedDomain=" + encodeURIComponent(domainsList.join(",")));
      }
    }

    // Handle module IDs for AMD/CJS
    if (typeof configOptions.amdModuleId === "string" && configOptions.amdModuleId.length > 0) {
      paramStrings.push("amdModuleId=" + encodeURIComponent(configOptions.amdModuleId));
    }
    if (typeof configOptions.cjsModuleId === "string" && configOptions.cjsModuleId.length > 0) {
      paramStrings.push("cjsModuleId=" + encodeURIComponent(configOptions.cjsModuleId));
    }
    return paramStrings.join("&");
  };

  // Checks if an element exists in an array and returns its index.
  var _searchInArray = function(item, targetArray) {
    if (!targetArray || !Array.isArray(targetArray)) {
      return -1;
    }
    // Prefer native indexOf for performance
    if (targetArray.indexOf) {
      return targetArray.indexOf(item);
    }
    // Fallback for older browsers
    var arrayLength = targetArray.length;
    for (var i = 0; i < arrayLength; i++) {
      if (targetArray[i] === item) {
        return i;
      }
    }
    return -1;
  };

  // Ensures the input `elements` is an array of DOM elements.
  var _normalizeInputElements = function(inputElements) {
    if (typeof inputElements === "string") {
      throw new TypeError("ClipboardManager does not accept CSS selectors directly. Provide DOM elements or an array of them.");
    }
    if (inputElements === null || typeof inputElements === "undefined") {
      return []; // Return an empty array for null/undefined input
    }
    if (!inputElements.length && inputElements.nodeType === 1) { // Single DOM element
      return [ inputElements ];
    }
    if (Array.isArray(inputElements) || (inputElements.length && typeof inputElements.length === "number")) {
      // Assume it's an array-like object (NodeList, HTMLCollection, etc.)
      return Array.prototype.slice.call(inputElements); // Convert to true array
    }
    return [ inputElements ]; // Wrap anything else in an array
  };

  // Dispatches a callback function, optionally asynchronously.
  var _safelyExecuteCallback = function(callbackFn, contextElement, instanceRef, callbackArgs, isAsync) {
    if (typeof callbackFn !== "function") {
      return; // Only execute functions
    }
    if (isAsync) {
      window.setTimeout(function() {
        callbackFn.call(contextElement, instanceRef, callbackArgs);
      }, 0);
    } else {
      callbackFn.call(contextElement, instanceRef, callbackArgs);
    }
  };

  // The main constructor for the ClipboardManager.
  var ClipboardManager = function(elementsToBind, optionsConfig) {
    // If an instance already exists, return it. This implements a singleton pattern.
    if (ClipboardManager.prototype._activeInstance) {
      // If elements are provided, bind them to the existing singleton.
      if (elementsToBind) {
        ClipboardManager.prototype._activeInstance.bindElements(elementsToBind);
      }
      return ClipboardManager.prototype._activeInstance;
    }

    ClipboardManager.prototype._activeInstance = this; // Set this instance as the singleton

    // Initialize options by merging defaults with provided options.
    this.options = {};
    for (var defaultKey in _globalConfigDefaults) {
      if (_globalConfigDefaults.hasOwnProperty(defaultKey)) {
        this.options[defaultKey] = _globalConfigDefaults[defaultKey];
      }
    }
    for (var optionKey in optionsConfig) {
      if (optionsConfig.hasOwnProperty(optionKey)) {
        this.options[optionKey] = optionsConfig[optionKey];
      }
    }

    this.eventHandlers = {}; // Stores registered event handlers.

    // If elements are provided during construction, bind them.
    if (elementsToBind) {
      this.bindElements(elementsToBind);
    }

    // Initialize the Flash bridge if Flash is detected.
    if (ClipboardManager.hasFlashCapability()) {
      _initializeFlashBridge();
    } else {
      // If no flash, dispatch noflash event immediately
      this.processFlashEvent("onNoFlash", null);
    }
  };

  // Private variables for the singleton instance state
  var activeTargetElement = null; // The currently hovered element
  var managedElementsList = []; // List of elements currently managed by the clipboard instance

  // Sets the currently active DOM element for clipboard operations.
  ClipboardManager.prototype.activateTarget = function(domElement) {
    if (!domElement) {
      return;
    }
    // If the element is already the active target, no need to update.
    if (activeTargetElement === domElement) {
      return;
    }
    activeTargetElement = domElement; // Update the active target
    this.alignBridge(); // Reposition the Flash bridge over the new target

    var elementTitle = domElement.getAttribute("title");
    if (elementTitle) {
      this.setBridgeTitle(elementTitle);
    }

    var usePointerCursor = this.options.forceHandCursor === true || _obtainElementStyle(domElement, "cursor") === "pointer";
    _updateFlashCursor.call(this, usePointerCursor); // Update Flash cursor style
  };

  // Sets the text data to be copied to the clipboard.
  ClipboardManager.prototype.setDataPayload = function(newTextContent) {
    if (typeof newTextContent === "string" && newTextContent.length > 0) {
      this.options.text = newTextContent;
      if (this.isBridgeReady()) {
        this.flashBridge.setText(newTextContent);
      }
    }
  };

  // Sets the title attribute of the Flash bridge element.
  ClipboardManager.prototype.setBridgeTitle = function(newTitle) {
    if (typeof newTitle === "string" && newTitle.length > 0) {
      this.htmlBridgeContainer.setAttribute("title", newTitle);
    }
  };

  // Adjusts the size of the Flash bridge to match the target element.
  ClipboardManager.prototype.adjustBridgeSize = function(widthPx, heightPx) {
    if (this.isBridgeReady()) {
      this.flashBridge.setSize(widthPx, heightPx);
    }
  };

  // Controls whether the Flash movie displays a hand cursor.
  ClipboardManager.prototype.controlCursorStyle = function(enableHandCursor) {
    var shouldBeEnabled = !!enableHandCursor; // Ensure boolean
    _updateFlashCursor.call(this, shouldBeEnabled);
    this.options.forceHandCursor = shouldBeEnabled;
  };

  // Internal helper to tell the Flash movie to set its cursor.
  var _updateFlashCursor = function(enabledFlag) {
    if (this.isBridgeReady()) {
      this.flashBridge.setHandCursor(enabledFlag);
    }
  };

  // Version information for the ClipboardManager library.
  ClipboardManager.versionInfo = "1.2.0-beta.4-clone";

  // Default configuration options.
  var _globalConfigDefaults = {
    flashMoviePath: "ZeroClipboard.swf",
    trustedDomains: null, // Can be a string or array of domains
    textData: null, // Default text to copy
    hoverCssClass: "clipboard-hover-state",
    activeCssClass: "clipboard-active-state",
    flashAccessPolicy: "sameDomain", // allowScriptAccess
    disableCache: true, // useNoCache
    forceHandCursor: false // forceHandCursor
  };

  // Allows users to override default configuration options.
  ClipboardManager.configureDefaults = function(newOptions) {
    if (typeof newOptions !== "object" || newOptions === null) {
      return;
    }
    for (var key in newOptions) {
      if (newOptions.hasOwnProperty(key)) {
        _globalConfigDefaults[key] = newOptions[key];
      }
    }
  };

  // Destroys the singleton ClipboardManager instance and removes the Flash bridge.
  ClipboardManager.disposeInstance = function() {
    var currentInstance = ClipboardManager.prototype._activeInstance;
    if (!currentInstance) {
      return;
    }

    // Unglue all managed elements
    currentInstance.unbindElements(managedElementsList);

    // Remove the Flash bridge container from the DOM
    var bridgeElement = currentInstance.htmlBridgeContainer;
    if (bridgeElement && bridgeElement.parentNode) {
      bridgeElement.parentNode.removeChild(bridgeElement);
    }

    // Clean up singleton reference
    delete ClipboardManager.prototype._activeInstance;
  };

  // Detects if Adobe Flash Player is installed and enabled.
  ClipboardManager.hasFlashCapability = function() {
    var flashDetected = false;
    // Check for ActiveXObject (IE)
    if (typeof ActiveXObject === "function") {
      try {
        if (new ActiveXObject("ShockwaveFlash.ShockwaveFlash")) {
          flashDetected = true;
        }
      } catch (e) { /* Swallowing error, likely not installed */ }
    }
    // Check for navigator.mimeTypes (non-IE)
    if (!flashDetected && navigator.mimeTypes && navigator.mimeTypes["application/x-shockwave-flash"]) {
      flashDetected = true;
    }
    return flashDetected;
  };

  // Private variables for module loaders
  var _amdLoaderId = null;
  var _cjsLoaderId = null;

  // Initializes and embeds the invisible Flash movie into the DOM.
  var _initializeFlashBridge = function() {
    var currentClient = ClipboardManager.prototype._activeInstance;
    var bridgeContainer = document.getElementById("global-clipboard-html-wrapper");

    // Create the Flash bridge if it doesn't exist
    if (!bridgeContainer) {
      var clientOpts = {};
      // Clone options to avoid modifying the original
      for (var optKey in currentClient.options) {
        if (currentClient.options.hasOwnProperty(optKey)) {
          clientOpts[optKey] = currentClient.options[optKey];
        }
      }
      clientOpts.amdModuleId = _amdLoaderId;
      clientOpts.cjsModuleId = _cjsLoaderId;

      var flashParameters = _generateFlashVars(clientOpts);
      var movieUrl = currentClient.options.flashMoviePath + _createCacheBuster(currentClient.options.flashMoviePath);

      // Construct the HTML for the Flash object/embed
      var flashHtmlContent = [
        '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" id="global-clipboard-flash-object" width="100%" height="100%">',
        '  <param name="movie" value="' + movieUrl + '"/>',
        '  <param name="allowScriptAccess" value="' + currentClient.options.flashAccessPolicy + '"/>',
        '  <param name="scale" value="exactfit"/>',
        '  <param name="loop" value="false"/>',
        '  <param name="menu" value="false"/>',
        '  <param name="quality" value="high" />', // Changed from 'best' to 'high'
        '  <param name="bgcolor" value="#ffffff"/>',
        '  <param name="wmode" value="transparent"/>',
        '  <param name="flashvars" value="' + flashParameters + '"/>',
        '  <embed src="' + movieUrl + '"',
        '    loop="false" menu="false"',
        '    quality="high" bgcolor="#ffffff"', // Changed from 'best' to 'high'
        '    width="100%" height="100%"',
        '    name="global-clipboard-flash-embed"', // Changed name
        '    id="global-clipboard-flash-embed"', // Added ID for embed
        '    allowScriptAccess="always"',
        '    allowFullScreen="false"',
        '    type="application/x-shockwave-flash"',
        '    wmode="transparent"',
        '    pluginspage="http://www.macromedia.com/go/getflashplayer"',
        '    flashvars="' + flashParameters + '"',
        '    scale="exactfit">',
        '  </embed>',
        '</object>'
      ].join("\n");

      bridgeContainer = document.createElement("div");
      bridgeContainer.id = "global-clipboard-html-wrapper"; // Changed ID
      bridgeContainer.className = "global-clipboard-overlay-container"; // Changed class
      bridgeContainer.setAttribute("data-clipboard-initialized", "false"); // Changed attribute name
      bridgeContainer.style.position = "absolute";
      bridgeContainer.style.left = "-99999px"; // Increased offset
      bridgeContainer.style.top = "-99999px"; // Increased offset
      bridgeContainer.style.width = "1px"; // Made smaller
      bridgeContainer.style.height = "1px"; // Made smaller
      bridgeContainer.style.zIndex = "99999"; // Increased z-index
      bridgeContainer.style.overflow = "hidden"; // Added overflow hidden
      bridgeContainer.innerHTML = flashHtmlContent;

      document.body.appendChild(bridgeContainer);
    }

    currentClient.htmlBridgeContainer = bridgeContainer;
    // Access the actual Flash movie object. IE uses document.id, others use children.
    currentClient.flashBridge = document["global-clipboard-flash-object"] || bridgeContainer.querySelector("#global-clipboard-flash-embed");
  };

  // Resets the position and attributes of the Flash bridge.
  ClipboardManager.prototype.resetBridgeState = function() {
    if (!this.htmlBridgeContainer) {
      return;
    }
    this.htmlBridgeContainer.style.left = "-99999px";
    this.htmlBridgeContainer.style.top = "-99999px";
    this.htmlBridgeContainer.removeAttribute("title");
    this.htmlBridgeContainer.removeAttribute("data-clipboard-text"); // Original attribute name
    this.htmlBridgeContainer.setAttribute("data-clipboard-initialized", "false"); // Reset ready state

    // Remove active class from the previously active element
    if (activeTargetElement) {
      _stripCssClasses(activeTargetElement, this.options.activeCssClass);
    }
    activeTargetElement = null; // Clear active target
    this.options.textData = null; // Clear stored text
  };

  // Checks if the Flash bridge is ready for interaction.
  ClipboardManager.prototype.isBridgeReady = function() {
    if (!this.htmlBridgeContainer) {
      return false;
    }
    var readyStatus = this.htmlBridgeContainer.getAttribute("data-clipboard-initialized");
    return readyStatus === "true";
  };

  // Repositions the Flash bridge to cover the currently active element.
  ClipboardManager.prototype.alignBridge = function() {
    if (!activeTargetElement || !this.htmlBridgeContainer) {
      return false; // No active element or bridge not initialized
    }
    var targetGeometry = _getElementAbsolutePosition(activeTargetElement);

    // Apply new position and dimensions to the HTML container
    this.htmlBridgeContainer.style.top = targetGeometry.top + "px";
    this.htmlBridgeContainer.style.left = targetGeometry.left + "px";
    this.htmlBridgeContainer.style.width = targetGeometry.width + "px";
    this.htmlBridgeContainer.style.height = targetGeometry.height + "px";
    this.htmlBridgeContainer.style.zIndex = (targetGeometry.zIndex + 1).toString(); // Ensure z-index is above target

    // Inform the Flash movie of its new size
    this.adjustBridgeSize(targetGeometry.width, targetGeometry.height);
  };

  // Static method for Flash to dispatch events back to JavaScript.
  ClipboardManager.receiveGlobalEvent = function(eventType, eventArguments) {
    var activeInstance = ClipboardManager.prototype._activeInstance;
    if (activeInstance) {
      activeInstance.processFlashEvent(eventType, eventArguments);
    }
  };

  // Registers an event handler for a specific event type.
  ClipboardManager.prototype.registerEvent = function(eventNames, handlerFunc) {
    if (typeof handlerFunc !== "function" && typeof handlerFunc !== "string") {
      console.warn("ClipboardManager: Event handler must be a function or a string referring to a global function.");
      return;
    }

    var namesArray = eventNames.toString().split(/\s/g);
    for (var i = 0; i < namesArray.length; i++) {
      var normalizedName = namesArray[i].toLowerCase().replace(/^on/, "");
      // Only store the handler if one isn't already present for this event
      if (!this.eventHandlers[normalizedName]) {
        this.eventHandlers[normalizedName] = handlerFunc;
      }
    }

    // If 'noflash' event is registered and Flash is not detected, dispatch it immediately.
    if (this.eventHandlers.noflash && !ClipboardManager.hasFlashCapability()) {
      this.processFlashEvent("onNoFlash", null);
    }
  };

  // Alias for registerEvent.
  ClipboardManager.prototype.attachEventObserver = ClipboardManager.prototype.registerEvent;

  // Unregisters an event handler.
  ClipboardManager.prototype.unregisterEvent = function(eventNames, handlerFunc) {
    var namesArray = eventNames.toString().split(/\s/g);
    for (var j = 0; j < namesArray.length; j++) {
      var normalizedName = namesArray[j].toLowerCase().replace(/^on/, "");
      // Iterate through stored handlers to find and remove the specific one
      for (var storedEvent in this.eventHandlers) {
        if (this.eventHandlers.hasOwnProperty(storedEvent) && storedEvent === normalizedName && this.eventHandlers[storedEvent] === handlerFunc) {
          delete this.eventHandlers[storedEvent];
        }
      }
    }
  };

  // Alias for unregisterEvent.
  ClipboardManager.prototype.detachEventObserver = ClipboardManager.prototype.unregisterEvent;

  // Processes events received from the Flash movie.
  ClipboardManager.prototype.processFlashEvent = function(eventName, eventData) {
    var cleanEventName = eventName.toString().toLowerCase().replace(/^on/, "");
    var targetDomElement = activeTargetElement;
    var executeHandlerAsynchronously = true; // Default to async execution

    switch (cleanEventName) {
      case "load":
        // Check Flash version requirement (e.g., 10.0.0 for ZeroClipboard)
        if (eventData && eventData.flashVersion) {
          var flashVer = parseFloat(eventData.flashVersion.replace(/,/g, ".").replace(/[^0-9\.]/gi, ""));
          if (flashVer < 10) {
            this.processFlashEvent("onWrongFlash", { flashVersion: eventData.flashVersion });
            return;
          }
        }
        this.htmlBridgeContainer.setAttribute("data-clipboard-initialized", "true"); // Mark bridge as ready
        break;

      case "mouseover":
        if (targetDomElement) {
          _applyCssClasses(targetDomElement, this.options.hoverCssClass);
        }
        break;

      case "mouseout":
        if (targetDomElement) {
          _stripCssClasses(targetDomElement, this.options.hoverCssClass);
        }
        this.resetBridgeState(); // Reset bridge position and state
        break;

      case "mousedown":
        if (targetDomElement) {
          _applyCssClasses(targetDomElement, this.options.activeCssClass);
        }
        break;

      case "mouseup":
        if (targetDomElement) {
          _stripCssClasses(targetDomElement, this.options.activeCssClass);
        }
        break;

      case "datarequested":
        var customTargetId = targetDomElement ? targetDomElement.getAttribute("data-clipboard-target") : null;
        var sourceElement = null;
        if (customTargetId) {
          sourceElement = document.getElementById(customTargetId);
        }

        var textContentToCopy = "";
        if (sourceElement) {
          // Prioritize value for input/textarea, then textContent, then innerText
          textContentToCopy = sourceElement.value || sourceElement.textContent || sourceElement.innerText;
        } else if (targetDomElement) {
          // Fallback to data-clipboard-text on the active target element
          textContentToCopy = targetDomElement.getAttribute("data-clipboard-text");
        }

        if (textContentToCopy) {
          this.setDataPayload(textContentToCopy);
        }
        executeHandlerAsynchronously = false; // Data request usually needs immediate text setting
        break;

      case "complete":
        // Clear the stored text after a successful copy operation
        this.options.textData = null;
        break;

      case "noflash":
        // This event is dispatched internally if Flash is not detected.
        // No additional state changes are needed here.
        break;

      default:
        // Unknown event, perhaps log for debugging
        // console.log("ClipboardManager: Unhandled Flash event:", cleanEventName);
        break;
    }

    // Execute the registered handler for the event
    var handlerToExecute = this.eventHandlers[cleanEventName];
    if (handlerToExecute) {
      // If handler is a string, try to resolve it as a global function
      if (typeof handlerToExecute === "string" && typeof window[handlerToExecute] === "function") {
        handlerToExecute = window[handlerToExecute];
      }
      _safelyExecuteCallback(handlerToExecute, targetDomElement, this, eventData, executeHandlerAsynchronously);
    }
  };

  // Binds a collection of DOM elements to the clipboard manager.
  // When hovered, these elements will become the active target.
  ClipboardManager.prototype.bindElements = function(elementsToManage) {
    var normalizedElements = _normalizeInputElements(elementsToManage);
    if (normalizedElements.length === 0) {
      return;
    }

    for (var k = 0; k < normalizedElements.length; k++) {
      var currentElement = normalizedElements[k];
      // Only add if not already managed
      if (_searchInArray(currentElement, managedElementsList) === -1) {
        managedElementsList.push(currentElement);
        _attachDomEvent(currentElement, "mouseover", _handleMouseHover);
      }
    }
  };

  // Unbinds a collection of DOM elements from the clipboard manager.
  ClipboardManager.prototype.unbindElements = function(elementsToRelease) {
    var normalizedElements = _normalizeInputElements(elementsToRelease);
    if (normalizedElements.length === 0) {
      return;
    }

    for (var j = 0; j < normalizedElements.length; j++) {
      var currentElement = normalizedElements[j];
      _detachDomEvent(currentElement, "mouseover", _handleMouseHover); // Remove event listener

      var elementIndex = _searchInArray(currentElement, managedElementsList);
      if (elementIndex !== -1) {
        managedElementsList.splice(elementIndex, 1); // Remove from managed list
      }
    }
  };

  // Module export logic (AMD, CommonJS, or global window object)
  if (typeof define === "function" && define.amd) {
    // AMD support
    define([ "require", "exports", "module" ], function(req, exp, mod) {
      _amdLoaderId = mod && mod.id || null;
      return ClipboardManager;
    });
  } else if (typeof module !== "undefined" && module && typeof module.exports !== "undefined") {
    // CommonJS support
    _cjsLoaderId = module.id || null;
    module.exports = ClipboardManager;
  } else {
    // Global exposure
    window.ClipboardManager = ClipboardManager;
  }

})();