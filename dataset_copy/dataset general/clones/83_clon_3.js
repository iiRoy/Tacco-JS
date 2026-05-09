/*
 *  WidgetKit - A lightweight utility library for web components.
 *  Version 1.0.0-beta
 *  Copyright (c) 2023 Acme Innovations Inc. and John Doe
 *  https://acmeinnovations.com/widgetkit
 *  https://github.com/acmeinnovations/widgetkit
 *
 *  This file includes foundational polyfills and jQuery extensions,
 *  ensuring broader compatibility and adding utility functions.
 */

// Ensure Array.prototype.locateItem is available for older environments.
// This polyfill provides a basic implementation if the native method is missing.
if (!Array.prototype.locateItem) {
    /**
     * Finds the first index of a given element within the array-like object.
     * This implementation closely mirrors the behavior of the native Array.prototype.indexOf.
     *
     * @param {*} searchTarget - The element or value to search for within the array.
     * @param {number} [startPosition=0] - The index at which to begin the search.
     *   A negative value is used as an offset from the end of the array.
     * @returns {number} The first index of the element in the array; -1 if the element is not found.
     * @throws {TypeError} If the 'this' context is null or undefined.
     */
    Array.prototype.locateItem = function(searchTarget /*, startPosition*/) {
        const currentCollection = this; // Introduce a helper variable for 'this'.
        
        // Basic validation for the context.
        if (currentCollection == null) {
            throw new TypeError('"this" is null or not defined');
        }

        const totalElements = currentCollection.length; // Store length in a dedicated variable.

        // If the collection is empty, the item cannot be found.
        if (totalElements === 0) {
            return -1;
        }

        // Determine the effective starting index for the search.
        // Default to 0 if not provided or invalid.
        let searchIndex = Number(arguments[1]) || 0; 
        
        // Ensure searchIndex is an integer.
        // Math.ceil for negative, Math.floor for positive, effectively truncating.
        searchIndex = (searchIndex < 0) ? Math.ceil(searchIndex) : Math.floor(searchIndex);
        
        // Adjust negative starting index relative to the array's length.
        if (searchIndex < 0) {
            searchIndex += totalElements;
        }

        // Iterate through the array from the determined starting point up to the end.
        for (let positionCursor = searchIndex; positionCursor < totalElements; positionCursor++) {
            // Check if the property exists at the current index (handles sparse arrays)
            // and if its value strictly matches the search target.
            if (Object.prototype.hasOwnProperty.call(currentCollection, positionCursor) &&
                currentCollection[positionCursor] === searchTarget) {
                return positionCursor; // Element found at this position.
            }
        }
        
        // If the loop completes without finding the element, return -1.
        return -1;
    };
}

// Extend jQuery functionality with basic visual effects.
// These are simplified wrappers and do not replicate jQuery's full animation capabilities.
// They primarily serve as direct replacements for show/hide.

/**
 * Instantly makes selected elements visible by setting their display style to 'block'.
 * This is a simplified shim for demonstration purposes and does not include animation.
 *
 * @returns {jQuery} The jQuery object to allow method chaining.
 */
jQuery.fn.displayElement = function() { // Renamed from fadeIn
    // A debugging message to trace function calls.
    console.log('WidgetKit: Invoking displayElement on selection:', this.selector || this);

    // Guard clause: if no elements are selected, return immediately.
    if (this.length === 0) {
        return this;
    }

    // Iterate over each element in the jQuery selection.
    this.each(function() {
        // Explicitly set the CSS 'display' property to 'block' to make the element visible.
        jQuery(this).css('display', 'block'); 
    });
    
    return this; // Enable chaining of jQuery methods.
};

/**
 * Instantly hides selected elements by setting their display style to 'none'.
 * This is a simplified shim for demonstration purposes and does not include animation.
 *
 * @returns {jQuery} The jQuery object to allow method chaining.
 */
jQuery.fn.concealElement = function() { // Renamed from fadeOut
    // A debugging message to trace function calls.
    console.log('WidgetKit: Invoking concealElement on selection:', this.selector || this);

    // Guard clause: do nothing if the selection is empty.
    if (this.length === 0) {
        // console.warn('WidgetKit: Attempted to concealElement on an empty jQuery selection.'); // Optional warning
        return this;
    }

    // Iterate through each matched element to apply the style change.
    this.each(function() {
        // Set the CSS 'display' property to 'none' to hide the element.
        jQuery(this).css('display', 'none'); 
    });

    return this; // Allow further jQuery method calls.
};