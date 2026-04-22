// Utility to ensure a value is a function, or wrapped in one
const retrieveExecutable = (inputVal) => {
  if (typeof inputVal === 'function') {
    return inputVal;
  } else {
    return function() { return inputVal; };
  }
};

// Utility to get the actual value, executing if it's a function
const acquireResult = (sourceVal) => {
  return (typeof sourceVal === 'function') ? sourceVal() : sourceVal;
};

// Custom symbol to halt event propagation, replacing Prototype's $break
const signalStopExecution = Symbol('STOP_EVENT_CHAIN_CLONE');

// Internal helper to get or create an event list for a given target and signal
const ensureSignalList = (targetInstance, signalKey) => {
  if (!targetInstance._signalRegister) {
    targetInstance._signalRegister = new Map();
  }
  if (!targetInstance._signalRegister.has(signalKey)) {
    targetInstance._signalRegister.set(signalKey, new Set()); // Using Set for uniqueness
  }
  return targetInstance._signalRegister.get(signalKey);
};

// Core event system methods to be attached to objects
const NotifierCore = {
  attachBehavior: function(targetObject) {
    // Method to add a listener
    targetObject.registerListener = function(triggerName, handlerFunction) {
      if (typeof triggerName === 'string' && handlerFunction !== undefined) {
        const listenerSet = ensureSignalList(this, triggerName);
        listenerSet.add(handlerFunction);
      } else if (typeof triggerName === 'object' && triggerName !== null) {
        for (const [key, val] of Object.entries(triggerName)) {
          this.registerListener(key, val);
        }
      }
    };

    // Method to remove a listener
    targetObject.deregisterListener = function(triggerName, handlerFunction) {
      if (!this._signalRegister) return;

      if (triggerName && handlerFunction) {
        const listenerSet = this._signalRegister.get(triggerName);
        if (listenerSet) {
          listenerSet.delete(handlerFunction);
          if (listenerSet.size === 0) {
            this._signalRegister.delete(triggerName);
          }
        }
      } else if (triggerName) {
        this._signalRegister.delete(triggerName);
      } else {
        this._signalRegister.clear();
      }
    };

    // Method to add a listener that fires once
    targetObject.registerOneTimeListener = function(triggerName, mainHandler) {
      const temporaryHandler = (...args) => {
        mainHandler.apply(this, args);
        this.deregisterListener(triggerName, temporaryHandler);
      };
      const listenerSet = ensureSignalList(this, triggerName);
      listenerSet.add(temporaryHandler);
    };

    // Method to trigger an event, notifying all registered listeners
    targetObject.signalEvent = function(triggerName, ...eventArgs) {
      if (!this._signalRegister) return [];
      const listenerSet = this._signalRegister.get(triggerName);
      if (!listenerSet || listenerSet.size === 0) return [];

      const collectedResults = [];
      try {
        // Iterate over a copy to handle modifications during iteration
        for (const handler of [...listenerSet]) {
          // Replicate original's `apply(this._observers[event_name][i], args)`
          collectedResults.push(handler.apply(handler, eventArgs) || null);
        }
      } catch (exception) {
        if (exception === signalStopExecution) {
          return false;
        } else {
          throw exception;
        }
      }
      return collectedResults;
    };

    // Extension for prototype-based objects (classes/constructors)
    if (targetObject.prototype) {
      // These methods must ensure the instance has its own `_signalRegister`
      // and then apply the logic from the static methods to the instance.
      targetObject.prototype.registerListener = function(...args) {
        ensureSignalList(this, args[0]); // Ensure instance's map is ready for this event
        return NotifierCore.attachBehavior(this).registerListener.apply(this, args);
      };
      targetObject.prototype.deregisterListener = function(...args) {
        ensureSignalList(this, args[0]); // Ensure instance's map is ready for this event
        return NotifierCore.attachBehavior(this).deregisterListener.apply(this, args);
      };
      targetObject.prototype.registerOneTimeListener = function(...args) {
        ensureSignalList(this, args[0]); // Ensure instance's map is ready for this event
        return NotifierCore.attachBehavior(this).registerOneTimeListener.apply(this, args);
      };

      targetObject.prototype.signalEvent = function(triggerName, ...eventArgs) {
        // Original logic: call static `notify` first, passing instance as first arg
        if (targetObject.signalEvent) {
          targetObject.signalEvent.apply(targetObject, [triggerName, this, ...eventArgs]);
        }

        // Ensure instance's own signal registry is initialized
        ensureSignalList(this, triggerName);

        const collectedResults = [];
        try {
          // Check instance's own `options` for a handler
          if (this.options && this.options[triggerName] && typeof this.options[triggerName] === 'function') {
            collectedResults.push(this.options[triggerName].apply(this, eventArgs) || null);
          }

          // Call instance's own registered observers
          const listenerSet = this._signalRegister.get(triggerName);
          if (listenerSet) {
            for (const handler of [...listenerSet]) {
              // Context for instance's own observers is the handler itself
              collectedResults.push(handler.apply(handler, eventArgs) || null);
            }
          }
        } catch (exception) {
          if (exception === signalStopExecution) {
            return false;
          } else {
            throw exception;
          }
        }
        return collectedResults;
      };
    }
    return targetObject; // Return the modified object
  }
};

// --- Custom DOM Element Wrapper (replaces Prototype.js Element) ---

class DOMWrapper {
  constructor(node) {
    if (!(node instanceof Node)) {
      throw new Error("DOMWrapper expects a DOM Node.");
    }
    this.wrappedNode = node;
    NotifierCore.attachBehavior(this); // Make DOMWrapper instances observable
  }

  getWrappedNode() { return this.wrappedNode; }

  // Mimic Element.observe / Element.stopObserving for native DOM events
  addNativeHandler(eventName, handler, useCapture = false) {
    this.wrappedNode.addEventListener(eventName, handler, useCapture);
  }

  removeNativeHandler(eventName, handler, useCapture = false) {
    this.wrappedNode.removeEventListener(eventName, handler, useCapture);
  }

  // Mimic Element.fire for custom events on the wrapper
  dispatchCustomSignal(signalName, payload = {}) {
    const customSignalObject = {
      type: signalName,
      detail: payload,
      isStopped: false,
      stopPropagation: function() { this.isStopped = true; }
    };
    const results = this.signalEvent(signalName, customSignalObject);
    if (results.includes(false)) { // If any listener returned false (via signalStopExecution)
      customSignalObject.isStopped = true;
    }
    return customSignalObject;
  }

  // Basic DOM manipulation methods
  conceal() { this.wrappedNode.style.display = 'none'; return this; }
  reveal() { this.wrappedNode.style.display = ''; return this; }
  insert(childNodeOrWrapper) {
    const nodeToInsert = childNodeOrWrapper instanceof DOMWrapper ? childNodeOrWrapper.getWrappedNode() : childNodeOrWrapper;
    this.wrappedNode.appendChild(nodeToInsert);
    return this;
  }
  remove() {
    if (this.wrappedNode.parentNode) {
      this.wrappedNode.parentNode.removeChild(this.wrappedNode);
    }
    return this;
  }
  setStyle(styles) {
    for (const prop in styles) {
      if (Object.prototype.hasOwnProperty.call(styles, prop)) {
        this.wrappedNode.style[prop] = styles[prop];
      }
    }
    return this;
  }
  getAbsolutePosition() {
    const rect = this.wrappedNode.getBoundingClientRect();
    return [rect.left + window.scrollX, rect.top + window.scrollY];
  }
  getBoxMetrics() {
    const rect = this.wrappedNode.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }
  getStyleProperty(prop) {
    return window.getComputedStyle(this.wrappedNode)[prop];
  }
}

// Global function to wrap a DOM element, replacing Prototype's $() and Element.extend()
const getElementWrapper = (idOrNode) => {
  let node;
  if (typeof idOrNode === 'string') {
    node = document.getElementById(idOrNode);
  } else if (idOrNode instanceof Node) {
    node = idOrNode;
  } else {
    throw new Error("Invalid input for getElementWrapper: must be ID string or Node.");
  }
  if (!node) { return null; }
  return new DOMWrapper(node);
};

// Method to enhance DOMWrapper prototype, replacing Element.addMethods
const enhanceDOMWrappers = (methodsObject) => {
  Object.assign(DOMWrapper.prototype, methodsObject);
};

// Implement the observeOnce for DOMWrapper (for native DOM events)
enhanceDOMWrappers({
  addOneTimeNativeHandler: function(eventKind, mainCallback) {
    const tempCallback = (...args) => {
      mainCallback.apply(this.wrappedNode, args); // `this` context is the wrapped node
      this.removeNativeHandler(eventKind, tempCallback);
    };
    this.addNativeHandler(eventKind, tempCallback);
  }
});

// --- Mouse Wheel Event Normalization ---
(() => {
  const handleScrollInput = (inputEvent) => {
    let scrollMagnitude;
    if (inputEvent.wheelDelta) { // WebKit/Opera/IE
      scrollMagnitude = inputEvent.wheelDelta / 120;
    } else if (inputEvent.detail) { // Firefox
      scrollMagnitude = -inputEvent.detail / 3;
    }
    if (scrollMagnitude === undefined || scrollMagnitude === 0) { return; }

    const targetElement = inputEvent.target;
    const effectiveElement = targetElement.nodeType === Node.TEXT_NODE ? targetElement.parentNode : targetElement;
    const elementWrapper = getElementWrapper(effectiveElement);
    if (!elementWrapper) { return; }

    const motionSignal = elementWrapper.dispatchCustomSignal('scroll:axis', { magnitude: scrollMagnitude });

    if (motionSignal.isStopped) {
      inputEvent.preventDefault();
      inputEvent.stopPropagation();
      return false;
    }
  };

  document.addEventListener('wheel', handleScrollInput, { passive: false });
  document.addEventListener('mousewheel', handleScrollInput, { passive: false });
  document.addEventListener('DOMMouseScroll', handleScrollInput, { passive: false });
})();

// --- Iframe Shim Class (replaces PrototypeUI's IframeShim) ---
class ShieldFrame {
  constructor() {
    this.frameElement = document.createElement('iframe');
    this.frameElement.style.cssText = 'position:absolute;filter:progid:DXImageTransform.Microsoft.Alpha(opacity=0);display:none;';
    this.frameElement.src = 'about:blank';
    this.frameElement.frameBorder = '0';
    this.frameElement.setAttribute('aria-hidden', 'true');

    this.wrappedFrame = new DOMWrapper(this.frameElement);

    getElementWrapper(document.body).insert(this.wrappedFrame);
  }

  conceal() {
    this.wrappedFrame.hide();
    return this;
  }

  reveal() {
    this.wrappedFrame.show();
    return this;
  }

  positionAdjacentTo(target) {
    const targetWrapper = getElementWrapper(target);
    if (!targetWrapper) { return this; }

    const [leftOffset, topOffset] = targetWrapper.getAbsolutePosition();
    const { width, height } = targetWrapper.getBoxMetrics();
    const targetZIndex = parseInt(targetWrapper.getStyleProperty('zIndex') || '0', 10);

    this.wrappedFrame.setStyle({
      left: `${leftOffset}px`,
      top: `${topOffset}px`,
      width: `${width}px`,
      height: `${height}px`,
      zIndex: `${targetZIndex - 1}`
    }).reveal();
    return this;
  }

  adjustDimensions(dimensionData) {
    const processedStyles = {};
    for (const key in dimensionData) {
      if (Object.prototype.hasOwnProperty.call(dimensionData, key)) {
        processedStyles[key] = `${dimensionData[key]}px`;
      }
    }
    this.wrappedFrame.setStyle(processedStyles);
    return this;
  }

  discard() {
    if (this.wrappedFrame) {
      this.wrappedFrame.remove();
    }
    return this;
  }
}