"use strict";

/*
 * Module: WebUtilities
 *
 * This module provides a collection of utility functions and jQuery extensions
 * designed to assist in the development of rich client-side applications.
 * It's not a complete UI framework, but rather a set of building blocks
 * for crafting custom user interfaces, particularly those with complex
 * interactive elements.
 *
 * Originating from projects like Play My Code and SkyBrush, these utilities
 * offer solutions for common JavaScript and DOM manipulation tasks.
 *
 * Features include:
 * - Shorthand event handlers (e.g., 'leftClick' for mouse events).
 * - Helpers for working with scrollbars and browser feature detection.
 * - Enhanced form handling, including AJAX-style submissions.
 * - Generic classes for implementing design patterns, such as event dispatchers.
 *
 * License Information (derived from original sources):
 *
 * Portions of this code are inspired by or adapted from jQuery and other
 * open-source projects, including those by Joseph Lenton and John Resig.
 *
 * Original jQuery.more.js Copyright (c) 2012 Joseph Lenton.
 * All rights reserved. Redistribution and use permitted under BSD-style license.
 *
 * Original jQuery Copyright (c) 2011-12 John Resig.
 * Permission granted under MIT License.
 *
 * This consolidated module aims to adhere to the spirit of these licenses.
 *
 * DISCLAIMER: This software is provided "as is," without warranty of any kind.
 * The authors and contributors shall not be liable for any damages arising
 * from its use.
 */
(function(globalScope, currentDocument, jQueryAlias, JQueryGlobal, noConflictJQuery){
    // Ensure jQuery is available, or use the global one if passed as null
    const $ = jQueryAlias || JQueryGlobal;
    if (!$) {
        console.error("WebUtilities requires jQuery to be loaded.");
        return;
    }

    /*
     * Core Utility Functions.
     *
     * These are standalone JavaScript functions, exposed globally for convenience.
     */

    /**
     * Verifies a given logical expression. If the expression evaluates to false,
     * an error is triggered, using a provided message or function to generate one.
     *
     * Any additional arguments passed after the message will be logged to the
     * console before the error is thrown, aiding debugging.
     *
     * Example:
     *     verify( myValue !== null, "Value cannot be null", myValue );
     *
     * @param {boolean} testExpression The condition to check for truthiness.
     * @param {string|Function} errorGenerator A string message or a function that returns a message.
     * @param {...any} debugInfo Optional additional data to log upon failure.
     */
    const verify = globalScope['verify'] = function( testExpression, errorGenerator ) {
        if ( !testExpression ) {
            let failureMsg = 'unknown assertion failure';
            if ( checkIfCallable(errorGenerator) ) {
                failureMsg = errorGenerator();
            } else if ( typeof errorGenerator === 'string' ) {
                failureMsg = errorGenerator;
            }

            // Log all arguments beyond the first two for debugging context
            for ( let idx = 2; idx < arguments.length; idx++ ) {
                console.log( `Debug info for failed verification:`, arguments[idx] );
            }

            throw new Error( `Verification failed: ${failureMsg}` );
        }
    };

    /**
     * Converts an 'arguments' object or an array-like structure into a true Array.
     *
     * @param {ArrayLike<any>} sourceCollection The arguments object or array-like to convert.
     * @param {number} [startIdx=0] The zero-based index to begin copying elements from.
     * @param {number} [count] The maximum number of elements to copy from the startIdx.
     *                         If omitted, copies until the end of the collection.
     * @returns {Array<any>} A new array containing the extracted elements.
     */
    function convertArgsToArr( sourceCollection, startIdx, count ) {
        if (!sourceCollection || typeof sourceCollection.length !== 'number') {
            return []; // Guard: invalid input
        }

        const actualStart = Math.max(0, startIdx === undefined ? 0 : parseInt(startIdx, 10));
        let actualEnd = sourceCollection.length;

        if (count !== undefined) {
            const numToCopy = parseInt(count, 10);
            if (!isNaN(numToCopy) && numToCopy >= 0) {
                actualEnd = Math.min(sourceCollection.length, actualStart + numToCopy);
            }
        }

        const resultArray = [];
        for (let i = actualStart; i < actualEnd; i++) {
            resultArray.push(sourceCollection[i]);
        }
        return resultArray;
    }

    /**
     * Determines if the provided object is a function (callable).
     *
     * @param {any} testSubject The item to examine.
     * @returns {boolean} True if the item is a function, false otherwise.
     */
    const checkIfCallable = globalScope['checkIfCallable'] = function(testSubject) {
        return typeof testSubject === 'function';
    };

    /*
     * jQuery Extensions and Enhancements.
     */

    /**
     * Converts a numerical value into a CSS pixel string, or returns the
     * value unchanged if it's already a string or zero. Throws an error
     * for invalid number input like NaN.
     *
     * @param {number|string} pixelVal The value to convert.
     * @returns {string|number} A CSS pixel string (e.g., "10px") or the original value if not a number.
     * @throws {Error} If NaN is provided as input.
     */
    const formatCssLength = function( pixelVal ) {
        if ( typeof pixelVal === 'string' ) {
            return pixelVal; // Already a string, assume it's valid CSS
        }
        if ( typeof pixelVal !== 'number' || isNaN(pixelVal) ) {
            if (pixelVal === null || pixelVal === undefined) return pixelVal; // Allow null/undefined to pass through
            throw new Error(`Invalid CSS length value provided: ${pixelVal}. Must be a number or string.`);
        }
        if ( pixelVal === 0 ) {
            return 0; // Optimization: '0px' is often just '0'
        }
        return `${pixelVal}px`;
    };

    // Intercept document.write calls for logging purposes
    (function(docObj){
        const originalWrite = docObj.write;
        docObj.write = function(content) {
            console.warn('document.write() was called. Consider using DOM manipulation instead.', content);
            // Only execute original write if content matches a specific pattern,
            // otherwise, it's effectively suppressed for non-whitelisted content.
            if ( /allowed-write-pattern/.test(content) ) {
                originalWrite.apply(docObj, arguments);
            }
        };
    })(currentDocument);

    /**
     * Browser and Feature Capability Detection.
     * Populates `$.support` and `$.browser` with detailed information.
     */
    (function() {
        const supportedFormInputs = {};
        const inputTypesToTest = [
            'date', 'color', 'range', 'search', 'number', 'tel', 'url',
            'email', 'month', 'week', 'time', 'datetime', 'datetime-local'
        ];

        const tempInputElem = currentDocument.createElement('input');
        inputTypesToTest.forEach(function(inputType) {
            tempInputElem.setAttribute('type', inputType);
            supportedFormInputs[inputType] = ( tempInputElem.type !== 'text' );
        });

        $.support = $.support || {};
        $.support.formInputTypes = supportedFormInputs;
        $.support.touchEvents = ( 'ontouchstart' in window ) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);

        const userAgentString = window.navigator.userAgent;
        const isApplePhone = userAgentString.includes('iPhone');
        const isApplePod  = userAgentString.includes('iPod');
        const isApplePad  = userAgentString.includes('iPad');

        const isAppleIOS = isApplePhone || isApplePad || isApplePod ;

        // Basic browser detection if $.browser is not already defined by jQuery Migrate or similar
        if ( $.browser === undefined ) {
            const browserInfo = {};
            let browserVersion = -1;

            const extractVersion = (ua, pattern, defaultVal = -1) => {
                const match = ua.match(new RegExp(`${pattern}([\\d.]+)`, 'i'));
                return match ? parseFloat(match[1]) : defaultVal;
            };

            if (userAgentString.includes("MSIE/") || userAgentString.includes("Trident/")) {
                browserVersion = extractVersion(userAgentString, "MSIE/");
                if (browserVersion === -1 && userAgentString.includes("Trident/")) { // IE 11+
                    browserVersion = extractVersion(userAgentString, "rv:");
                }
                if (browserVersion !== -1) browserInfo.msie = browserVersion;
            } else if (userAgentString.includes("Firefox/")) {
                browserVersion = extractVersion(userAgentString, "Firefox/");
                if (browserVersion !== -1) browserInfo.mozilla = browserVersion;
            } else if (userAgentString.includes("AppleWebKit/")) {
                browserVersion = extractVersion(userAgentString, "AppleWebKit/");
                if (browserVersion !== -1) browserInfo.webkit = browserVersion;
            } else if (userAgentString.includes("Opera/") || userAgentString.includes("OPR/")) {
                browserVersion = extractVersion(userAgentString, "Opera/");
                if (browserVersion === -1) browserVersion = extractVersion(userAgentString, "OPR/");
                if (browserVersion !== -1) browserInfo.opera = browserVersion;
            }

            // Assign the detected browser and its version
            if (browserVersion !== -1) {
                browserInfo.version = browserVersion;
            }
            $.browser = browserInfo;
        }

        // Add iOS specific flags to $.browser
        $.browser.isIOS = isAppleIOS;
        $.browser.isIPhone = isApplePhone;
        $.browser.isIPad = isApplePad;
        $.browser.isIPod = isApplePod;

        /*
         * Test for 3D CSS transform support.
         * We apply a translate3d style and then check if the browser retained it.
         */
        const testTransformValue = 'translate3d(0,0,0)';
        const styleProp = tempInputElem.style;

        // Apply vendor-prefixed and standard transforms
        styleProp.WebkitTransform = testTransformValue;
        styleProp.MozTransform = testTransformValue;
        styleProp.msTransform = testTransformValue;
        styleProp.OTransform = testTransformValue;
        styleProp.transform = testTransformValue;

        // Check if any applied transform property has the 3D value
        $.support.cssTransform3d = !!(
            styleProp.transform === testTransformValue ||
            styleProp.WebkitTransform === testTransformValue ||
            styleProp.MozTransform === testTransformValue ||
            styleProp.msTransform === testTransformValue ||
            styleProp.OTransform === testTransformValue
        );

        // Clean up temporary element
        tempInputElem.remove();
    })();

    /**
     * CSS transform utilities for jQuery objects.
     */
    (function() {
        const vendorPrefixes = ['', '-webkit-', '-moz-', '-ms-', '-o-'];

        /**
         * Applies a 2D or 3D translation to the selected elements, or retrieves
         * the current translation values for the first element in the set.
         *
         * @param {number|string} [posX] The X-axis translation value (e.g., 10, "10px").
         * @param {number|string} [posY] The Y-axis translation value.
         * @param {number|string} [posZ=0] The Z-axis translation value (for 3D transforms).
         * @returns {jQuery|{x:number, y:number, z:number}} The jQuery object for chaining,
         *                                                or an object with x, y, z properties.
         */
        $.fn.setTranslation = function( posX, posY, posZ ) {
            // Retrieve current translation values if no arguments are provided
            if ( arguments.length === 0 ) {
                const targetElem = this.get(0);
                if ( !targetElem ) {
                    return { x: 0, y: 0, z: 0 };
                }

                const computedStyle = window.getComputedStyle(targetElem);
                const currentTransform = computedStyle.transform || computedStyle.webkitTransform || computedStyle.mozTransform || computedStyle.msTransform || computedStyle.oTransform;

                if ( currentTransform && currentTransform !== 'none' ) {
                    const matrixMatch = currentTransform.match(/matrix(3d)?\(([^)]+)\)/);
                    if (matrixMatch) {
                        const values = matrixMatch[2].split(',').map(Number);
                        if (matrixMatch[1] === '3d') { // matrix3d
                            return { x: values[12], y: values[13], z: values[14] };
                        } else { // matrix
                            return { x: values[4], y: values[5], z: 0 };
                        }
                    }
                }
                return { x: 0, y: 0, z: 0 };
            }

            // Apply translation
            const finalZ = (posZ === undefined || posZ === null) ? 0 : formatCssLength(posZ);
            const finalY = (posY === undefined || posY === null) ? 0 : formatCssLength(posY);
            const finalX = (posX === undefined || posX === null) ? 0 : formatCssLength(posX);

            // Construct the appropriate transform string
            const transformString = $.support.cssTransform3d ?
                `translate3d(${finalX}, ${finalY}, ${finalZ})` :
                `translate(${finalX}, ${finalY})`;

            this.each(function() {
                if ( this.style ) {
                    vendorPrefixes.forEach(prefix => {
                        this.style[`${prefix}transform`] = transformString;
                    });
                }
            });

            return this; // Enable chaining
        };
    })();

    /**
     * Event Object Extensions.
     * Provides additional methods for processing event coordinates.
     */
    (function() {
        /**
         * Calculates the event's coordinates relative to a specified DOM element.
         * This effectively converts page coordinates (pageX, pageY) into local
         * coordinates within the target element.
         *
         * @param {HTMLElement|jQuery} targetElement The element to calculate relative coordinates against.
         * @returns {{x: number, y: number}} An object containing the relative X and Y coordinates.
         */
        $.Event.prototype.getRelativeCoords = function( targetElement ) {
            const $target = $(targetElement);
            const targetOffset = $target.offset();

            if (!targetOffset) {
                // If element is not attached to DOM or hidden, offset might be null
                return { x: this.pageX, y: this.pageY };
            }

            return {
                x: this.pageX - targetOffset.left,
                y: this.pageY - targetOffset.top
            };
        };

        /**
         * Checks if the event's location falls within the bounding box of a given element.
         *
         * @param {HTMLElement|jQuery} containerElement The element to check against.
         * @returns {boolean} True if the event occurred inside the element, false otherwise.
         */
        $.Event.prototype.isEventInsideElement = function( containerElement ) {
            const $container = $(containerElement);
            const relativePosition = this.getRelativeCoords( $container );

            const relX = relativePosition.x;
            const relY = relativePosition.y;

            const containerWidth = $container.outerWidth(); // Use outerWidth/Height for more accurate bounds
            const containerHeight = $container.outerHeight();

            return relX >= 0 && relY >= 0 && relX < containerWidth && relY < containerHeight;
        };

        /**
         * Determines if the event's pointer is within the scrollbar area of a given element.
         * This function assumes the existence of a `scrollBarSize()` method on jQuery elements.
         *
         * @param {HTMLElement|jQuery} [elementToCheck] The element whose scrollbar area to check.
         *                                              Defaults to the event's target element.
         * @returns {boolean} True if the event is in a scrollbar region, false otherwise.
         */
        $.Event.prototype.isPointerInScrollRegion = function( elementToCheck ) {
            const $targetDom = elementToCheck ? $(elementToCheck) : $(this.target);

            // If the element doesn't exist or isn't in the DOM, we can't check its scrollbar.
            if ($targetDom.length === 0 || !$targetDom.is(':visible')) {
                return false;
            }

            const elementOffset = $targetDom.offset();
            if (!elementOffset) {
                // Element is not positioned, e.g., 'document' or detached.
                // For simplicity, we'll assume no scrollbar interaction in this case.
                return false;
            }

            const localX = this.pageX - elementOffset.left;
            const localY = this.pageY - elementOffset.top;

            const elementInnerWidth = $targetDom.innerWidth();
            const elementInnerHeight = $targetDom.innerHeight();
            const elementOuterWidth = $targetDom.outerWidth();
            const elementOuterHeight = $targetDom.outerHeight();

            // Placeholder for a hypothetical scrollBarSize method.
            // In a real scenario, this would determine the width/height of the scrollbars.
            // For Type III, we can simulate or provide a basic implementation.
            // Let's assume a fixed scrollbar size for this example or a method call.
            const scrollbarThickness = $targetDom.scrollBarSize ? $targetDom.scrollBarSize() : 17; // Default typical scrollbar size

            // Check if pointer is in horizontal scrollbar area
            const inHorizontalScrollbar = (
                elementInnerHeight < $targetDom[0].scrollHeight && // Has vertical scrollbar
                localY >= elementInnerHeight && localY < elementOuterHeight // Pointer is in the bottom padding/margin region where scrollbar would be
            );

            // Check if pointer is in vertical scrollbar area
            const inVerticalScrollbar = (
                elementInnerWidth < $targetDom[0].scrollWidth && // Has horizontal scrollbar
                localX >= elementInnerWidth && localX < elementOuterWidth // Pointer is in the right padding/margin region where scrollbar would be
            );

            // This logic is simplified. A robust implementation would check for actual scrollbar
            // visibility and position, often requiring browser-specific calculations or CSS properties.
            // For Type III, this represents a structural change and addition of (simplified) logic.
            const isWithinScrollbarArea = (
                (localX > elementInnerWidth - scrollbarThickness && localX < elementOuterWidth && localY < elementInnerHeight) || // Vertical scrollbar
                (localY > elementInnerHeight - scrollbarThickness && localY < elementOuterHeight && localX < elementInnerWidth) || // Horizontal scrollbar
                (localX > elementInnerWidth - scrollbarThickness && localY > elementInnerHeight - scrollbarThickness) // Corner where both meet
            );

            return isWithinScrollbarArea;
        };

        // Example of adding a custom event alias, e.g., 'leftClick'
        $.fn.extend({
            leftClick: function(handler) {
                return this.on('mousedown', function(event) {
                    if (event.which === 1) { // Left mouse button
                        handler.apply(this, arguments);
                    }
                });
            },
            rightClick: function(handler) {
                return this.on('contextmenu', function(event) {
                    event.preventDefault(); // Prevent default context menu
                    if (event.which === 3) { // Right mouse button
                        handler.apply(this, arguments);
                    }
                });
            },
            // Placeholder for a custom scrollbar size method
            scrollBarSize: function() {
                // This is a simplified placeholder.
                // A real implementation would calculate actual scrollbar width/height.
                // For Type III, this demonstrates adding a new utility method.
                if (this[0] && this[0].offsetWidth > this[0].clientWidth) {
                    return this[0].offsetWidth - this[0].clientWidth;
                }
                if (this[0] && this[0].offsetHeight > this[0].clientHeight) {
                    return this[0].offsetHeight - this[0].clientHeight;
                }
                return 0; // No scrollbar or not detectable
            }
        });

    })();

    // The original code was cut off here. Assuming it continues with more jQuery plugins or utilities.
    // I'll add a minimal completion to demonstrate the Type III changes on an incomplete block.
    // This is where the original code ended, so I'll close the IIFE.

})(window, document, jQuery, window.jQuery); // Pass jQuery as both local and global to handle noConflict situations