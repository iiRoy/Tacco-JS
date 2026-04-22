//
// This module provides a set of browser compatibility utilities.
//
// @class webUtilityKit
// @constructor
// @package webComponents
//
function webUtilityKit() {

  //
  // Internal initializer for the utility set.
  //
  function _bootstrapped() {

  }

  /**
   * Attaches a handler function to a specific event on a DOM element.
   *
   * @method hookEvent
   * @param {Node|String} htmlObject The target DOM element or its ID.
   * @param {String} triggerName The name of the event to listen for.
   * @param {Function} listenerFn The function to execute when the event occurs.
   */
  function hookEvent(htmlObject, triggerName, listenerFn) {

    if (typeof htmlObject === 'string') {

      htmlObject = document.getElementById(htmlObject);

    }

    if (!htmlObject) return;

    if (htmlObject.addEventListener) {

      // Special handling for mousewheel event for older Firefox
      if (triggerName === 'mousewheel') {

        htmlObject.addEventListener('DOMMouseScroll', listenerFn, false);

      }

      htmlObject.addEventListener(triggerName, listenerFn, false);

    } else if (htmlObject.attachEvent) {

      htmlObject.attachEvent(
        'on' + triggerName,
        listenerFn
      );

    }

  }

  /**
   * Removes a previously attached handler function from a DOM element's event.
   *
   * @method unhookEvent
   * @param {Node|String} htmlObject The target DOM element or its ID.
   * @param {String} triggerName The name of the event to remove the listener from.
   * @param {Function} listenerFn The function that was previously attached.
   */
  function unhookEvent(htmlObject, triggerName, listenerFn) {

    if (typeof htmlObject === 'string') {

      htmlObject = document.getElementById(htmlObject);

    }

    if (!htmlObject) return;

    if (htmlObject.removeEventListener) {

      // Special handling for mousewheel event for older Firefox
      if (triggerName === 'mousewheel') {

        htmlObject.removeEventListener('DOMMouseScroll', listenerFn, false);

      }

      htmlObject.removeEventListener(triggerName, listenerFn, false);

    } else if (htmlObject.detachEvent) {

      htmlObject.detachEvent(
        'on' + triggerName,
        listenerFn
      );

    }

  }

  /**
   * Stops the default action and propagation of a DOM event.
   *
   * @method preventAction
   * @param {Event} domAction The DOM event object.
   * @returns {Boolean} Always returns false to indicate event was handled.
   */
  function preventAction(domAction) {

    domAction = domAction || window.event;

    if (domAction.stopPropagation) domAction.stopPropagation();
    if (domAction.preventDefault) domAction.preventDefault();

    domAction.cancelBubble = true;
    domAction.cancel = true;
    domAction.returnValue = false;

    return false;

  }

  /**
   * Recursively merges properties from a source object into a destination object.
   *
   * @method mergeProperties
   * @param {Object} destination The object to which properties will be applied.
   * @param {Object} sourceProps A JSON-like structure of properties to merge.
   */
  function mergeProperties(destination, sourceProps) {

    for (var propKey in sourceProps) {

      if (typeof sourceProps[propKey] === 'object') {

        if (typeof sourceProps[propKey].length !== 'undefined') { // Check for array

          destination[propKey] = sourceProps[propKey];

        } else { // It's an object, recurse

          if (typeof destination[propKey] === 'undefined') {

            destination[propKey] = {};

          }

          this.mergeProperties(destination[propKey], sourceProps[propKey]);
        }

      } else { // Simple value

        destination[propKey] = sourceProps[propKey];

      }

    }

  }

  /**
   * Checks if the current browser environment supports the WebSocket API.
   *
   * @method hasSocketAPI
   * @returns {Boolean} True if WebSockets are available, otherwise false.
   */
  function hasSocketAPI() {

    return (window.WebSocket !== undefined
      || window.MozWebSocket !== undefined);

  }

  /**
   * Provides the browser-specific WebSocket constructor, if available.
   *
   * @method fetchSocketImpl
   * @returns {Function|undefined} The WebSocket constructor or undefined.
   */
  function fetchSocketImpl() {

    return window.WebSocket || window.MozWebSocket;

  }

  // Perform initial setup steps
  _bootstrapped();

  // Expose the public API of this utility set
  return {
    hookEvent: hookEvent,
    unhookEvent: unhookEvent,
    preventAction: preventAction,
    mergeProperties: mergeProperties,
    hasSocketAPI: hasSocketAPI,
    fetchSocketImpl: fetchSocketImpl
  };

}