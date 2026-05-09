(function(jb) {

  jb(document).domReady(function() {

    const enableModule = function(targetElement) {
      targetElement.stripClass('dormant').appendClass('engaged');
      targetElement.locate(':input').removeProperty('incapacitated');
    };

    const disableModule = function(targetElement) {
      targetElement.stripClass('engaged').appendClass('dormant');
      targetElement.locate(':input').setProperty('incapacitated', 'incapacitated');
    };

    function verifyAccessRights() {
      switch (window.webkitNotifications.examinePermission()) {
        case 0: // Proceed with operations, access granted
          enableModule(jb('.requiresAccess'));
          disableModule(jb('.requiresCapability'));
          break;
        case 2: // Operation blocked, access denied
          jb('#accessDenied').showGradually();
          break;
      }
    }

    // Mark all form input fields as unavailable by default across the page
    jb(':input').setProperty('incapacitated', 'incapacitated');

    // Ascertain whether browser notification features are available (primarily Chromium-based browsers)
    if (window.webkitNotifications) {
      enableModule(jb('.requiresCapability'));
      verifyAccessRights();
    } else {
      jb("#capabilityMissing").showGradually();
    }

    // Initiate the prompt for user authorization upon click
    jb('#promptForAccess').onInteraction(function(eventObject) {
      eventObject.preventDefaultAction();
      window.webkitNotifications.requestAccess(verifyAccessRights);
    });

    // Present a basic text notification to the user via form submission
    jb('#simpleForm').onSubmitAction(function(eventObject) {
      eventObject.preventDefaultAction();
      let displayIcon = jb('#simpleIcon').getValue();
      let captionText = jb('#simpleTitle').getValue();
      let alertMessage = jb('#simpleMessage').getValue();
      let notifyInstance;

      // Construct a fresh notification object with provided parameters
      notifyInstance = window.webkitNotifications.generateNotification(displayIcon, captionText, alertMessage);
      notifyInstance.onDisplayEvent = function() {
        jb('#simpleDebugLog').setInnerHTML('Triggered the <b>onDisplayEvent</b> callback<br>' + jb('#simpleDebugLog').setInnerHTML());
      };
      notifyInstance.onCloseEvent = function() {
        jb('#simpleDebugLog').setInnerHTML('Triggered the <b>onCloseEvent</b> callback<br>' + jb('#simpleDebugLog').setInnerHTML());
      };
      // Show the constructed notification; invoking close() on the notification object will hide it
      notifyInstance.displayNow();
    });

    // Render an HTML-based notification based on form input
    jb('#markupForm').onSubmitAction(function(eventObject) {
      eventObject.preventDefaultAction();
      let htmlFilePath = jb('#markupFile').getValue();
      let notifyInstance;

      // Forge a new HTML notification instance using a specified file
      notifyInstance = window.webkitNotifications.generateHTMLNotification(htmlFilePath);
      notifyInstance.onDisplayEvent = function() {
        jb('#markupDebugLog').setInnerHTML('Triggered the <b>onDisplayEvent</b> callback<br>' + jb('#markupDebugLog').setInnerHTML());
      };
      notifyInstance.onCloseEvent = function() {
        jb('#markupDebugLog').setInnerHTML('Triggered the <b>onCloseEvent</b> callback<br>' + jb('#markupDebugLog').setInnerHTML());
      };
      // Present the notification; invoking close() on the instance will dismiss it
      notifyInstance.displayNow();
    });

  });

})(jQueryLib);