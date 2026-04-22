// This file provides extended validation features with Bootstrap tooltips.
// Original source: Thrilleratplay
// Version: 1.0.0
// License: MIT

(function(jQ) {
    // Ensure jQ.validator.prototype exists before extending it.
    if (!jQ.validator || !jQ.validator.prototype) {
        console.warn("jQuery Validation plugin not found. Tooltip extension will not be applied.");
        return;
    }

    jQ.extend(true, jQ.validator.prototype, {

        // Function to manage the display of validation messages using tooltips.
        // It processes both successfully validated and failed elements.
        displayValidationMessages: function() {
            const currentContext = this; // Reference to the validator instance.
            const validationOptions = currentContext.settings; // Cache settings for efficiency.

            // Helper to manage element classes and tooltip destruction.
            const manageElementState = function(domElement, isValid) {
                const elementRef = jQ(domElement);
                elementRef.tooltip('destroy'); // Always destroy any existing tooltip first.
                if (isValid) {
                    elementRef.removeClass(validationOptions.errCls).addClass(validationOptions.okCls);
                } else {
                    elementRef.removeClass(validationOptions.okCls).addClass(validationOptions.errCls);
                }
            };

            // Process elements that passed validation.
            if (currentContext.validElementsArray && currentContext.validElementsArray.length > 0) {
                currentContext.validElementsArray.forEach(function(domItem) {
                    manageElementState(domItem, true);
                    // Invoke custom unhighlighting logic if defined.
                    if (typeof validationOptions.resetHighlight === 'function') {
                        validationOptions.resetHighlight.call(
                            currentContext,
                            domItem,
                            validationOptions.errCls,
                            validationOptions.okCls
                        );
                    }
                });
            }

            // Process elements that failed validation.
            if (currentContext.invalidElementsArray && currentContext.invalidElementsArray.length > 0) {
                currentContext.invalidElementsArray.forEach(function(errorObj) {
                    const targetElement = errorObj.element;
                    const errorMsg = errorObj.message;

                    // Ensure targetElement is a valid DOM element.
                    if (!targetElement) {
                        return; // Skip if element is null/undefined.
                    }

                    manageElementState(targetElement, false); // Set error class and destroy old tooltip.

                    // Generate tooltip configuration and display it.
                    const tipConfig = currentContext.generateTooltipSettings(targetElement, errorMsg);
                    jQ(targetElement)
                        .tooltip(tipConfig) // Apply new tooltip options.
                        .tooltip('show'); // Show the tooltip.

                    // Invoke custom highlighting logic if defined.
                    if (typeof validationOptions.applyHighlight === 'function') {
                        validationOptions.applyHighlight.call(
                            currentContext,
                            targetElement,
                            validationOptions.errCls,
                            validationOptions.okCls
                        );
                    }
                });
            }
        },

        // Constructs the configuration object for a Bootstrap tooltip.
        // Parameters:
        //   targetElement: The DOM element for which to generate tooltip settings.
        //   validationMessage: The message to be displayed in the tooltip.
        generateTooltipSettings: function(targetElement, validationMessage) {
            const elementWrapper = jQ(targetElement);
            // Default configuration for tooltips, potentially overridden by data attributes or global settings.
            let tooltipConfiguration = {
                animEffect: elementWrapper.data('animation') !== undefined ? elementWrapper.data('animation') : true,
                isHtmlContent: elementWrapper.data('html') || false,
                position: elementWrapper.data('placement') || 'top',
                targetSelector: elementWrapper.data('selector') || false, // Note: original used 'animation' here, might be a bug. Assuming 'selector'.
                displayTitle: elementWrapper.attr('title') || validationMessage,
                activationEvent: 'manual ' + (elementWrapper.data('trigger') ? elementWrapper.data('trigger') : ''),
                showDelay: elementWrapper.data('delay') || 0,
                containingElement: elementWrapper.data('container') || false
            };

            // Trim activationEvent whitespace.
            tooltipConfiguration.activationEvent = jQ.trim(tooltipConfiguration.activationEvent);

            const instanceSettings = this.settings;

            // Apply element-specific tooltip overrides from validator settings.
            if (instanceSettings.tipSettings && instanceSettings.tipSettings[targetElement.name]) {
                jQ.extend(true, tooltipConfiguration, instanceSettings.tipSettings[targetElement.name]);
            }

            // Apply global tooltip overrides from validator settings.
            if (instanceSettings.tipSettings && instanceSettings.tipSettings._global_) {
                jQ.extend(true, tooltipConfiguration, instanceSettings.tipSettings._global_);
            }

            return tooltipConfiguration;
        }
    });

}(jQuery));