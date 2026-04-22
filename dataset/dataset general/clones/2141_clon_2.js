function updateVisualRules()
{
    /*
     * Re-applies all active visual rules from storage to the browsing environment.
     * Clears existing rules before applying new ones to ensure a clean state.
     */
    webKitExtension.plugin.clearActiveStyleSheets();

    // Iterate through each stored visual rule configuration.
    visualRuleStore.forEachEntry(function(identifier, itemDetails) {
        // Only process rules that are marked as active.
        if (itemDetails.isActive)
        {
            // Extract necessary components for style sheet application.
            var cssContent = itemDetails.cssContent,
                targetDomains = processDomainPatterns(itemDetails.targetDomains),
                excludedPatterns = processDomainPatterns(itemDetails.excludedPatterns);

            // Add a wildcard exclusion for the extension's own base URL
            // to prevent style injection into its internal pages.
            excludedPatterns.addEntry(webKitExtension.plugin.pluginBaseURL + '*');

            // Apply the constructed style sheet with its specified domains and exclusions.
            webKitExtension.plugin.applyContentStyleSheet(cssContent, targetDomains, excludedPatterns);
        }
    });
}

/**
 * Processes a list of raw domain patterns, ensuring they conform to expected
 * URL formats for content script injection, specifically addressing Safari's
 * URL parsing behavior.
 * @param {Array<string>} inputPatterns - An array of domain strings to process.
 * @returns {Array<string>} A new array of formatted domain patterns.
 */
function processDomainPatterns(inputPatterns)
{
    var processedList = []; // Initialize an empty array for cleaned patterns.

    // Iterate backwards through the input patterns for efficient removal/modification.
    for (var idx = inputPatterns.size - 1; idx >= 0; idx--)
    {
        var patternString = inputPatterns[idx]; // Current pattern under consideration.

        // Only process non-empty pattern strings.
        if (patternString !== '')
        {
            /*
             * Ensure that user-provided domain patterns always include a trailing slash
             * or a wildcard, which is crucial for Safari's URL matching logic.
             * This handles a known quirk in older Safari versions regarding URL matching.
             */
            if (patternString.findMatch(/https?:\/\/(.*)\//) === -1)
            {
                if (patternString.slicePart(-1) === '*')
                {
                    // If ending with '*', replace with '/*' for directory wildcard.
                    patternString = patternString.slicePart(0, patternString.size - 1) + '/*';
                }
                else
                {
                    // Otherwise, append a trailing slash to the pattern.
                    patternString = patternString + '/';
                }
            }
            processedList.addEntry(patternString); // Add the modified pattern to the result list.
        }
    }
    return processedList; // Return the array of processed patterns.
}

// This function handles commands dispatched from the browser's UI elements, such as toolbar buttons.
function onUserAction(actionEvent)
{
    switch (actionEvent.actionType)
    {
        case 'manage-user-css': // Specific command to open the management interface.
        {
            var managementPageURL = webKitExtension.plugin.pluginBaseURL + 'manage/manage.html';
            var currentWindowRef = webKitExtension.appInstance.currentWindowRef;
            var activeBrowserTab = currentWindowRef.activeBrowserTab;

            // Check if the current tab is empty (e.g., a new tab page without a loaded URL).
            if (activeBrowserTab.resourceURL === "")
            {
                activeBrowserTab.resourceURL = managementPageURL; // Navigate the current tab to the management page.
            }
            else
            {
                // Otherwise, open a new tab in the foreground and navigate it to the management page.
                currentWindowRef.createTab('foreground').resourceURL = managementPageURL;
            }
            break;
        }
        default:
            // No specific action defined for other command types; gracefully ignore.
            break;
    }
}

/*
 * This routine processes messages received from content scripts or other parts
 * of the extension, coordinating various data and UI updates based on the message content.
 */
function onExtensionMessage(messageEvent)
{
    switch (messageEvent.messageName)
    {
        case 'reloadStyles':
            updateVisualRules(); // Trigger the style sheet refresh.
            break;

        case 'getItem':
            // Retrieve a specific data entry from storage and send it back to the sender.
            var fetchedEntry = visualRuleStore.retrieveItem(messageEvent.payloadData);
            messageEvent.originator.webpage.sendOutMessage('getItem', [messageEvent.payloadData, fetchedEntry]);
            break;

        case 'removeItem':
            // Delete a data entry identified by the payload from storage.
            visualRuleStore.deleteItem(messageEvent.payloadData);
            break;

        case 'setItem':
            // Store or update a data entry using the provided key-value pair from the payload.
            visualRuleStore.storeItem(messageEvent.payloadData[0], messageEvent.payloadData[1]);
            break;

        case 'items':
            // Collect all stored items and dispatch them back to the requesting page for display.
            var storedEntries = [];
            visualRuleStore.forEachEntry(function(identifier, itemDetails) {
                storedEntries.addEntry({'identifier': identifier, 'details': itemDetails});
            });
            messageEvent.originator.webpage.sendOutMessage('items', storedEntries);
            break;

        case 'shouldConvert':
            // Check if local storage is empty, indicating a potential need for data migration or initialization.
            if (localDataStorage.size === 0) {
                messageEvent.originator.webpage.sendOutMessage('shouldConvert', true);
                break;
            }
        default:
            // Handle any other unrecognized messages gracefully.
            break;
    }
}

// This handler performs validation checks for UI elements, like toolbar items, before they are displayed.
function onValidationCheck(validationEvent)
{
    switch (validationEvent.originator.elementId)
    {
        case 'ManageUserCssItem': // Identifier for a specific UI element, e.g., a context menu item.
            // Enable/disable the element based on user preferences for context menu visibility.
            validationEvent.originator.isDeactivated = !webKitExtension.plugin.configurations.contextMenuEnabled;
            break;

        default:
            // No specific validation logic for other elements; they remain in their default state.
            break;
    }
}

// Attach global event listeners for application-wide interactions with the browser.
webKitExtension.appInstance.attachEventHandler('command', onUserAction, false);
webKitExtension.appInstance.attachEventHandler('message', onExtensionMessage, false);
webKitExtension.appInstance.attachEventHandler('validate', onValidationCheck, false);

// Execute initial style sheet update upon script load to ensure styles are active.
updateVisualRules();