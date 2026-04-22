/*
 * This file contains JSLint directives and global declarations.
 * It configures JSLint for specific checks and declares global variables.
 * For example, 'vars: true' allows multiple var statements in a function.
 */
/* jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */

/*
 * Global objects available in the environment.
 * 'window' and 'document' are standard browser objects.
 * 'CSInterface' is likely an Adobe CEP specific interface.
 */
/* global window, document, CSInterface */

/*
 * This module, 'themeManager', is specifically designed
 * to dynamically apply and update CSS styles.
 * Its primary role is to adapt the application's theme
 * based on user-defined settings from the Creative Cloud (CC) application.
 * It ensures the user interface reflects the chosen aesthetic.
 */

var themeManager = ( function ( ) {
    // Enforce strict mode for cleaner code and fewer errors.
    'use strict';

    // This is the core 'themeManager' module.
    // It encapsulates all theme-related functionalities.

    /**
     * Converts a given color object into its hexadecimal string representation.
     * Optionally applies a delta value to each color component (red, green, blue)
     * before conversion, allowing for slight variations (e.g., darker/lighter shades).
     * @param {object} color - An object with red, green, and blue properties (0-255).
     * @param {number} [delta] - An optional numeric value to add/subtract from each color component.
     * @returns {string} The hexadecimal string representation of the color (e.g., "RRGGBB").
     */
    function toHex ( color, delta )
    {
        /**
         * Helper function to compute and convert a single color component to hex.
         * Ensures the value stays within 0-255 range and formats it to two hex digits.
         * @param {number} value - The initial color component value (0-255).
         * @param {number} [delta] - An optional adjustment for the value.
         * @returns {string} The two-digit hexadecimal string for the component.
         */
        function computeValue ( value, delta )
        {
            var computedValue =   ! isNaN ( delta )   ?   value + delta   :   value;

            // Ensure the computed color value remains within the valid 0-255 range.
            if ( computedValue < 0 )
            {
                computedValue = 0;
            }
            else if ( computedValue > 255 )
            {
                computedValue = 255;
            }

            // Round down to the nearest integer.
            computedValue = Math . floor ( computedValue );

            // Convert to hexadecimal string.
            computedValue = computedValue . toString ( 16 );
            // Prepend a '0' if the hex string is a single digit (e.g., 'F' becomes '0F').
            return computedValue . length === 1   ?   "0" + computedValue   :   computedValue;
        }

        var hex = ""; // Initialize the hexadecimal string accumulator.

        // Only proceed if a color object is provided.
        if ( color )
        {
            // Concatenate the hex values of red, green, and blue components.
            hex =   computeValue ( color . red, delta )
                  + computeValue ( color . green, delta )
                  + computeValue ( color . blue, delta );
        }

        return hex; // Return the final hexadecimal color string.
    }


    /**
     * Computes the "reversed" (complementary) color in hexadecimal format.
     * The reversal is based on subtracting each component from 255.
     * @param {object} color - The original color object with red, green, blue components.
     * @param {number} [delta] - An optional delta value to apply during hex conversion.
     * @returns {string} The hexadecimal string of the reversed color.
     */
    function reverseColor ( color, delta )
    {
        // Calculate the absolute difference from 255 for each color component
        // to get a "reversed" effect, then convert to hex.
        return toHex (
            {
                red:   Math . abs ( 255 - color . red ),
                green: Math . abs ( 255 - color . green ),
                blue:  Math . abs ( 255 - color . blue )
            },
            delta
        );
    }


    /**
     * Adds a CSS rule to a specified stylesheet.
     * It supports both 'addRule' (IE-specific) and 'insertRule' (standard) methods.
     * @param {string} stylesheetId - The ID of the <style> element to add the rule to.
     * @param {string} selector - The CSS selector for the rule (e.g., ".myClass").
     * @param {string} rule - The CSS declaration block (e.g., "color: red; font-size: 12px;").
     */
    function addRule ( stylesheetId, selector, rule )
    {
        // Retrieve the stylesheet element by its ID.
        var stylesheet = document . getElementById ( stylesheetId );

        // Proceed only if the stylesheet element exists.
        if ( stylesheet )
        {
            // Access the actual CSSStyleSheet object.
            stylesheet = stylesheet . sheet;

            // Check for browser-specific methods to add rules.
            if ( stylesheet . addRule )
            {
                // Internet Explorer compatible method.
                stylesheet . addRule ( selector, rule );
            }
            else if ( stylesheet . insertRule )
            {
                // Standard W3C method for modern browsers.
                // The rule needs to be wrapped in curly braces for insertRule.
                stylesheet . insertRule (
                    selector + ' { ' + rule + ' }',
                    stylesheet . cssRules . length
                );
            }
        }
    }


    /**
     * Applies theme updates based on the provided application skin information.
     * This function extracts color and font settings and dynamically injects
     * CSS rules to style various UI elements.
     * @param {object} appSkinInfo - An object containing theme details like
     *                                panel background color, font size, and font family.
     */
    function updateThemeWithAppSkinInfo ( appSkinInfo )
    {
        // Extract the base panel background color.
        var panelBgColor =   appSkinInfo . panelBackgroundColor . color;

        // Convert the base background color to a hexadecimal string.
        var bgdColor =   toHex ( panelBgColor );

        // Calculate a darker variation of the background color.
        var darkBgdColor =   toHex ( panelBgColor, 20 );

        // Determine the font color based on the luminosity of the panel background.
        // If background is light (red component > 122), use dark font; otherwise, use light font.
        var fontColor = "F0F0F0"; // Default light font color.
        if ( panelBgColor . red > 122 )
        {
            fontColor = "000000"; // Dark font color for light backgrounds.
        }

        // Calculate a lighter variation of the background color.
        var lightBgdColor =   toHex ( panelBgColor, -100 );

        // Define the ID for the dynamic stylesheet.
        var styleId = "hostStyle";

        // Apply styles to elements with the '.hostElt' class.
        // These rules set background, font size, font family, and font color.
        addRule ( styleId, ".hostElt", "background-color:" + "#" + bgdColor );
        addRule ( styleId, ".hostElt", "font-size:" + appSkinInfo . baseFontSize + "px;" );
        addRule ( styleId, ".hostElt", "font-family:" + appSkinInfo . baseFontFamily );
        addRule ( styleId, ".hostElt", "color:" + "#" + fontColor );

        // Apply background color styles for specific background elements.
        addRule ( styleId, ".hostBgd",      "background-color:" + "#" + bgdColor );
        addRule ( styleId, ".hostBgdDark",  "background-color: " + "#" + darkBgdColor );
        addRule ( styleId, ".hostBgdLight", "background-color: " + "#" + lightBgdColor );

        // Apply font-specific styles to elements.
        addRule ( styleId, ".hostFontSize",    "font-size:" + appSkinInfo . baseFontSize + "px;" );
        addRule ( styleId, ".hostFontFamily",  "font-family:" + appSkinInfo . baseFontFamily );
        addRule ( styleId, ".hostFontColor",   "color:" + "#" + fontColor );

        // Consolidate font styles for a general '.hostFont' class.
        addRule ( styleId, ".hostFont", "font-size:" + appSkinInfo . baseFontSize + "px;" );
        addRule ( styleId, ".hostFont", "font-family:" + appSkinInfo . baseFontFamily );
        addRule ( styleId, ".hostFont", "color:" + "#" + fontColor );

        // Apply styles for button elements, including hover and active states.
        addRule ( styleId, ".hostButton",          "background-color:" + "#" + darkBgdColor );
        addRule ( styleId, ".hostButton:hover",    "background-color:" + "#" + bgdColor );
        addRule ( styleId, ".hostButton:active",   "background-color:" + "#" + darkBgdColor );
        addRule ( styleId, ".hostButton",          "border-color: " + "#" + lightBgdColor );

    }


    /**
     * Event handler for when the application's theme color changes.
     * It retrieves the updated skin information and applies it to the UI.
     * @param {object} event - The event object, typically from a CEP event listener.
     */
    function onAppThemeColorChanged ( event )
    {
        // Parse the host environment string to get the latest skin information.
        var skinInfo =   JSON . parse ( window . __adobe_cep__ . getHostEnvironment ( ) ) . appSkinInfo;

        // Update the theme using the newly retrieved skin information.
        updateThemeWithAppSkinInfo ( skinInfo );
    }


    /**
     * Initializes the theme manager.
     * This function sets up the initial theme based on the current host environment
     * and registers an event listener for theme color changes.
     */
    function init ( )
    {
        // Create a new instance of CSInterface, which provides communication with the host application.
        var csInterface =   new CSInterface ( );

        // Apply the initial theme settings from the host application's skin information.
        updateThemeWithAppSkinInfo ( csInterface . hostEnvironment . appSkinInfo );

        // Register an event listener to respond to theme color changes from the host.
        csInterface . addEventListener (
            CSInterface . THEME_COLOR_CHANGED_EVENT,
            onAppThemeColorChanged
        );
    }

    // Public API of the themeManager module.
    return {
        init: init // Expose the initialization function.
    };

}() ); // Immediately invoke the function to create the module.