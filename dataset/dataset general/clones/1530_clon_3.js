(function ($) {

    // Main jQuery plugin entry point for enhancing native select elements
    $.fn.enhanceSelect = function (actionName) {

        // Collection of public methods available for the plugin
        const pluginActions = {
            // Initializes the custom select widget
            initialize: function (userOptions) {
                const contextRef = this; // Reference to the jQuery collection the plugin is called on
                // Consolidate default configuration with user-provided settings
                contextRef.enhanceSelect.configOptions = $.extend(true, {}, contextRef.enhanceSelect.defaults, userOptions);

                // Iterate over each selected native <select> element to apply the enhancement
                return contextRef.each(function () {
                    const $hostElement = $(this); // jQuery wrapper for the current DOM element
                    const domHostElement = this; // Raw DOM element reference
                    const hostElementId = domHostElement.id; // Unique identifier of the host select
                    const widgetContainerId = `${hostElementId}${contextRef.enhanceSelect.configOptions.containerSuffix}`; // ID for the new custom widget container

                    // Prevent re-initialization if widget already exists for this select
                    if ($(`#${widgetContainerId}`).length) {
                        console.warn(`enhanceSelect: Widget already exists for #${hostElementId}. Skipping initialization.`);
                        return;
                    }

                    // Determine the initial text for the toggle link
                    contextRef.enhanceSelect.configOptions.defaultToggleText =
                        contextRef.enhanceSelect.configOptions.defaultToggleText || $hostElement.find("option:first-child").text();

                    // Construct and insert the custom widget markup
                    const generatedWidgetId = utilityFns.constructWidgetMarkup($hostElement, domHostElement, contextRef);

                    // Visually hide the original select element
                    $hostElement.attr('aria-hidden', 'true').css({ position: "absolute", left: "-99999px", top: "-99999px" });

                    // Set up all necessary event handlers for the new widget
                    utilityFns.setupInteractionHandlers(generatedWidgetId, contextRef);

                    // Store a reference to the original select on the new widget for easy lookup
                    $(`#${generatedWidgetId}`).data('original-select-id', hostElementId);
                });
            },

            // Destroys the custom widget and restores the original select element
            destroy: function () {
                return this.each(function () {
                    const $hostElement = $(this);
                    const hostElementId = this.id;
                    const widgetContainerId = `${hostElementId}${$.fn.enhanceSelect.configOptions.containerSuffix}`;
                    const $existingWidget = $(`#${widgetContainerId}`);

                    if ($existingWidget.length) {
                        // Remove event handlers
                        $existingWidget.off('.enhanceSelect');
                        $('body').off('.enhanceSelectGlobal'); // Clean up global handlers

                        // Remove the widget from the DOM
                        $existingWidget.remove();

                        // Restore the original select element
                        $hostElement.removeAttr('aria-hidden').css({ position: "", left: "", top: "" });

                        console.log(`enhanceSelect: Widget for #${hostElementId} destroyed.`);
                    } else {
                        console.warn(`enhanceSelect: No widget found for #${hostElementId} to destroy.`);
                    }
                });
            },

            // Refreshes the widget, useful if original select options change
            refresh: function () {
                return this.each(function () {
                    const $hostElement = $(this);
                    const hostElementId = this.id;
                    const widgetContainerId = `${hostElementId}${$.fn.enhanceSelect.configOptions.containerSuffix}`;
                    const $existingWidget = $(`#${widgetContainerId}`);

                    if ($existingWidget.length) {
                        // First, destroy the existing widget
                        $hostElement.enhanceSelect('destroy');
                        // Then, re-initialize it
                        $hostElement.enhanceSelect('initialize', $.fn.enhanceSelect.configOptions);
                        console.log(`enhanceSelect: Widget for #${hostElementId} refreshed.`);
                    } else {
                        console.warn(`enhanceSelect: Cannot refresh, no widget found for #${hostElementId}. Initializing instead.`);
                        $hostElement.enhanceSelect('initialize', $.fn.enhanceSelect.configOptions);
                    }
                });
            }
        };

        // Collection of private utility functions
        const utilityFns = {
            // Orchestrates the setup of all event listeners for the widget
            setupInteractionHandlers: function (widgetContainerId, contextRef) {
                utilityFns.attachWidgetTriggers(widgetContainerId, contextRef);
                utilityFns.bindOptionSelection(contextRef);
                utilityFns.initializeGlobalCloseHandler(widgetContainerId); // Add global handler
            },

            // Generates the HTML markup for the custom select widget
            constructWidgetMarkup: function ($hostElement, domHostElement, contextRef) {
                const config = contextRef.enhanceSelect.configOptions;
                const widgetContainerId = `${domHostElement.id}${config.containerSuffix}`;
                const toggleLinkId = `${domHostElement.id}${config.toggleSuffix}`;
                let widgetHtmlString = `<div id="${widgetContainerId}" class="${config.widgetBaseClass}" role="listbox" aria-expanded="false" tabindex="0">\n`;
                widgetHtmlString += `<a href="#" id="${toggleLinkId}" class="${config.widgetBaseClass}-toggle" data-selected-value="" role="button" aria-haspopup="listbox" aria-labelledby="${toggleLinkId}">${config.defaultToggleText}</a>\n`;
                widgetHtmlString += `<ul class="${config.widgetBaseClass}-options" role="presentation" style="display: none; visibility: hidden;">\n`;

                const selectOptions = $hostElement.find("option");
                if (selectOptions.length === 0) {
                    console.warn(`enhanceSelect: No options found in select #${domHostElement.id}. Widget will be empty.`);
                    widgetHtmlString += `<li>No options available</li>\n`;
                } else {
                    selectOptions.each(function (index) {
                        const $option = $(this);
                        if (config.omitFirstOption && index === 0) {
                            // Skip the first option if configured
                            return true; // continue to next iteration
                        }
                        const optionValue = $option.val();
                        const optionText = $option.text();
                        const isSelected = $option.is(':selected');
                        const ariaSelected = isSelected ? 'aria-selected="true"' : '';
                        const selectedClass = isSelected ? 'selected' : '';

                        widgetHtmlString += `  <li role="option" id="${domHostElement.id}-option-${index}" ${ariaSelected} class="${selectedClass}">`;
                        widgetHtmlString += `<a href="#" data-value="${optionValue}">${optionText}</a></li>\n`;

                        // If this option is initially selected, update the toggle link text and value
                        if (isSelected) {
                            $(`#${toggleLinkId}`).text(optionText).data('selected-value', optionValue);
                        }
                    });
                }
                widgetHtmlString += `</ul>\n</div>\n`;

                // Insert the new widget after the original select element
                $hostElement.after(widgetHtmlString);

                return widgetContainerId;
            },

            // Attaches click event to the main widget container to open/close it
            attachWidgetTriggers: function (widgetContainerId, contextRef) {
                const $activeWidgetContainer = $(`#${widgetContainerId}`);
                const config = contextRef.enhanceSelect.configOptions;

                $activeWidgetContainer.on('click.enhanceSelect', function (eventObj) {
                    eventObj.preventDefault();
                    eventObj.stopPropagation();

                    const currentWidgetId = $(this).attr("id");

                    // Close any other open widgets, excluding the current one
                    $(`.${config.widgetBaseClass}.is-open`).not(this).each(function () {
                        utilityFns.collapseWidget($(this).attr("id"));
                    });

                    if (!$(this).hasClass("is-open") && !$(this).hasClass("is-disabled")) {
                        // Open the widget
                        const $widgetOptionList = $(this).find(`ul.${config.widgetBaseClass}-options`);
                        const $selectedOption = $widgetOptionList.find('li.selected');
                        if ($selectedOption.length) {
                            const index = $selectedOption.index();
                            // Scroll to selected item (adjust 25px per item, a common list item height)
                            const scrollPosition = 25 * index;
                            $widgetOptionList.scrollTop(scrollPosition);
                        }

                        // Check and adjust position if it needs to "flip" upwards
                        if (config.autoPositionUpwards) {
                            utilityFns.adjustWidgetPosition(this, contextRef);
                        }

                        $widgetOptionList.css({ "visibility": "visible" }).slideDown("fast", function() {
                            $(this).attr('aria-expanded', 'true');
                        });
                        $(this).addClass("is-open").attr('aria-expanded', 'true');

                        // Bind a global click handler to close when clicking outside
                        // This handler is managed by initializeGlobalCloseHandler
                    } else {
                        // Close the widget
                        utilityFns.collapseWidget(currentWidgetId);
                    }
                });
            },

            // Binds click events to the individual options within the custom widget
            bindOptionSelection: function (contextRef) {
                const config = contextRef.enhanceSelect.configOptions;
                // Use event delegation on the document body for options within any widget
                $(document).on('click.enhanceSelect', `.${config.widgetBaseClass} ul li a`, function (eventObj) {
                    eventObj.preventDefault();
                    const $clickedLink = $(this);
                    const selectedText = $clickedLink.text();
                    const selectedValue = $clickedLink.data('value');
                    const $parentListItem = $clickedLink.parent('li');
                    const $currentWidget = $clickedLink.parents(`.${config.widgetBaseClass}`);
                    const originalSelectId = $currentWidget.data('original-select-id');

                    if (!originalSelectId) {
                        console.error("enhanceSelect: Could not find original select ID for widget.", $currentWidget);
                        return;
                    }

                    const $originalSelect = $(`#${originalSelectId}`);
                    const selectedIndex = $parentListItem.index();

                    // Update the original select element's value
                    $originalSelect.val(selectedValue);

                    // Update the custom widget's toggle link text and value
                    $currentWidget.find(`.${config.widgetBaseClass}-toggle`).text(selectedText).data('selected-value', selectedValue);

                    // Remove 'selected' class from all options and add to the newly selected one
                    $currentWidget.find('li').removeClass('selected').removeAttr('aria-selected');
                    $parentListItem.addClass('selected').attr('aria-selected', 'true');

                    // Close the widget
                    utilityFns.collapseWidget($currentWidget.attr("id"));

                    // Trigger change event on the original select element
                    $originalSelect.trigger('change');
                });
            },

            // Handles the closing of a specific custom select widget
            collapseWidget: function (widgetContainerId) {
                const $activeWidgetContainer = $(`#${widgetContainerId}`);
                if ($activeWidgetContainer.hasClass("is-open")) {
                    $activeWidgetContainer.find(`ul.is-open`).slideUp("fast", function() {
                        $(this).css({ "visibility": "hidden" }).removeAttr('aria-expanded');
                    });
                    $activeWidgetContainer.removeClass("is-open").attr('aria-expanded', 'false');
                    // Focus on the toggle button after closing for accessibility
                    $activeWidgetContainer.find(`.${$.fn.enhanceSelect.configOptions.widgetBaseClass}-toggle`).focus();
                }
            },

            // Adjusts the dropdown's position to open upwards if space is limited below
            adjustWidgetPosition: function (targetWidget, contextRef) {
                const $targetWidget = $(targetWidget);
                const $optionList = $targetWidget.find(`ul.${contextRef.enhanceSelect.configOptions.widgetBaseClass}-options`);
                const config = contextRef.enhanceSelect.configOptions;

                // Remove any previous "showTop" class
                $optionList.removeClass("opens-upward");

                const currentOffsetTop = $optionList.offset().top;
                let parentOffsetTop = 0;

                // If a parent selector is provided, calculate its offset
                if (config.scrollParentSelector && $targetWidget.parents(config.scrollParentSelector).length) {
                    parentOffsetTop = $targetWidget.parents(config.scrollParentSelector).offset().top;
                } else if (config.autoPositionUpwards) {
                    console.warn("enhanceSelect: 'autoPositionUpwards' is true, but 'scrollParentSelector' is not set or parent not found. Cannot accurately determine upward flip position.");
                }

                const widgetHeight = $optionList.outerHeight(true); // Include padding/margin
                const viewportHeight = $(window).height();

                // Check if there's not enough space below AND enough space above (relative to parent if applicable)
                if (((viewportHeight - currentOffsetTop) < widgetHeight) && ((currentOffsetTop - parentOffsetTop) > widgetHeight)) {
                    $optionList.addClass("opens-upward");
                }
            },

            // Handles global clicks to close open widgets if the click is outside
            initializeGlobalCloseHandler: function() {
                // Ensure only one global handler is bound
                $(document).off('click.enhanceSelectGlobal').on('click.enhanceSelectGlobal', function(eventObj) {
                    const $target = $(eventObj.target);
                    // Iterate through all open widgets
                    $(`.${$.fn.enhanceSelect.configOptions.widgetBaseClass}.is-open`).each(function() {
                        const $widget = $(this);
                        // If the click was outside this open widget, close it
                        if (!$target.closest($widget).length) {
                            utilityFns.collapseWidget($widget.attr('id'));
                        }
                    });
                });
            }
        };

        // Plugin method dispatcher
        if (pluginActions[actionName] && typeof pluginActions[actionName] === 'function') {
            // Call the specified method
            return pluginActions[actionName].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof actionName === 'object' || !actionName) {
            // If an options object is passed or no argument, call the initialize method
            return pluginActions.initialize.apply(this, arguments);
        } else {
            // Handle unknown method calls
            $.error(`Method "${actionName}" does not exist in the enhanceSelect plugin!`);
        }
    };

    // Default configuration options for the enhanceSelect plugin
    $.fn.enhanceSelect.defaults = {
        containerSuffix: "_CustomList",      // Suffix for the custom widget's container ID
        toggleSuffix: "_CustomToggle",       // Suffix for the toggle link ID
        defaultToggleText: "",               // Default text for the toggle (will use first option if empty)
        scrollParentSelector: "",            // Selector for a scrollable parent (required for autoPositionUpwards to work well)
        autoPositionUpwards: false,          // If true, widget tries to open upwards if space below is insufficient
        widgetBaseClass: "custom-select-widget", // Base CSS class for the custom widget
        omitFirstOption: false               // If true, the first option from the original select is not included in the custom list
    };

    // This property will hold the merged default and user-provided configuration
    $.fn.enhanceSelect.configOptions = {};

})(jQuery);