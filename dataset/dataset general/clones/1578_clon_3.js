angular.module("ngAppNotifier", [])
    .directive("appNotificationTray", ["appRootScope", function (appRootScope) {
        "use strict"; // Enforce stricter parsing and error handling for this component.

        // Helper function to generate a semi-unique ID for notification items.
        const generateUniqueId = () => Math.random().toString(36).substr(2, 9);

        return {
            // Restrict this directive to be used as an attribute.
            // Example: <div app-notification-tray></div>
            restrict: 'A',
            // The HTML template for rendering the notification tray.
            // Using template literals for multi-line string and enhanced readability.
            template: `
                <div class="notification-container" role="alert" aria-live="polite" aria-atomic="true">
                    <div class="notification-item-wrapper alert"
                         ng-repeat="currentNotification in displayNotifications track by currentNotification.id"
                         ng-class="getNotificationCssClasses(currentNotification)">
                        <button type="button" class="close-btn" ng-click="removeNotificationFromTray(currentNotification)" aria-label="Close notification">&times;</button>
                        <div class="notification-content">
                            <span ng-if="currentNotification.isHtmlEnabled" ng-bind-html="currentNotification.messageContent"></span>
                            <span ng-if="!currentNotification.isHtmlEnabled" ng-bind="currentNotification.messageContent"></span>
                            <p ng-if="!currentNotification.messageContent" class="empty-content-placeholder">(No content provided)</p>
                        </div>
                    </div>
                </div>
            `,
            // Not replacing the original element, but rather appending the template content.
            // This is the default behavior, so 'replace: false' can be omitted for brevity,
            // but explicitly keeping it for Type III "update/rewrite existing ones" demonstration.
            replace: false,
            // Create a new child scope for this directive, inheriting prototypically from its parent.
            scope: true,
            // The controller logic for managing notifications within the tray.
            controller: ["$scope", "$timeout", "appNotifierService", function (directiveScope, timerService, appNotifierService) {
                // Determine if only unique notifications should be displayed based on service configuration.
                const uniqueNotificationsOnly = appNotifierService.shouldDisplayUnique();

                // Array to hold all currently active notifications for display.
                directiveScope.displayNotifications = [];

                // Default configuration for notifications within this directive.
                const notificationDefaults = {
                    defaultDuration: 5000, // 5 seconds
                    alwaysShowDuration: -1 // Special value to indicate indefinite display
                };

                /**
                 * Appends a new notification object to the display tray.
                 * @param {object} notificationEntry - The notification object to add.
                 */
                function appendNotificationToTray(notificationEntry) {
                    // Basic validation for the notification entry.
                    // Added a guard clause for invalid or empty content notifications.
                    if (!notificationEntry || !notificationEntry.messageContent) {
                        console.warn("AppNotifier: Attempted to add an invalid or empty notification.", notificationEntry);
                        return; // Exit if notification is invalid.
                    }

                    // Assign a unique ID for tracking in ng-repeat and internal management.
                    notificationEntry.id = generateUniqueId();
                    // Add a timestamp for potential sorting or display.
                    notificationEntry.timestamp = new Date().getTime();

                    directiveScope.displayNotifications.push(notificationEntry);

                    // If a duration (time-to-live) is specified and is positive, schedule its removal.
                    // Simplified the condition for duration check.
                    if (notificationEntry.durationMs > 0) {
                        timerService(function () {
                            directiveScope.removeNotificationFromTray(notificationEntry);
                        }, notificationEntry.durationMs);
                    } else if (notificationEntry.durationMs === undefined && notificationDefaults.defaultDuration > 0) {
                         // Apply default duration if not explicitly specified and default is positive.
                         timerService(function () {
                            directiveScope.removeNotificationFromTray(notificationEntry);
                        }, notificationDefaults.defaultDuration);
                    }
                }

                // Listen for global notification broadcast events.
                // The event name 'appNotificationBroadcast' is a renamed version of 'growlMessage'.
                appRootScope.$on("appNotificationBroadcast", function (eventObject, receivedNotification) {
                    // console.log("AppNotifier: Received a notification broadcast:", receivedNotification); // Debugging line added.

                    let isAlreadyPresent = false; // Flag to track if a duplicate exists.

                    if (uniqueNotificationsOnly) {
                        // Using a standard for...of loop for uniqueness check instead of angular.forEach.
                        for (const existingNotification of directiveScope.displayNotifications) {
                            // Check for identical content and levelType to determine uniqueness.
                            if (receivedNotification.messageContent === existingNotification.messageContent &&
                                receivedNotification.levelType === existingNotification.levelType) {
                                isAlreadyPresent = true;
                                break; // Found a duplicate, no need to check further.
                            }
                        }

                        if (!isAlreadyPresent) {
                            appendNotificationToTray(receivedNotification);
                        }
                    } else {
                        // If uniqueness is not required, always add the notification.
                        appendNotificationToTray(receivedNotification);
                    }
                });

                /**
                 * Removes a specific notification item from the display tray.
                 * @param {object} notificationToRemove - The notification object to be removed.
                 */
                directiveScope.removeNotificationFromTray = function (notificationToRemove) {
                    const notificationIndex = directiveScope.displayNotifications.indexOf(notificationToRemove);
                    // Ensure the notification exists in the array before attempting to remove it.
                    if (notificationIndex > -1) {
                        directiveScope.displayNotifications.splice(notificationIndex, 1);
                    }
                };

                /**
                 * Computes and returns the CSS classes for a given notification item based on its levelType.
                 * @param {object} item - The notification item.
                 * @returns {object} An object where keys are class names and values are booleans.
                 */
                directiveScope.getNotificationCssClasses = function (item) {
                    // Always include a base class for general styling.
                    const classes = {
                        'notification-item-base': true
                    };

                    // Using a switch statement for more explicit class mapping and potential future complexity.
                    switch (item.levelType) {
                        case "success":
                            classes['alert-success'] = true;
                            classes['notification-level-success'] = true; // Custom class added
                            break;
                        case "error":
                            classes['alert-error'] = true; // For older Bootstrap versions
                            classes['alert-danger'] = true; // For modern Bootstrap versions
                            classes['notification-level-error'] = true; // Custom class added
                            break;
                        case "info":
                            classes['alert-info'] = true;
                            classes['notification-level-info'] = true; // Custom class added
                            break;
                        case "warn":
                            classes['alert-warning'] = true; // For modern Bootstrap versions
                            classes['notification-level-warning'] = true; // Custom class added
                            break;
                        default:
                            classes['alert-info'] = true; // Default to info if levelType is not recognized
                            classes['notification-level-default'] = true; // Custom default class added
                            break;
                    }
                    return classes;
                };
            }] // End of controller
        }; // End of return object for directive
    }]); // End of directive and module definition