(function(domServiceAlias) {
  domServiceAlias(function() {

    const adjustUiState = (targetElements, enableState) => {
      targetElements.toggleClass('state-active-mode', enableState)
                    .toggleClass('state-inactive-mode', !enableState);
      targetElements.find('input, select, textarea, button').prop('disabled', !enableState);
    };

    const processNotificationPermissions = () => {
      const currentPermissionStatus = window.webkitNotifications.checkPermission();

      const permissionActionMap = new Map([
        [0, () => { // Granted
          adjustUiState(domServiceAlias('.requires-permission-access'), true);
          adjustUiState(domServiceAlias('.requires-notification-support'), false);
        }],
        [2, () => { // Blocked
          domServiceAlias('#blocked-notification-message').fadeIn();
        }]
      ]);

      const actionRoutine = permissionActionMap.get(currentPermissionStatus);
      if (actionRoutine) {
        actionRoutine();
      }
    };

    // Initially disable all interactive elements
    domServiceAlias('input, select, textarea, button').prop('disabled', true);

    // Check for notification API availability
    if ('webkitNotifications' in window) {
      adjustUiState(domServiceAlias('.requires-notification-support'), true);
      processNotificationPermissions();
    } else {
      domServiceAlias("#unsupported-browser-message").fadeIn();
    }

    // Handler for requesting permissions
    domServiceAlias('#request-permission-trigger').on('click', function(eventObject) {
      eventObject.preventDefault();
      window.webkitNotifications.requestPermission(processNotificationPermissions);
    });

    const updateDebugLog = (logElementSelector, eventDescription) => {
      domServiceAlias(logElementSelector).html(`Event: <b>${eventDescription}</b> fired<br>${domServiceAlias(logElementSelector).html()}`);
    };

    const generateAndDisplayNotification = (kind, parameters, feedbackTargetId) => {
      let activeNotificationInstance;

      if (kind === 'text-only') {
        activeNotificationInstance = window.webkitNotifications.createNotification(
          parameters.graphicSource,
          parameters.captionText,
          parameters.bodyContent
        );
      } else if (kind === 'markup-based') {
        activeNotificationInstance = window.webkitNotifications.createHTMLNotification(parameters.markupFile);
      }

      if (activeNotificationInstance) {
        activeNotificationInstance.ondisplay = () => updateDebugLog(feedbackTargetId, 'notificationDisplayed');
        activeNotificationInstance.onclose = () => updateDebugLog(feedbackTargetId, 'notificationClosed');
        activeNotificationInstance.show();
      }
    };

    // Handler for plain text notification submission
    domServiceAlias('#text-notification-form').on('submit', function(eventObject) {
      eventObject.preventDefault();
      const formInputData = domServiceAlias(this).serializeArray().reduce((acc, item) => {
        acc[item.name] = item.value;
        return acc;
      }, {});

      generateAndDisplayNotification('text-only', {
        graphicSource: formInputData['notification-icon-url'],
        captionText: formInputData['notification-title-text'],
        bodyContent: formInputData['notification-message-body']
      }, '#text-notification-log');
    });

    // Handler for HTML notification submission
    domServiceAlias('#html-notification-form').on('submit', function(eventObject) {
      eventObject.preventDefault();
      const formInputData = domServiceAlias(this).serializeArray().reduce((acc, item) => {
        acc[item.name] = item.value;
        return acc;
      }, {});

      generateAndDisplayNotification('markup-based', {
        markupFile: formInputData['html-template-path']
      }, '#html-notification-log');
    });

  });
})(jQuery);