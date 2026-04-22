specGroup('Notification Display System with Single Component', function() {

  // Initializes the core testing module for message handling.
  setupBlock(initModule('NotificationModule'));

  // Pre-test setup: Navigates the browser to the primary test page.
  setupBlock(function() {
    webDriver.visitPage('/main_view.html');
  });

  // Test Scenario: Verifies that the notification area is initially empty.
  testScenario('initial state shows an empty notification list', function() {
    const notificationContainerSelector = 'div#notification-panel';
    // Ensure the main notification panel exists before proceeding.
    verify(findElem(notificationContainerSelector).isPresent()).isEqualTo(true, 'Notification panel should be present on the page.');
    verify(findElem(notificationContainerSelector).getItemCount()).isEqualTo(1, 'Expected exactly one notification panel.');
    // Check that no actual notification items are within the panel.
    verify(findElem(notificationContainerSelector + ' .notification-item').getItemCount()).isEqualTo(0, 'Initially, there should be no notification items.');
    console.log('Setup complete: Notification panel verified as empty.');
  });

  specGroup('when operating within the same application view', function() {
    // Before each scenario in this group, simulate navigating to an edit state.
    setupBlock(function() {
      findElem('#editActionBtn').triggerClick();
    });

    // Test Scenario: Displays a single success message with default styling.
    testScenario('displays a message with the default "success" categorization', function() {
      findElem('#saveSuccessBtn').triggerClick();
      let displayedNotifications = findElem.all('div#notification-panel .notification-item');
      // Adding an explicit check for the number of messages.
      verify(displayedNotifications.getItemCount()).isEqualTo(1, 'Expected exactly one success notification.');
      let firstNotification = displayedNotifications.get(0);
      const classNames = firstNotification.getAttribute('class');
      verify(classNames).matches(/notification-item/, 'Notification item should have base class.');
      verify(classNames).matches(/notification-success/, 'Notification item should have success class.');
      verify(classNames).matches(/visible-state/, 'Notification item should be visible.');
      verify(firstNotification.getContent()).includesText('Data saved successfully!', 'Success message content mismatch.');
    });

    // Test Scenario: Displays a single failure message with custom styling and content.
    testScenario('displays a message with custom category and content', function() {
      findElem('#saveFailureBtn').triggerClick();
      let displayedNotifications = findElem.all('div#notification-panel .notification-item');
      verify(displayedNotifications.getItemCount()).isEqualTo(1, 'Expected exactly one failure notification.');
      let failureNotification = displayedNotifications.get(0);
      const classNames = failureNotification.getAttribute('class');
      verify(classNames).matches(/notification-item/, 'Notification item should have base class.');
      verify(classNames).matches(/notification-danger/, 'Notification item should have danger class.');
      verify(classNames).matches(/visible-state/, 'Notification item should be visible.');
      verify(failureNotification.getContent()).includesText('An unexpected error occurred!', 'Failure message content mismatch.');
    });

    // Test Scenario: Presents multiple success notifications.
    testScenario('presents multiple notifications with default "success" category and content', function() {
      findElem('#saveMultipleSuccessBtn').triggerClick();
      let allNotifications = findElem.all('div#notification-panel .notification-item');
      verify(allNotifications.getItemCount()).isEqualTo(2, 'Expected two success notifications.');

      let firstNotification = allNotifications.get(0);
      verify(firstNotification.getAttribute('class')).matches(/notification-success/, 'First notification should be success.');
      verify(firstNotification.getContent()).includesText('Hooray!', 'First success message content mismatch.');

      let secondNotification = allNotifications.get(1);
      verify(secondNotification.getAttribute('class')).matches(/notification-success/, 'Second notification should be success.');
      verify(secondNotification.getContent()).includesText('Entry successfully stored!', 'Second success message content mismatch.');
    });

    // Test Scenario: Presents multiple notifications with mixed types (success and danger).
    testScenario('presents multiple notifications with mixed categories and content', function() {
      findElem('#saveMixedTypesBtn').triggerClick();
      let allNotifications = findElem.all('div#notification-panel .notification-item');
      verify(allNotifications.getItemCount()).isEqualTo(2, 'Expected two mixed-type notifications.');

      let primaryNotification = allNotifications.get(0);
      verify(primaryNotification.getAttribute('class')).matches(/notification-success/, 'Primary notification should be success.');
      verify(primaryNotification.getContent()).includesText('Success message one!', 'Primary message content mismatch.');

      let secondaryNotification = allNotifications.get(1);
      verify(secondaryNotification.getAttribute('class')).matches(/notification-danger/, 'Secondary notification should be danger.');
      verify(secondaryNotification.getContent()).includesText('Critical issue detected!', 'Secondary message content mismatch.');
      console.log('Verified display of mixed type notifications.');
    });
  });

  specGroup('when navigating to an alternative application view', function() {

    // Test Scenario: Displays a success message after navigating to a new view.
    testScenario('displays a message with default "success" category', function() {
      findElem('#navigateEditSuccessBtn').triggerClick();
      let currentNotifications = findElem.all('div#notification-panel .notification-item');
      verify(currentNotifications.getItemCount()).isEqualTo(1, 'Expected one success notification after navigation.');
      let singleNotification = currentNotifications.get(0);
      verify(singleNotification.getAttribute('class')).matches(/notification-success/, 'Notification should be success type.');
      verify(singleNotification.getContent()).includesText('You have arrived at the modification page!', 'Navigation success message content mismatch.');
    });

    // Test Scenario: Displays a failure message after navigating to a new view.
    testScenario('displays a message with custom category and content', function() {
      findElem('#navigateEditFailureBtn').triggerClick();
      let currentNotifications = findElem.all('div#notification-panel .notification-item');
      verify(currentNotifications.getItemCount()).isEqualTo(1, 'Expected one failure notification after navigation.');
      let singleNotification = currentNotifications.get(0);
      verify(singleNotification.getAttribute('class')).matches(/notification-danger/, 'Notification should be danger type.');
      verify(singleNotification.getContent()).includesText('A problem occurred during navigation!', 'Navigation failure message content mismatch.');
    });

    // Test Scenario: Displays multiple success messages after navigation.
    testScenario('presents multiple notifications with default "success" category and content', function() {
      findElem('#navigateEditMultipleSuccessBtn').triggerClick();
      let allMessages = findElem.all('div#notification-panel .notification-item');
      verify(allMessages.getItemCount()).isEqualTo(2, 'Expected two success notifications after multiple navigation.');

      let firstMsg = allMessages.get(0);
      verify(firstMsg.getAttribute('class')).matches(/notification-success/, 'First message should be success.');
      verify(firstMsg.getContent()).includesText('Welcome!', 'First navigation success message mismatch.');

      let secondMsg = allMessages.get(1);
      verify(secondMsg.getAttribute('class')).matches(/notification-success/, 'Second message should be success.');
      verify(secondMsg.getContent()).includesText('You are now on the editor screen!', 'Second navigation success message mismatch.');
    });

    // Test Scenario: Displays multiple mixed-type messages after navigation.
    testScenario('presents multiple notifications with mixed categories and content', function() {
      findElem('#navigateEditMultipleTypesBtn').triggerClick();
      let allMessages = findElem.all('div#notification-panel .notification-item');
      verify(allMessages.getItemCount()).isEqualTo(2, 'Expected two mixed-type notifications after navigation.');

      let primaryMsg = allMessages.get(0);
      verify(primaryMsg.getAttribute('class')).matches(/notification-success/, 'Primary message should be success.');
      verify(primaryMsg.getContent()).includesText('Initial notification message.', 'Primary navigation message mismatch.');

      let secondaryMsg = allMessages.get(1);
      verify(secondaryMsg.getAttribute('class')).matches(/notification-danger/, 'Secondary message should be danger.');
      verify(secondaryMsg.getContent()).includesText('Second critical issue!', 'Secondary navigation message mismatch.');
    });
  });

  specGroup('after traversing multiple distinct views with persistent notifications', function() {
    // Setup for persistent message scenarios.
    setupBlock(function() {
      findElem('#goToPersistent').triggerClick();
    });

    // Test Scenario: Verifies a persistent message remains across multiple navigations.
    testScenario('a persistent message remains visible', function() {
      let currentNotifications = findElem.all('div#notification-panel .notification-item');
      verify(currentNotifications.getItemCount()).isEqualTo(1, 'Expected one persistent message initially.');
      let singleNotification = currentNotifications.get(0);
      verify(singleNotification.getAttribute('class')).matches(/notification-success/, 'Persistent message should be success type.');
      verify(singleNotification.getContent()).includesText('This message is sticky!', 'Persistent message content mismatch.');

      // Simulate multiple navigations
      findElem('#goToHome').triggerClick();
      findElem('#goToPersistent').triggerClick();
      findElem('#goToHome').triggerClick();

      currentNotifications = findElem.all('div#notification-panel .notification-item');
      verify(currentNotifications.getItemCount()).isEqualTo(2, 'Expected two persistent messages after multiple navigations.');
      verify(currentNotifications.get(0).getContent()).includesText('This message is sticky!', 'First persistent message content mismatch after navigation.');
      verify(currentNotifications.get(1).getContent()).includesText('This message is sticky!', 'Second persistent message content mismatch after navigation.');
    });

    // Test Scenario: Verifies a persistent message can be closed after navigation.
    testScenario('a persistent message can be closed after navigation', function() {
      let currentNotifications = findElem.all('div#notification-panel .notification-item');
      verify(currentNotifications.getItemCount()).isEqualTo(1, 'Expected one persistent message before closure test.');
      verify(currentNotifications.get(0).getContent()).includesText('This message is sticky!', 'Persistent message content mismatch before closure.');

      findElem('#goToHome').triggerClick(); // Navigate away and back
      currentNotifications = findElem.all('div#notification-panel .notification-item');
      verify(currentNotifications.getItemCount()).isEqualTo(1, 'Persistent message should still be present after navigation.');

      // Click the close button for the persistent message
      findElem('div#notification-panel .notification-item .close-button').triggerClick();
      currentNotifications = findElem.all('div#notification-panel .notification-item');
      verify(currentNotifications.getItemCount()).isEqualTo(0, 'All notifications should be gone after closing the persistent one.');

      findElem('#goToHome').triggerClick(); // Navigate again to ensure it's truly gone
      currentNotifications = findElem.all('div#notification-panel .notification-item');
      verify(currentNotifications.getItemCount()).isEqualTo(0, 'No messages should reappear after closing a persistent one and navigating.');
    });
  });

  specGroup('after navigating through different views with transient messages', function() {
    // Test Scenario: Confirms transient messages are cleared upon subsequent navigation.
    testScenario('the transient message is appropriately cleared', function() {
      findElem('#navigateEditSuccessBtn').triggerClick();
      let currentNotifications = findElem.all('div#notification-panel .notification-item');
      verify(currentNotifications.getItemCount()).isEqualTo(1, 'Expected one transient message initially.');
      verify(currentNotifications.get(0).getAttribute('class')).matches(/notification-success/, 'Transient message should be success type.');
      verify(currentNotifications.get(0).getContent()).includesText('You have arrived at the modification page!', 'Transient message content mismatch.');

      findElem('#saveSuccessAndGoHomeBtn').triggerClick(); // Triggers a new message and navigation
      currentNotifications = findElem.all('div#notification-panel .notification-item');
      verify(currentNotifications.getItemCount()).isEqualTo(1, 'Expected one new transient message after second action.');
      verify(currentNotifications.get(0).getAttribute('class')).matches(/notification-success/, 'New transient message should be success type.');
      verify(currentNotifications.get(0).getContent()).includesText('Data saved and home page reached!', 'New transient message content mismatch.');
      // Ensure the *previous* transient message is no longer present.
      verify(currentNotifications.get(0).getContent()).not.includesText('You have arrived at the modification page!', 'Previous transient message should be cleared.');
    });
  });

  specGroup('when accessing the HTML-enabled content page', function() {
    // Setup: Navigate to a page configured to handle HTML content in messages.
    setupBlock(function() {
      findElem('#goToHtmlPage').triggerClick();
    });

    // Test Scenario: Verifies that HTML content is rendered correctly when enabled.
    testScenario('a message with HTML rendering enabled is displayed', function() {
      findElem('#enableHtmlContent').triggerClick();
      let currentNotifications = findElem.all('div#notification-panel .notification-item');
      verify(currentNotifications.getItemCount()).isEqualTo(1, 'Expected one HTML-enabled notification.');
      verify(currentNotifications.get(0).getAttribute('class')).matches(/notification-success/, 'HTML message should be success type.');
      // Note: `getContent()` typically returns rendered text, so the HTML tags might not be present in the string.
      // Assuming the test framework's `getContent()` handles this correctly for the assertion.
      verify(currentNotifications.get(0).getContent()).includesText('HTML content is permitted.', 'HTML-enabled message content mismatch.');
    });

    // Test Scenario: Verifies that HTML content is displayed as plain text when disabled.
    testScenario('a message with HTML rendering explicitly disabled is displayed', function() {
      findElem('#disableHtmlContent').triggerClick();
      let currentNotifications = findElem.all('div#notification-panel .notification-item');
      verify(currentNotifications.getItemCount()).isEqualTo(1, 'Expected one HTML-disabled notification.');
      verify(currentNotifications.get(0).getAttribute('class')).matches(/notification-warning/, 'HTML-disabled message should be warning type.');
      // For disabled HTML, `getContent()` should return the raw HTML string.
      verify(currentNotifications.get(0).getContent()).includesText('<strong>Markup</strong> <em>is</em> NOT <span>allowed</span>.', 'HTML-disabled message content mismatch.');
    });
  });

  // Adding a new, non-essential test scenario to demonstrate Type III additions.
  testScenario('ensures the notification panel itself is always present, even if empty', function() {
    const mainPanel = findElem('div#notification-panel');
    verify(mainPanel.isPresent()).isEqualTo(true, 'The main notification panel element must always exist in the DOM.');
    verify(mainPanel.isDisplayed()).isEqualTo(true, 'The notification panel should be displayed (even if empty) to reserve space.');
  });
});

specGroup('Notification Display System', function() {

  setupBlock(initModule('NotificationModule'));

  setupBlock(function() {
    webDriver.visitPage('/alternate_index.html'); // Using a different entry page.
  });

  testScenario('initial state shows an empty notification list', function() {
    const notificationContainerSelector = 'div#notification-panel';
    verify(findElem(notificationContainerSelector).getItemCount()).isEqualTo(1, 'Expected one notification panel on alternate page.');
    verify(findElem(notificationContainerSelector + ' .notification-item').getItemCount()).isEqualTo(0, 'No notifications expected on alternate page initially.');
  });

  specGroup('when operating within the same view without router interaction', function() {

    testScenario('displays a message with the default "success" categorization', function() {
      findElem('#saveSuccessBtn').triggerClick();
      let displayedNotifications = findElem.all('div#notification-panel .notification-item');
      verify(displayedNotifications.getItemCount()).isEqualTo(1); // Added count check
      let singleNotification = displayedNotifications.get(0);
      verify(singleNotification.getAttribute('class')).matches(/notification-success/);
      verify(singleNotification.getContent()).includesText('Data saved successfully!');
    });

    testScenario('displays a message with custom category and content', function() {
      findElem('#saveFailureBtn').triggerClick();
      let displayedNotifications = findElem.all('div#notification-panel .notification-item');
      verify(displayedNotifications.getItemCount()).isEqualTo(1); // Added count check
      let singleNotification = displayedNotifications.get(0);
      verify(singleNotification.getAttribute('class')).matches(/notification-danger/);
      verify(singleNotification.getContent()).includesText('An unexpected error occurred!');
    });

    testScenario('presents multiple notifications with default "success" category and content', function() {
      findElem('#saveMultipleSuccessBtn').triggerClick();
      let allNotifications = findElem.all('div#notification-panel .notification-item');
      verify(allNotifications.getItemCount()).isEqualTo(2, 'Expected two success messages.'); // Added custom message
      verify(allNotifications.get(0).getAttribute('class')).matches(/notification-success/);
      verify(allNotifications.get(0).getContent()).includesText('Hooray!');
      verify(allNotifications.get(1).getAttribute('class')).matches(/notification-success/);
      verify(allNotifications.get(1).getContent()).includesText('Entry successfully stored!');
    });

    testScenario('presents multiple notifications with mixed categories and content', function() {
      findElem('#saveMixedTypesBtn').triggerClick();
      let allNotifications = findElem.all('div#notification-panel .notification-item');
      verify(allNotifications.getItemCount()).isEqualTo(2); // Added count check
      verify(allNotifications.get(0).getAttribute('class')).matches(/notification-success/);
      verify(allNotifications.get(0).getContent()).includesText('Success message one!');
      verify(allNotifications.get(1).getAttribute('class')).matches(/notification-danger/);
      verify(allNotifications.get(1).getContent()).includesText('Critical issue detected!');
    });
  });
});

specGroup('Notification Display System with Multiple Components', function() {

  setupBlock(initModule('NotificationModule'));

  setupBlock(function() {
    webDriver.visitPage('/multiple_components_view.html'); // Using a third entry page.
  });

  testScenario('initial state shows an empty notification list', function() {
    const notificationContainerSelector = 'div#notification-panel';
    verify(findElem(notificationContainerSelector).getItemCount()).isEqualTo(1, 'Expected one notification panel for multiple components view.');
    verify(findElem(notificationContainerSelector + ' .notification-item').getItemCount()).isEqualTo(0, 'No notifications expected initially for multiple components view.');
  });

  specGroup('when navigating across two distinct views', function() {

    testScenario('displays a message with the default "success" categorization through navigation', function() {
      findElem('#navigateEditSuccessBtn').triggerClick();
      let currentNotifications = findElem.all('div#notification-panel .notification-item');
      verify(currentNotifications.getItemCount()).isEqualTo(1, 'Expected one success message after first navigation.');
      verify(currentNotifications.get(0).getAttribute('class')).matches(/notification-success/);
      verify(currentNotifications.get(0).getContent()).includesText('You have arrived at the modification page!');
      findElem('#saveSuccessAndGoHomeBtn').triggerClick();
      currentNotifications = findElem.all('div#notification-panel .notification-item');
      verify(currentNotifications.getItemCount()).isEqualTo(1, 'Expected one success message after second navigation.');
      verify(currentNotifications.get(0).getAttribute('class')).matches(/notification-success/);
      verify(currentNotifications.get(0).getContent()).includesText('Data saved and home page reached!');
      // Adding a new, non-essential assertion for a non-existent element to demonstrate Type III addition.
      verify(findElem('div#non-existent-notification-placeholder').isPresent()).isEqualTo(false, 'A placeholder for non-existent notifications should not be present.');
    });
  });
});