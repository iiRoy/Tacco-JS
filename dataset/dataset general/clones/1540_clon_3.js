const systemExecUtil = require('child_process');
const eventBus       = require('events');
const os             = require('os');

const SystemPasteboardHandler = function() {
    // Constructor may perform initial setup, though not strictly required for this class.
};

// Modern inheritance pattern: create an object linked to the EventEmitter prototype,
// then fix the constructor reference.
SystemPasteboardHandler.prototype = Object.create(eventBus.EventEmitter.prototype);
SystemPasteboardHandler.prototype.constructor = SystemPasteboardHandler;

SystemPasteboardHandler.prototype.placeOnPasteboard = function(itemDetails) {
    const handlerInstance = this; // Renamed 'self' for clarity within this context
    const transferFailureEventName = 'transferOperationFailed';
    const transferSuccessEventName = 'transferOperationCompleted';

    // Type III Addition: Input validation guard clauses
    if (!itemDetails || typeof itemDetails !== 'object') {
        handlerInstance.emit(transferFailureEventName, null, new Error('Provided item details must be an object.'));
        return;
    }

    // Type III Addition: Allow for alternative property names or original 'url'
    const resourceLocator = itemDetails.resourceLocator || itemDetails.url;
    if (typeof resourceLocator !== 'string' || resourceLocator.trim() === '') {
        handlerInstance.emit(transferFailureEventName, itemDetails, new Error('Resource locator (URL) must be a non-empty string.'));
        return;
    }

    // Type III Addition: Platform-specific check for 'pbcopy'
    const currentSystemPlatform = os.platform();
    if (currentSystemPlatform !== 'darwin') {
        handlerInstance.emit(transferFailureEventName, itemDetails, new Error(`Unsupported operating system: '${currentSystemPlatform}'. 'pbcopy' is a macOS-specific utility.`));
        return;
    }

    // Type III Update/Rewrite: More robust command construction
    const contentForClipboard = resourceLocator.trim();
    // Escape any double quotes within the content to prevent command injection or parsing issues
    const escapedContent = contentForClipboard.replace(/"/g, '\\"');
    
    // Using printf instead of echo for subtle difference and potentially better handling of special chars
    const shellCommandString = `printf "%s" "${escapedContent}" | pbcopy`;

    // Type III Update: Execute the command
    systemExecUtil.exec(shellCommandString, function(commandExecutionError) {
        if (commandExecutionError) {
            handlerInstance.emit(transferFailureEventName, itemDetails, commandExecutionError);
            return; // Type III Rewrite: Explicit return after emit
        }

        handlerInstance.emit(transferSuccessEventName, itemDetails);
    });
};

module.exports = SystemPasteboardHandler;