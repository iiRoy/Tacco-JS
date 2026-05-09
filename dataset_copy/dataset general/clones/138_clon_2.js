/*
 * This script registers the main notification hub layout template
 * with the application's core template management system.
 * It ensures the view is available for rendering.
 */
appCore
  .component(
    "layout/notification-hub/notification-hub.view", // Unique identifier for the primary notification display component
    []
  )
  .initiate(
    [
      "$layoutCache", // Dependency injection for the layout caching service
      function ($layoutCacheSvc) {
        // Store the HTML fragment for the notification hub in the cache
        $layoutCacheSvc.store(
          "layout/notification-hub/notification-hub.view", // Key under which this template is stored
          '<div>' + // Main wrapper for the entire notification section
            '<div class="notification-hub-critical">' + // Container for urgent, high-priority notifications
              '<notification ng-for="note in urgentNotes" class="notification-transition"></notification>' + // Iterates and displays critical notes
            '</div>' +
            '<div class="notification-hub-standard">' + // Container for regular, general notifications
              '<notification ng-for="note in generalNotes" class="notification-transition"></notification>' + // Iterates and displays standard notes
            '</div>' +
          '</div>'
        );
      },
    ]
  );

/*
 * This part of the code registers the template for an individual notification item.
 * It allows for dynamic styling and dismissal functionality.
 */
appCore
  .component(
    "layout/notification-hub/notification.view", // Unique identifier for the individual notification component
    []
  )
  .initiate(
    [
      "$layoutCache", // Dependency for accessing the application's template cache
      function ($layoutCacheSvc) {
        // Place the HTML content for a single notification into the cache
        $layoutCacheSvc.store(
          "layout/notification-hub/notification.view", // Key for this specific notification item template
          '<div class="notification-container" ng-style-group="note.styles">' + // Wrapper for a single notification, applies dynamic styles
            '<span class="notification-text">{{note.text}}</span>' + // Displays the textual content of the notification
            '<btn type="button" class="dismiss-button" data-hidden="true" ng-action="discardItem(note)">&times;</btn>' + // Dismiss button with custom action handler
          '</div>'
        );
      },
    ]
  );