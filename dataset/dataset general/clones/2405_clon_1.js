/*
 * This is a utility object 'p' designed for DOM manipulation.
 * It provides a chainable interface for selecting elements,
 * applying styles, attributes, animations, and event listeners.
 */
var    p    =    {


    /**
     * Selects elements based on a CSS selector and stores them internally.
     * @param {string} selector - The CSS selector string.
     * @returns {object} The 'p' object itself for method chaining.
     */
    select     :     function     (     selector     )     {

        // Store the selected elements as an array-like object
        this.value     =     Array.prototype.slice.call     (     document.querySelectorAll     (     selector     )     )     ;


        // Return the current instance for chaining
        return     this     ;
    }     ,


    // A reference to the native Array.prototype.forEach method, used internally for iteration.
    each     :     [     ]     .     forEach     ,


    /**
     * Applies CSS styles to all selected elements.
     * @param {string} v - The CSS text string to apply (e.g., "color: red; font-size: 16px;").
     * @returns {object} The 'p' object itself for method chaining.
     */
    css     :     function     (     v     )     {

        // Iterate over each selected element and apply the CSS text
        this.value     =     this.each.call     (     this.value     ,     function     (     i     )     {

            // Set the cssText property of the element's style
            i.style.cssText     =     v     ;

        }     )     ;


        // Allow method chaining
        return     this     ;
    }     ,


    /**
     * Sets an attribute on all selected elements.
     * @param {string} a - The name of the attribute to set.
     * @param {string} v - The value to set for the attribute.
     * @returns {object} The 'p' object itself for method chaining.
     */
    att     :     function     (     a     ,     v     )     {

        // Loop through each element in the internal 'value' array
        this.value     =     this.each.call     (     this.value     ,     function     (     i     )     {

            // Apply the attribute to the current element
            i.setAttribute     (     a     ,     v     )     ;

        }     )     ;


        // Return 'this' to enable further method calls
        return     this     ;

    }     ,


    /**
     * Applies a complex CSS transform animation to all selected elements.
     * This method constructs a -webkit-transform string based on provided parameters.
     *
     * @param {number} time       - Duration of the transition in seconds.
     * @param {number} scale      - Scaling factor.
     * @param {number} rotate     - Rotation angle in degrees.
     * @param {number} rotateX    - Rotation around X-axis in degrees.
     * @param {number} rotateY    - Rotation around Y-axis in degrees.
     * @param {number} translateX - Translation along X-axis in pixels.
     * @param {number} translateY - Translation along Y-axis in pixels.
     * @param {number} skewX      - Skew along X-axis in degrees.
     * @param {number} skewY      - Skew along Y-axis in degrees.
     * @returns {object} The 'p' object for chaining.
     */
    animate     :     function     (     time     ,     scale     ,     rotate     ,     rotateX     ,     rotateY     ,     translateX     ,     translateY     ,     skewX     ,     skewY     )     {

        // Iterate over the selected elements to apply the animation style
        this.value     =     [     ]     .     forEach     .     call     (     this.value     ,     function     (     i     )     {

            // Construct the comprehensive CSS transform string for WebKit browsers
            i.style.cssText     =     '-webkit-transition: all '     +     time     +     's ease-in-out; -webkit-transform: scale('     +     scale     +     ') rotate('     +     rotate     +     'deg) rotateX('     +     rotateX     +     'deg) rotateY('     +     rotateY     +     'deg) translate('     +     translateX     +     'px, '     +     translateY     +     'px) skew('     +     skewX     +     'deg, '     +     skewY     +     'deg)'     ;

        }     )     ;


        // Ensure chainability
        return     this     ;
    }     ,


    /**
     * Attaches an event listener to all selected elements.
     * @param {string} type - The event type (e.g., "click", "mouseover").
     * @param {Function} fn - The event handler function.
     * @returns {object} The 'p' object for chaining.
     */
    on     :     function     (     type     ,     fn     )     {

        // Loop through each of the currently selected DOM elements
        this.value     =     this.each.call     (     this.value     ,     function     (     i     )     {

            // Add the specified event listener to the current element.
            // The 'false' argument indicates event bubbling (not capturing).
            i.addEventListener     (     type     ,     fn     ,     false     )     ;

        }     )     ;


        // Return 'this' to maintain the chainable interface
        return     this     ;

    }

}     ;