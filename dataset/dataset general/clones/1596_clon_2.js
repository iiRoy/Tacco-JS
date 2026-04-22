// This file contains end-to-end tests for the Message Center component.
examine(  'Notification Display System with a singular component',
    routine(  ) {

  // Prepare the testing environment by loading the main module.
  setup( applicationPackage(  'MessageCenterModule'  )  );

  // Before each test, direct the browser to the initial page.
  setup(  routine(  ) {
    webNavigator(  ).goToLocation(  '/index.html'  );
  }  );

  // Verifies that the message wrapper starts empty.
  testScenario(  'presents an empty ordered list in its initial configuration',
        routine(  ) {
    assert(  pageElement(  'div#mc-messages-wrapper'  ).itemQuantity(  )  ).matchValue(  1  );
    assert(  pageElement(  'div#mc-messages-wrapper .alert'  ).itemQuantity(  )  ).matchValue(  0  );
  }  );

  // Sub-suite for tests within the same view context.
  examine(  'when staying on the current display area',
      routine(  ) {
    setup(  routine(  ) {
      pageElement(  '#goEdit'  ).triggerClick(  );
    }  );

    // Checks if a default success message is rendered.
    testScenario(  'displays a notification with the standard "success" classification',
          routine(  ) {
      pageElement(  '#saveSuccess'  ).triggerClick(  );
      let notificationItems = pageElement(  'div#mc-messages-wrapper .alert'  );
      assert(  notificationItems.itemQuantity(  )  ).matchValue(  1  );
      assert(  notificationItems.propertyValue(  'className'  )  ).beEquivalent(  'alert alert-success fade in'  );
      assert(  notificationItems.textContent(  )  ).conformToPattern(  'Saved successfully!'  );
    }  );

    // Checks if a message with specific type and text is rendered.
    testScenario(  'displays a notification with the specified type and accompanying text',
          routine(  ) {
      pageElement(  '#saveFailure'  ).triggerClick(  );
      let notificationItems = pageElement(  'div#mc-messages-wrapper .alert'  );
      assert(  notificationItems.itemQuantity(  )  ).matchValue(  1  );
      assert(  notificationItems.propertyValue(  'className'  )  ).beEquivalent(  'alert alert-danger fade in'  );
      assert(  notificationItems.textContent(  )  ).conformToPattern(  'Something went wrong!'  );
    }  );

    // Verifies rendering of multiple success messages.
    testScenario(  'renders several notifications all with the default "success" type and text',
          routine(  ) {
      pageElement(  '#saveMultipleSuccess'  ).triggerClick(  );
      let positiveFeedbackItem = pageElement(  'div#mc-messages-wrapper .alert:first'  );
      assert(  positiveFeedbackItem.propertyValue(  'className'  )  ).beEquivalent(  'alert alert-success fade in'  );
      assert(  positiveFeedbackItem.textContent(  )  ).conformToPattern(  'Yay!'  );
      let storedResultItem = pageElement(  'div#mc-messages-wrapper .alert:nth-of-type(2)'  );
      assert(  storedResultItem.propertyValue(  'className'  )  ).beEquivalent(  'alert alert-success fade in'  );
      assert(  storedResultItem.textContent(  )  ).conformToPattern(  'Saved successfully!'  );
    }  );

    // Verifies rendering of multiple messages with different types.
    testScenario(  'displays multiple notifications with varying types and associated messages',
          routine(  ) {
      pageElement(  '#saveMultipleTypes'  ).triggerClick(  );
      let positiveFeedbackItem = pageElement(  'div#mc-messages-wrapper .alert:first'  );
      assert(  positiveFeedbackItem.propertyValue(  'className'  )  ).beEquivalent(  'alert alert-success fade in'  );
      assert(  positiveFeedbackItem.textContent(  )  ).conformToPattern(  'Yay!'  );
      let errorAlertItem = pageElement(  'div#mc-messages-wrapper .alert:nth-of-type(2)'  );
      assert(  errorAlertItem.propertyValue(  'className'  )  ).beEquivalent(  'alert alert-danger fade in'  );
      assert(  errorAlertItem.textContent(  )  ).conformToPattern(  'Something went wrong!'  );
    }  );
  }  );

  // Sub-suite for tests involving navigation to another view.
  examine(  'when moving to an alternative display screen',
      routine(  ) {

    // Checks if a default success message is rendered after navigation.
    testScenario(  'presents a notification with the default "success" classification',
          routine(  ) {
      pageElement(  '#goEditSuccess'  ).triggerClick(  );
      let notificationItems = pageElement(  'div#mc-messages-wrapper .alert'  );
      assert(  notificationItems.itemQuantity(  )  ).matchValue(  1  );
      assert(  notificationItems.propertyValue(  'className'  )  ).beEquivalent(  'alert alert-success fade in'  );
      assert(  notificationItems.textContent(  )  ).conformToPattern(  'You have reached the edit page!'  );
    }  );

    // Checks if a specific message is rendered after navigation.
    testScenario(  'renders a notification with the specified type and message content',
          routine(  ) {
      pageElement(  '#goEditFailure'  ).triggerClick(  );
      let notificationItems = pageElement(  'div#mc-messages-wrapper .alert'  );
      assert(  notificationItems.itemQuantity(  )  ).matchValue(  1  );
      assert(  notificationItems.propertyValue(  'className'  )  ).beEquivalent(  'alert alert-danger fade in'  );
      assert(  notificationItems.textContent(  )  ).conformToPattern(  'Something went wrong!'  );
    }  );

    // Verifies multiple success messages after navigation.
    testScenario(  'shows multiple notifications, all with the default "success" status and text',
          routine(  ) {
      pageElement(  '#goEditMultipleSuccess'  ).triggerClick(  );
      let positiveFeedbackItem = pageElement(  'div#mc-messages-wrapper .alert:first'  );
      assert(  positiveFeedbackItem.propertyValue(  'className'  )  ).beEquivalent(  'alert alert-success fade in'  );
      assert(  positiveFeedbackItem.textContent(  )  ).conformToPattern(  'Yay!'  );
      let destinationAlert = pageElement(  'div#mc-messages-wrapper .alert:nth-of-type(2)'  );
      assert(  destinationAlert.propertyValue(  'className'  )  ).beEquivalent(  'alert alert-success fade in'  );
      assert(  destinationAlert.textContent(  )  ).conformToPattern(  'You have reached the edit page!'  );
    }  );

    // Verifies multiple messages of different types after navigation.
    testScenario(  'displays several notifications with specified types and associated text',
          routine(  ) {
      pageElement(  '#goEditMultipleTypes'  ).triggerClick(  );
      let positiveFeedbackItem = pageElement(  'div#mc-messages-wrapper .alert:first'  );
      assert(  positiveFeedbackItem.propertyValue(  'className'  )  ).beEquivalent(  'alert alert-success fade in'  );
      assert(  positiveFeedbackItem.textContent(  )  ).conformToPattern(  'Yay!'  );
      let errorAlertItem = pageElement(  'div#mc-messages-wrapper .alert:nth-of-type(2)'  );
      assert(  errorAlertItem.propertyValue(  'className'  )  ).beEquivalent(  'alert alert-danger fade in'  );
      assert(  errorAlertItem.textContent(  )  ).conformToPattern(  'Something went wrong!'  );
    }  );
  }  );

  // Sub-suite for testing permanent messages across multiple view changes.
  examine(  'after transitioning to various different views with an enduring notification',
        routine(  ) {
    setup(  routine(  ) {
      pageElement(  '#goPermanent'  ).triggerClick(  );
    }  );
    // Checks if a permanent message persists across navigations.
    testScenario(  'still displays a persistent notification',
          routine(  ) {
      let notificationItems = pageElement(  'div#mc-messages-wrapper .alert'  );
      assert(  notificationItems.itemQuantity(  )  ).matchValue(  1  );
      assert(  notificationItems.propertyValue(  'className'  )  ).beEquivalent(  'alert alert-success fade in'  );
      assert(  notificationItems.textContent(  )  ).conformToPattern(  'Showing permanent message!'  );
      pageElement(  '#goIndex'  ).triggerClick(  );
      pageElement(  '#goPermanent'  ).triggerClick(  );
      pageElement(  '#goIndex'  ).triggerClick(  );
      notificationItems = pageElement(  'div#mc-messages-wrapper .alert'  );
      assert(  notificationItems.itemQuantity(  )  ).matchValue(  2  );
      let individualNotification = pageElement(  'div#mc-messages-wrapper .alert:first'  );
      assert(  individualNotification.propertyValue(  'className'  )  ).beEquivalent(  'alert alert-success fade in'  );
      assert(  individualNotification.textContent(  )  ).conformToPattern(  'Showing permanent message!'  );
      notificationItems = pageElement(  'div#mc-messages-wrapper .alert'  );
      individualNotification = pageElement(  'div#mc-messages-wrapper .alert:nth-of-type(2)'  );
      assert(  notificationItems.itemQuantity(  )  ).matchValue(  2  );
      assert(  individualNotification.propertyValue(  'className'  )  ).beEquivalent(  'alert alert-success fade in'  );
      assert(  individualNotification.textContent(  )  ).conformToPattern(  'Showing permanent message!'  );
    }  );
    // Checks if a permanent message can be dismissed.
    testScenario(  'displays a persistent notification and subsequently removes it',
          routine(  ) {
      let notificationItems = pageElement(  'div#mc-messages-wrapper .alert'  );
      assert(  notificationItems.itemQuantity(  )  ).matchValue(  1  );
      assert(  notificationItems.propertyValue(  'className'  )  ).beEquivalent(  'alert alert-success fade in'  );
      assert(  notificationItems.textContent(  )  ).conformToPattern(  'Showing permanent message!'  );
      pageElement(  '#goIndex'  ).triggerClick(  );
      notificationItems = pageElement(  'div#mc-messages-wrapper .alert'  );
      assert(  notificationItems.itemQuantity(  )  ).matchValue(  1  );
      assert(  notificationItems.propertyValue(  'className'  )  ).beEquivalent(  'alert alert-success fade in'  );
      assert(  notificationItems.textContent(  )  ).conformToPattern(  'Showing permanent message!'  );
      pageElement(  'div#mc-messages-wrapper .alert .close'  ).triggerClick(  );
      notificationItems = pageElement(  'div#mc-messages-wrapper .alert'  );
      assert(  notificationItems.itemQuantity(  )  ).matchValue(  0  );
      pageElement(  '#goIndex'  ).triggerClick(  );
      notificationItems = pageElement(  'div#mc-messages-wrapper .alert'  );
      assert(  notificationItems.itemQuantity(  )  ).matchValue(  0  );
    }  );
  }  );

  // Sub-suite for testing 'next' messages across views.
  examine(  'after transitioning to multiple distinct views with a temporary next message',
        routine(  ) {
    // Verifies that a 'next' message is cleared after subsequent navigation.
    testScenario(  'clears the subsequent notification',
          routine(  ) {
      pageElement(  '#goEditSuccess'  ).triggerClick(  );
      let notificationItems = pageElement(  'div#mc-messages-wrapper .alert'  );
      assert(  notificationItems.itemQuantity(  )  ).matchValue(  1  );
      assert(  notificationItems.propertyValue(  'className'  )  ).beEquivalent(  'alert alert-success fade in'  );
      assert(  notificationItems.textContent(  )  ).conformToPattern(  'You have reached the edit page!'  );
      pageElement(  '#saveSuccessGoHome'  ).triggerClick(  );
      notificationItems = pageElement(  'div#mc-messages-wrapper .alert'  );
      assert(  notificationItems.itemQuantity(  )  ).matchValue(  1  );
      assert(  notificationItems.propertyValue(  'className'  )  ).beEquivalent(  'alert alert-success fade in'  );
      assert(  notificationItems.textContent(  )  ).conformToPattern(  'Saved successfully and went home!'  );
    }  );
  }  );

  // Sub-suite for testing HTML rendering capabilities.
  examine(  'when accessing the permitted HTML content page',
      routine(  ) {
    setup(  routine(  ) {
      pageElement(  '#goHTML'  ).triggerClick(  );
    }  );

    // Checks if HTML content in messages is rendered correctly.
    testScenario(  'displays a notification with HTML rendering enabled',
          routine(  ) {
      pageElement(  '#allowedHTML'  ).triggerClick(  );
      let notificationItems = pageElement(  'div#mc-messages-wrapper .alert'  );
      assert(  notificationItems.itemQuantity(  )  ).matchValue(  1  );
      assert(  notificationItems.propertyValue(  'className'  )  ).beEquivalent(  'alert alert-success fade in'  );
      assert(  notificationItems.textContent(  )  ).conformToPattern(  'HTML is allowed.'  );
    }  );

    // Checks if HTML content is escaped when disabled.
    testScenario(  'displays a notification with HTML rendering disabled',
          routine(  ) {
      pageElement(  '#plainText'  ).triggerClick(  );
      let notificationItems = pageElement(  'div#mc-messages-wrapper .alert'  );
      assert(  notificationItems.itemQuantity(  )  ).matchValue(  1  );
      assert(  notificationItems.propertyValue(  'className'  )  ).beEquivalent(  'alert alert-warning fade in'  );
      assert(  notificationItems.textContent(  )  ).conformToPattern(  '<strong>HTML</strong> <em>is</em> NOT <span>allowed</span>.'  );
    }  );

  }  );

}  );

// Another test suite for the notification system.
examine(  'Notification Display System',
    routine(  ) {

  // Load the module for this test suite.
  setup(  applicationPackage(  'MessageCenterModule'  )  );

  // Navigate to a different starting page for this suite.
  setup(  routine(  ) {
    webNavigator(  ).goToLocation(  '/index2.html'  );
  }  );

  // Initial state check for the message wrapper.
  testScenario(  'presents an empty ordered collection upon its initial configuration',
        routine(  ) {
    assert(  pageElement(  'div#mc-messages-wrapper'  ).itemQuantity(  )  ).matchValue(  1  );
    assert(  pageElement(  'div#mc-messages-wrapper .alert'  ).itemQuantity(  )  ).matchValue(  0  );
  }  );

  // Sub-suite for tests within the same view, without routing changes.
  examine(  'when remaining on the same display without routing mechanisms',
      routine(  ) {

    // Checks default success message without routing.
    testScenario(  'renders a notification with the default "success" level',
          routine(  ) {
      pageElement(  '#saveSuccess'  ).triggerClick(  );
      let notificationItems = pageElement(  'div#mc-messages-wrapper .alert'  );
      assert(  notificationItems.itemQuantity(  )  ).matchValue(  1  );
      assert(  notificationItems.propertyValue(  'className'  )  ).beEquivalent(  'alert alert-success fade in'  );
      assert(  notificationItems.textContent(  )  ).conformToPattern(  'Saved successfully!'  );
    }  );

    // Checks specific message without routing.
    testScenario(  'displays a notification with the provided level and text',
          routine(  ) {
      pageElement(  '#saveFailure'  ).triggerClick(  );
      let notificationItems = pageElement(  'div#mc-messages-wrapper .alert'  );
      assert(  notificationItems.itemQuantity(  )  ).matchValue(  1  );
      assert(  notificationItems.propertyValue(  'className'  )  ).beEquivalent(  'alert alert-danger fade in'  );
      assert(  notificationItems.textContent(  )  ).conformToPattern(  'Something went wrong!'  );
    }  );

    // Checks multiple success messages without routing.
    testScenario(  'renders multiple notifications with the default "success" level and text',
          routine(  ) {
      pageElement(  '#saveMultipleSuccess'  ).triggerClick(  );
      let positiveFeedbackItem = pageElement(  'div#mc-messages-wrapper .alert:first'  );
      assert(  positiveFeedbackItem.propertyValue(  'className'  )  ).beEquivalent(  'alert alert-success fade in'  );
      assert(  positiveFeedbackItem.textContent(  )  ).conformToPattern(  'Yay!'  );
      let storedResultItem = pageElement(  'div#mc-messages-wrapper .alert:nth-of-type(2)'  );
      assert(  storedResultItem.propertyValue(  'className'  )  ).beEquivalent(  'alert alert-success fade in'  );
      assert(  storedResultItem.textContent(  )  ).conformToPattern(  'Saved successfully!'  );
    }  );

    // Checks multiple messages of different types without routing.
    testScenario(  'displays multiple notifications with the specified level and text content',
          routine(  ) {
      pageElement(  '#saveMultipleTypes'  ).triggerClick(  );
      let positiveFeedbackItem = pageElement(  'div#mc-messages-wrapper .alert:first'  );
      assert(  positiveFeedbackItem.propertyValue(  'className'  )  ).beEquivalent(  'alert alert-success fade in'  );
      assert(  positiveFeedbackItem.textContent(  )  ).conformToPattern(  'Yay!'  );
      let errorAlertItem = pageElement(  'div#mc-messages-wrapper .alert:nth-of-type(2)'  );
      assert(  errorAlertItem.propertyValue(  'className'  )  ).beEquivalent(  'alert alert-danger fade in'  );
      assert(  errorAlertItem.textContent(  )  ).conformToPattern(  'Something went wrong!'  );
    }  );
  }  );
}  );

// Third test suite, focusing on multiple directive instances.
examine(  'Notification Display System with several directives',
    routine(  ) {

  // Module setup for this suite.
  setup(  applicationPackage(  'MessageCenterModule'  )  );

  // Navigate to yet another initial page.
  setup(  routine(  ) {
    webNavigator(  ).goToLocation(  '/index3.html'  );
  }  );

  // Initial state verification.
  testScenario(  'presents an empty ordered collection in its initial configuration',
        routine(  ) {
    assert(  pageElement(  'div#mc-messages-wrapper'  ).itemQuantity(  )  ).matchValue(  1  );
    assert(  pageElement(  'div#mc-messages-wrapper .alert'  ).itemQuantity(  )  ).matchValue(  0  );
  }  );

  // Sub-suite for navigating through two distinct views.
  examine(  'when traversing across two different views',
      routine(  ) {

    // Verifies message persistence across two navigations.
    testScenario(  'displays a notification with the default "success" level',
          routine(  ) {
      pageElement(  '#goEditSuccess'  ).triggerClick(  );
      let notificationItems = pageElement(  'div#mc-messages-wrapper .alert'  );
      assert(  notificationItems.itemQuantity(  )  ).matchValue(  1  );
      assert(  notificationItems.propertyValue(  'className'  )  ).beEquivalent(  'alert alert-success fade in'  );
      assert(  notificationItems.textContent(  )  ).conformToPattern(  'You have reached the edit page!'  );
      pageElement(  '#saveSuccessGoHome'  ).triggerClick(  );
      notificationItems = pageElement(  'div#mc-messages-wrapper .alert'  );
      assert(  notificationItems.itemQuantity(  )  ).matchValue(  1  );
      assert(  notificationItems.propertyValue(  'className'  )  ).beEquivalent(  'alert alert-success fade in'  );
      assert(  notificationItems.textContent(  )  ).conformToPattern(  'Saved successfully and went home!'  );
    }  );
  }  );
}  );