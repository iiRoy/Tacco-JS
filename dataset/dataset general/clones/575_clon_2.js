/*
 * Copyright (c) 2023 [New Author Name]
 *
 * This software is provided under the MIT License.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/* global console:false */

(function(jq, globalObj, domDoc, undefinedVar) {
  'use strict';

  // Collection of internal operational functions
  var utilityFunctions = {
    // Function to append a new notification item
    add: function(config) {
      var generatedItem,
        currentContext = this,
        renderEngine = null;

      // Merge user configuration with default event settings
      config = jq.extend({}, defaultEventSettings, config);

      // Determine the UI framework based on global settings
      if (globalSettings.displayEngine.search(new RegExp('jqueryui', 'i')) === 0) {
        renderEngine = 'jqueryui';
      } else if (globalSettings.displayEngine.search(new RegExp('bootstrap', 'i')) === 0) {
        renderEngine = 'bootstrap';
      } else if (globalSettings.displayEngine.search(new RegExp('foundation', 'i')) === 0) {
        renderEngine = 'foundation';
      } else {
        renderEngine = 'envelope'; // Default custom framework
      }

      // Create the new UI element
      generatedItem = createDisplayItem(renderEngine, config.itemType, config.contentMessage, config.includeDismissButton);

      // Initially hide the element
      generatedItem.hide();

      // Attach an event handler to the document for the specified event name
      jq(domDoc).on(config.eventName, function(eventObj, additionalText) {

        // If there's additional text, append it to the message
        if (additionalText) {
          var messageSpan = generatedItem.find(".message");

          messageSpan.html(
            messageSpan.html() + ' ' + additionalText
          );
        }

        // Add the new element to the DOM
        currentContext.append(generatedItem);

        // Animate the element into view
        generatedItem.fadeIn('slow');

        // Check if the notification should auto-dismiss
        if (config.autoDismiss) {

          var timerHandle = globalObj.setTimeout(function() {
            generatedItem.fadeOut('slow', function() {
              jq(this).remove(); // Remove element after fading out
            });

            globalObj.clearTimeout(timerHandle); // Clear the timeout to prevent issues
          }, globalSettings.dismissDelay);
        }

        // Execute callback if provided and is a function
        if (config.completionCallback && typeof config.completionCallback === 'function') {
          config.completionCallback();
        }
      });

      return this; // Allow for method chaining
    },

    // Function to detach an event handler
    remove: function(eventIdentifier) {
      return jq(domDoc).off(eventIdentifier);
    }
  };

  // Object to store event definitions that the plugin will respond to
  var subscribedEvents = {},
    targetElement, // Reference to the DOM element (currently unused)
    globalSettings; // Global plugin configuration options

  // Default settings for the entire plugin
  var pluginBaseDefaults = {
    displayEngine: 'none', // No specific UI framework by default
    dismissDelay: 5000 // Default auto-close timeout of 5 seconds
  };

  // Default settings for individual event configurations
  var defaultEventSettings = {
    itemType: 'info', // Default type of notification (e.g., info, error, success)
    autoDismiss: false, // Don't auto-close by default
    includeDismissButton: false, // No close button by default
    completionCallback: undefinedVar // No callback by default
  };

  // Configuration objects for different UI frameworks
  var uiComponents = {
    jqueryui: {
      htmlTemplate: '<p><span class="ui-icon" style="float: left; margin-right: .3em;"></span>' + '<span class="message"></span></p>',
      successStyle: 'ui-icon-info',
      errorStyle: 'ui-icon-error',
      infoStyle: 'ui-icon-info',
      dismissButtonHtml: '<a href="#" class="ui-dialog-titlebar-close ui-corner-all" role="button"><span class="ui-icon ui-icon-closethick" style="float: right">close</span></a>',
      targetSelector: 'span:first', // Selector for where to add classes
      attachDismissHandler: function() {
        jq(this).on('click', function() {
          jq(this).parent().parent().fadeOut('slow'); // Fade out grandparent
        });
      }
    },
    bootstrap: {
      htmlTemplate: '<div class="alert"><span class="message"></span></div>',
      successStyle: 'alert-success',
      errorStyle: 'alert-error',
      infoStyle: 'alert-info',
      dismissButtonHtml: '<button class="close" data-dismiss="alert">x</button>',
      targetSelector: null, // No specific selector, apply to main element
      attachDismissHandler: function() {

        jq(this).on('click', function() {
          jq(this).parent().fadeOut('slow'); // Fade out parent
        });
      }
    },
    foundation: {
      htmlTemplate: '<div class="alert-box"><span class="message"></span></div>',
      successStyle: 'success',
      errorStyle: 'alert',
      infoStyle: null, // Foundation might not have a distinct 'info' style
      dismissButtonHtml: '<a class="close">x</a>',
      targetSelector: null,
      attachDismissHandler: function() {

        jq(this).on('click', function() {
          jq(this).parent().fadeOut('slow'); // Fade out parent
        });
      }
    },
    envelope: { // Custom 'envelope' framework
      htmlTemplate: '<div class="env_container"><span class="message">Hello World</span></div>',
      successStyle: 'success',
      errorStyle: 'error',
      infoStyle: null,
      dismissButtonHtml: jq('<div class="close">&times;</div>'), // jQuery object for close button
      targetSelector: null,
      attachDismissHandler: function() {

        jq(this).on('click', function() {
          jq(this).parent().fadeOut('slow'); // Fade out parent
        });
      }
    }
  };


  // Helper function to construct a new alert element based on framework and type
  var createDisplayItem = function(renderEngine, itemType, contentMessage, includeDismissButton) {

    var generatedItem = jq(uiComponents[renderEngine].htmlTemplate),
      targetSelector = uiComponents[renderEngine].targetSelector,
      insertionPoint = null;

    // Determine where to apply classes
    if (targetSelector !== null) {
      insertionPoint = generatedItem.find(targetSelector);
    } else {
      insertionPoint = generatedItem;
    }

    // Apply appropriate class based on message type
    if (itemType === 'error') {

      insertionPoint.addClass(uiComponents[renderEngine].errorStyle);
    } else if (itemType === 'info') {

      if (uiComponents[renderEngine].infoStyle) {
        insertionPoint.addClass(uiComponents[renderEngine].infoStyle);
      }
    } else { // Default to success

      insertionPoint.addClass(uiComponents[renderEngine].successStyle);
    }

    // If a close button is requested, add it
    if (includeDismissButton) {
      var dismissButton = jq(uiComponents[renderEngine].dismissButtonHtml).clone();

      if (uiComponents[renderEngine].attachDismissHandler) {
        uiComponents[renderEngine].attachDismissHandler.call(dismissButton);
      }

      generatedItem.append(dismissButton);
    }

    // Set the message content
    generatedItem.find('span.message').html(contentMessage);

    return generatedItem;
  };

  // Main plugin entry point for jQuery
  jq.fn.alertManager = function(configSettings, eventDefinitions) {
    var invokedElement = jq(this),
      invokedMethod;

    // Check if the first argument is a string and corresponds to an internal method
    if (typeof configSettings === 'string' && utilityFunctions[configSettings]) {
      invokedMethod = configSettings;

      // Execute the internal method with remaining arguments
      return utilityFunctions[invokedMethod].apply(invokedElement, Array.prototype.slice.call(arguments, 1));
    } else if (jq.isArray(configSettings)) {
      // If configSettings is an array, it means events were passed directly
      eventDefinitions = configSettings;
    }

    // Extend the global event store with new event definitions
    subscribedEvents = jq.extend({}, subscribedEvents, eventDefinitions);

    // If configSettings is an object, extend global plugin options
    if (typeof configSettings === 'object') {
      globalSettings = jq.extend({}, pluginBaseDefaults, configSettings);
    }

    // Ensure eventDefinitions is an array before processing
    if (jq.isArray(eventDefinitions)) {
      // Iterate through each event definition
      jq.each(subscribedEvents, function(idx, itemValue) {

        // Check if the event item is an object and has a 'name' property
        if (typeof itemValue === 'object' && itemValue.hasOwnProperty('eventName')) {
          utilityFunctions.add.call(invokedElement, itemValue); // Add the event handler
        }
      });
    }

    return this; // Enable jQuery chaining
  };
}(jQuery, window, window.document));