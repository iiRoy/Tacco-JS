/* This file provides Bootstrap integration components for Knockout.js.
 * It's structured to support various module loading environments.
 */
(function (pluginInitializer) {
    "use strict"; // Enforce strict mode for better code quality and error handling.

    // Check for AMD (Asynchronous Module Definition) loader, e.g., Require.js
    if (typeof define === 'function' && define.amd) {
        // Define an anonymous AMD module with its dependencies.
        define(["require", "exports", "knockout", "jquery"], function (req, moduleExports, koLib, jqLib) {
            // Pass the core Knockout and jQuery instances to the main plugin setup function.
            pluginInitializer(koLib, jqLib);
        });
    } else {
        // If no AMD loader is present, assume a global script include scenario.
        // Attach the plugin setup function to the globally available 'ko' and 'jQuery' objects.
        if (typeof window.ko === 'undefined' || typeof window.jQuery === 'undefined') {
            console.warn("Knockout.js or jQuery not found globally. Bootstrap integration may not function.");
            return; // Exit if dependencies are missing.
        }
        pluginInitializer(window.ko, window.jQuery);
    }
}(function initializeKoPlugins(koInstance, jqRef) {
    "use strict"; // Re-enforce strict mode within the main setup function.

    // Helper function to generate a simple non-RFC4122 compliant unique ID string.
    var idMaker = (function (hexSegmentGenerator) {
        // Returns a function that, when called, produces a UUID-like string.
        return function createNewUniqueId() {
            // Concatenate segments to form a unique identifier.
            return hexSegmentGenerator() + hexSegmentGenerator() + '-' + hexSegmentGenerator() + '-' + hexSegmentGenerator() + '-' + hexSegmentGenerator() + '-' + hexSegmentGenerator() + hexSegmentGenerator() + hexSegmentGenerator();
        };
    })(function generateSingleHexSegment() {
        // Generates a 4-character hexadecimal segment.
        const segmentValue = (1 + Math.random()) * 0x10000; // Generate a random number between 1 and 65536.
        return Math.floor(segmentValue)
            .toString(16) // Convert to hexadecimal string.
            .substring(1); // Remove the leading '1' to get a 4-char segment.
    });

    // Extend jQuery to include a method for retrieving an element's outer HTML.
    // This is useful for contexts where native .outerHTML might not be available or needs polyfilling.
    if (!jqRef.fn.getOuterMarkup) {
        jqRef.fn.getOuterMarkup = function () {
            // If the jQuery selection is empty, there's no markup to return.
            if (!this.length) {
                console.warn("Attempted to get outer markup of an empty jQuery selection.");
                return ''; // Return an empty string instead of false for consistency.
            }

            const targetElement = this[0]; // Get the raw DOM element.

            // If the native outerHTML property is available, use it directly.
            if (targetElement.outerHTML) {
                return targetElement.outerHTML;
            }

            // Fallback for browsers without native outerHTML (older versions or specific contexts).
            const tagNameLower = targetElement.tagName.toLowerCase();
            const attributeList = jqRef.map(targetElement.attributes, function (attr) {
                // Format attributes as 'name="value"'.
                return attr.name + '="' + attr.value + '"';
            });

            // Construct the outer HTML string manually.
            const attributesString = attributeList.length > 0 ? " " + attributeList.join(" ") : "";
            return "<" + tagNameLower + attributesString + ">" + targetElement.innerHTML + "</" + tagNameLower + ">";
        };
    }

    // Register a Knockout binding handler for Twitter Typeahead.js (or similar auto-suggest libraries).
    koInstance.bindingHandlers.autoSuggest = {
        initializeBinding: function (boundElement, valueProvider, bindingOptionsProvider, dataContext, executionScope) {
            const jQueryElement = jqRef(boundElement);
            const currentBindings = bindingOptionsProvider(); // Get all binding options.

            // Inner function to create a filter for substring matches.
            const partialMatchFilter = function (sourceStrings) {
                // Ensure sourceStrings is an array before proceeding.
                if (!Array.isArray(sourceStrings)) {
                    console.error("AutoSuggest binding expects an array for source strings.", sourceStrings);
                    return function (queryInput, callbackFunction) { callbackFunction([]); }; // Return a no-op matcher.
                }

                return function findSuggestions(queryInput, callbackFunction) {
                    let foundSuggestions = [];
                    const searchPattern = new RegExp(queryInput, 'i'); // Case-insensitive regex for the query.

                    // Iterate through the provided string pool to find matches.
                    sourceStrings.forEach(function (currentString) {
                        if (searchPattern.test(currentString)) {
                            // The underlying typeahead plugin expects an object with a 'value' property.
                            foundSuggestions.push({ value: currentString });
                        }
                    });

                    callbackFunction(foundSuggestions); // Pass the results to the typeahead callback.
                };
            };

            // Prepare options for the typeahead plugin.
            const suggestionOptions = {
                // The source for suggestions is derived from the bound value (unwrapped if observable).
                source: partialMatchFilter(koInstance.utils.unwrapObservable(valueProvider()))
            };

            // Merge additional typeahead options if provided in the binding.
            if (currentBindings.autoSuggestOptions) {
                jqRef.each(currentBindings.autoSuggestOptions, function (optionKey, optionVal) {
                    suggestionOptions[optionKey] = koInstance.utils.unwrapObservable(optionVal);
                });
            }

            // Initialize the typeahead plugin on the element.
            jQueryElement.prop("autocomplete", "off").typeahead({
                hint: true, // Show a hint.
                highlight: true, // Highlight matching parts.
                minimumCharacters: 1 // Require at least one character to start suggesting.
            }, suggestionOptions);
        }
    };

    // Register a Knockout binding handler for Bootstrap progress bars.
    koInstance.bindingHandlers.progressBar = {
        setupProgressIndicator: function (targetJqElement, valueProvider, bindingOptionsProvider, dataContext, executionScope) {
            const currentProgressValue = koInstance.utils.unwrapObservable(valueProvider());

            // Validate that the value is a number.
            if (typeof currentProgressValue !== 'number' || isNaN(currentProgressValue)) {
                console.warn("Progress bar binding expects a numeric value.", currentProgressValue);
                // Default to 0% if invalid.
            }

            // Create the inner progress bar element.
            const progressSegment = jqRef('<div/>', {
                'class': 'progress-bar',
                // Data-bind for dynamic width based on the value.
                'data-bind': 'style: { width: ' + currentProgressValue + '% }',
                'role': 'progressbar',
                'aria-valuenow': currentProgressValue,
                'aria-valuemin': 0,
                'aria-valuemax': 100
            });

            // Set a unique ID on the container, add Bootstrap progress classes, and append the bar.
            targetJqElement.attr('id', idMaker()) // Assign a generated unique ID.
                .addClass('progress progress-striped active') // Add standard Bootstrap progress classes.
                .append(progressSegment); // Insert the inner bar.

            // Apply bindings to the descendants of the progress bar (i.e., the progressSegment).
            koInstance.applyBindingsToDescendants(dataContext, targetJqElement[0]);
        }
    };

    // Register a Knockout binding handler for Bootstrap alerts.
    koInstance.bindingHandlers.notificationDisplay = {
        prepareAlertComponent: function (alertContainer, valueProvider, bindingOptionsProvider, dataContext, executionScope) {
            const notificationDetails = koInstance.utils.unwrapObservable(valueProvider());

            // Ensure notificationDetails is an object and has a message.
            if (!notificationDetails || typeof notificationDetails.message !== 'string') {
                console.warn("Notification display binding requires an object with a 'message' property.", notificationDetails);
                return; // Do not render if essential data is missing.
            }

            // Create the dismiss button.
            const closeButton = jqRef('<button/>', {
                'type': 'button',
                'class': 'close',
                'data-dismiss': 'alert', // Bootstrap's data attribute for closing alerts.
                'aria-label': 'Close'
            }).html('&times;'); // HTML entity for a multiplication sign (common close icon).

            // Create the paragraph for the alert message.
            const messageParagraph = jqRef('<p/>').html(notificationDetails.message);

            // Add Bootstrap alert classes based on priority (e.g., 'alert-danger', 'alert-success').
            alertContainer.addClass('alert alert-dismissible alert-' + (notificationDetails.priority || 'info')) // Default to 'info' if no priority.
                .append(closeButton) // Add the close button first.
                .append(messageParagraph); // Then add the message content.
        }
    };

    // Register a Knockout binding handler for Bootstrap tooltips.
    koInstance.bindingHandlers.hintDisplay = {
        update: function (hintTarget, valueProvider, bindingOptionsProvider, dataContext, executionScope) {
            const jQueryHintTarget = jqRef(hintTarget);
            const hintConfig = koInstance.utils.unwrapObservable(valueProvider());
            let titleSubscription = null; // To hold the subscription if the title is observable.

            // Ensure hintConfig is an object.
            if (typeof hintConfig !== 'object' || hintConfig === null) {
                console.warn("Hint display binding expects an object for configuration.", hintConfig);
                return;
            }

            // If the tooltip's title is an observable, we need to set up a subscription
            // to update the tooltip dynamically when the title changes.
            if (koInstance.isObservable(hintConfig.title)) {
                let hintCurrentlyShown = false; // Track tooltip visibility.

                // Event handlers for showing/hiding the tooltip.
                jQueryHintTarget.on('show.bs.tooltip', function () {
                    hintCurrentlyShown = true;
                });
                jQueryHintTarget.on('hide.bs.tooltip', function () {
                    hintCurrentlyShown = false;
                });

                // Store the original animation setting. Bootstrap defaults to true.
                const initialAnimationSetting = hintConfig.animation !== undefined ? hintConfig.animation : true;

                // Subscribe to changes in the observable title.
                titleSubscription = hintConfig.title.subscribe(function () {
                    if (hintCurrentlyShown) {
                        // Temporarily disable animation to prevent flickering during title update.
                        const bsTooltipInstance = jQueryHintTarget.data('bs.tooltip');
                        if (bsTooltipInstance && bsTooltipInstance.options) {
                            bsTooltipInstance.options.animation = false;
                        }

                        // Update the title and re-show the tooltip.
                        jQueryHintTarget.tooltip('fixTitle') // Forces the tooltip to re-read its title attribute.
                            .tooltip('show');

                        // Restore the original animation setting.
                        if (bsTooltipInstance && bsTooltipInstance.options) {
                            bsTooltipInstance.options.animation = initialAnimationSetting;
                        }
                    }
                });
            }

            // Get the existing Bootstrap tooltip instance, if any.
            let currentHintInstance = jQueryHintTarget.data('bs.tooltip');

            if (currentHintInstance) {
                // If a tooltip already exists, extend its options with new ones.
                jqRef.extend(currentHintInstance.options, hintConfig);
            } else {
                // If no tooltip exists, initialize a new one.
                jQueryHintTarget.tooltip(hintConfig);
            }

            // Ensure the tooltip is properly destroyed when the DOM node is removed.
            koInstance.utils.domNodeDisposal.addDisposeCallback(hintTarget, function () {
                if (titleSubscription) {
                    titleSubscription.dispose(); // Clean up the observable subscription.
                }
                jQueryHintTarget.tooltip('destroy'); // Destroy the Bootstrap tooltip instance.
            });
        }
    };

    // Register a Knockout binding handler for Bootstrap popovers.
    koInstance.bindingHandlers.infoPopup = {
        initPopupComponent: function (popupTrigger, valueProvider, bindingOptionsProvider, dataContext, executionScope) {
            const jQueryPopupTrigger = jqRef(popupTrigger);
            const popupConfigValues = koInstance.utils.unwrapObservable(valueProvider());

            // Validate configuration.
            if (typeof popupConfigValues !== 'object' || popupConfigValues === null) {
                console.error("Info popup binding requires an object for configuration.", popupConfigValues);
                return { controlsDescendantBindings: false };
            }

            const contentTemplate = popupConfigValues.template || null; // Template name for popover content.
            const popupOptions = popupConfigValues.options || { title: 'Information' }; // Default options.
            const templateData = popupConfigValues.data || null; // Data context for the template.

            // If a template is specified, configure the popover content to use it.
            if (contentTemplate) {
                if (templateData) {
                    // If data is provided, use KO template binding syntax in content.
                    popupOptions.content = "<!-- ko template: { name: '" + contentTemplate + "', if: true, data: data } --><!-- /ko -->";
                } else {
                    // Otherwise, fetch raw HTML from a template element.
                    const templateSource = document.getElementById(contentTemplate);
                    popupOptions.content = templateSource ? templateSource.innerHTML : '';
                    if (!templateSource) {
                        console.warn("Info popup: Template element with ID '" + contentTemplate + "' not found.");
                    }
                }
                popupOptions.html = true; // Essential for rendering HTML content.
            }

            // Event listener for when the popover is actually shown.
            jQueryPopupTrigger.on('shown.bs.popover', function (event) {
                const eventPopupData = jqRef(event.target).data();
                const popupInstance = eventPopupData['bs.popover'];

                if (!popupInstance) {
                    console.error("Could not retrieve Bootstrap popover instance on 'shown' event.");
                    return;
                }

                const popupElement = popupInstance.$tip; // The jQuery object for the popover element itself.
                const currentPopupOptions = popupInstance.options || {};
                const triggerButton = jqRef(event.target);

                // Apply Knockout bindings to the popover content if a template is used.
                // This allows dynamic content within the popover.
                if (contentTemplate) {
                    if (templateData) {
                        koInstance.applyBindings({ template: contentTemplate, data: templateData }, popupElement[0]);
                    } else {
                        // If no specific data, bind to the original view model.
                        koInstance.applyBindings(dataContext, popupElement[0]);
                    }
                }

                // Add a click handler to any button with data-dismiss="popover" inside the popup.
                popupElement.find('button[data-dismiss="popover"]').on('click', function () {
                    triggerButton.popover('hide');
                });

                // Manual repositioning logic (Bootstrap often handles this, but this code suggests custom adjustments).
                const btnPos = triggerButton.position();
                const btnDims = {
                    x: triggerButton.outerWidth(),
                    y: triggerButton.outerHeight()
                };
                const popupDims = {
                    x: popupElement.outerWidth(),
                    y: popupElement.outerHeight()
                };

                switch (currentPopupOptions.placement) {
                    case 'right':
                        popupElement.css({
                            left: btnDims.x + btnPos.left,
                            top: (btnDims.y / 2 + btnPos.top) - popupDims.y / 2
                        });
                        break;
                    case 'left':
                        popupElement.css({
                            left: btnPos.left - popupDims.x,
                            top: (btnDims.y / 2 + btnPos.top) - popupDims.y / 2
                        });
                        break;
                    case 'top':
                        popupElement.css({
                            left: btnPos.left + (btnDims.x / 2 - popupDims.x / 2),
                            top: btnPos.top - popupDims.y
                        });
                        break;
                    case 'bottom':
                        popupElement.css({
                            left: btnPos.left + (btnDims.x / 2 - popupDims.x / 2),
                            top: btnPos.top + btnDims.y
                        });
                        break;
                    // Default placement handled by Bootstrap, no custom CSS needed here.
                }
            });

            // Initialize the Bootstrap popover plugin.
            jQueryPopupTrigger.popover(popupOptions);

            // Clean up the popover when the DOM node is removed.
            koInstance.utils.domNodeDisposal.addDisposeCallback(popupTrigger, function () {
                jQueryPopupTrigger.popover('destroy');
            });

            // Inform Knockout that this binding handler controls its descendants.
            return { controlsDescendantBindings: true };
        }
    };

    // Register a Knockout binding handler for Bootstrap modals (dialog boxes).
    koInstance.bindingHandlers.dialogBox = {
        setupDialogBox: function (dialogTrigger, valueProvider, bindingOptionsProvider, dataContext, executionScope) {
            const jQueryDialogTrigger = jqRef(dialogTrigger);
            const dialogConfiguration = koInstance.utils.unwrapObservable(valueProvider());

            // Validate configuration.
            if (typeof dialogConfiguration !== 'object' || dialogConfiguration === null) {
                console.error("Dialog box binding requires an object for configuration.", dialogConfiguration);
                return { controlsDescendantBindings: false };
            }

            const dialogTemplateName = dialogConfiguration.template || null; // ID of the template for modal content.
            const dialogOptions = dialogConfiguration.options || {}; // Bootstrap modal options.
            const templateDataContext = dialogConfiguration.data || null; // Data to bind to the template.
            const applyFadeEffect = dialogConfiguration.fade || false; // Apply fade animation.
            const onDialogOpened = dialogConfiguration.openCallback || null; // Callback after modal is shown.

            // Ensure the modal initially hidden.
            dialogOptions.show = false;

            // Prepare attributes for the modal div.
            const dialogAttributes = {
                'class': "modal" + (applyFadeEffect ? ' fade' : ''), // Add 'fade' class if animation is desired.
                'tabindex': '-1', // Make the modal focusable.
                'role': 'dialog', // ARIA role for accessibility.
                'aria-hidden': 'true' // Initially hidden from screen readers.
            };

            // If template data is provided, use KO's template binding for the modal content.
            if (templateDataContext && dialogTemplateName) {
                dialogAttributes['data-bind'] = "template: { name: '" + dialogTemplateName + "', if: true, data: data }";
            }

            const dialogInstance = jqRef('<div/>', dialogAttributes); // Create the modal container.

            // If no template data, fetch raw HTML from a template element.
            if (!templateDataContext && dialogTemplateName) {
                const templateSource = document.getElementById(dialogTemplateName);
                dialogInstance.html(templateSource ? templateSource.innerHTML : '');
                if (!templateSource) {
                    console.warn("Dialog box: Template element with ID '" + dialogTemplateName + "' not found.");
                }
            }

            dialogInstance.modal(dialogOptions); // Initialize the Bootstrap modal.

            // Attach a click event handler to the trigger element.
            jQueryDialogTrigger.on('click', function (event) {
                event.preventDefault(); // Prevent default action (e.g., navigating if it's a link).

                // Apply Knockout bindings to the modal's content.
                if (templateDataContext && dialogTemplateName) {
                    koInstance.applyBindings({
                        template: dialogTemplateName,
                        data: templateDataContext
                    }, dialogInstance[0]);
                } else {
                    // If no specific data context for the template, bind to the parent view model.
                    koInstance.applyBindings(dataContext, dialogInstance[0]);
                }

                dialogInstance.modal('show'); // Show the modal.

                // Execute the optional callback after the modal is shown.
                if (typeof onDialogOpened === 'function') {
                    onDialogOpened();
                }

                // Adjust backdrop height to cover the entire window, fixing potential scroll issues.
                // This is often a workaround for specific Bootstrap/browser quirks.
                jqRef(document).find('.modal-backdrop').css({ height: jqRef(window).height(), position: 'fixed' });
            });

            // Clean up the modal when the DOM node is removed.
            koInstance.utils.domNodeDisposal.addDisposeCallback(dialogTrigger, function () {
                // Ensure the modal is hidden and removed from the DOM.
                if (dialogInstance.data('bs.modal')) { // Check if Bootstrap modal is initialized.
                    dialogInstance.modal('hide'); // Hide first to trigger events.
                    dialogInstance.modal('destroy'); // Then destroy.
                }
                dialogInstance.remove(); // Remove the modal element from the DOM.
            });

            // Inform Knockout that this binding handler manages descendant bindings.
            return { controlsDescendantBindings: true };
        }
    };
}));