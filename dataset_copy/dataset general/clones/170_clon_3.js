$.fn.dynamicPanel = function(configParams) {

    // Internal default settings for the panel system.
    const defaultSettings = {
        displayAnimated: true,
        primaryAnimDirection: "up",
        secondaryAnimDirection: "left",
        subPanelDelay: 500,
        animDuration: 100,
        // New internal setting to track panel's active state.
        panelStateKey: 'panel-active-status'
    };

    // Merge provided configurations with defaults.
    // Using Object.assign for a slight variation from $.extend, assuming jQuery is present.
    const currentSettings = Object.assign({}, defaultSettings, configParams);

    // Reference to the main element this plugin is called upon.
    const mainPanelElement = $(this);

    // Perform initial setup routines for the UI components.
    initializePanelElements();

    // Helper jQuery extension to manage panel activation state.
    // This centralizes logic for adding/removing an 'active' class and updating data.
    $.fn.toggleActivation = function(activate = true) {
        if (activate) {
            return this.addClass("dp-active").data(currentSettings.panelStateKey, 1);
        } else {
            return this.removeClass("dp-active").data(currentSettings.panelStateKey, 0);
        }
    };

    // Section: Core Utility Functions.

    // Prepares the DOM structure by assigning necessary classes for styling and positioning.
    function initializePanelElements() {
        // Apply styling to content lists within the panel to manage layout.
        $(".panel-content UL", mainPanelElement).addClass("dp-no-wrap dp-no-padding dp-no-margin");
        // Ensure the main panel's containers are positioned correctly (e.g., absolutely).
        $(".panel-container", mainPanelElement).addClass("dp-absolute-pos");
        // Set an initial inactive state for the main panel.
        mainPanelElement.data(currentSettings.panelStateKey, 0);
        console.log("Dynamic Panel initialized on:", mainPanelElement.selector); // Debug log.
    }

    // Function to hide all currently open sub-panels within a given parent element.
    function hideAllDescendantPanels(parentElement) {
        $(".panel-container", parentElement).each(function() {
            const currentSubPanel = $(this);
            // Animate hiding with a slide-up effect.
            currentSubPanel.slideUp(currentSettings.animDuration);
            // Deactivate the parent item visually and in its data state.
            currentSubPanel.parent().toggleActivation(false);
            // Clean up any custom data stored on the panel.
            currentSubPanel.removeData("current-direction");
        });
    }

    // Function to display a specific sub-panel with animation options.
    function displaySubPanel(panelToDisplay, direction, duration) {
        // Decide whether to animate based on current settings.
        if (currentSettings.displayAnimated) {
            panelToDisplay.show("slide", { direction: direction }, duration).toggleActivation(true);
        } else {
            // No animation, just show.
            panelToDisplay.show().toggleActivation(true);
        }
        // Store the direction used for animation on the panel itself.
        panelToDisplay.data("current-direction", direction);
    }

    // End of section: Core Utility Functions.


    // Section: Interactive Handlers.

    let activationTimer = null; // Renamed from 'waitHandle', used for hover delay.

    // Handler for clicks on panel entries that are not disabled.
    $("li.dp-entry:not(.dp-disabled)", mainPanelElement).on("click", function(event) {
        // Prevent default browser behavior (e.g., following a link) and stop event propagation.
        event.preventDefault();
        event.stopPropagation();

        // Clear any pending hover activation to prevent unwanted sub-panel display or double-triggering.
        if (activationTimer) {
            clearTimeout(activationTimer);
            activationTimer = null; // Resetting the timer ID.
        }

        const clickedEntry = $(this);
        const subPanelHolder = $(".sub-panel-holder", clickedEntry);

        // Check if the clicked entry contains a sub-panel.
        if (subPanelHolder.length > 0) {
            const currentSubPanel = $(".panel-container", clickedEntry).first();

            // Guard clause: If the sub-panel is already active, do nothing to prevent re-animation.
            if (currentSubPanel.data(currentSettings.panelStateKey) === 1) {
                console.log("Sub-panel already active, ignoring click.");
                return;
            }

            // Before showing a new sub-panel, hide all other sub-panels at the same level.
            hideAllDescendantPanels(clickedEntry.parent());

            // Use the secondary animation direction for sub-panels.
            const animDir = currentSettings.secondaryAnimDirection;

            // Display the sub-panel using the helper function.
            displaySubPanel(currentSubPanel, animDir, currentSettings.animDuration);
        } else {
            // If the entry does not hold a sub-panel, close any open sibling sub-panels.
            hideAllDescendantPanels(clickedEntry.parent());
            console.log("Clicked on a leaf entry:", clickedEntry.text().trim()); // Debug log for leaf nodes.
            // Trigger a custom event for leaf nodes, allowing external listeners to react.
            mainPanelElement.trigger('dp:leafClicked', [clickedEntry]);
        }
    });

    // Handler for mouse entering a panel entry, potentially triggering sub-panel display.
    $("li.dp-entry:not(.dp-disabled)", mainPanelElement).on("mouseenter", function(event) {
        // Stop event bubbling to prevent parent menu items from reacting.
        event.stopPropagation();

        const hoveredEntry = $(this);
        const subPanelHolder = $(".sub-panel-holder", hoveredEntry);

        // If a sub-panel exists for this entry.
        if (subPanelHolder.length > 0) {
            // Clear any existing timer to ensure the delay restarts if the mouse quickly moves between entries.
            if (activationTimer) {
                clearTimeout(activationTimer);
                activationTimer = null;
            }

            // Set a new timer for delayed sub-panel activation.
            activationTimer = setTimeout(() => {
                const currentSubPanel = $(".panel-container", hoveredEntry).first();
                // Guard clause: If sub-panel is already active, prevent re-animation on hover.
                if (currentSubPanel.data(currentSettings.panelStateKey) === 1) {
                    console.log("Sub-panel already active on hover, no re-animation.");
                    return;
                }

                // Hide all sibling sub-panels before displaying the new one.
                hideAllDescendantPanels(hoveredEntry.parent());

                // Use the secondary animation direction for sub-panels.
                const animDir = currentSettings.secondaryAnimDirection;

                // Display the sub-panel.
                displaySubPanel(currentSubPanel, animDir, currentSettings.animDuration);

            }, currentSettings.subPanelDelay);
        } else {
            // If no sub-panel, close any open sibling sub-panels immediately.
            hideAllDescendantPanels(hoveredEntry.parent());
            // Clear any pending activation timer if moving from an entry with a sub-panel to one without.
            if (activationTimer) {
                clearTimeout(activationTimer);
                activationTimer = null;
            }
        }
    });

    // Handler for mouse leaving a panel entry.
    $("li.dp-entry", mainPanelElement).on("mouseleave", function(event) {
        // Crucial: Clear the timer when the mouse leaves an entry to prevent unwanted sub-panel opening.
        if (activationTimer) {
            clearTimeout(activationTimer);
            activationTimer = null;
        }
        // No immediate hiding here; `mouseenter` on a new item or `document` click handles closing.
    });

    // Global click handler to close all panels when clicking anywhere outside the main panel.
    $(document).on("click", function(event) {
        // Check if the click originated from within the main panel or any of its sub-panels.
        // If not, proceed to close all active panels.
        if (!$(event.target).closest(mainPanelElement).length) {
            $(".panel-container").each(function() {
                const panel = $(this);
                // Only hide panels that are currently active.
                if (panel.data(currentSettings.panelStateKey) === 1) {
                    panel.slideUp(currentSettings.animDuration).parent().toggleActivation(false);
                    panel.removeData("current-direction"); // Clean up custom data.
                }
            });
            console.log("All dynamic panels closed due to outside click."); // Debug log.
        }
    });

    // End of section: Interactive Handlers.


    // Section: Public API Definition.

    // Constructs and returns the public interface for the dynamic panel.
    return buildPanelInterface();

    // Factory function to create the public API object.
    function buildPanelInterface() {
        return {
            revealPanel: revealPanel,
            concealPanel: concealPanel,
            launchContextPanel: launchContextPanel,
            // New API method: allows setting options dynamically after initialization.
            updateSettings: function(newSettings) {
                Object.assign(currentSettings, newSettings);
                console.log("Dynamic Panel settings updated:", currentSettings);
            }
        };
    }

    // Makes the primary panel visible.
    function revealPanel() {
        // Guard against showing if the panel is already active.
        if (mainPanelElement.data(currentSettings.panelStateKey) === 1) {
            console.log("Main panel already visible.");
            return;
        }

        if (currentSettings.displayAnimated) {
            mainPanelElement.show("slide", { direction: currentSettings.primaryAnimDirection }, currentSettings.animDuration).toggleActivation(true);
        } else {
            mainPanelElement.show().toggleActivation(true);
        }
        mainPanelElement.data("current-direction", currentSettings.primaryAnimDirection); // Store the direction used.
    }

    // Hides the primary panel.
    function concealPanel() {
        // Guard against hiding if the panel is already inactive.
        if (mainPanelElement.data(currentSettings.panelStateKey) === 0) {
            console.log("Main panel already concealed.");
            return;
        }
        // Animate hiding with a slide-up effect.
        mainPanelElement.slideUp(currentSettings.animDuration).toggleActivation(false);
        mainPanelElement.removeData("current-direction"); // Clean up custom data.
    }

    // Displays the panel as a context menu at the event's coordinates.
    // Parameters:
    //      eventObj: The browser event object (e.g., from a right-click).
    function launchContextPanel(eventObj) {
        // Basic validation for the event object.
        if (!eventObj || !eventObj.type || !eventObj.type.includes("context")) {
            console.warn("launchContextPanel called without a valid context event object.");
            return;
        }

        eventObj.preventDefault(); // Prevent default browser context menu.
        eventObj.stopPropagation(); // Stop event from bubbling up.

        // Retrieve dimensions of the panel area for accurate positioning.
        // Look for a specific context-panel-area, or fall back to the main element.
        let panelArea = $(".context-panel-area", mainPanelElement);
        if (panelArea.length === 0) {
            console.warn("Context panel area not found, using mainPanelElement for dimensions.");
            panelArea = mainPanelElement;
        }

        // Use outerHeight/outerWidth for more accurate dimensions including padding/border.
        const panelHeight = panelArea.outerHeight();
        const panelWidth = panelArea.outerWidth();

        // Calculate position, attempting to center the panel around the mouse pointer.
        // Using clientX/Y for consistency with modern event properties.
        const targetX = eventObj.clientX;
        const targetY = eventObj.clientY;

        let finalLeft = targetX - (panelWidth / 2);
        let finalTop = targetY - (panelHeight / 2);

        // Add boundary checks to keep the context menu within the viewport.
        const windowWidth = $(window).width();
        const windowHeight = $(window).height();

        if (finalLeft < 0) finalLeft = 0;
        if (finalTop < 0) finalTop = 0;
        if (finalLeft + panelWidth > windowWidth) finalLeft = windowWidth - panelWidth;
        if (finalTop + panelHeight > windowHeight) finalTop = windowHeight - panelHeight;


        // Apply calculated position and ensure it's fixed, then display.
        mainPanelElement.css({
            left: `${finalLeft}px`,
            top: `${finalTop}px`,
            position: 'fixed' // Crucial for context menus to stay relative to the viewport.
        });

        // Guard against showing if the panel is already active, just reposition.
        if (mainPanelElement.data(currentSettings.panelStateKey) === 1) {
            console.log("Context panel already visible, just repositioning.");
            return;
        }

        if (currentSettings.displayAnimated) {
            mainPanelElement.show("slide", { direction: currentSettings.primaryAnimDirection }, currentSettings.animDuration).toggleActivation(true);
        } else {
            mainPanelElement.show().toggleActivation(true);
        }
        mainPanelElement.data("current-direction", currentSettings.primaryAnimDirection); // Store the direction.

        return false; // Prevent further event propagation (e.g., default browser right-click menu).
    }

    // End of section: Public API Definition.
};