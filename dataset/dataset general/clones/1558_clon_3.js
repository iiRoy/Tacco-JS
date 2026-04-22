const ActionPanelManager = function(configurationSettings) {
    // Input validation: Ensure the configuration object and its identifier are present.
    if (!configurationSettings || typeof configurationSettings.identifier !== 'string' || configurationSettings.identifier.trim() === '') {
        console.error("ActionPanelManager: Invalid or missing configuration identifier. Panel cannot be initialized without a unique ID.");
        // Provide a fallback or exit early if critical configuration is missing.
        return { show: () => {}, hide: () => {}, toggle: () => {}, getIdentifier: () => 'invalid-panel' };
    }
    if (!Array.isArray(configurationSettings.actionGroups)) {
        console.warn("ActionPanelManager: 'actionGroups' is not an array. Initializing with no actions.");
        configurationSettings.actionGroups = [];
    }

    // Determines the appropriate pixel dimension for visual assets (icons) based on the viewport width.
    const determineDisplayUnitDimension = function() {
        const currentViewportWidth = window.innerWidth || document.documentElement.clientWidth;
        // Using a `switch (true)` construct for multiple conditions, an alternative to if-else chains.
        switch (true) {
            case (currentViewportWidth >= 640):
                return 72; // Larger screens
            case (currentViewportWidth >= 470):
                return 48; // Medium screens
            default:
                return 36; // Smaller screens
        }
    };

    // A utility function to streamline the creation of DOM elements with attributes and child nodes.
    const fabricateElement = (tagName, attributes = {}, childNodes = []) => {
        const newElement = document.createElement(tagName);
        for (const attrKey in attributes) {
            if (attributes.hasOwnProperty(attrKey)) {
                if (attrKey === 'style') {
                    // Apply individual style properties from an object.
                    Object.assign(newElement.style, attributes[attrKey]);
                } else if (attrKey === 'className') {
                    newElement.className = attributes[attrKey];
                } else if (attrKey === 'dataset') {
                    // Set data attributes using the dataset API.
                    for (const dataKey in attributes[attrKey]) {
                        if (attributes[attrKey].hasOwnProperty(dataKey)) {
                            newElement.dataset[dataKey] = attributes[attrKey][dataKey];
                        }
                    }
                } else {
                    newElement.setAttribute(attrKey, attributes[attrKey]);
                }
            }
        }
        // Append all specified child nodes or text content.
        childNodes.forEach(child => {
            if (typeof child === 'string') {
                newElement.appendChild(document.createTextNode(child));
            } else if (child instanceof Node) {
                newElement.appendChild(child);
            }
        });
        return newElement;
    };

    const displayUnitDimension = determineDisplayUnitDimension();
    let isPanelCurrentlyVisible = false; // Internal state to track panel visibility.

    // The primary container element for the action panel, styled for fixed positioning.
    const controlPanelElement = fabricateElement("div", {
        id: configurationSettings.identifier,
        className: 'action-panel-root', // A generic class for global styling hooks.
        style: {
            display: 'none', // Initially hidden to prevent flash of unstyled content.
            position: 'fixed',
            bottom: '0',
            left: '0', // Added left:0 for full width consistency.
            width: '100%',
            zIndex: '1000', // Ensures the panel is above other content.
            boxSizing: 'border-box', // Include padding and border in the element's total width and height.
            backgroundColor: 'rgba(0, 0, 0, 0.9)' // Slightly transparent background.
        }
    });

    // The main table structure for laying out action groups horizontally.
    const layoutGridElement = fabricateElement("table", {
        style: {
            width: '100%',
            borderCollapse: 'collapse', // Replaces `cellpadding="0"` and `cellspacing="0"`.
            tableLayout: 'fixed' // Ensures column widths are respected.
        }
    });

    // Iterate over each collection of actions (each representing a row in the panel).
    // Using `for...of` for cleaner array iteration.
    for (const actionGroup of configurationSettings.actionGroups) {
        if (!Array.isArray(actionGroup) || actionGroup.length === 0) {
            // Skip empty or invalid action groups.
            continue;
        }

        const groupRowElement = fabricateElement("tr", {
            className: 'action-panel-group-row'
        });
        const groupCellElement = fabricateElement("td", {
            style: {
                padding: '0', // Override default cell padding.
                border: 'none' // Ensure no default cell borders.
            }
        });

        // An inner table for distributing actions evenly within a single group row.
        const itemContainerGrid = fabricateElement("table", {
            style: {
                width: '100%',
                borderCollapse: 'collapse',
                tableLayout: 'fixed'
            }
        });
        const itemContainerRow = fabricateElement("tr", {
            className: 'action-panel-item-row'
        });

        // Calculate the base percentage width for each item to ensure even distribution.
        const itemBaseWidthPercentage = (100 / actionGroup.length);

        // Iterate through each individual action item within the current group.
        // Using a traditional `for` loop to easily access the index for conditional styling.
        for (let actionIndex = 0; actionIndex < actionGroup.length; actionIndex++) {
            const singleAction = actionGroup[actionIndex];

            // Determine the precise width for the current action cell.
            // Distribute any rounding errors to the last item to ensure the row sums to exactly 100%.
            let cellWidthStyle;
            if (actionIndex === actionGroup.length - 1) {
                // For the last item, calculate remaining width to fill 100%.
                cellWidthStyle = `${(100 - (itemBaseWidthPercentage * (actionGroup.length - 1))).toFixed(2)}%`;
            } else {
                cellWidthStyle = `${itemBaseWidthPercentage.toFixed(2)}%`;
            }

            // Create the table cell that acts as an interactive button for the action.
            const actionButtonCell = fabricateElement("td", {
                align: "center", // Text and image alignment.
                className: 'action-panel-button-cell',
                style: {
                    width: cellWidthStyle,
                    color: 'white',
                    fontWeight: 'bold',
                    borderTop: '1px solid grey',
                    backgroundColor: 'black', // Explicit background color.
                    padding: '10px 5px', // Added internal padding for better aesthetics.
                    verticalAlign: 'middle', // Vertically centers content within the cell.
                    cursor: 'pointer', // Indicates interactivity.
                    whiteSpace: 'normal', // Allow text to wrap.
                    wordBreak: 'break-word' // Handle long words.
                }
            });

            // Apply a right border to all items except the very last one in the row for visual separation.
            if (actionIndex < actionGroup.length - 1) {
                actionButtonCell.style.borderRight = '1px solid grey';
            }

            // Define a unified click handler for each action button.
            actionButtonCell.addEventListener('click', (event) => {
                // Execute the specific callback function associated with this action.
                if (typeof singleAction.handler === 'function') {
                    singleAction.handler(event); // Pass the event object to the handler.
                }
                // Immediately hide the panel after an action is performed.
                hidePanel();
            }, false); // Use capture phase if necessary, but false (bubbling) is standard.

            // If an icon image path is provided in the action configuration, create and append the image.
            if (singleAction.iconPath) {
                const iconImage = fabricateElement("img", {
                    src: singleAction.iconPath,
                    width: displayUnitDimension,
                    height: displayUnitDimension,
                    alt: singleAction.displayText ? `${singleAction.displayText} icon` : 'Action icon', // Accessibility enhancement.
                    style: {
                        display: 'block', // Ensures the image takes its own line for vertical stacking.
                        margin: '0 auto 6px auto', // Centers the image and adds space below it.
                        maxWidth: '100%', // Prevent image overflow.
                        height: 'auto' // Maintain aspect ratio.
                    }
                });
                actionButtonCell.appendChild(iconImage);
            }

            // Append the display label (text) for the action.
            // The explicit `<br>` tag from the original code is removed, relying on CSS for layout,
            // or the default block-level behavior of the image followed by text.
            actionButtonCell.appendChild(document.createTextNode(singleAction.displayText));
            itemContainerRow.appendChild(actionButtonCell);
        }
        itemContainerGrid.appendChild(itemContainerRow);
        groupCellElement.appendChild(itemContainerGrid);
        groupRowElement.appendChild(groupCellElement);
        layoutGridElement.appendChild(groupRowElement);
    }

    // Append the constructed layout table to the main panel container.
    controlPanelElement.appendChild(layoutGridElement);

    // Critical guard clause: Ensure `document.body` is available before attempting to append elements.
    if (!document.body) {
        console.error("DOM readiness issue: 'document.body' is not available. Action panel cannot be mounted.");
        // Return a no-op interface if the panel cannot be properly initialized.
        return { show: () => {}, hide: () => {}, toggle: () => {}, getIdentifier: () => configurationSettings.identifier };
    }
    // Finally, attach the entire panel to the document's body.
    document.body.appendChild(controlPanelElement);

    // --- Public API and Visibility Management ---

    // Function to explicitly make the panel visible.
    const showPanel = () => {
        if (!isPanelCurrentlyVisible) {
            controlPanelElement.style.display = 'block';
            isPanelCurrentlyVisible = true;
            // Dispatch a custom event for external listeners to react to panel visibility changes.
            document.dispatchEvent(new CustomEvent('actionPanelVisibilityChanged', {
                detail: { panelId: configurationSettings.identifier, isVisible: true }
            }));
        }
    };

    // Function to explicitly hide the panel.
    const hidePanel = () => {
        if (isPanelCurrentlyVisible) {
            controlPanelElement.style.display = 'none';
            isPanelCurrentlyVisible = false;
            document.dispatchEvent(new CustomEvent('actionPanelVisibilityChanged', {
                detail: { panelId: configurationSettings.identifier, isVisible: false }
            }));
        }
    };

    // Function to toggle the panel's visibility state.
    const togglePanel = () => {
        isPanelCurrentlyVisible ? hidePanel() : showPanel();
    };

    // Global event listener to trigger panel toggling based on a custom event.
    // The event name is changed, and a check for `event.detail` is added for targeted control.
    document.addEventListener("toggle_context_actions_request", function(event) {
        // Only toggle this specific panel if the event's detail matches its identifier,
        // or if no specific panel is targeted (to toggle the first instance).
        if (event.detail && event.detail.targetPanelId === configurationSettings.identifier) {
            togglePanel();
        } else if (!event.detail || !event.detail.targetPanelId) {
            // If the event is generic (no targetPanelId), toggle this panel.
            // This behavior might need refinement if multiple panels exist without specific targeting.
            console.warn(`'toggle_context_actions_request' received without targetPanelId. Toggling panel: ${configurationSettings.identifier}`);
            togglePanel();
        }
    }, false);

    // Return a public interface for external control of the panel.
    return {
        show: showPanel,
        hide: hidePanel,
        toggle: togglePanel,
        // Provide a getter for the panel's unique identifier.
        getIdentifier: () => configurationSettings.identifier,
        // Expose current visibility status
        isVisible: () => isPanelCurrentlyVisible
    };
};