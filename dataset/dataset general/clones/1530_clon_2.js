/****************************************************************
exchangeDropdownView()	converts a standard HTML <select> element into a styled
						list-based control for enhanced visual customisation.
						
Author:
	A. N. Other
	CodeForge.dev
Revision:
	1.0
Parameters: Component Identifier
Configuration options:
			containerIdSuffix: "LinkList", // Suffix for the new container's ID
			anchorIdSuffix: "Link",       // Suffix for the main interactive anchor's ID
			anchorDisplayContent: "",     // Default text for the main anchor
			ancestorSelector: "",         // Required for vertical position adjustment
			reversePositioning: false,    // Flag to potentially flip the list's vertical display
			controlCssClass: "ddlist",    // CSS class for the generated control
			omitInitialOption: true       // Whether to exclude the first <option> from the list
Usage:	$("select").exchangeDropdownView();
		$("select").exchangeDropdownView({ controlCssClass: "customDropList"});
Future Enhancements:	
	1) Transition to a class-based selection mechanism instead of relying on IDs
	2) Maintain references to created DOM elements within a closure for more efficient future manipulation
	3) Implement a configurable timer for automatic closing of the dropdown panel
	4) Refactor the codebase for improved efficiency and reduced footprint
	5) Restructure the code according to a more robust plugin boilerplate pattern
*****************************************************************/
(function ($) {

    $.fn.exchangeDropdownView = function (operation) {

        var operations = {
            initializeComponent: function (configurationSettings) {
                var componentInstance = this;
                // Combine default settings with user-provided overrides
                componentInstance.exchangeDropdownView.configuration = $.extend(
                    {},
                    componentInstance.exchangeDropdownView.defaultSettings,
                    configurationSettings
                );

                // Iterate over each DOM element selected by the jQuery object
                return componentInstance.each(function () {

                    var currentDomElementJq = $(this),  // jQuery wrapper for the current DOM element
                        currentDomElement = this,       // Raw DOM element reference
                        domElementIdentifier = this.id, // The ID of the original select element
                        containerIdentifier = domElementIdentifier + componentInstance.exchangeDropdownView.configuration.containerIdSuffix, // ID for the new wrapper div
                        panelCloseTimer,                // Variable to hold any auto-close timer
                        cachedOpenPanelJq = $("#" + containerIdentifier); // Cached jQuery object for the main container

                    // Set default link text if not provided, using the first option's text
                    componentInstance.exchangeDropdownView.configuration.anchorDisplayContent =
                        componentInstance.exchangeDropdownView.configuration.anchorDisplayContent ||
                        currentDomElementJq.find("option").eq(0).text();
                    
                    // Build the new dropdown structure and get its ID
                    containerIdentifier = componentHelpers.constructControlMarkup(currentDomElementJq, currentDomElement, componentInstance);
                    
                    // Hide the original select element off-screen
                    currentDomElementJq.css({ position: "absolute", left: "-99999px" });

                    // Set up click and other interaction events for the new control
                    componentHelpers.setupInteractionHandlers(containerIdentifier, componentInstance);

                });

            }
        };
        // Private utility functions for the component
        var componentHelpers = {
            setupInteractionHandlers: function (containerIdentifier, componentInstance) {
                // Attach events specific to the dropdown's primary action
                componentHelpers.attachControlEventHandlers(containerIdentifier, componentInstance);
                // Assign click actions to the individual list item links
                componentHelpers.bindOptionLinkActions(componentInstance);
                // Ensure the dropdown is closed initially (or after external click)
                componentHelpers.deactivateControlPanel(containerIdentifier);
            },
            constructControlMarkup: function ($elementJq, elementRaw, componentInstance) {
                // Logic to generate the HTML for the custom dropdown
                var indexCounter,
                    containerIdentifier = elementRaw.id + componentInstance.exchangeDropdownView.configuration.containerIdSuffix,
                    anchorIdentifier = elementRaw.id + componentInstance.exchangeDropdownView.configuration.anchorIdSuffix,
                    selectOptionsJq = $elementJq.find("option");
                
                var generatedMarkupString = '<div id="' + containerIdentifier + '" class="' + componentInstance.exchangeDropdownView.configuration.controlCssClass + '">\n<a href="#" id="' + anchorIdentifier + '">' + componentInstance.exchangeDropdownView.configuration.anchorDisplayContent + '</a>\n<ul>\n';
                
                for (indexCounter = 0; indexCounter < selectOptionsJq.length; indexCounter++) {
                    // Optionally remove the first option from the display
                    if (componentInstance.exchangeDropdownView.configuration.omitInitialOption && indexCounter === 0) {
                        selectOptionsJq.eq(indexCounter).remove();
                        continue;
                    }
                    generatedMarkupString += '<li><a href="' + selectOptionsJq.eq(indexCounter).text() + '" rel="' + selectOptionsJq.eq(indexCounter).val() + '">' + selectOptionsJq.eq(indexCounter).text() + '</a></li>\n';
                }
                generatedMarkupString += '</ul>\n</div>\n';

                // Remove any previously generated button that might be next to the select
                $elementJq.next("button").remove();
                // Insert the new custom control after the original select element
                $elementJq.after(generatedMarkupString);

                return containerIdentifier;
            },
            attachControlEventHandlers: function (containerIdentifier, componentInstance) {
                var cachedOpenPanelJq = $("#" + containerIdentifier);
                cachedOpenPanelJq.unbind().click(function (eventObject) {
                    eventObject.preventDefault();
                    eventObject.stopPropagation();
                    var clickedPanelId = cachedOpenPanelJq.attr("id");
                    // Close any other currently open custom controls
                    $("." + componentInstance.exchangeDropdownView.configuration.controlCssClass + ".open:not('#" + clickedPanelId + "')").each(function () {
                        componentHelpers.deactivateControlPanel(this.id); // Close existing open panels
                    });
                    // If the current panel is not open and not disabled
                    if ($(this).hasClass("open") === false && $(this).hasClass("disabled") === false) {
                        var selectedIndex = $(this).find("a.selected").parent().index();
                        var verticalScrollOffset = 25 * selectedIndex; // Approximate scroll position
                        if (componentInstance.exchangeDropdownView.configuration.reversePositioning) {
                            componentHelpers.adjustControlVerticalPosition(this, componentInstance);
                        }
                        var currentPanelListJq = $(this).find("ul");
                        currentPanelListJq.scrollTop(verticalScrollOffset);
                        currentPanelListJq.css({ "visibility": "visible" }); // Make the list visible
                        currentPanelListJq.slideDown("fast"); // Animate the list opening
                        $(this).addClass("open"); // Mark the control as open
                        // Bind a global click handler to close the panel when clicking outside
                        $("body").click(function (eventObject) {
                            $("body").unbind(); // Unbind to prevent multiple handlers
                            componentHelpers.deactivateControlPanel(containerIdentifier);
                        });
                    } else {
                        // If already open, close it
                        componentHelpers.deactivateControlPanel(containerIdentifier);
                        $("body").unbind(); // Ensure global handler is removed
                    }
                });
            },
            bindOptionLinkActions: function (componentInstance) {
                // Attach click events to all individual option links within the custom controls
                $("." + componentInstance.exchangeDropdownView.configuration.controlCssClass + " ul li a").bind("click", function (eventObject) {
                    eventObject.preventDefault();
                    // Determine the ID of the original select element
                    var originalSelectId = $(this).parents("." + componentInstance.exchangeDropdownView.configuration.controlCssClass).attr("id").replace(componentInstance.exchangeDropdownView.configuration.containerIdSuffix, "");
                    var originalSelectJq = $("#" + originalSelectId);
                    
                    // Reset all options to not selected
                    originalSelectJq.children("option").attr("selected", "");
                    // Set the corresponding option in the original select to selected
                    originalSelectJq.children("option").eq($(this).parent().index()).attr("selected", "selected");
                    
                    // Close all dropdown lists
                    $("." + componentInstance.exchangeDropdownView.configuration.controlCssClass + " ul").slideUp("fast");
                    // Update the display text of the main anchor to the selected option's text
                    $(this).parents("." + componentInstance.exchangeDropdownView.configuration.controlCssClass).find("#" + originalSelectId + componentInstance.exchangeDropdownView.configuration.anchorIdSuffix).text($(this).text());
                    
                    // Trigger the change event on the original select element
                    originalSelectJq.change();
                });
            },
            deactivateControlPanel: function (containerIdentifier) {
                var cachedOpenPanelJq = $("#" + containerIdentifier);
                // If the panel is currently marked as open
                if (cachedOpenPanelJq.hasClass("open")) {
                    cachedOpenPanelJq.children("ul").css({ "visibility": "hidden" }); // Hide the list
                    cachedOpenPanelJq.removeClass("open"); // Remove the 'open' class
                    cachedOpenPanelJq.find("a").blur(); // Remove focus from any links
                }
            },
            adjustControlVerticalPosition: function (itemElement, componentInstance) {
                $(itemElement).find("ul").removeClass("showTop"); // Ensure initial state
                var listTopCoordinate = $(itemElement).find("ul").offset().top; // Top position of the list
                // Top position of the closest relevant ancestor, or 0 if none
                var ancestorTopCoordinate = $(itemElement).parents(componentInstance.exchangeDropdownView.configuration.ancestorSelector).length ? $(itemElement).parents(componentInstance.exchangeDropdownView.configuration.ancestorSelector).offset().top : 0;
                var panelHeight = $(itemElement).find("ul").height() * 1 + 6; // Total height of the list
                var viewportHeight = $(window).height() * 1; // Current browser window height
                
                // If there's not enough space below and enough space above, flip the panel
                if (((viewportHeight - listTopCoordinate) < panelHeight) && ((listTopCoordinate - ancestorTopCoordinate) > panelHeight)) {
                    $(itemElement).find("ul").addClass("showTop");
                }
            }
        };

        // If a specific operation name is provided and exists in the 'operations' object
        if (operations[operation]) {
            // Call the corresponding operation function, passing arguments
            return operations[operation].apply(this, Array.prototype.slice.call(arguments, 1));
        // If an object is provided (implying configuration) or no argument is given
        } else if (typeof operation === 'object' || !operation) {
            // Call the default initialization operation
            return operations.initializeComponent.apply(this, arguments);
        // If an unknown operation name is provided
        } else {
            // Throw an error indicating an invalid operation
            $.error('Operation "' + operation + '" is not a valid method for the exchangeDropdownView plugin!');
        };
    };

    // Default configuration options for the plugin
    $.fn.exchangeDropdownView.defaultSettings = {
        containerIdSuffix: "LinkList", // Suffix for the main container's ID
        anchorIdSuffix: "Link",       // Suffix for the clickable anchor's ID
        anchorDisplayContent: "",     // Default text for the anchor
        ancestorSelector: "",         // Selector for the parent element, used in positioning
        reversePositioning: false,    // Boolean to control list display direction
        controlCssClass: "ddlist",    // CSS class applied to the custom control
        omitInitialOption: true       // Flag to hide the first option from the list
    };
    // This property will store the combined default and user-provided configuration
    $.fn.exchangeDropdownView.configuration = {};
})(jQuery);