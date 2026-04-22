angular
.module("ng-notification-display") // Define the module for notification display functionality.
.directive("notificationDisplay", ["$rootContext", function (appRootContext) {
	"use strict"; /* Enforce strict mode for better code quality and error handling. */

	return {
		restrict: 'A', // This directive can only be used as an attribute.
		template:   '<div     class="notifier"     >' +
					'	<div class="notifier-item status" ng-repeat="item in notifications" ng-class="determineStyles(item)">' +
					'		<button type="button" class="close-btn" ng-click="removeNotification(item)"> &times; </button>' +
					'       <div ng-switch="item.allowRichText">' +
					'           <div ng-switch-when="true" ng-bind-html="item.content"></div>' +
					'           <div ng-switch-default ng-bind="item.content"></div>' +
					'       </div>' +
					'	</div>' +
					'</div>', // The HTML template structure for a single notification display area.
		replace: false, // Do not replace the element this directive is on; append to it.
		scope: true, // Create an isolated scope for this directive instance.
		controller: ['$viewScope', '$delayService', 'notificationService', function (currentViewScope, delayExecution, notifierService) {
			// Determine if the notification service is configured to display only unique messages.
			var uniqueModeEnabled = notifierService.isUniqueOnly();

			// Initialize an empty array to store the notification objects displayed in the view.
			currentViewScope.notifications = [];

			/**
			 * Appends a new notification item to the display list.
			 * @param {object} item - The notification object containing details like content, level, and expiration.
			 */
			function appendNotification(item) {
				currentViewScope.notifications.push(item); // Add the new item to the collection.

				/* If an expiration time (TTL) is provided and is not -1 (for infinite display),
				 * set a timed removal for the notification. */
				if (item.expirationTime && item.expirationTime !== -1) {
					delayExecution(function () {
						currentViewScope.removeNotification(item); // Call the removal function after the delay.
					}, item.expirationTime); // The duration after which the notification should disappear.
				}
			}

			// Register a listener on the root scope for global notification events.
			appRootContext.$on("notificationEvent", function (evt, notificationItem) {
				var alreadyExists; // A flag to indicate if a duplicate notification is found.

				// Proceed with uniqueness check only if the service is configured for it.
				if (uniqueModeEnabled) {
					angular.forEach(currentViewScope.notifications, function(existingItem) {
						// Compare the content and level to determine if the notification is a duplicate.
						if (notificationItem.content === existingItem.content && notificationItem.level === existingItem.level) {
							alreadyExists = true; // Set flag if a match is found.
						}
					});

					// If no duplicate was found, add the new notification.
					if (!alreadyExists) {
						appendNotification(notificationItem);
					}
				} else {
					// If unique mode is not active, always add the notification without checking for duplicates.
					appendNotification(notificationItem);
				}
			});

			/**
			 * Removes a specified notification item from the display.
			 * This function is exposed on the scope for use in the template.
			 * @param {object} itemToRemove - The notification object that needs to be removed.
			 */
			currentViewScope.removeNotification = function (itemToRemove) {
				var itemIndex = currentViewScope.notifications.indexOf(itemToRemove); // Find the array index of the item.
				if (itemIndex > -1) { // If the item is found in the array (index is not -1).
					currentViewScope.notifications.splice(itemIndex, 1); // Remove one item at the found index.
				}

			};

			/**
			 * Calculates and returns the appropriate CSS classes for a notification based on its severity level.
			 * This function is used by ng-class in the directive's template.
			 * @param {object} notificationItem - The notification object whose level determines the styling.
			 * @returns {object} An object where keys are CSS class names and values are booleans.
			 */
			currentViewScope.determineStyles = function (notificationItem) {
				return {
					'status-success': notificationItem.level === "successful", /* CSS class for successful status */
					'status-error': notificationItem.level === "failure", // Generic error class (e.g., Bootstrap 2.x)
					'status-critical': notificationItem.level === "failure", // Critical error class (e.g., Bootstrap 3.x danger)
					'status-information': notificationItem.level === "informational", // Informational message class
					'status-caution': notificationItem.level === "warning" // Warning message class (e.g., Bootstrap 3.x warning)
				};
			};
		}]
	};
}]);