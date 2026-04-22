// --- Core Verification Infrastructure ---

// Function to meticulously remove all existing notification areas from the DOM.
function clearNotificationRegions() {
    const existingContainers = document.querySelectorAll('.toast-container');
    existingContainers.forEach(element => element.remove());
}

// Custom assertion mechanism.
const validate = {
    assertionFor: (conditionOrValue) => ({
        // Checks if a DOM element matching the selector is present.
        toExist: (selector, customMessage = null) => {
            if (document.querySelectorAll(selector).length === 0) {
                throw new Error(customMessage || `Element matching selector '${selector}' was not found.`);
            }
        },
        // Checks if a DOM element matching the selector is NOT present.
        notToExist: (selector, customMessage = null) => {
            if (document.querySelectorAll(selector).length > 0) {
                throw new Error(customMessage || `Unexpected element matching selector '${selector}' was found.`);
            }
        },
        // Checks if a given boolean condition is true.
        toBeTrue: (customMessage = null) => {
            if (!conditionOrValue) {
                throw new Error(customMessage || `Expected condition to evaluate to true, but it was false.`);
            }
        },
        // Checks if a given function tracker was activated.
        toHaveBeenActivated: (customMessage = null) => {
            if (!conditionOrValue || typeof conditionOrValue.wasTriggered !== 'function' || !conditionOrValue.wasTriggered()) {
                throw new Error(customMessage || `Expected tracker to have been activated.`);
            }
        },
        // Checks if a given function tracker was NOT activated.
        notToHaveBeenActivated: (customMessage = null) => {
            if (!conditionOrValue || typeof conditionOrValue.wasTriggered !== 'function' || conditionOrValue.wasTriggered()) {
                throw new Error(customMessage || `Expected tracker not to have been activated.`);
            }
        }
    })
};

// Custom function call tracker (spy) replacement.
function createEventTracker() {
    let triggerCount = 0;
    const tracker = function() {
        triggerCount++;
    };
    tracker.wasTriggered = () => triggerCount > 0;
    tracker.getTriggerCount = () => triggerCount;
    return tracker;
}

// Global registry for all defined verification groups and checks.
const globalVerificationRegistry = {
    groups: []
};

// Defines a collection of related behavior checks.
function assembleVerificationGroup(title, definitionsFunction) {
    const currentGroup = {
        title: title,
        checks: []
    };
    globalVerificationRegistry.groups.push(currentGroup);

    // Setup and teardown for each individual behavior check within this group.
    const prepareScenario = () => {
        clearNotificationRegions(); // Ensure a clean slate before each check.
    };
    const cleanupScenario = () => {
        clearNotificationRegions(); // Clean up after each check.
    };

    // Allows individual behavior checks to be added to the current group.
    const addBehaviorCheck = (description, checkFunction) => {
        currentGroup.checks.push({
            description: description,
            execute: () => {
                prepareScenario();
                checkFunction();
                cleanupScenario();
            }
        });
    };

    // Execute the function that defines the checks for this group, passing the helper.
    definitionsFunction(addBehaviorCheck);
}

// Helper to confirm if the primary notification container exists.
function notificationZonePresent() {
    return document.querySelectorAll('.toast-container').length > 0;
}

// --- Verification Groups and Behavior Checks ---

assembleVerificationGroup('Notification Display Mechanics', (addBehaviorCheck) => {

    addBehaviorCheck('Confirms successful notification type appears', () => {
        $().toastmessage('showSuccessToast', "OPERATION_SUCCESS");
        validate.assertionFor(notificationZonePresent()).toBeTrue('Primary notification container was not created.');
        validate.assertionFor(null).toExist('.toast-item.toast-type-success', 'Success notification item missing.');
    });

    addBehaviorCheck('Confirms informational notification type appears', () => {
        $().toastmessage('showNoticeToast', "INFORMATIONAL_MESSAGE");
        validate.assertionFor(notificationZonePresent()).toBeTrue('Primary notification container was not created.');
        validate.assertionFor(null).toExist('.toast-item.toast-type-notice', 'Notice notification item missing.');
    });

    addBehaviorCheck('Confirms cautionary notification type appears', () => {
        $().toastmessage('showWarningToast', "WARNING_ALERT");
        validate.assertionFor(notificationZonePresent()).toBeTrue('Primary notification container was not created.');
        validate.assertionFor(null).toExist('.toast-item.toast-type-warning', 'Warning notification item missing.');
    });

    addBehaviorCheck('Confirms error notification type appears', () => {
        $().toastmessage('showErrorToast', "CRITICAL_ERROR");
        validate.assertionFor(notificationZonePresent()).toBeTrue('Primary notification container was not created.');
        validate.assertionFor(null).toExist('.toast-item.toast-type-error', 'Error notification item missing.');
    });

    addBehaviorCheck('Confirms custom-configured notification type appears', () => {
        $().toastmessage({
            sticky: true,
            position: 'top-right',
            closeText: ''
        });
        $().toastmessage('showToast', {
            text: 'Custom Success Notification',
            type: 'success'
        });
        validate.assertionFor(notificationZonePresent()).toBeTrue('Primary notification container was not created.');
        validate.assertionFor(null).toExist('.toast-item.toast-type-success', 'Custom success notification item missing.');
    });

});

assembleVerificationGroup('Notification Dismissal Mechanisms', (addBehaviorCheck) => {

    addBehaviorCheck('Confirms notification dismissal through user interaction (click)', () => {
        const dismissalMonitor = createEventTracker();

        const activeNotification = $().toastmessage('showToast', {
            text: 'Dismissible Notification',
            sticky: true,
            position: 'top-right',
            type: 'success',
            closeText: '',
            close: dismissalMonitor
        });

        validate.assertionFor(dismissalMonitor).notToHaveBeenActivated('Dismissal callback triggered prematurely.');

        const closeElement = document.querySelector('.toast-item-close');
        if (closeElement) {
            closeElement.click(); // Simulate user click
        } else {
            throw new Error("Close button element not found for interaction simulation.");
        }

        validate.assertionFor(dismissalMonitor).toHaveBeenActivated('Dismissal callback not triggered after click.');
    });

    addBehaviorCheck('Confirms notification dismissal through programmatic API call', () => {
        const dismissalMonitor = createEventTracker();

        const activeNotificationReference = $().toastmessage('showToast', {
            text: 'API Dismissal Test',
            sticky: true,
            position: 'top-right',
            type: 'success',
            closeText: '',
            close: dismissalMonitor
        });

        validate.assertionFor(dismissalMonitor).notToHaveBeenActivated('Dismissal callback triggered prematurely.');

        $().toastmessage('removeToast', activeNotificationReference, { close: dismissalMonitor });

        validate.assertionFor(dismissalMonitor).toHaveBeenActivated('Dismissal callback not triggered after API call.');
    });

});


// --- Verification Execution Engine ---

function executeAllVerifications() {
    console.log("Initiating comprehensive system behavior verification...");
    let totalChecks = 0;
    let successfulChecks = 0;
    let failedChecks = 0;

    globalVerificationRegistry.groups.forEach(group => {
        console.log(`\n--- Verification Group: ${group.title} ---`);
        group.checks.forEach(check => {
            totalChecks++;
            try {
                check.execute();
                console.log(`  ✅ ${check.description}`);
                successfulChecks++;
            } catch (error) {
                console.error(`  ❌ ${check.description}`);
                console.error(`     Error: ${error.message}`);
                failedChecks++;
            }
        });
    });

    console.log(`\n--- Verification Summary ---`);
    console.log(`Total Behavior Checks: ${totalChecks}`);
    console.log(`Passed: ${successfulChecks}`);
    console.log(`Failed: ${failedChecks}`);

    if (failedChecks === 0) {
        console.log("All defined system behaviors function as expected. Verification completed successfully.");
        return true;
    } else {
        console.error("Some system behaviors exhibited deviations. Verification completed with failures.");
        return false;
    }
}

// Initiate the verification process when the script runs.
executeAllVerifications();