(function(jq) {
  jq(document).ready(function() {

    // Define constants for various notification permission states.
    // These reflect the integer values returned by the legacy webkitNotifications API.
    const PERMISSION_STATE_GRANTED = 0; // User has explicitly granted permission.
    const PERMISSION_STATE_DENIED = 2;  // User has explicitly blocked permission.
    // Note: State 1 (prompt) is typically not returned by checkPermission, but by requestPermission.

    /**
     * Modifies the 'disabled' property of input elements within a given jQuery container.
     * This ensures correct boolean handling for form controls.
     * @param {jQuery} containerElementSelector - A jQuery object representing the parent element.
     * @param {boolean} disableInputs - Set to true to disable, false to enable.
     */
    const adjustContainerInputStatus = (containerElementSelector, disableInputs) => {
      const targetInputs = containerElementSelector.find(':input');
      if (targetInputs.length > 0) {
        targetInputs.prop('disabled', disableInputs);
      } else {
        console.debug("No input elements found in the specified container for status adjustment.");
      }
    };

    /**
     * Activates a UI segment, making it visually and functionally available.
     * This includes changing its class and enabling its contained input elements.
     * @param {jQuery} segmentHandle - The jQuery object for the UI segment.
     */
    function bringSegmentOnline(segmentHandle) {
      if (!segmentHandle || segmentHandle.length === 0) {
        console.warn("Attempted to bring a non-existent segment online.");
        return;
      }
      segmentHandle.removeClass('inactive_ui_element').addClass('active_ui_element');
      adjustContainerInputStatus(segmentHandle, false); // Enable inputs.
    }

    /**
     * Deactivates a UI segment, making it visually and functionally unavailable.
     * This includes changing its class and disabling its contained input elements.
     * @param {jQuery} segmentHandle - The jQuery object for the UI segment.
     */
    function takeSegmentOffline(segmentHandle) {
      if (!segmentHandle || segmentHandle.length === 0) {
        console.warn("Attempted to take a non-existent segment offline.");
        return;
      }
      segmentHandle.removeClass('active_ui_element').addClass('inactive_ui_element');
      adjustContainerInputStatus(segmentHandle, true); // Disable inputs.
    }

    /**
     * Provides standardized event handlers for notification lifecycle events (display and close).
     * @param {string} eventCategory - A descriptive string for logging (e.g., 'Basic', 'Rich HTML').
     * @returns {object} An object containing `onNotificationShow` and `onNotificationHide` functions.
     */
    const generateNotificationEventCallbacks = (eventCategory) => {
      return {
        onNotificationShow: function() {
          console.log(`[Notification ${eventCategory}] Notification became visible at ${new Date().toLocaleTimeString()}.`);
          // Original code updated a debug div; for Type III, we're simplifying to console logs.
        },
        onNotificationHide: function() {
          console.log(`[Notification ${eventCategory}] Notification was dismissed or closed at ${new Date().toLocaleTimeString()}.`);
          // Original code updated a debug div; for Type III, we're simplifying to console logs.
        }
      };
    };

    /**
     * Assesses the current notification permission status from the browser API
     * and updates the user interface elements accordingly. This function is also
     * used as a callback after a permission request.
     */
    const updateInterfaceBasedOnPermission = () => {
      const nativeNotificationHandler = window.webkitNotifications;

      // Guard clause: Ensure the API and its methods are available.
      if (!nativeNotificationHandler || typeof nativeNotificationHandler.checkPermission !== 'function') {
        console.error("Browser's legacy notification API is not fully supported or available.");
        jq("#apiUnavailableDisplay").fadeIn();
        return;
      }

      const permissionResult = nativeNotificationHandler.checkPermission();
      const permissionRequiredUI = jq('.permissionRequestDependentArea');
      const apiSupportUI = jq('.apiAvailabilitySection');
      const blockedMessageDisplay = jq('#permissionBlockedIndicator');

      if (permissionResult === PERMISSION_STATE_GRANTED) {
        // Permission is granted: enable features that require it.
        bringSegmentOnline(permissionRequiredUI);
        takeSegmentOffline(apiSupportUI); // Logical inversion/change from original: only show support if not granted
        blockedMessageDisplay.hide(); // Hide any prior 'blocked' message.
        console.info("Notification permission is granted. User can send notifications.");
      } else if (permissionResult === PERMISSION_STATE_DENIED) {
        // Permission is denied: show a message and disable related features.
        takeSegmentOffline(permissionRequiredUI);
        takeSegmentOffline(apiSupportUI);
        blockedMessageDisplay.fadeIn();
        console.warn("Notification permission is denied by the user.");
      } else {
        // Any other state (e.g., 'default' or 'prompt'): assume not granted and disable.
        console.warn(`Notification permission state is ambiguous or not granted: ${permissionResult}. Disabling related features.`);
        takeSegmentOffline(permissionRequiredUI);
        blockedMessageDisplay.hide(); // Ensure hidden if it was shown for denied
      }
    };

    // Initial setup: Disable all form controls across the page.
    // This provides a clean slate before feature detection and permission checks.
    jq(':input').prop('disabled', true);

    // Feature detection for the legacy WebKit notification API.
    const legacyNotificationAPI = window.webkitNotifications;
    const isAPIPresent = (legacyNotificationAPI && typeof legacyNotificationAPI.createNotification === 'function');

    if (isAPIPresent) {
      // If the API is present, enable the sections that rely on its existence.
      bringSegmentOnline(jq('.apiAvailabilitySection'));
      // Then proceed to check the specific permission status.
      updateInterfaceBasedOnPermission();
    } else {
      // If the API is not detected, display an unsupported message and disable all related UI.
      jq("#apiUnavailableDisplay").fadeIn();
      takeSegmentOffline(jq('.permissionRequestDependentArea'));
      takeSegmentOffline(jq('.apiAvailabilitySection'));
      console.error("WebKit Notifications API is not supported in this browser environment.");
    }

    // Event handler for the button that prompts the user for notification permission.
    jq('#requestPermissionButton').on('click', function(interactionEvent) {
      interactionEvent.preventDefault(); // Prevent any default browser action.

      // Pre-check: Ensure the API exists before attempting to request permission.
      if (!legacyNotificationAPI || typeof legacyNotificationAPI.requestPermission !== 'function') {
        console.error("Cannot request permission: Notification API is unavailable or missing requestPermission method.");
        jq("#apiUnavailableDisplay").fadeIn(); // Display unsupported message.
        return;
      }

      // Execute the permission request, using our status updater as the callback.
      legacyNotificationAPI.requestPermission(updateInterfaceBasedOnPermission);
      console.log("Permission request initiated.");
    });

    /**
     * Performs basic validation on content intended for a basic text notification.
     * @param {object} contentPayload - An object containing `title`, `message`, and optionally `icon`.
     * @returns {boolean} True if content is deemed valid, false otherwise.
     */
    const validateBasicNotificationContent = (contentPayload) => {
      if (!contentPayload.title || contentPayload.title.trim().length < 3) { // Minimum length added
        console.error("Validation Error: Notification title is too short or empty.");
        return false;
      }
      if (!contentPayload.message || contentPayload.message.trim() === '') {
        console.error("Validation Error: Notification message cannot be empty.");
        return false;
      }
      // Optional: Basic URL format check for icon.
      if (contentPayload.icon && !/^https?:\/\//i.test(contentPayload.icon)) {
        console.warn("Validation Warning: Icon path might not be a valid absolute URL.");
        // This is a warning, not a blocker, as the API might handle relative paths.
      }
      return true;
    };

    /**
     * Orchestrates the creation and display of a notification (either basic text or HTML).
     * @param {string} notificationKind - Specifies 'text' for basic or 'markup' for HTML.
     * @param {object} notificationOptions - Options specific to the notification type.
     */
    const triggerNotificationDisplay = (notificationKind, notificationOptions) => {
      if (!legacyNotificationAPI) {
        console.error("Cannot trigger notification: API is not present.");
        jq("#apiUnavailableDisplay").fadeIn();
        return;
      }

      let currentNotificationInstance;
      const { onNotificationShow, onNotificationHide } = generateNotificationEventCallbacks(
        notificationKind === 'text' ? 'Basic Text' : 'Rich HTML'
      );

      try {
        if (notificationKind === 'text') {
          if (!validateBasicNotificationContent(notificationOptions)) {
            return; // Halt if basic content validation fails.
          }
          currentNotificationInstance = legacyNotificationAPI.createNotification(
            notificationOptions.iconPath,
            notificationOptions.primaryTitle,
            notificationOptions.bodyMessage
          );
        } else if (notificationKind === 'markup') {
          if (!notificationOptions.contentFileUrl || notificationOptions.contentFileUrl.trim() === '') {
            console.error("Validation Error: HTML notification content URL cannot be empty.");
            return;
          }
          // Simple URL format validation for HTML content file.
          if (!/^https?:\/\//i.test(notificationOptions.contentFileUrl)) {
            console.warn("Validation Warning: HTML content URL might not be a valid absolute URL.");
            // This is a warning, not a blocker.
          }
          currentNotificationInstance = legacyNotificationAPI.createHTMLNotification(notificationOptions.contentFileUrl);
        } else {
          console.error(`Attempted to create an unknown notification kind: ${notificationKind}.`);
          return;
        }

        if (currentNotificationInstance) {
          currentNotificationInstance.ondisplay = onNotificationShow;
          currentNotificationInstance.onclose = onNotificationHide;
          currentNotificationInstance.show();
          console.log(`Successfully requested display of a ${notificationKind} notification.`);
        } else {
          console.error(`Failed to instantiate a ${notificationKind} notification object.`);
        }
      } catch (exceptionDetails) {
        console.error(`An exception occurred during ${notificationKind} notification creation/display:`, exceptionDetails);
      }
    };

    // Event listener for the basic text notification submission form.
    jq('#basicNotificationSubmission').on('submit', function(submissionEvent) {
      submissionEvent.preventDefault(); // Prevent page reload.

      const iconSource = jq('#basicNotificationIcon').val();
      const notificationHead = jq('#basicNotificationTitle').val();
      const notificationBody = jq('#basicNotificationMessage').val();

      triggerNotificationDisplay('text', {
        iconPath: iconSource,
        primaryTitle: notificationHead,
        bodyMessage: notificationBody
      });
    });

    // Event listener for the rich HTML notification submission form.
    jq('#richNotificationSubmission').on('submit', function(submissionEvent) {
      submissionEvent.preventDefault(); // Prevent page reload.

      const htmlContentUrl = jq('#richContentUrl').val();

      triggerNotificationDisplay('markup', {
        contentFileUrl: htmlContentUrl
      });
    });

  });
})(jQuery);