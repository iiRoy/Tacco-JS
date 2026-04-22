/*
  jQuery.Notifier

  @description: A robust system for displaying temporary alerts and notifications.
  @author: A. H. (adapted by AI)
  @version: 1.1.0
  @license: MIT (assumed)
*/
;(function(jq){

  // Internal global reference for the primary notification display area.
  // This container holds all custom alerts that appear on the page.
  let notificationTray;
  // Counter to assign unique identifiers to each custom alert instance.
  let alertSequenceId = 0;

  // Expose the core notification functionality through jQuery's namespace.
  // This makes the Notifier accessible via `$.Notifier.display(...)`.
  jq.Notifier = {

    /**
     * Initiates and displays a new notification, either native browser or custom.
     * @param {string} contentMsg - The primary textual content for the alert message.
     * @param {object} configParams - Optional configuration settings for this specific alert.
     * @returns {AlertInstance|Notification|void} Returns the custom alert object,
     *                                             a native Notification instance, or void if validation fails.
     */
    display: function(contentMsg, configParams){

      // Ensure configuration parameters are always an object to prevent errors.
      const currentConfig = configParams || {};

      // First, check if native browser notifications are requested and available
      // (using the older webkitNotifications API as per original code's context).
      if(currentConfig.nativeAlert && window["webkitNotifications"]){

        const browserNotificationsAPI = window["webkitNotifications"]; // Alias for cleaner access.

        // Verify user permission for displaying native alerts.
        // Permission states: 0=granted, 1=default, 2=denied.
        if (browserNotificationsAPI.checkPermission() === 0) { // Using original method name for consistency

          // Determine the heading text for the native notification.
          const headingText = currentConfig.headingText || " "; // Renamed title, default to space.

          // Create and show the native notification.
          // The icon URL is intentionally blank here, as the original used a base64 gif.
          // The message is stripped of HTML to ensure plain text for native alerts.
          return browserNotificationsAPI.createNotification('', headingText, jq('<div>'+contentMsg+'</div>').text()).show();
        } else {
          // If permission is not granted, request it from the user.
          browserNotificationsAPI.requestPermission();
        }
      }

      // If native notifications aren't used or not available, proceed with custom alerts.
      // If the notification tray element doesn't exist yet, create it and append to the body.
      if(!notificationTray) {
        notificationTray = jq('<div id="notifier-tray-container" style="z-index: 9999; position: fixed; top: 20px; right: 20px;"></div>').appendTo("body"); // Renamed id, added z-index, position.
      }

      // Create and return a new instance of our custom alert.
      // This will manage its own display, interaction, and dismissal.
      return new AlertInstance(contentMsg, currentConfig);
    }
  };

  /**
   * Represents an individual notification alert managed by the Notifier system.
   * This constructor handles the creation, display, and lifecycle of a single alert.
   * @constructor
   * @param {string} contentMsg - The message content to be displayed within this alert.
   * @param {object} initialConfig - Configuration object specific to this alert instance.
   */
  function AlertInstance(contentMsg, initialConfig) {

    // Maintain a self-reference for proper scope within event handlers and callbacks.
    const selfRef = this;
    alertSequenceId++; // Increment for a new unique alert ID.

    // Merge default settings with user-provided configurations.
    // A deep merge ensures nested objects are also properly combined.
    this.currentConfig = jq.extend(true, {
      "headingText": false, // Optional heading for the alert.
      "messageContent": contentMsg, // The main message body.
      "animationDuration": 600, // Speed of display/dismissal animations in milliseconds.
      "displayTimeout": 4500, // Time before auto-dismissal, or false to disable.
      "onDismissCallback": null, // Optional function to call when the alert is dismissed.
      "alertUniqueId": "notifier-" + alertSequenceId // Unique ID for this alert instance.
    }, initialConfig);

    // Basic validation: ensure the message content is a non-empty string.
    if (!this.currentConfig.messageContent || typeof this.currentConfig.messageContent !== 'string') {
        console.warn("Notifier: Alert message content is missing or invalid. Alert will not be displayed.");
        return; // Halt creation if essential content is missing.
    }

    // Construct the HTML element for the alert.
    // Includes a close button, heading (if present), and message content.
    this.alertElement = jq(
      `<div class="notifier-alert-box" style="display:none;" data-alert-id="${this.currentConfig.alertUniqueId}">
         <button type="button" class="notifier-close-button">&times;</button>
         <div class="notifier-body-content">${this.currentConfig.messageContent}</div>
       </div>`
    ); // Renamed classes, added type="button", changed close button content, wrapped message.

    // If a heading is specified, prepend it to the alert's body content.
    if(this.currentConfig.headingText){
      this.alertElement.prepend(`<div class="notifier-header-title">${this.currentConfig.headingText}</div>`); // Renamed class.
    }

    // Prepend the new alert element to the notification tray.
    // New alerts appear at the top of the tray.
    notificationTray.prepend(this.alertElement);

    // Attach event handler for the close button using delegated events.
    // This is more efficient for dynamically added elements.
    this.alertElement.on("click", ".notifier-close-button", function(){
      selfRef.closeAlert(true); // Call dismissal logic, forcing it.
    });

    // Handle hover interactions to prevent auto-dismissal while the user is interacting.
    this.alertElement
      .hover(
        function(){
          jq(this).data("isHovered", true); // Set a data flag when hovered.
        },
        function(){
          jq(this).data("isHovered", false); // Clear the data flag.
          // If an auto-dismissal timeout is configured, re-evaluate dismissal after hover ends.
          if(selfRef.currentConfig.displayTimeout !== false){
            // Use a slight delay before re-evaluating to avoid flickering or accidental dismissals.
            window.setTimeout(() => {
                // Only dismiss if still not hovered after the debounce period.
                if (!selfRef.alertElement.data("isHovered")) {
                    selfRef.closeAlert();
                }
            }, 150); // Small debounce delay.
          }
        }
      )
      // Animate the alert into view using its configured duration.
      .fadeIn(selfRef.currentConfig.animationDuration, function(){
        // Once visible, set up the auto-dismissal timer if configured.
        if(selfRef.currentConfig.displayTimeout !== false){
          // Store the timer reference to allow it to be cleared if needed (e.g., by manual close).
          selfRef.autoDismissalTimer = window.setTimeout(function(){
            selfRef.closeAlert();
          }, selfRef.currentConfig.displayTimeout);
        }
      });

    /**
     * Dismisses the notification alert from the display.
     * @param {boolean} forceDismissal - If true, dismisses the alert even if it's currently hovered.
     */
    this.closeAlert = function(forceDismissal){

      // Only dismiss if the alert is not hovered, or if dismissal is explicitly forced.
      if(!this.alertElement.data("isHovered") || forceDismissal){

        // Clear any pending auto-dismissal timer to prevent double-dismissal.
        if (selfRef.autoDismissalTimer) {
            clearTimeout(selfRef.autoDismissalTimer);
            selfRef.autoDismissalTimer = null; // Clear reference.
        }

        // Animate the alert out of view using multiple CSS properties for a smoother effect.
        this.alertElement.animate({
            opacity: "0.0",
            height: "0px",
            paddingTop: "0px",
            paddingBottom: "0px",
            marginTop: "0px",
            marginBottom: "0px"
        }, selfRef.currentConfig.animationDuration, function(){
          // After the animation completes, remove the element entirely from the DOM.
          jq(this).remove();
          // Execute the optional callback function if provided.
          if (typeof selfRef.currentConfig.onDismissCallback === 'function') {
              selfRef.currentConfig.onDismissCallback(selfRef.currentConfig.alertUniqueId);
          }
        });
      }
    };
  }

})(jQuery);