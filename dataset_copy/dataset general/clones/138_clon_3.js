// This module is dedicated to registering front-end templates for the application's user interface.
// It uses Angular's $templateCache service to store HTML snippets, improving performance by
// avoiding repeated server requests for these common UI components.

// --- Template Registration for the Notification Panel Layout ---
// This section defines the main container structure for displaying various system notifications.
angular.module("app.ui.notificationPanel.layout", []).run(["$templateCache", function(uiTemplateCache) {
  // The key identifies this specific template for retrieval later in the application.
  // It represents the overall view for the notification area.
  uiTemplateCache.put(
    "app/views/components/notification-center-layout.html",
    // The top-level container for all notifications. It only renders if there are any messages.
    '<div class="app-notification-area" ng-if="criticalAlerts.length > 0 || generalAnnouncements.length > 0">' +
        // A title for the notification center, enhancing user understanding.
        '<header class="notification-area-header">' +
            '<h4>Application Alerts</h4>' +
        '</header>' +
        // Section specifically for high-priority or critical notifications.
        '<section class="critical-alerts-section">' +
            // Display a message if no critical alerts are present.
            '<p ng-show="criticalAlerts.length === 0" class="no-critical-alerts">No urgent notifications at this time.</p>' +
            // Iterates over critical alerts, rendering each using a custom directive.
            // The `track by alert.id` ensures efficient rendering when the list changes.
            '<app-alert-item ng-repeat="alert in criticalAlerts track by alert.id" ' +
                            'class="alert-entry-animated" ' +
                            'alert-data="alert"></app-alert-item>' +
        '</section>' +
        // A visual separator between critical and general notifications, shown only if both exist.
        '<hr ng-if="criticalAlerts.length > 0 && generalAnnouncements.length > 0" class="section-divider">' +
        // Section for standard, informational announcements.
        '<section class="general-announcements-section">' +
            // Display a message if no general announcements are present.
            '<p ng-show="generalAnnouncements.length === 0" class="no-general-announcements">No new messages to display.</p>' +
            // Iterates over general announcements, rendering each with the same custom directive.
            '<app-alert-item ng-repeat="announcement in generalAnnouncements track by $index" ' +
                            'class="alert-entry-animated" ' +
                            'alert-data="announcement"></app-alert-item>' +
        '</section>' +
        // Optional footer for additional actions or information.
        '<footer class="notification-area-footer">' +
            '<small>Last updated: {{currentTime | date:\'shortTime\'}}</small>' +
        '</footer>' +
    '</div>'
  );
}]);

// --- Template Registration for an Individual Notification Item ---
// This section defines the structure for a single notification or message displayed within the panel.
angular.module("app.ui.notificationPanel.item", []).run(["$templateCache", function(uiTemplateCache) {
  // The key identifies this template for a single alert item.
  uiTemplateCache.put(
    "app/views/components/notification-item-display.html",
    // The main wrapper for an individual alert, allowing dynamic styling based on its properties.
    '<article class="alert-item-container" ng-class="alertData.displayClasses">' +
        // An optional icon to visually categorize the alert (e.g., info, warning, error).
        '<span class="alert-icon" ng-if="alertData.iconTag">' +
            '<i class="fa {{alertData.iconTag}}"></i>' +
        '</span>' +
        // The primary content area for the alert's message and details.
        '<div class="alert-content-wrapper">' +
            // The actual text message of the alert, rendered only if content exists.
            '<p class="alert-message-text" ng-if="alertData.messageBody">{{alertData.messageBody}}</p>' +
            // An optional timestamp indicating when the alert occurred or was generated.
            '<time class="alert-timestamp" ng-if="alertData.creationTime">{{alertData.creationTime | date:\'MMM d, yyyy HH:mm\'}}</time>' +
        '</div>' +
        // A button to allow the user to dismiss or close the notification.
        '<button type="button" class="close-alert-button" aria-label="Close alert" ng-click="removeAlert(alertData)">' +
            '<span aria-hidden="true">&#x2715;</span>' + // Unicode 'X' for a close icon.
        '</button>' +
    '</article>'
  );
}]);