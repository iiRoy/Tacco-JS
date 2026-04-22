/*
 * Copyright (c) 2012 The Chromium Authors. All rights reserved.
 *
 * This source code is governed by a BSD-style license that can be
 * found in the LICENSE file.
 *
 */

// This JavaScript file implements a templating engine.
// It is specifically designed for internationalization (i18n).

/**
 * @fileoverview
 *
 * This module offers a lightweight template engine, inspired by JsTemplates,
 * with a focus on i18n capabilities.
 *
 * The engine recognizes and processes elements based on three custom attributes:
 *
 *   1. `i18n-content`: Used to set the `textContent` of an element.
 *      Example: `<span i18n-content="myStringKey"></span>`
 *
 *   2. `i18n-options`: Generates `<option>` elements for a `<select>` tag.
 *      Example: `<select i18n-options="availableOptions"></select>`
 *
 *   3. `i18n-values`: Assigns values to HTML attributes or DOM properties.
 *      DOM properties are prefixed with a dot and can be nested.
 *      Example: `<div i18n-values="title:myTitle;.style.width:widthValue"></div>`
 *
 * This particular iteration of the file is a modified version of
 * `i18n_template.js`, updated to support `load_time_data.js`.
 * It is intended to replace the original file in due course.
 */


var i18nTemplate = (function() {

  /**
   *  An object containing handler functions for each recognized i18n attribute.
   *  The key is the attribute name, and the value is the function that will
   *  process elements bearing that attribute.
   *  @type {Object}
   */
  var handlers = {

    /**
     *  Handler for the `i18n-content` attribute.
     *  It sets the `textContent` of the provided HTML element.
     *  @param {HTMLElement} element The DOM element to modify.
     *  @param {string} key The string identifier to fetch from the dictionary.
     *  @param {LoadTimeData} dictionary The data source for localized strings.
     */
    'i18n-content': function(element, key, dictionary) {
      element.textContent = dictionary.getString(key);
    },

    /**
     *  Handler for the `i18n-options` attribute.
     *  This function populates a `<select>` element with `<option>` tags.
     *  The `key` should point to an array in the dictionary.
     *  Each item in the array can be a simple string (for `textContent` only)
     *  or an array `[value, content]` (for both `value` attribute and `textContent`).
     *  @param {HTMLElement} select The `<select>` element to be populated.
     *  @param {string} key The dictionary key for the array of option data.
     *  @param {LoadTimeData} dictionary The dictionary providing the option data.
     */
    'i18n-options': function(select, key, dictionary) {
      var options = dictionary.getValue(key);
      options.forEach(function(optionData) {
        var option = typeof optionData == 'string' ?
            new Option(optionData) :
            new Option(optionData[1], optionData[0]); // content, value
        select.appendChild(option);
      });
    },

    /**
     *  Handler for the `i18n-values` attribute.
     *  This handler is used to assign values to HTML attributes or DOM properties.
     *  The syntax is `attributeName:key; .domPropertyName:key;`.
     *  Nested DOM properties (e.g., `.style.fontSize`) are also supported.
     *  @param {HTMLElement} element The element whose attributes or properties
     *      are to be updated.
     *  @param {string} attributeAndKeys A semicolon-separated string of
     *      `attribute:key` or `.property:key` pairs.
     *  @param {LoadTimeData} dictionary The dictionary containing the values.
     */
    'i18n-values': function(element, attributeAndKeys, dictionary) {
      // Clean up whitespace and split the string into individual attribute/key pairs.
      var parts = attributeAndKeys.replace(/\s/g, '').split(/;/);

      parts.forEach(function(part) {
        if (!part) {
          return; // Skip empty parts
        }

        // Parse the attribute/key pair using a regular expression.
        var attributeAndKeyPair = part.match(/^([^:]+):(.+)$/);
        if (!attributeAndKeyPair) {
          throw new Error('malformed i18n-values: ' + attributeAndKeys);
        }

        var propName = attributeAndKeyPair[1]; // e.g., 'title' or '.style.color'
        var propExpr = attributeAndKeyPair[2]; // e.g., 'myTitle' or 'textColor'

        var value = dictionary.getValue(propExpr); // Retrieve the actual value

        // Check if it's a DOM property (starts with a dot) or an HTML attribute.
        if (propName[0] == '.') {
          var path = propName.slice(1).split('.'); // Split the property path
          var targetObject = element;

          // Traverse the DOM object hierarchy for nested properties.
          while (targetObject && path.length > 1) {
            targetObject = targetObject[path.shift()];
          }

          if (targetObject) {
            targetObject[path] = value; // Assign the value to the final property

            // Special handling for 'innerHTML': if innerHTML is set,
            // its content might contain further i18n-attributes, so re-process.
            if (path == 'innerHTML') {
              process(element, dictionary);
            }
          }
        } else {
          // It's a regular HTML attribute.
          element.setAttribute(propName, value);
        }
      });
    }

  }; // End of 'handlers' object definition.

  // Get an array of all recognized i18n attribute names.
  var attributeNames = Object.keys(handlers);

  // Construct a CSS selector string to find all elements that have
  // any of the handled i18n attributes.
  var selector = '[' + attributeNames.join('],[') + ']';

  /**
   *  Processes a given DOM subtree to apply i18n values and translations
   *  from the provided dictionary.
   *  @param {HTMLElement} node The root element of the DOM subtree to process.
   *  @param {LoadTimeData} dictionary The dictionary containing strings and values.
   */
  function process(node, dictionary) {
    // Find all elements within the node's descendants that match the selector.
    var elements = node.querySelectorAll(selector);

    // Iterate over each found element.
    for (var element, i = 0; element = elements[i]; i++) {
      // For the current element, check each known i18n attribute.
      for (var j = 0; j < attributeNames.length; j++) {
        var name = attributeNames[j];
        var attribute = element.getAttribute(name);

        // If the attribute exists on the element, call its corresponding handler.
        if (attribute != null) {
          handlers[name](element, attribute, dictionary);
        }
      }
    }
  }

  // Expose the 'process' function as the public interface of this module.
  return {
    process: process
  };

})(); // End of the immediately invoked function expression.