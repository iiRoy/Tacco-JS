/*
 * Module for dynamic styling adjustments based on host application settings.
 * Manages the application of custom CSS rules at runtime.
 */

var stylingController = (function () {
    'use strict';

    // Internal cache for stylesheet elements to avoid repeated DOM lookups.
    var _sheetCache = {};

    // Configuration for color adjustments and thresholds
    const COLOR_OFFSET_DARK_VARIANT = 25; // Offset to calculate a darker background variant
    const COLOR_OFFSET_LIGHT_VARIANT = -90; // Offset to calculate a lighter background variant
    const TEXT_COLOR_LUMINANCE_THRESHOLD = 130; // Threshold for determining light/dark text color

    /**
     * Converts a single color component value (0-255) into its two-digit hexadecimal string representation.
     * Applies an optional adjustment and ensures the value stays within the valid range.
     * @private
     * @param {number} componentVal - The R, G, or B component value.
     * @param {number} [adjustment=0] - An optional numeric offset to apply to the component value.
     * @returns {string} The two-digit hexadecimal string. Returns "00" if input is invalid.
     */
    function _processColorComponent(componentVal, adjustment = 0) {
        if (typeof componentVal !== 'number' || isNaN(componentVal)) {
            console.warn("Invalid color component value received, defaulting to 0:", componentVal);
            return "00"; // Default to black component if invalid
        }

        let modifiedVal = componentVal;
        if (typeof adjustment === 'number' && !isNaN(adjustment)) {
            modifiedVal += adjustment;
        }

        // Clamp the value between 0 and 255 and round to the nearest integer
        modifiedVal = Math.max(0, Math.min(255, Math.round(modifiedVal)));

        // Convert to hex and pad with leading zero if necessary, then convert to uppercase
        return modifiedVal.toString(16).padStart(2, '0').toUpperCase();
    }

    /**
     * Converts an RGB color object into a 6-digit hexadecimal string.
     * Applies an optional numeric offset to each color component.
     * @param {object} inputRgbColor - An object with 'red', 'green', and 'blue' properties (0-255).
     * @param {number} [colorAdjustment=0] - An optional numeric offset to apply to each color component.
     * @returns {string} The 6-digit hexadecimal color string (e.g., "RRGGBB"). Returns empty string on invalid input.
     */
    function convertRgbToHexString(inputRgbColor, colorAdjustment = 0) {
        if (!inputRgbColor || typeof inputRgbColor.red !== 'number' ||
            typeof inputRgbColor.green !== 'number' || typeof inputRgbColor.blue !== 'number') {
            console.warn("Invalid RGB color object provided for conversion, returning empty string.");
            return ""; // Return empty string for invalid input
        }

        const hexComponents = [
            _processColorComponent(inputRgbColor.red, colorAdjustment),
            _processColorComponent(inputRgbColor.green, colorAdjustment),
            _processColorComponent(inputRgbColor.blue, colorAdjustment)
        ];

        return hexComponents.join('');
    }

    /**
     * Applies a CSS rule to a specified stylesheet, caching the stylesheet element for performance.
     * Includes a basic check to prevent adding identical rules multiple times.
     * @param {string} sheetId - The ID of the HTML <style> or <link> element.
     * @param {string} cssSelector - The CSS selector (e.g., ".myClass", "body").
     * @param {string} ruleDeclaration - The CSS rule declaration (e.g., "background-color: #FFF;").
     */
    function injectCssRule(sheetId, cssSelector, ruleDeclaration) {
        if (!sheetId || typeof sheetId !== 'string' || !cssSelector || typeof cssSelector !== 'string' || !ruleDeclaration || typeof ruleDeclaration !== 'string') {
            console.error("Invalid sheet ID, CSS selector, or rule declaration provided for rule injection.");
            return;
        }

        let targetSheet = _sheetCache[sheetId];

        // Retrieve and cache the stylesheet if not already available
        if (!targetSheet) {
            const styleElement = document.getElementById(sheetId);
            if (styleElement && styleElement.sheet) {
                targetSheet = styleElement.sheet;
                _sheetCache[sheetId] = targetSheet; // Cache the sheet object for future use
            } else {
                console.warn(`Stylesheet with ID "${sheetId}" not found or has no sheet property. Cannot inject rule.`);
                return;
            }
        }

        try {
            // Check if the exact rule already exists to avoid redundancy.
            // This is a basic check and might need more sophistication for complex rules or dynamic values.
            let ruleExists = false;
            if (targetSheet.cssRules) {
                const fullRuleText = `${cssSelector} { ${ruleDeclaration} }`;
                for (let i = 0; i < targetSheet.cssRules.length; i++) {
                    const rule = targetSheet.cssRules[i];
                    // Compare the full rule text, or at least selector and declaration
                    if (rule.selectorText === cssSelector && rule.cssText.includes(ruleDeclaration)) {
                        ruleExists = true;
                        break;
                    }
                }
            }

            if (!ruleExists) {
                if (targetSheet.addRule) { // IE-specific method
                    targetSheet.addRule(cssSelector, ruleDeclaration);
                } else if (targetSheet.insertRule) { // Standard method
                    targetSheet.insertRule(`${cssSelector} { ${ruleDeclaration} }`, targetSheet.cssRules.length);
                } else {
                    console.warn("Neither addRule nor insertRule methods found on stylesheet. Rule not applied.");
                }
            } else {
                // console.log(`Rule "${cssSelector} { ${ruleDeclaration} }" already exists, skipping.`); // Optional: log if rule exists
            }
        } catch (e) {
            console.error(`Error injecting CSS rule for selector "${cssSelector}":`, e);
        }
    }

    /**
     * Helper function to apply multiple CSS properties to a single selector.
     * Iterates over an object of properties and calls `injectCssRule` for each.
     * @private
     * @param {string} sheetId - The ID of the HTML <style> element.
     * @param {string} selector - The CSS selector.
     * @param {object} properties - An object where keys are CSS properties and values are their definitions.
     */
    function _applyMultipleRules(sheetId, selector, properties) {
        if (!properties || typeof properties !== 'object') {
            console.error("Invalid properties object provided for _applyMultipleRules.");
            return;
        }
        for (const prop in properties) {
            if (Object.prototype.hasOwnProperty.call(properties, prop)) {
                injectCssRule(sheetId, selector, `${prop}: ${properties[prop]}`);
            }
        }
    }

    /**
     * Updates the application's theme styling based on the provided host product skin information.
     * This function now uses a more structured and robust approach for applying CSS rules.
     * @param {object} skinData - The AppSkinInfo object retrieved from the host product.
     */
    function applyDynamicTheme(skinData) {
        // Basic validation for essential skin data
        if (!skinData || !skinData.panelBackgroundColor || typeof skinData.baseFontSize === 'undefined' || !skinData.baseFontFamily) {
            console.error("Incomplete or invalid skin data received. Cannot apply theme styles.");
            return;
        }

        const currentPanelBgColor = skinData.panelBackgroundColor.color;
        const baseHexBg = convertRgbToHexString(currentPanelBgColor);
        const darkHexBg = convertRgbToHexString(currentPanelBgColor, COLOR_OFFSET_DARK_VARIANT);
        const lightHexBg = convertRgbToHexString(currentPanelBgColor, COLOR_OFFSET_LIGHT_VARIANT);

        let computedTextColor = "F0F0F0"; // Default to a light text color
        // Determine text color based on the perceived luminance of the background
        // A simple check against a threshold for any component can indicate a generally lighter background.
        if (currentPanelBgColor.red > TEXT_COLOR_LUMINANCE_THRESHOLD ||
            currentPanelBgColor.green > TEXT_COLOR_LUMINANCE_THRESHOLD ||
            currentPanelBgColor.blue > TEXT_COLOR_LUMINANCE_THRESHOLD) {
            computedTextColor = "000000"; // Use dark text for lighter backgrounds
        }

        const dynamicStyleIdentifier = "cep-dynamic-app-styling"; // Unique ID for the dynamically generated style block

        // Ensure the dynamic style element exists in the document head
        if (!document.getElementById(dynamicStyleIdentifier)) {
            const styleElement = document.createElement('style');
            styleElement.id = dynamicStyleIdentifier;
            document.head.appendChild(styleElement);
            // Immediately cache the sheet object after creation
            _sheetCache[dynamicStyleIdentifier] = styleElement.sheet;
        }

        // Define a set of common properties for generic host elements
        const commonHostElementProperties = {
            "background-color": `#${baseHexBg}`,
            "font-size": `${skinData.baseFontSize}px`,
            "font-family": skinData.baseFontFamily,
            "color": `#${computedTextColor}`
        };

        // Apply these common properties to a general host element selector
        _applyMultipleRules(dynamicStyleIdentifier, ".host-interface-element", commonHostElementProperties);

        // Apply specific background color variants
        injectCssRule(dynamicStyleIdentifier, ".host-background-base", `background-color: #${baseHexBg}`);
        injectCssRule(dynamicStyleIdentifier, ".host-background-dark", `background-color: #${darkHexBg}`);
        injectCssRule(dynamicStyleIdentifier, ".host-background-light", `background-color: #${lightHexBg}`);

        // Apply specific font styling classes
        injectCssRule(dynamicStyleIdentifier, ".host-text-size", `font-size: ${skinData.baseFontSize}px`);
        injectCssRule(dynamicStyleIdentifier, ".host-text-family", `font-family: ${skinData.baseFontFamily}`);
        injectCssRule(dynamicStyleIdentifier, ".host-text-color", `color: #${computedTextColor}`);

        // Define styling for interactive button elements
        const buttonBaseBackground = `#${darkHexBg}`;
        const buttonHoverBackground = `#${baseHexBg}`;
        const buttonBorderColor = `#${lightHexBg}`;

        // Apply base button styles
        _applyMultipleRules(dynamicStyleIdentifier, ".interactive-button", {
            "background-color": buttonBaseBackground,
            "border": `1px solid ${buttonBorderColor}`, // Explicit border definition
            "color": `#${computedTextColor}`, // Ensure button text color is set
            "padding": "6px 12px", // Slightly adjusted padding
            "border-radius": "4px", // Slightly adjusted border-radius
            "cursor": "pointer", // Added cursor style for usability
            "transition": "background-color 0.2s ease" // Added transition for smoother hovers
        });

        // Apply button pseudo-class styles
        injectCssRule(dynamicStyleIdentifier, ".interactive-button:hover", `background-color: ${buttonHoverBackground}`);
        injectCssRule(dynamicStyleIdentifier, ".interactive-button:active", `background-color: ${buttonBaseBackground}`);
        injectCssRule(dynamicStyleIdentifier, ".interactive-button:focus", `outline: 2px solid ${buttonHoverBackground}; outline-offset: 2px;`); // Added focus state with offset

        // Add a new general utility rule for common spacing
        injectCssRule(dynamicStyleIdentifier, ".utility-spacing-medium", "margin: 10px; padding: 10px;");
    }

    /**
     * Handler for the theme color change event from the host application.
     * This function retrieves the updated skin information and applies the new theme.
     * @param {object} eventObject - The event object from the host.
     */
    function handleHostThemeChange(eventObject) {
        // Ensure that we are operating within an Adobe CEP environment
        if (typeof window.__adobe_cep__ === 'object' && window.__adobe_cep__.getHostEnvironment) {
            try {
                const environmentInfo = JSON.parse(window.__adobe_cep__.getHostEnvironment());
                if (environmentInfo && environmentInfo.appSkinInfo) {
                    applyDynamicTheme(environmentInfo.appSkinInfo);
                } else {
                    console.warn("App skin information not found in host environment during theme change event.");
                }
            } catch (error) {
                console.error("Failed to parse host environment information during theme change:", error);
            }
        } else {
            console.warn("Not in a valid Adobe CEP environment or getHostEnvironment is unavailable. Theme change ignored.");
        }
    }

    /**
     * Initializes the styling controller: fetches the initial theme settings and
     * registers an event listener for subsequent theme changes from the host application.
     */
    function setupStyling() {
        // Check for the availability of the CSInterface object
        if (typeof CSInterface === 'undefined') {
            console.error("CSInterface object is not defined. Cannot initialize dynamic styling controller.");
            return;
        }

        const cepService = new CSInterface();

        try {
            // Apply the initial theme settings when the panel loads
            if (cepService.hostEnvironment && cepService.hostEnvironment.appSkinInfo) {
                applyDynamicTheme(cepService.hostEnvironment.appSkinInfo);
            } else {
                console.warn("Initial host environment or app skin info not available.");
            }
        } catch (error) {
            console.error("Error applying initial theme during setup:", error);
        }

        // Register the event listener for theme color changes
        cepService.addEventListener(CSInterface.THEME_COLOR_CHANGED_EVENT, handleHostThemeChange);

        // Confirmation log for successful initialization
        console.info("Dynamic styling controller initialized and listening for host theme changes.");
    }

    // Expose the initialization function as the public API of the module
    return {
        init: setupStyling
    };

}());