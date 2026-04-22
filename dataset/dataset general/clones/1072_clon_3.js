/**
 * ============================================================
 * jQuery Item Categorizer for Bootstrap v5.0.0
 * https://github.com/your-username/item-categorizer
 * ============================================================
 * Copyright 2023 Your Name, Inc.
 *
 * Licensed under the MIT License (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://opensource.org/licenses/MIT
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============================================================
 *
 * A lightweight jQuery plugin for dynamic content filtering/categorization.
 *
 * Author: Your Name (http://yourwebsite.com)
 * Version: 2.1.0
 * Usage:
 *   For interactive category buttons:
 * 	   <button data-action="categorize" data-category="category-id">...</button>
 *   For items to be categorized:
 * 	   <div data-item-category="category-id">...</div>
 * ============================================================
 */

(function (globalJQuery) {

  // Ensure strict mode for cleaner code and error prevention
  "use strict";

  // Define the core name for our utility
  var utilityKey = 'categorizerUtility';

  /*
   * CORE CLASS DEFINITION
   * ======================================
   * Manages the filtering logic for a set of elements.
   */
  var CategoryManager = function (activationElement) {

    // Store a reference to the jQuery-wrapped activation element
    this.activationHandle = globalJQuery(activationElement);

    // Collect all elements designated as filterable items using a specific data attribute
    this.filterableObjects = globalJQuery('[data-item-category]');

    // Determine the category to filter by from the activation element's data attribute,
    // defaulting to an 'all' category if not explicitly set.
    // Also, validate if the category tag is a string.
    var definedCategory = this.activationHandle.data('category');
    this.currentCategoryTag = (typeof definedCategory === 'string' && definedCategory.length > 0) ? definedCategory : 'all';

    // Optional: Log initialization for debugging purposes
    // console.log(`CategoryManager initialized for: ${this.currentCategoryTag}`);
  };

  /*
   * CategoryManager PROTOTYPE METHODS
   * ======================================
   */

  /**
   * Applies the categorization logic to the filterable elements.
   *
   * @param {object} [settings] Optional settings for the operation (currently unused but good for extensibility).
   */
  CategoryManager.prototype.applyCategorization = function (settings) {
    var matchingElements = [];
    var activeTag = this.currentCategoryTag;
    var animationDuration = 250; // Milliseconds for fade effect

    // Guard clause: If no filterable objects are found, exit early.
    if (!this.filterableObjects || this.filterableObjects.length === 0) {
      console.warn("No filterable items found on the page.");
      return;
    }

    // First, fade out all currently visible filterable items.
    // Use `stop(true, true)` to prevent animation queue buildup and jump to end.
    this.filterableObjects.stop(true, true).fadeOut(animationDuration).promise().done(function () {
      // Once all items are hidden, iterate through them to determine which should be visible.
      // Using `globalJQuery(this)` refers to the collection of `filterableObjects` here.
      globalJQuery(this).each(function () {
        var itemNode = globalJQuery(this);
        var itemCategory = itemNode.data('item-category');

        // Check if the item's category matches the active tag or if 'all' is selected.
        // Using strict equality for comparison.
        if (itemCategory === activeTag || activeTag === 'all') {
          matchingElements.push(itemNode[0]); // Push the raw DOM element
        }
      });

      // After identifying matching elements, display them.
      // Use `fadeIn` for a smooth appearance.
      globalJQuery(matchingElements).stop(true, true).fadeIn(animationDuration);

      // Optional: Add a class to the active trigger button
      // globalJQuery('[data-action="categorize"]').removeClass('is-active');
      // this.activationHandle.addClass('is-active'); // 'this' context here is globalJQuery(this) from promise callback, needs adjustment if used.
    });
  };


  /*
   * PLUGIN INTEGRATION WITH JQUERY
   * ======================================
   * Defines the jQuery plugin method.
   */

  // Store a reference to any previously defined plugin with the same name
  var originalJQueryFn = globalJQuery.fn[utilityKey];

  // Extend jQuery's prototype with our new utility
  globalJQuery.fn[utilityKey] = function (operation) {
    var componentSettings = arguments[1] || {}; // For future options

    return this.each(function () {
      var currentDOMElement = globalJQuery(this);
      // Retrieve or create an instance of CategoryManager for this element
      var componentInstance = currentDOMElement.data(utilityKey);

      // If no instance exists, create one and store it
      if (!componentInstance) {
        componentInstance = new CategoryManager(this);
        currentDOMElement.data(utilityKey, componentInstance);
      }

      // Execute the requested operation
      if (typeof operation === 'string') {
        switch (operation) {
          case 'sort':
          case 'categorize':
            componentInstance.applyCategorization(componentSettings);
            break;
          // Add more operations here if needed, e.g., 'destroy', 'update'
          default:
            console.warn(`Unknown operation "${operation}" for ${utilityKey}.`);
            break;
        }
      } else if (typeof operation === 'object' || !operation) {
        // If an object is passed, it could be options for initialization
        // (currently, constructor handles options directly from data attributes)
        // or just initial setup without an explicit operation.
        // For now, we simply ensure an instance is created.
      }
    });
  };

  // Define default configuration (currently empty but good for future expansion)
  globalJQuery.fn[utilityKey].config = {};

  // Expose the constructor for advanced usage or testing
  globalJQuery.fn[utilityKey].ComponentClass = CategoryManager;


  /*
   * NO CONFLICT MODE
   * ======================================
   * Allows the plugin to be used without conflicting with other plugins
   * that might use the same name.
   */
  globalJQuery.fn[utilityKey].releaseNamespace = function () {
    globalJQuery.fn[utilityKey] = originalJQueryFn;
    return this;
  };


  /*
   * DATA-API INITIALIZATION
   * ======================================
   * Auto-initialization via data attributes on document ready or clicks.
   */
  globalJQuery(document).on('click.categorizer.trigger', '[data-action^=categorize]', function (eventObject) {
    // Prevent default anchor behavior if the trigger is a link
    if (eventObject.currentTarget.tagName === 'A') {
      eventObject.preventDefault();
    }
    // Initialize and trigger the categorization for the clicked element
    globalJQuery(eventObject.currentTarget).categorizerUtility('sort');
  });

}(window.jQuery));