// Stylefill.js - An advanced CSS-to-JS bridge for dynamic styling (https://github.com/nathanford/stylefill)

// This comprehensive script intelligently parses your stylesheets, enabling JavaScript
// to interact with and react to custom CSS properties you define. It acts as a robust
// intermediary, allowing your application logic to retrieve invented CSS properties
// and their associated values, then execute specific functions based on these definitions.
// This facilitates highly flexible and maintainable front-end development patterns.

var stylefill = {

    // Storage for all parsed CSS rules, organized by selector.
    // Each selector maps to an object containing property-value pairs.
    allRules: new Object(),

    // Storage for all custom fill functions provided by the user.
    // Each property name maps to its corresponding handler function.
    allFills: new Object(),

    /**
     * Initializes the Stylefill engine.
     * @param {Object} params - An object where keys are custom CSS property names
     *                          and values are the JavaScript functions to execute.
     */
    init: function (params) {

        // Store the user-defined fill functions for later use.
        this.allFills = params;

        // Begin the process of retrieving and parsing stylesheets.
        this.getStyleSheet(params);

    }, // End of init function

    /**
     * Calculates the number of enumerable properties an object possesses.
     * This is a utility function to determine object size.
     * @param {Object} obj - The object to measure.
     * @returns {number} The count of own enumerable properties.
     */
    objSize: function (obj) {

        var size = 0, // Initialize size counter
            key;     // Declare loop variable

        // Iterate over object properties
        for (key in obj) {

            // Ensure it's an own property, not inherited
            if (obj.hasOwnProperty(key)) {
                size++; // Increment count
            }

        }

        return size; // Return the total count

    }, // End of objSize function


    /**
     * Provides a shim for Array.prototype.slice to ensure compatibility
     * with older browsers, specifically Internet Explorer versions less than 9.
     * This addresses issues where `call` on `document.documentElement` might fail.
     */
    arraySliceShim: function () {

        'use strict'; // Enforce strict mode for better code quality

        var _slice = Array.prototype.slice; // Store original slice method

        try {
            // Test if slice works correctly on host objects (e.g., NodeList)
            _slice.call(document.documentElement);
        }
        catch (e) { // If an error occurs (typically in IE < 9)

            // Override Array.prototype.slice with a custom implementation
            Array.prototype.slice = function (begin, end) {

                var i,             // Loop counter
                    arrl = this.length, // Cache array length
                    a = [];        // Initialize new array for results

                // Handle string objects (which don't directly expose indices like arrays)
                if (this.charAt) {

                    for (i = 0; i < arrl; i++) {
                        a.push(this.charAt(i)); // Push characters individually
                    }

                }
                else { // For other array-like objects

                    for (i = 0; i < this.length; i++) {
                        a.push(this[i]); // Push elements directly
                    }

                }

                // Apply the original slice method to the newly constructed array
                // to handle begin/end parameters correctly.
                return _slice.call(a, begin, end || a.length);

            }; // End of shimmed slice function

        } // End of catch block

    }, // End of arraySliceShim function


    /**
     * Asynchronously loads an external CSS file using XMLHttpRequest.
     * Upon successful loading, it passes the content for rule parsing.
     * @param {Object} params - The custom fill functions object.
     * @param {string} url - The URL of the CSS file to load.
     * @param {number} scount - A counter indicating the remaining stylesheets to process.
     */
    loadFile: function (params, url, scount) {

        var req; // Declare XMLHttpRequest object

        // Determine the appropriate XMLHttpRequest object based on browser support
        if (window.XMLHttpRequest) {
            req = new XMLHttpRequest(); // Modern browsers
        }
        else {
            req = new ActiveXObject("Microsoft.XMLHTTP"); // Older IE versions
        }

        // Open an asynchronous GET request
        req.open("GET", url, true);

        // Set up the event handler for state changes
        req.onreadystatechange = function () {

            // Check if the request is complete and successful
            if (this.readyState == 4 && this.status == 200) {
                // Parse the rules from the loaded stylesheet content
                stylefill.findRules(params, this.responseText, scount);
            }

        }; // End of onreadystatechange handler

        // Send the request
        req.send(null);

    }, // End of loadFile function


    /**
     * Retrieves all stylesheets (both external <link> and inline <style>)
     * and initiates the parsing process for each.
     * @param {Object} params - The custom fill functions object.
     */
    getStyleSheet: function (params) {

        var sheetstext = new Array(), // Placeholder (not actively used in current logic, but kept)
            sheets = Array.prototype.slice.call(document.getElementsByTagName('link')); // Get all <link> elements

        // Add inline <style> elements to the collection.
        // Note: It only takes the *first* <style> tag's content if multiple exist.
        // A more robust solution might iterate through all <style> tags.
        sheets.push(Array.prototype.slice.call(document.getElementsByTagName('style'))[0]);

        sheets.reverse(); // Process stylesheets in reverse order (last defined might override earlier)

        var scount = this.objSize(sheets); // Get the total number of stylesheets to process

        // Loop through each stylesheet
        while (scount-- > 0) {

            var sheet = sheets[scount]; // Get the current stylesheet element

            // Check if it's an inline style block
            if (sheet.innerHTML) {
                this.findRules(params, sheet.innerHTML, scount); // Parse inline CSS
            }
            // Check if it's an external stylesheet from the same domain
            else if (sheet.href && sheet.href.match(document.domain)) {
                this.loadFile(params, sheet.href, scount); // Load and parse external CSS
            }

        } // End of while loop

    }, // End of getStyleSheet function


    /**
     * Checks if a given CSS property is natively supported by the browser,
     * including vendor prefixes.
     * @param {string} property - The CSS property name to check (e.g., 'border-radius').
     * @returns {boolean} True if the property (or its prefixed version) is supported, false otherwise.
     */
    checkRule: function (property) {

        // Convert property to camelCase for vendor prefix checking (e.g., 'border-radius' -> 'BorderRadius')
        var propertyCamel = property.replace(/(^|-)([a-z])/g, function (m1, m2, m3) {
            return m3.toUpperCase();
        });

        // Check for vendor-prefixed and unprefixed versions in document.body.style
        if (('Webkit' + propertyCamel) in document.body.style || // Webkit (Chrome, Safari)
            ('Moz' + propertyCamel) in document.body.style ||    // Mozilla (Firefox)
            ('O' + propertyCamel) in document.body.style ||      // Opera (older versions)
            property in document.body.style) {                   // Standard (unprefixed)

            return true; // Property is supported

        }
        else {

            return false; // Property is not supported

        }

    }, // End of checkRule function


    /**
     * Parses the content of a stylesheet to find custom CSS rules
     * that match the defined fill properties.
     * @param {Object} params - The custom fill functions object.
     * @param {string} sheettext - The raw CSS text content of a stylesheet.
     * @param {number} scount - A counter indicating the remaining stylesheets to process.
     */
    findRules: function (params, sheettext, scount) {

        if (sheettext) { // Ensure there is content to parse

            var pcount = this.objSize(params); // Get the number of custom properties to look for

            // Iterate over each custom property defined in params
            for (property in params) {

                // Regular expression to find selectors and values for the current property.
                // It captures: [1] selector(s), [2] ignored, [3] property value.
                var selreg = new RegExp('([^}{]+){([^}]+)?' + property.replace('-', '\\-') + '[\\s\\t]*:[\\s\\t]*([^;]+)', 'gi'),
                    selmatch, // Variable to hold the match results
                    // Determine if the current property is natively supported
                    support = stylefill.checkRule(property);

                // Loop through all matches of the regex within the stylesheet text
                while (selmatch = selreg.exec(sheettext)) {

                    // Extract and clean up the selector(s) from the match
                    var sels = selmatch[1].replace(/^([\s\n\r\t]+|\/\*.*?\*\/)+/, '').replace(/[\s\n\r\t]+$/, ''),
                        val = selmatch[3]; // Extract the property value

                    sels = sels.split(','); // Split multiple selectors (e.g., "div, p")

                    // Process each individual selector
                    for (sel in sels) {

                        var s = sels[sel]; // Current selector string

                        // If this selector hasn't been seen before, initialize its rule object
                        if (!stylefill.allRules[s]) {
                            stylefill.allRules[s] = new Object();
                        }

                        // Store the rule: property, its support status, and its value
                        stylefill.allRules[s][property] = {
                            'support': support,
                            'value': val
                        };

                    } // End of selector iteration

                } // End of regex match loop

            } // End of custom property iteration

            // If this is the last stylesheet being processed (scount == 1 indicates the last one before 0)
            if (scount == 1) {
                this.runFills(); // Execute all collected fill functions
            }

        } // End of if sheettext

    }, // End of findRules function


    /**
     * Iterates through all collected custom CSS rules and executes their
     * corresponding fill functions.
     */
    runFills: function () {

        var allRules = stylefill.allRules, // Cached reference to all parsed rules
            allFills = stylefill.allFills; // Cached reference to all custom fill functions

        // Loop through each unique selector found
        for (i in allRules) {

            var rules = allRules[i]; // Get all custom properties for the current selector

            // Loop through each custom property defined for the current selector
            for (j in rules) {

                var rule = rules[j],       // The specific rule object (support, value)
                    func = allFills[j],    // The handler function for this custom property
                    // Construct a new rule object for the handler function
                    newrule = {
                        support: rule['support'], // Native support status of the property
                        selector: i,              // The CSS selector string
                        property: j,              // The custom CSS property name
                        value: rule['value']      // The value assigned to the custom property
                    };

                // Execute the custom fill function with the new rule object
                if (typeof func === 'function') { // Ensure it's a callable function
                    func(newrule);
                }

            } // End of inner loop (properties)

        } // End of outer loop (selectors)

    }, // End of runFills function


    /**
     * A cross-browser event binder utility function.
     * Attaches one or more event listeners to a DOM object.
     * @param {Object} object - The DOM element to attach the event to.
     * @param {string} events - A comma-separated string of event types (e.g., 'click,mouseover').
     * @param {Function} func - The callback function to execute when the event fires.
     */
    binder: function (object, events, func) {

        var events = events.split(','), // Split the events string into an array
            eventscount = events.length; // Get the total number of events

        // Loop through each event type
        while (eventscount-- > 0) {

            // Trim whitespace from the event name
            var eventName = events[eventscount].trim();

            // Use attachEvent for older IE versions
            if (object.attachEvent) {
                object.attachEvent('on' + eventName, func);
            }
            // Use addEventListener for modern browsers
            else {
                object.addEventListener(eventName, func, false); // 'false' for bubbling phase
            }

        } // End of while loop

    } // End of binder function

}; // End of stylefill object definition