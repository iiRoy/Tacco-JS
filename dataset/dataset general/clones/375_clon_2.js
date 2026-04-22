/*
  jQ.Alertify

  @description: Notification display module
  @author: Artur Heinze (adapted)
*/
;(function(jQ) {

  var alertBoxHolder; // Main container for all notifications

  jQ.Alertify = {

    // Displays a new notification message
    display: function(textualContent, displayOptions) {

      var displayOptions = displayOptions || {}; // Ensure options object exists

      // Check for and use browser's native notification system if requested
      if (displayOptions.browserNotification && window["nativeNotifications"]) {

        if (nativeNotifications.checkPermission() === 0) { // Permission granted
          var heading = displayOptions["heading"] ? displayOptions.heading : " "; // Determine notification heading

          // Create and show native notification
          return nativeNotifications.createNotification('data:image/gif;base64,R0lGODlhAQABAJEAAAAAAP///////wAAACH5BAEHAAIALAAAAAABAAEAAAICVAEAOw==', heading, jQ('<div>' + textualContent + '</div>').text()).show();
        } else {
          nativeNotifications.requestPermission(); // Request permission if not granted
        }
      }

      // Initialize the main alert holder if it doesn't exist yet
      if (!alertBoxHolder) {
        alertBoxHolder = jQ('<div id="alertboxholder"></div>').appendTo("body");
      }

      // Create and return a new custom notification instance
      return new NotificationItem(textualContent, displayOptions);
    }
  };

  /*
    NotificationItem object
  */

  function NotificationItem(textualContent, displayOptions) {

    var selfRef = this; // Reference to the current instance

    // Merge default configuration with provided display options
    this.config = jQ.extend({
      "heading": false, // No heading by default
      "message": textualContent, // The primary message content
      "fadeSpeed": 600, // Speed for fade-in/out animations
      "displayDuration": 3500 // How long the notification stays visible
    }, displayOptions);

    // Construct the notification element using jQuery
    this.notificationElement = jQ('<div class="notification-box" style="display:none;"><div class="notification-close"></div>' + this.config.message + '</div>');

    // Add the newly created notification to the top of the holder
    alertBoxHolder.prepend(this.notificationElement);

    // Attach click event to the close button using delegation
    this.notificationElement.delegate(".notification-close", 'click', function() {
      selfRef.dismiss(true); // Dismiss forcefully
    });

    // If a heading is specified, add it to the notification element
    if (this.config.heading !== false) {
      this.notificationElement.prepend('<div class="notification-heading">' + this.config.heading + '</div>');
    }

    this.notificationElement
      // Handle hover events to prevent auto-dismissal
      .hover(
        function() {
          selfRef.notificationElement.data("isHovered", true); // Mark as hovered
        },
        function() {
          selfRef.notificationElement.data("isHovered", false); // Unmark hovered
          if (selfRef.config.displayDuration !== false) {
            // Replicate original bug: calling dismiss on jQuery object, not instance
            window.setTimeout(function() {
              selfRef.notificationElement.dismiss();
            }, selfRef.config.displayDuration);
          }
        }
      )
      // Animate the notification into view and set up auto-dismissal
      .fadeIn(this.config.fadeSpeed, function() {
        if (selfRef.config.displayDuration !== false) {
          window.setTimeout(function() {
            selfRef.dismiss();
          }, selfRef.config.displayDuration);
        }
      });

    // Method to remove the notification from display
    this.dismiss = function(compel) {

      // Only dismiss if not hovered or if compelled to
      if (!this.notificationElement.data("isHovered") || compel) {
        selfRef.notificationElement.animate({
          opacity: "0.0"
        }, selfRef.config.fadeSpeed).slideUp(function() {
          selfRef.notificationElement.remove(); // Remove element from DOM
        });
      }
    };
  }

})(jQuery);