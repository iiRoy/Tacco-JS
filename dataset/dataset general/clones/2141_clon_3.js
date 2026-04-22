/**
 * @file This script serves as the global page for the Safari extension,
 *       managing background operations, inter-page communication,
 *       and the application of user-defined custom stylesheets.
 *       It handles commands from the browser, messages from content scripts,
 *       and validation events for toolbar items.
 *
 *       This is a Type III clone, featuring extensive renaming, structural
 *       modifications, added helper functions, guard clauses, and reorganized
 *       logic while preserving the core functionality of the original.
 */

// Define some application-wide constants for event names and identifiers.
const APP_CONSTANTS = Object.freeze({
    COMMAND_MANAGE_STYLES: 'manage-user-css',
    MESSAGE_RELOAD_STYLES: 'reloadStyles',
    MESSAGE_GET_ITEM: 'getItem',
    MESSAGE_REMOVE_ITEM: 'removeItem',
    MESSAGE_SET_ITEM: 'setItem',
    MESSAGE_GET_ALL_ITEMS: 'items',
    MESSAGE_CHECK_CONVERSION: 'shouldConvert',
    VALIDATE_MANAGE_ITEM: 'ManageUserCssItem'
});

// A simple utility to log messages, can be enhanced for different log levels.
const logService = {
    info: (msg, ...args) => console.log(`[INFO] ${msg}`, ...args),
    warn: (msg, ...args) => console.warn(`[WARN] ${msg}`, ...args),
    error: (msg, ...args) => console.error(`[ERROR] ${msg}`, ...args),
    debug: (msg, ...args) => console.debug(`[DEBUG] ${msg}`, ...args)
};

/**
 * Processes an array of raw domain/URL patterns to ensure they conform to Safari's expected format.
 * Adds trailing slashes or wildcards where necessary for proper matching.
 * This function also filters out any empty pattern strings.
 * @param {Array<string>} rawPatternList - An array of unprocessed domain or URL strings.
 * @returns {Array<string>} A new array containing the standardized and filtered patterns.
 */
const processDomainPatterns = (rawPatternList) => {
    // Initialize an empty list to store the standardized patterns.
    let standardizedPatterns = [];

    // Early exit if the input list is not an array or is empty.
    if (!Array.isArray(rawPatternList) || rawPatternList.length === 0) {
        logService.debug("Input for domain pattern processing was invalid or empty.");
        return standardizedPatterns; // Return an empty array.
    }

    // Iterate through each pattern provided in the input list.
    for (const currentPattern of rawPatternList) {
        // Skip processing if the current pattern is an empty string or not a string.
        if (typeof currentPattern !== 'string' || currentPattern.trim() === '') {
            logService.debug(`Skipping empty or invalid pattern: '${currentPattern}'.`);
            continue; // Move to the next pattern.
        }

        let modifiedPattern = currentPattern.trim(); // Trim whitespace from the pattern.

        // Check if the pattern already contains a protocol and a trailing slash.
        // This regex looks for 'http://' or 'https://' followed by anything and then a '/'
        const protocolAndSlashRegex = /^(https?:\/\/.+\/)$/;

        // If the pattern doesn't end with a slash or a wildcard after the protocol, adjust it.
        // This addresses a known compatibility requirement for Safari's URL matching.
        if (!protocolAndSlashRegex.test(modifiedPattern)) {
            // If the pattern ends with a single wildcard, ensure it's followed by a slash for directory matching.
            if (modifiedPattern.endsWith('*')) {
                // Example: "example.com*" becomes "example.com/*"
                modifiedPattern = modifiedPattern.substring(0, modifiedPattern.length - 1) + '/*';
            } else if (!modifiedPattern.endsWith('/')) {
                // If it doesn't end with a wildcard or a slash, append a slash.
                // Example: "example.com" becomes "example.com/"
                modifiedPattern = modifiedPattern + '/';
            }
        }
        // Add the now-standardized pattern to our result list.
        standardizedPatterns.push(modifiedPattern);
    }
    return standardizedPatterns;
};

/**
 * Initiates a full refresh of all custom CSS content sheets managed by the extension.
 * This involves removing all previously applied sheets and then re-adding
 * only those that are currently enabled in the style storage.
 */
function refreshContentSheetConfig() {
    logService.info("Starting content stylesheet configuration refresh cycle.");

    // First, clear all existing content stylesheets to prevent duplicates or stale rules.
    safari.extension.removeContentStyleSheets();

    // Ensure styleStorage is available and has an 'each' method before proceeding.
    if (!styleStorage || typeof styleStorage.each !== 'function') {
        logService.error("Style storage mechanism is not accessible or malformed. Cannot refresh styles.");
        return; // Exit early if storage is unavailable.
    }

    const currentExtensionBaseURI = safari.extension.baseURI;
    const selfExclusionPattern = currentExtensionBaseURI + '*'; // Pattern to exclude the extension's own pages.

    // Iterate through each stored style configuration.
    styleStorage.each((configKey, styleDefinition) => {
        // Only process and apply styles that are explicitly marked as enabled.
        if (styleDefinition && typeof styleDefinition === 'object' && styleDefinition.enabled) {
            const cssTextContent = styleDefinition.styles;
            // Process user-defined domains for inclusion.
            const targetDomainsList = processDomainPatterns(styleDefinition.domains);
            // Process user-defined domains for exclusion.
            let blockedDomainsList = processDomainPatterns(styleDefinition.excludes);

            // Always ensure the extension's own pages are excluded from custom styles to prevent conflicts.
            // This is a critical safeguard for the extension's UI.
            if (!blockedDomainsList.includes(selfExclusionPattern)) {
                blockedDomainsList.push(selfExclusionPattern);
            }

            // Apply the content stylesheet with the determined rules.
            safari.extension.addContentStyleSheet(cssTextContent, targetDomainsList, blockedDomainsList);
            logService.debug(`Applied stylesheet for key: '${configKey}'. Domains: ${targetDomainsList.length}, Excludes: ${blockedDomainsList.length}`);
        } else {
            logService.debug(`Skipping disabled or invalid style configuration for key: '${configKey || 'unknown'}'.`);
        }
    });
    logService.info("Content stylesheet refresh cycle completed.");
}

/**
 * Manages commands received by the extension, primarily handling the opening
 * of the administration interface for user styles.
 * @param {SafariExtensionGlobalPageEvent} cmdEvt - The event object containing command details.
 */
const processCommandEvent = (cmdEvt) => {
    // Validate that a command property exists on the event object.
    if (!cmdEvt || typeof cmdEvt !== 'object' || !cmdEvt.command) {
        logService.warn("Received a command event without a defined command property or invalid event object.");
        return;
    }

    // Use a switch statement for command processing.
    switch (cmdEvt.command) {
        case APP_CONSTANTS.COMMAND_MANAGE_STYLES:
            logService.info("Received command to open user style management interface.");
            const administrationPagePath = 'manage/manage.html';
            const fullAdminURL = safari.extension.baseURI + administrationPagePath;

            const activeBrowserWindowRef = safari.application.activeBrowserWindow;
            // Ensure we have an active window to operate on.
            if (!activeBrowserWindowRef) {
                logService.error("No active browser window found to open the management page.");
                return;
            }

            const currentActiveTab = activeBrowserWindowRef.activeTab;

            // Determine if the management page should open in the current tab or a new one.
            // If the current tab's URL is empty (e.g., a new tab page), reuse it.
            if (currentActiveTab && typeof currentActiveTab === 'object' && currentActiveTab.url === "") {
                currentActiveTab.url = fullAdminURL;
                logService.debug(`Opened management page in current empty tab: ${fullAdminURL}`);
            } else {
                // Otherwise, open a brand new tab in the foreground.
                const newForegroundTab = activeBrowserWindowRef.openTab('foreground');
                if (newForegroundTab) {
                    newForegroundTab.url = fullAdminURL;
                    logService.debug(`Opened management page in new foreground tab: ${fullAdminURL}`);
                } else {
                    logService.error("Failed to open a new foreground tab for the management page.");
                }
            }
            break;
        default:
            // Log any unrecognized commands for debugging purposes.
            logService.debug(`Unrecognized command received: '${cmdEvt.command}'. No action taken.`);
            break;
    }
};

/**
 * Processes messages dispatched from content scripts or other parts of the extension.
 * This function acts as a central hub for inter-component communication.
 * @param {SafariExtensionMessageEvent} msgEvent - The event object containing message details.
 */
const handleIncomingMessage = (msgEvent) => {
    // Basic validation for the message event structure.
    if (!msgEvent || typeof msgEvent !== 'object' || !msgEvent.name || !msgEvent.target || !msgEvent.target.page) {
        logService.warn("Received an invalid or incomplete message event.");
        return;
    }

    const messageName = msgEvent.name;
    const messagePayload = msgEvent.message; // General payload, can be any type.
    const senderPage = msgEvent.target.page; // Reference to the page that sent the message.

    logService.debug(`Processing incoming message: '${messageName}' from page.`);

    // Use a series of if-else if statements for message type handling.
    if (messageName === APP_CONSTANTS.MESSAGE_RELOAD_STYLES) {
        // Request to refresh all active stylesheets.
        refreshContentSheetConfig();
        logService.info("Triggered stylesheet refresh based on message request.");
    } else if (messageName === APP_CONSTANTS.MESSAGE_GET_ITEM) {
        // Request to retrieve a specific item from storage.
        const requestedKey = messagePayload;
        const retrievedValue = styleStorage.getItem(requestedKey);
        // Respond to the sender with the item's key and its value.
        senderPage.dispatchMessage(APP_CONSTANTS.MESSAGE_GET_ITEM, [requestedKey, retrievedValue]);
        logService.debug(`Dispatched stored item for key '${requestedKey}' to sender.`);
    } else if (messageName === APP_CONSTANTS.MESSAGE_REMOVE_ITEM) {
        // Request to remove an item from storage.
        const keyToRemove = messagePayload;
        styleStorage.removeItem(keyToRemove);
        logService.info(`Removed item with key '${keyToRemove}' from storage.`);
    } else if (messageName === APP_CONSTANTS.MESSAGE_SET_ITEM) {
        // Request to store an item. Expects payload to be an array [key, value].
        if (Array.isArray(messagePayload) && messagePayload.length === 2) {
            const [itemKey, itemValue] = messagePayload;
            styleStorage.setItem(itemKey, itemValue);
            logService.info(`Stored item with key '${itemKey}'.`);
        } else {
            logService.warn(`Invalid payload for SET_ITEM message. Expected [key, value], got:`, messagePayload);
        }
    } else if (messageName === APP_CONSTANTS.MESSAGE_GET_ALL_ITEMS) {
        // Request for all stored items.
        const allStoredItems = [];
        // Ensure the styleStorage has an 'each' method before attempting to iterate.
        if (typeof styleStorage.each === 'function') {
            styleStorage.each((itemKey, itemData) => {
                allStoredItems.push({ identifier: itemKey, dataObject: itemData });
            });
            // Respond with the collected items.
            senderPage.dispatchMessage(APP_CONSTANTS.MESSAGE_GET_ALL_ITEMS, allStoredItems);
            logService.debug(`Dispatched ${allStoredItems.length} stored items to sender.`);
        } else {
            logService.error("Style storage 'each' method is unavailable. Cannot retrieve all items.");
            senderPage.dispatchMessage(APP_CONSTANTS.MESSAGE_GET_ALL_ITEMS, []); // Send empty array as fallback.
        }
    } else if (messageName === APP_CONSTANTS.MESSAGE_CHECK_CONVERSION) {
        // Request to check if old localStorage data needs migration.
        const needsConversion = (localStorage.length === 0);
        senderPage.dispatchMessage(APP_CONSTANTS.MESSAGE_CHECK_CONVERSION, needsConversion);
        if (needsConversion) {
            logService.info("Signaled sender that data conversion might be needed (localStorage is empty).");
        } else {
            logService.debug("LocalStorage not empty, conversion likely not needed.");
        }
    } else {
        // Handle any message names that are not explicitly recognized.
        logService.debug(`Unhandled message name received: '${messageName}' with payload:`, messagePayload);
    }
};

/**
 * Handles validation events for toolbar items, typically used to enable or disable
 * UI elements based on current extension settings or state.
 * @param {SafariExtensionValidateEvent} validationEvent - The event object for validation.
 */
const validateToolbarItem = (validationEvent) => {
    // Ensure the event and its target are valid before proceeding.
    if (!validationEvent || typeof validationEvent !== 'object' || !validationEvent.target || !validationEvent.target.identifier) {
        logService.warn("Received an invalid validation event or missing target identifier.");
        return;
    }

    const targetIdentifier = validationEvent.target.identifier;
    const toolbarItem = validationEvent.target; // Reference to the toolbar item being validated.

    logService.debug(`Validating toolbar item: '${targetIdentifier}'.`);

    // Check if the identifier matches the user style management item.
    if (targetIdentifier === APP_CONSTANTS.VALIDATE_MANAGE_ITEM) {
        // The item's disabled state is determined by the 'enableContextMenu' setting.
        // If the setting is false, the item should be disabled (true for disabled property).
        const isContextMenuEnabled = safari.extension.settings.enableContextMenu;
        toolbarItem.disabled = !isContextMenuEnabled;
        logService.debug(`Toolbar item '${targetIdentifier}' disabled state set to: ${toolbarItem.disabled} (Context menu enabled: ${isContextMenuEnabled}).`);
    } else {
        // Log unrecognized validation targets.
        logService.debug(`Unhandled validation target identifier: '${targetIdentifier}'.`);
    }
};

// Global execution context for the Safari Extension.

// Attach event listeners for various application-level events.
// These listeners route specific events to their dedicated handler functions.
safari.application.addEventListener('command', processCommandEvent, false);
safari.application.addEventListener('message', handleIncomingMessage, false);
safari.application.addEventListener('validate', validateToolbarItem, false);

logService.info("Extension global page initialized. Attaching event handlers.");

// Perform an initial refresh of content stylesheets when the extension starts.
// This ensures that any user styles are applied immediately upon launch.
refreshContentSheetConfig();
logService.info("Initial content stylesheet configuration applied.");